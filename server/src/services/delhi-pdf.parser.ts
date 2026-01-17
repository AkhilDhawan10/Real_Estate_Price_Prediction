type FloorType = 'basement' | 'ground' | 'first' | 'second' | 'third' | 'terrace' | 'stilt';

/**
 * Filter out phone numbers and builder names from text
 * Removes: 10-digit numbers, contact info, builder/owner mentions
 */
function filterSensitiveInfo(text: string): string {
  let filtered = text;
  
  // Remove phone numbers (various formats)
  // Matches: 9876543210, +91-9876543210, 98765-43210, (987) 654-3210, etc.
  filtered = filtered.replace(/\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, '');
  
  // Remove common contact patterns
  filtered = filtered.replace(/\b(contact|call|phone|mobile|tel|whatsapp)\s*:?\s*\d*/gi, '');
  
  // Remove builder/owner name patterns (common formats)
  filtered = filtered.replace(/\b(builder|owner|proprietor|developer|by)\s*:?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/gi, '');
  
  // Remove email addresses
  filtered = filtered.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  
  // Clean up extra spaces and trim
  filtered = filtered.replace(/\s+/g, ' ').trim();
  
  return filtered;
}

interface ExtractedProperty {
  location: { city: string; area: string };
  propertyId?: string;
  size?: { value: number; unit: 'gaj' | 'sqft' | 'yd' };
  floors: FloorType[];
  bedrooms?: number;
  detail?: string;
  rawDetail?: string;
}

export const parseDelhiPDF = (text: string): ExtractedProperty[] => {
  const properties: ExtractedProperty[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentArea = '';
  let currentCity = 'south delhi';

  // Keywords that indicate a line is NOT an area heading
  const NOT_AREA_KEYWORDS = /\d+|BR|BHK|GAJ|GJ|YD|YARD|SQFT|SQ\.FT|SFT|FT|PLOT|FLAT|READY|BOOKING|U\/C|U\/R|₹|RS|CR|CRORE|BMT|GF|FF|SF|TF|TERR|STILT|BASEMENT|GROUND|FIRST|SECOND|THIRD|SALE|SEPTEMBER|RESIDENTIAL|@/i;

  console.log('\n========== STARTING PDF PARSING ==========\n');

  for (const line of lines) {
    // Skip empty lines
    if (!line) continue;

    // Detect city name
    if (/DELHI/i.test(line) && line.length < 30) {
      currentCity = line.toLowerCase();
      console.log(`📍 CITY DETECTED: ${currentCity}`);
      continue;
    }

    // Skip common header/footer lines
    if (/RESIDENTIAL|SEPTEMBER|SALE|PAGE|^\d+$/i.test(line)) {
      continue;
    }

    // AREA HEADING DETECTION (improved logic)
    // An area heading is:
    // 1. Only contains letters and spaces (no numbers, no special chars)
    // 2. Between 5-50 characters
    // 3. Does NOT contain property-related keywords
    // 4. Typically in UPPERCASE or Title Case
    const isAreaHeading = 
      line.length >= 5 && 
      line.length <= 50 &&
      /^[A-Za-z\s\-\.]+$/.test(line) && // Only letters, spaces, hyphens, dots
      !NOT_AREA_KEYWORDS.test(line);

    if (isAreaHeading) {
      // This is a new area heading
      currentArea = line
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ') // Remove special chars
        .replace(/\s+/g, ' ')      // Normalize spaces
        .trim();
      
      console.log(`\n🏘️  NEW AREA DETECTED: "${currentArea}"\n`);
      continue;
    }

    // If no area detected yet, skip property parsing
    if (!currentArea) {
      continue;
    }

    // PROPERTY DATA PARSING
    // Only parse lines that contain property indicators
    const hasPropertyData = /\d/.test(line) && (
      /YD|GAJ|GJ|SQFT|SQ\.FT|SFT|FT/i.test(line) ||
      /BR|BHK/i.test(line) ||
      /GF|FF|SF|TF|BMT/i.test(line)
    );

    if (!hasPropertyData) {
      continue; // Skip lines without property data
    }

    console.log(`  ✓ Parsing property: ${line.substring(0, 80)}...`);

    // Extract Property ID (if exists at start of line)
    const propertyIdMatch = line.match(/^([A-Z]-?\d+|\d+[A-Z]?)/);
    const propertyId = propertyIdMatch ? propertyIdMatch[1] : undefined;

    // Extract Size
    const sizeMatch = line.match(/(\d+(?:\.\d+)?)\s*(GJ|GAJ|YD|YARD|FT|SQFT|SQ\.FT|SFT)/i);
    let size: { value: number; unit: 'gaj' | 'sqft' | 'yd' } | undefined;
    
    if (sizeMatch) {
      const sizeValue = parseFloat(sizeMatch[1]);
      const rawUnit = sizeMatch[2].toUpperCase();
      const sizeUnit = rawUnit.includes('G') ? 'gaj' : 
                       rawUnit.includes('Y') ? 'yd' : 'sqft';
      size = { value: sizeValue, unit: sizeUnit };
    }

    // Extract Bedrooms
    const bedroomMatch = line.match(/(\d+)\s*(BR|BHK)/i);
    const bedrooms = bedroomMatch ? Number(bedroomMatch[1]) : undefined;

    // Extract Floors
    const floors: FloorType[] = [];
    if (/\bBMT\b|\bBASEMENT\b/i.test(line)) floors.push('basement');
    if (/\bGF\b|\bGROUND\b/i.test(line)) floors.push('ground');
    if (/\bFF\b|\bFIRST\b/i.test(line)) floors.push('first');
    if (/\bSF\b|\bSECOND\b/i.test(line)) floors.push('second');
    if (/\bTF\b|\bTHIRD\b/i.test(line)) floors.push('third');
    if (/\bTERR\b|\bTERRACE\b/i.test(line)) floors.push('terrace');
    if (/\bSTILT\b/i.test(line)) floors.push('stilt');
    
    // Capture additional detail from the line
    const rawDetail = line; // Store raw unfiltered line for admin
    const detail = filterSensitiveInfo(line); // Filtered for normal users

    // Default to ground if no floor specified
    if (floors.length === 0) floors.push('ground');

    // Only add property if it has size data (required for our use case)
    if (size) {
      properties.push({
        location: { 
          city: currentCity, 
          area: currentArea 
        },
        propertyId,
        size,
        floors,
        bedrooms,
        detail: detail || undefined,
        rawDetail: rawDetail || undefined,
      });
    }
  }

  console.log(`\n========== PARSING COMPLETE ==========`);
  console.log(`Total properties extracted: ${properties.length}\n`);

  return properties;
};
