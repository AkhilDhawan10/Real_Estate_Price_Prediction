import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.model';
import Subscription from '../models/Subscription.model';
import Property from '../models/Property.model';
import SearchLog from '../models/SearchLog.model';
import { processPDFFile } from '../services/pdf.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as XLSX from 'xlsx';

// City domain
const CITY_DOMAIN = (process.env.CITY_DOMAIN || 'south delhi').toLowerCase();

// Helper function to convert size to sqft
const convertToSqft = (value: number, unit: 'gaj' | 'sqft' | 'yd'): number => {
  if (unit === 'gaj') return value * 9;
  else if (unit === 'yd') return value * 9;
  return value;
};

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `property-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * Upload and process PDF file
 */
export const uploadPDF = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Process PDF
    const result = await processPDFFile(filePath, fileName);

    res.json({
      message: 'PDF processed successfully',
      saved: result.saved,
      errors: result.errors,
      fileName,
    });
  } catch (error: any) {
    console.error('Upload PDF error:', error);
    res.status(500).json({
      message: 'Error processing PDF',
      error: error.message,
    });
  }
};

/**
 * Get all users
 */
export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { fullName: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
        { phoneNumber: new RegExp(search as string, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

/**
 * Get all subscriptions
 */
export const getSubscriptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query: any = {};
    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gt: new Date() };
    } else if (status === 'expired') {
      query.$or = [
        { isActive: false },
        { expiryDate: { $lt: new Date() } },
      ];
    }

    const subscriptions = await Subscription.find(query)
      .populate('user', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Subscription.countDocuments(query);

    res.json({
      subscriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      message: 'Error fetching subscriptions',
      error: error.message,
    });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'broker' });
    const totalProperties = await Property.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({
      isActive: true,
      expiryDate: { $gt: new Date() },
    });
    const expiredSubscriptions = await Subscription.countDocuments({
      $or: [{ isActive: false }, { expiryDate: { $lt: new Date() } }],
    });

    const revenue = await Subscription.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const recentUsers = await User.find({ role: 'broker' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email createdAt');

    res.json({
      stats: {
        totalUsers,
        totalProperties,
        activeSubscriptions,
        expiredSubscriptions,
        totalRevenue: revenue[0]?.total || 0,
      },
      recentUsers,
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * Download users Excel report
 */
export const downloadUsersReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({ role: 'broker' })
      .select('fullName email phoneNumber createdAt')
      .lean();

    const data = users.map((user) => ({
      'Full Name': user.fullName,
      'Email': user.email,
      'Phone Number': user.phoneNumber,
      'Created At': user.createdAt.toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users-report-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error: any) {
    console.error('Download users report error:', error);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message,
    });
  }
};

/**
 * Delete all properties from database
 */
export const deleteAllProperties = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await Property.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} properties`);
    
    res.json({
      message: 'All properties deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Delete properties error:', error);
    res.status(500).json({
      message: 'Error deleting properties',
      error: error.message,
    });
  }
};

/**
 * Download subscriptions Excel report
 */
export const downloadSubscriptionsReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'fullName email')
      .lean();

    const data = subscriptions.map((sub: any) => ({
      'User Name': sub.user?.fullName || 'N/A',
      'User Email': sub.user?.email || 'N/A',
      'Plan Type': sub.planType,
      'Amount': sub.amount,
      'Start Date': sub.startDate.toISOString(),
      'Expiry Date': sub.expiryDate.toISOString(),
      'Is Active': sub.isActive ? 'Yes' : 'No',
      'Created At': sub.createdAt.toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscriptions');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=subscriptions-report-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error: any) {
    console.error('Download subscriptions report error:', error);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message,
    });
  }
};

/**
 * Get search statistics - most searched areas
 */
