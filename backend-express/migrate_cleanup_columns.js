import sequelize from './config/database.js';
import fs from 'fs';

async function runCleanupMigration() {
  try {
    console.log('Starting schema cleanup migration...');
    
    // 1. Drop unwanted columns
    const columnsToDrop = ['imagePath', 'pdfPath'];
    
    for (const col of columnsToDrop) {
      // Check if column exists
      const [columns] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
          AND TABLE_NAME = 'userdetails' 
          AND COLUMN_NAME = '${col}'
      `);
      
      if (columns.length > 0) {
        console.log(`Dropping column: ${col}...`);
        await sequelize.query(`ALTER TABLE userdetails DROP COLUMN ${col}`);
        console.log(`✓ Dropped ${col}`);
      } else {
        console.log(`Column ${col} does not exist, skipping drop.`);
      }
    }
    
    // 2. Add missing column: otherOccupation
    // Check if otherOccupation column exists
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'userdetails' 
        AND COLUMN_NAME = 'otherOccupation'
    `);
    
    if (columns.length === 0) {
      console.log('Adding missing column: otherOccupation...');
      await sequelize.query(`
        ALTER TABLE userdetails 
        ADD COLUMN otherOccupation TEXT NULL 
        AFTER occupationBusiness
      `);
      console.log('✓ Added otherOccupation');
    } else {
      console.log('Column otherOccupation already exists, skipping add.');
    }
    
    console.log('\nCleanup migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runCleanupMigration();
