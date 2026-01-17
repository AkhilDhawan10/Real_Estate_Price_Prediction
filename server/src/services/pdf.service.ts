import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import Property from '../models/Property.model';
import { savePropertiesToExcel } from '../utils/excel.util';
import { parseDelhiPDF } from './delhi-pdf.parser';

type FloorType = 'basement' | 'ground' | 'first' | 'second' | 'third' | 'terrace' | 'stilt';

interface ExtractedProperty {
  location: {
    city: string;
    area: string;
  };
  propertyId?: string;
  size: {
    value: number;
    unit: 'gaj' | 'sqft' | 'yd';
  };
  floors: FloorType[];
  bedrooms?: number;
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
 * Process PDF file and store properties
 */
export const processPDFFile = async (
  filePath: string,
  sourcePdfName: string
): Promise<{ saved: number; errors: number }> => {
  try {
    console.log(`\n📄 Processing PDF: ${sourcePdfName}`);
    
    // Extract text from PDF
    const text = await extractTextFromPDF(filePath);
    console.log(`✓ Extracted text from PDF (${text.length} characters)`);

    // Use Delhi PDF parser for unstructured real estate data
    const extractedProperties = parseDelhiPDF(text);

    if (extractedProperties.length === 0) {
      console.log('❌ No properties could be extracted from PDF');
      throw new Error('No properties could be extracted from PDF');
    }

    console.log(`✓ Parsed ${extractedProperties.length} properties from PDF`);

    // Save to MongoDB
    let saved = 0;
    let errors = 0;

    for (const prop of extractedProperties) {
      try {
        // Validate that property has required fields
        if (!prop.location?.area || !prop.location?.city) {
          console.log(`⚠️  Skipping property without location`);
          errors++;
          continue;
        }

        await Property.create({
          ...prop,
          sourcePdf: sourcePdfName,
          uploadedAt: new Date(),
        });
        saved++;
      } catch (error: any) {
        console.error(`❌ Error saving property:`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Saved ${saved} properties to database`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} properties failed to save`);
    }

    // Update Excel file
    try {
      const allProperties = await Property.find().lean();
      const excelData = allProperties.map((p) => ({
        location: p.location,
        size: p.size,
        floors: p.floors,
        bedrooms: p.bedrooms,
        propertyId: p.propertyId,
        detail: p.detail,
        rawDetail: p.rawDetail,
      }));
      savePropertiesToExcel(excelData);
      console.log(`✓ Updated Excel file with all properties`);
    } catch (excelError: any) {
      console.error(`⚠️  Excel update failed:`, excelError.message);
      // Don't fail the whole operation if Excel fails
    }

    console.log(`\n✅ PDF processing complete!\n`);
    return { saved, errors };
  } catch (error: any) {
    console.error('❌ Error processing PDF:', error.message);
    throw error;
  }
};

