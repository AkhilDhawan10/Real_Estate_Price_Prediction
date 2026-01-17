import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import User from '../models/User.model';

const EXCEL_DIR = path.join(__dirname, '../../excel-data');

// Ensure directory exists
if (!fs.existsSync(EXCEL_DIR)) {
  fs.mkdirSync(EXCEL_DIR, { recursive: true });
}

const USERS_FILE = path.join(EXCEL_DIR, 'users.xlsx');
const PROPERTIES_FILE = path.join(EXCEL_DIR, 'properties.xlsx');

/**
 * Append user to users.xlsx file
 */
export const appendUserToExcel = async (userData: {
  fullName: string;
  phoneNumber: string;
  email: string;
  createdAt: Date;
}): Promise<void> => {
  try {
    let workbook: XLSX.WorkBook;
    let worksheet: XLSX.WorkSheet;

    // Check if file exists
    if (fs.existsSync(USERS_FILE)) {
      workbook = XLSX.readFile(USERS_FILE);
      worksheet = workbook.Sheets[workbook.SheetNames[0]];
    } else {
      // Create new workbook
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([
        ['Full Name', 'Phone Number', 'Email', 'Created At'],
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    }

    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Add new user
    data.push({
      'Full Name': userData.fullName,
      'Phone Number': userData.phoneNumber,
      'Email': userData.email,
      'Created At': userData.createdAt.toISOString(),
    });

    // Create new sheet with updated data
    const newWorksheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;

    // Write file
    XLSX.writeFile(workbook, USERS_FILE);
  } catch (error) {
    console.error('Error appending user to Excel:', error);
    throw error;
  }
};

/**
 * Save properties to properties.xlsx file
 */
export const savePropertiesToExcel = (properties: Array<{
  location: { city: string; area: string };
  size?: { value: number; unit: string };
  floors: string[];
  bedrooms?: number;
  propertyId?: string;
  detail?: string;
  rawDetail?: string;
}>): void => {
  try {
    const data = properties.map((prop) => ({
      'City': prop.location.city,
      'Area': prop.location.area,
      'Property ID': prop.propertyId || '',
      'Size Value': prop.size?.value || '',
      'Size Unit': prop.size?.unit || '',
      'Bedrooms': prop.bedrooms || '',
      'Floors': prop.floors.join(', '),
      'Details (Filtered)': prop.detail || '',
      'Full Details (Admin)': prop.rawDetail || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Properties');
    XLSX.writeFile(workbook, PROPERTIES_FILE);
  } catch (error) {
    console.error('Error saving properties to Excel:', error);
    throw error;
  }
};

/**
 * Read properties from Excel file
 */
export const readPropertiesFromExcel = (): Array<{
  location: { city: string; area: string };
  size: { value: number; unit: string };
  floors: string[];
  bedrooms?: number;
  propertyId?: string;
}> => {
  try {
    if (!fs.existsSync(PROPERTIES_FILE)) {
      return [];
    }

    const workbook = XLSX.readFile(PROPERTIES_FILE);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    return data.map((row) => ({
      location: {
        city: row['City'] || '',
        area: row['Area'] || '',
      },
      propertyId: row['Property ID'] || undefined,
      size: {
        value: row['Size Value'] || 0,
        unit: row['Size Unit'] || 'sqft',
      },
      bedrooms: row['Bedrooms'] || undefined,
      floors: row['Floors'] ? row['Floors'].split(', ') : [],
    }));
  } catch (error) {
    console.error('Error reading properties from Excel:', error);
    return [];
  }
};

