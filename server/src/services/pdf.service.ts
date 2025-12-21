import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import Property from '../models/Property.model';
import { savePropertiesToExcel } from '../utils/excel.util';

interface ExtractedProperty {
  location: {
    city: string;
    area: string;
  };
  propertyType: 'plot' | 'flat';
  size: {
    value: number;
    unit: 'gaj' | 'sqft';
  };
  price: number;
  brokerNotes?: string;
}

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Parse extracted text to structured property data
 * This is a basic parser - you may need to customize based on your PDF format
 */
export const parsePropertyData = (text: string): ExtractedProperty[] => {
  const properties: ExtractedProperty[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  // This is a simplified parser - adjust based on your PDF structure
  // Example format: "City: Mumbai, Area: Bandra, Type: flat, Size: 1200 sqft, Price: 5000000"
  
  let currentProperty: Partial<ExtractedProperty> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // Extract city
    const cityMatch = line.match(/(?:city|location)[:\s]+([^,]+)/i);
    if (cityMatch) {
      const existingArea = currentProperty.location?.area || '';
      currentProperty.location = { 
        city: cityMatch[1].trim(), 
        area: existingArea
      };
    }

    // Extract area
    const areaMatch = line.match(/(?:area|locality)[:\s]+([^,]+)/i);
    if (areaMatch) {
      const existingCity = currentProperty.location?.city || '';
      currentProperty.location = { 
        city: existingCity, 
        area: areaMatch[1].trim() 
      };
    }

    // Extract property type
    if (line.includes('plot')) {
      currentProperty.propertyType = 'plot';
    } else if (line.includes('flat') || line.includes('apartment')) {
      currentProperty.propertyType = 'flat';
    }

    // Extract size
    const sizeMatch = line.match(/(\d+(?:\.\d+)?)\s*(gaj|sqft|sq\.ft\.|square\s*feet)/i);
    if (sizeMatch) {
      const unit = sizeMatch[2].toLowerCase().includes('gaj') ? 'gaj' : 'sqft';
      currentProperty.size = {
        value: parseFloat(sizeMatch[1]),
        unit,
      };
    }

    // Extract price
    const priceMatch = line.match(/(?:price|cost|amount)[:\s]*[₹]?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (priceMatch) {
      currentProperty.price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }

    // Extract notes
    if (line.includes('note') || line.includes('remark')) {
      currentProperty.brokerNotes = line;
    }

    // If we have enough data, save the property
    if (
      currentProperty.location?.city &&
      currentProperty.location?.area &&
      currentProperty.propertyType &&
      currentProperty.size?.value &&
      currentProperty.price
    ) {
      properties.push(currentProperty as ExtractedProperty);
      currentProperty = {};
    }
  }

  return properties;
};

/**
 * Process PDF file and store properties
 */
export const processPDFFile = async (
  filePath: string,
  sourcePdfName: string
): Promise<{ saved: number; errors: number }> => {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(filePath);

    // Parse property data
    let extractedProperties = parsePropertyData(text);

    // If parsing didn't work well, try table extraction
    if (extractedProperties.length === 0) {
      // Fallback: Try to extract structured data from tables
      extractedProperties = extractFromTableFormat(text);
    }

    if (extractedProperties.length === 0) {
      throw new Error('No properties could be extracted from PDF');
    }

    // Save to MongoDB
    let saved = 0;
    let errors = 0;

    for (const prop of extractedProperties) {
      try {
        await Property.create({
          ...prop,
          sourcePdf: sourcePdfName,
          uploadedAt: new Date(),
        });
        saved++;
      } catch (error) {
        console.error('Error saving property:', error);
        errors++;
      }
    }

    // Update Excel file
    const allProperties = await Property.find().lean();
    const excelData = allProperties.map((p) => ({
      location: p.location,
      propertyType: p.propertyType,
      size: p.size,
      price: p.price,
      brokerNotes: p.brokerNotes,
    }));
    savePropertiesToExcel(excelData);

    return { saved, errors };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};

/**
 * Extract properties from table-like format in PDF text
 */
const extractFromTableFormat = (text: string): ExtractedProperty[] => {
  const properties: ExtractedProperty[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  // Look for table patterns
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/\s{2,}|\t/).filter(p => p.trim());
    
    if (parts.length >= 4) {
      // Assume format: City | Area | Type | Size | Price
      try {
        const property: ExtractedProperty = {
          location: {
            city: parts[0] || 'unknown',
            area: parts[1] || 'unknown',
          },
          propertyType: (parts[2]?.toLowerCase().includes('plot') ? 'plot' : 'flat') as 'plot' | 'flat',
          size: {
            value: parseFloat(parts[3]) || 0,
            unit: parts[3]?.toLowerCase().includes('gaj') ? 'gaj' : 'sqft',
          },
          price: parseFloat(parts[4]?.replace(/[₹,]/g, '')) || 0,
        };

        if (property.price > 0 && property.size.value > 0) {
          properties.push(property);
        }
      } catch (error) {
        // Skip invalid rows
        continue;
      }
    }
  }

  return properties;
};

