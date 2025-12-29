import { Response } from 'express';
import Property from '../models/Property.model';
import PropertyRequirement from '../models/PropertyRequirement.model';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Convert size to sqft for comparison
 */
const convertToSqft = (value: number, unit: 'gaj' | 'sqft' | 'yd'): number => {
  if (unit === 'gaj') {
    return value * 9; // 1 gaj = 9 sqft (approximately)
  } else if (unit === 'yd') {
    return value * 9; // 1 yard ≈ 9 sqft (same as gaj in Indian real estate)
  }
  return value;
};

/**
 * Search properties based on requirements
 */
export const searchProperties = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const {
      city,
      area,
      propertyType,
      sizeMin,
      sizeMax,
      sizeUnit,
      bedrooms,
      floors,
      status,
      budgetMin,
      budgetMax,
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query: any = {};

    if (city) {
      query['location.city'] = new RegExp(city as string, 'i');
    }
    if (area) {
      query['location.area'] = new RegExp(area as string, 'i');
    }
    if (propertyType) {
      query.propertyType = propertyType;
    }
    if (bedrooms) {
      query.bedrooms = Number(bedrooms);
    }
    if (floors) {
      // Support comma-separated floors: ?floors=ground,first
      const floorArray = (floors as string).split(',');
      query.floors = { $in: floorArray };
    }
    if (status) {
      query.status = status;
    }
    if (budgetMin || budgetMax) {
      query.price = {};
      if (budgetMin) query.price.$gte = Number(budgetMin);
      if (budgetMax) query.price.$lte = Number(budgetMax);
    }

    // Execute query
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // Filter by size if provided
    let filteredProperties = properties;
    if (sizeMin || sizeMax) {
      const unit = (sizeUnit as 'gaj' | 'sqft' | 'yd') || 'sqft';
      const minSqft = sizeMin ? convertToSqft(Number(sizeMin), unit) : 0;
      const maxSqft = sizeMax
        ? convertToSqft(Number(sizeMax), unit)
        : Infinity;

      filteredProperties = properties.filter((prop) => {
        const propSqft = convertToSqft(prop.size.value, prop.size.unit);
        return propSqft >= minSqft && propSqft <= maxSqft;
      });
    }

    // Calculate relevance scores and sort
    const scoredProperties = filteredProperties.map((prop) => {
      let score = 100; // Base score

      // Exact matches get higher scores
      if (city && prop.location.city.toLowerCase() === (city as string).toLowerCase()) {
        score += 20;
      }
      if (area && prop.location.area.toLowerCase() === (area as string).toLowerCase()) {
        score += 20;
      }
      if (propertyType && prop.propertyType === propertyType) {
        score += 15;
      }

      // Price proximity (within 10-15% range) - only if price exists
      if (budgetMin && budgetMax && prop.price) {
        const avgBudget = (Number(budgetMin) + Number(budgetMax)) / 2;
        const diff = Math.abs(prop.price - avgBudget) / avgBudget;
        if (diff <= 0.1) score += 15;
        else if (diff <= 0.15) score += 10;
      }

      // Size proximity
      if (sizeMin && sizeMax) {
        const unit = (sizeUnit as 'gaj' | 'sqft') || 'sqft';
        const avgSize = (Number(sizeMin) + Number(sizeMax)) / 2;
        const avgSizeSqft = convertToSqft(avgSize, unit);
        const propSqft = convertToSqft(prop.size.value, prop.size.unit);
        const diff = Math.abs(propSqft - avgSizeSqft) / avgSizeSqft;
        if (diff <= 0.1) score += 10;
        else if (diff <= 0.15) score += 5;
      }

      return { ...prop, relevanceScore: score };
    });

    // Sort by relevance score (descending)
    scoredProperties.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Save requirement
    try {
      await PropertyRequirement.create({
        user: req.user.id,
        location: city || area ? { city: city as string, area: area as string } : undefined,
        propertyType: propertyType as 'plot' | 'flat' | undefined,
        size: sizeMin || sizeMax
          ? {
              min: sizeMin ? Number(sizeMin) : undefined,
              max: sizeMax ? Number(sizeMax) : undefined,
              unit: (sizeUnit as 'gaj' | 'sqft') || 'sqft',
            }
          : undefined,
        budget: {
          min: budgetMin ? Number(budgetMin) : 0,
          max: budgetMax ? Number(budgetMax) : Infinity,
        },
      });
    } catch (error) {
      console.error('Error saving requirement:', error);
      // Don't fail the request if requirement save fails
    }

    const total = await Property.countDocuments(query);

    res.json({
      properties: scoredProperties.map(({ relevanceScore, ...prop }) => prop),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Search properties error:', error);
    res.status(500).json({
      message: 'Error searching properties',
      error: error.message,
    });
  }
};

/**
 * Get property by ID
 */
export const getPropertyById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    res.json({ property });
  } catch (error: any) {
    console.error('Get property error:', error);
    res.status(500).json({
      message: 'Error fetching property',
      error: error.message,
    });
  }
};

/**
 * Get property statistics
 */
export const getPropertyStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalProperties = await Property.countDocuments();
    const plots = await Property.countDocuments({ propertyType: 'plot' });
    const flats = await Property.countDocuments({ propertyType: 'flat' });

    const cities = await Property.distinct('location.city');
    const avgPrice = await Property.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } },
    ]);

    res.json({
      totalProperties,
      byType: {
        plots,
        flats,
      },
      cities: cities.length,
      averagePrice: avgPrice[0]?.avgPrice || 0,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

