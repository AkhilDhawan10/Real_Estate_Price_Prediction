import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { processPDFFile } from '../services/pdf.service';

// Load env from server/.env when running via ts-node
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/property-broker';

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error('Usage: ts-node src/scripts/importLocalPdf.ts <absolute-or-relative-pdf-path>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(inputPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`PDF file not found at path: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`Connecting to MongoDB at ${MONGODB_URI} ...`);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const fileName = path.basename(resolvedPath);
  console.log(`Processing PDF: ${resolvedPath}`);

  try {
    const { saved, errors } = await processPDFFile(resolvedPath, fileName);
    console.log(`✅ Import complete. Saved: ${saved}, Errors: ${errors}`);
  } catch (error: any) {
    console.error('❌ Error processing PDF:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
