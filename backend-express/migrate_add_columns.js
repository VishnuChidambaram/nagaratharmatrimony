import sequelize from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Starting migration to add missing columns...');
    
    // Check if otherEducation column exists
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'userdetails' 
        AND COLUMN_NAME = 'otherEducation'
    `);
    
    if (columns.length === 0) {
      // Column doesn't exist, add it
      await sequelize.query(`
        ALTER TABLE userdetails 
        ADD COLUMN otherEducation TEXT NULL 
        AFTER educationQualification
      `);
      console.log('✓ otherEducation column added successfully');
    } else {
      console.log('✓ otherEducation column already exists, skipping');
    }
    
    // Verify the column was added
    const [results] = await sequelize.query('DESCRIBE userdetails');
    const otherEducationColumn = results.find(col => col.Field === 'otherEducation');
    
    if (otherEducationColumn) {
      console.log('✓ Verified: otherEducation column exists in database');
      console.log('  Type:', otherEducationColumn.Type);
      console.log('  Null:', otherEducationColumn.Null);
    } else {
      console.error('✗ Warning: otherEducation column not found after migration');
    }
    
    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
