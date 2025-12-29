type FloorType = 'basement' | 'ground' | 'first' | 'second' | 'third' | 'terrace' | 'stilt';
type PropertyStatus = 'ready' | 'under_construction' | 'booking';

interface ExtractedProperty {
  location: {
    city: string;
    area: string;
  };
  propertyId?: string;
  propertyType: 'plot' | 'flat';
  size: {
    value: number;
    unit: 'gaj' | 'sqft' | 'yd';
  };
  price?: number;
  floors: FloorType[];
  bedrooms?: number;
  status?: PropertyStatus;
  contact?: string;
  brokerNotes?: string;
}

/**
 * Parse Delhi Real Estate PDF format
 * Format: Area names in caps, followed by property listings with size, floors, BR, contact
 */
export const parseDelhiPDF = (text: string): ExtractedProperty[] => {
  const properties: ExtractedProperty[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentArea = '';
  let currentCity = 'south delhi'; // Default from PDF header

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header lines
    if (line.includes('RESIDENTIAL FOR SALE') || 
        line.includes('SOUTH DELHI') || 
        line.includes('SEPTEMBER') || 
        line.includes('SALE -')) {
      // Extract city if present
      if (line.includes('DELHI')) {
        currentCity = 'delhi';
      }
      continue;
    }

    // Check if this is an area name (all caps, no numbers at start, no parentheses)
    if (line === line.toUpperCase() && 
        line.length > 3 && 
        !/^\d/.test(line) && 
        !line.includes('(') &&
        !line.includes('FT') &&
        !line.includes('YD') &&
        !line.includes('BR')) {
      currentArea = line.toLowerCase().replace(/\s+/g, ' ').trim();
      continue;
    }

    // Skip if no area set yet
    if (!currentArea) continue;

    // Try to extract property details from the line
    try {
      // Extract property ID (plot/flat number at start)
      let propertyId = '';
      const idMatch = line.match(/^([A-Z]-?\d+|[A-Z]+\s*\d+|\d+[A-Z]?|FLAT\s*NO-?\d+)/i);
      if (idMatch) {
        propertyId = idMatch[1].trim();
      }

      // Extract size with unit (YD, FT, SQFT)
      const sizeMatch = line.match(/(\d+(?:\.\d+)?)\s*(YD|FT|SQFT)/i);
      if (!sizeMatch) continue; // Skip if no size found

      const sizeValue = parseFloat(sizeMatch[1]);
      const sizeUnitRaw = sizeMatch[2].toUpperCase();
      const sizeUnit = sizeUnitRaw === 'YD' ? 'yd' : 'sqft';

      // Extract floors (BMT, GF, FF, SF, TF, TERR, STILT)
      const floors: FloorType[] = [];
      const floorMap: { [key: string]: FloorType } = {
        'BMT': 'basement',
        'GF': 'ground',
        'FF': 'first',
        'SF': 'second',
        'TF': 'third',
        'TERR': 'terrace',
        'STILT': 'stilt'
      };

      Object.keys(floorMap).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        if (regex.test(line)) {
          floors.push(floorMap[key]);
        }
      });

      // If no floor specified, default to ground
      if (floors.length === 0) {
        floors.push('ground');
      }

      // Extract bedrooms (3BR, 4BR, 2BHK, etc.)
      const bedroomMatch = line.match(/(\d+)\s*(BR|BHK|BEDROOM)/i);
      const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : undefined;

      // Extract status (READY, U/C, BOOKING, U/R)
      let status: PropertyStatus | undefined;
      if (/\bREADY\b/i.test(line)) {
        status = 'ready';
      } else if (/\bU\/C\b/i.test(line) || /\bU\/R\b/i.test(line)) {
        status = 'under_construction';
      } else if (/\bBOOKING\b/i.test(line)) {
        status = 'booking';
      }

      // Extract contact (phone numbers - 10 digits, 8 digits, or with spaces/dashes)
      const contactMatches = line.match(/(\d{10}|\d{11}|\d{8}|\d{2,5}[-\s]?\d{3,8})/g);
      const contact = contactMatches ? contactMatches.join(', ') : undefined;

      // Determine property type
      const propertyType: 'plot' | 'flat' = /\bPLOT\b/i.test(line) ? 'plot' : 'flat';

      // Extract price if available (numbers after Rs, ₹, @)
      let price: number | undefined;
      const priceMatch = line.match(/(?:Rs\.?|₹|@)\s*(\d+(?:\.\d+)?)/i);
      if (priceMatch) {
        price = parseFloat(priceMatch[1]) * 100000; // Assuming in lakhs
      }

      // Create notes from the line (limit to 300 chars)
      const brokerNotes = line.substring(0, 300).trim();

      // Only add if we have minimum required data
      if (sizeValue > 0 && currentArea) {
        const property: ExtractedProperty = {
          location: {
            city: currentCity,
            area: currentArea,
          },
          propertyId: propertyId || undefined,
          propertyType,
          size: {
            value: sizeValue,
            unit: sizeUnit as 'gaj' | 'sqft' | 'yd',
          },
          price,
          floors,
          bedrooms,
          status,
          contact,
          brokerNotes,
        };

        properties.push(property);
      }
    } catch (error) {
      // Skip invalid lines
      continue;
    }
  }

  return properties;
};