export const getSearchStatistics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Aggregate searches by area
    const areaStats = await SearchLog.aggregate([
      {
        $match: {
          searchedAt: { $gte: startDate },
          'searchParams.area': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$searchParams.area',
          searchCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
          avgResultsCount: { $avg: '$resultsCount' },
          lastSearchedAt: { $max: '$searchedAt' },
        },
      },
      {
        $project: {
          area: '$_id',
          searchCount: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' },
          avgResultsCount: { $round: ['$avgResultsCount', 0] },
          lastSearchedAt: 1,
          _id: 0,
        },
      },
      {
        $sort: { searchCount: -1 },
      },
      {
        $limit: 50,
      },
    ]);

    // Get total searches in period
    const totalSearches = await SearchLog.countDocuments({
      searchedAt: { $gte: startDate },
    });

    res.json({
      statistics: areaStats,
      summary: {
        totalSearches,
        periodDays: Number(days),
        topAreas: areaStats.slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error('Get search statistics error:', error);
    res.status(500).json({
      message: 'Error fetching search statistics',
      error: error.message,
    });
  }
};

/**
 * Download search statistics Excel report
 */
export const downloadSearchReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Aggregate searches by area
    const areaStats = await SearchLog.aggregate([
      {
        $match: {
          searchedAt: { $gte: startDate },
          'searchParams.area': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$searchParams.area',
          searchCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
          avgResultsCount: { $avg: '$resultsCount' },
          lastSearchedAt: { $max: '$searchedAt' },
        },
      },
      {
        $project: {
          area: '$_id',
          searchCount: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' },
          avgResultsCount: { $round: ['$avgResultsCount', 0] },
          lastSearchedAt: 1,
          _id: 0,
        },
      },
      {
        $sort: { searchCount: -1 },
      },
    ]);

    // Format data for Excel
    const data: any[] = areaStats.map((stat, index) => ({
      'Rank': index + 1,
      'Area/Locality': stat.area,
      'Total Searches': stat.searchCount,
      'Unique Users': stat.uniqueUsersCount,
      'Avg Results Found': stat.avgResultsCount,
      'Last Searched': new Date(stat.lastSearchedAt).toLocaleString(),
    }));

    // Add summary row
    const totalSearches = areaStats.reduce((sum, stat) => sum + stat.searchCount, 0);
    data.push({
      'Rank': '',
      'Area/Locality': 'TOTAL',
      'Total Searches': totalSearches,
      'Unique Users': '',
      'Avg Results Found': '',
      'Last Searched': '',
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Search Statistics');

    // Add metadata sheet
    const metadata = [
      { Field: 'Report Generated', Value: new Date().toLocaleString() },
      { Field: 'Period (Days)', Value: days },
      { Field: 'Total Areas Searched', Value: areaStats.length },
      { Field: 'Total Searches', Value: totalSearches },
    ];
    const metadataSheet = XLSX.utils.json_to_sheet(metadata);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Report Info');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=search-statistics-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error: any) {
    console.error('Download search report error:', error);
    res.status(500).json({
      message: 'Error generating search report',
      error: error.message,
    });
  }
};

/**
 * Admin property search - shows ALL details including phone numbers
 */
export const adminSearchProperties = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      city,
      area,
      sizeMin,
      sizeMax,
      sizeUnit,
      bedrooms,
      floors,
      page = 1,
      limit = 100,
    } = req.query;

    console.log('🔍 Admin search request:', { city, area, sizeMin, sizeMax, bedrooms, floors });

    // Build query - ALL filters are optional
    const query: any = {};

    // Location filters
    query['location.city'] = new RegExp(CITY_DOMAIN, 'i');
    if (area) {
      query['location.area'] = new RegExp(area as string, 'i');
    }

    // Bedrooms filter
    if (bedrooms) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { bedrooms: { $exists: false } },
          { bedrooms: null },
          { bedrooms: { $gte: Number(bedrooms) } }
        ]
      });
    }

    // Floors filter
    if (floors) {
      const floorList = (floors as string)
        .split(',')
        .map(f => f.trim().toLowerCase())
        .filter(Boolean);

      if (floorList.length > 0) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { floors: { $exists: false } },
            { floors: { $size: 0 } },
            { floors: { $in: floorList } }
          ]
        });
      }
    }

    console.log('📋 MongoDB query:', JSON.stringify(query, null, 2));

    // Execute query
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    console.log(`✅ Found ${properties.length} properties from DB`);

    // Filter by size if provided
    let filteredProperties = properties;
    if (sizeMin || sizeMax) {
      const unit = (sizeUnit as 'gaj' | 'sqft' | 'yd') || 'sqft';
      const minSqft = sizeMin ? convertToSqft(Number(sizeMin), unit) : 0;
      const maxSqft = sizeMax ? convertToSqft(Number(sizeMax), unit) : Infinity;

      filteredProperties = properties.filter((prop) => {
        if (!prop.size || !prop.size.value) return true;
        const propSqft = convertToSqft(prop.size.value, prop.size.unit);
        return propSqft >= minSqft && propSqft <= maxSqft;
      });
      
      console.log(`📏 After size filter: ${filteredProperties.length} properties`);
    }

    // Return with rawDetail for admin (includes phone numbers)
    const adminProperties = filteredProperties.map(prop => ({
      ...prop,
      detail: prop.rawDetail || prop.detail, // Show unfiltered details to admin
    }));

    const total = await Property.countDocuments(query);

    res.json({
      properties: adminProperties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Admin property search error:', error);
    res.status(500).json({
      message: 'Error searching properties',
      error: error.message,
    });
  }
};

