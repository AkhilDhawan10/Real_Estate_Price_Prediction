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
  propertyType: string;
  size: { value: number; unit: string };
  price?: number;
  brokerNotes?: string;
}>): void => {
  try {
    const data = properties.map((prop) => ({
      'City': prop.location.city,
      'Area': prop.location.area,
      'Property Type': prop.propertyType,
      'Size Value': prop.size.value,
      'Size Unit': prop.size.unit,
      'Price': prop.price || 0,
      'Broker Notes': prop.brokerNotes || '',
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
  propertyType: string;
  size: { value: number; unit: string };
  price: number;
  brokerNotes?: string;
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
      propertyType: row['Property Type'] || '',
      size: {
        value: row['Size Value'] || 0,
        unit: row['Size Unit'] || 'sqft',
      },
      price: row['Price'] || 0,
      brokerNotes: row['Broker Notes'] || '',
    }));
  } catch (error) {
    console.error('Error reading properties from Excel:', error);
    return [];
  }
};

