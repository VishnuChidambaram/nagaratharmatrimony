import sequelize from './config/database.js';
import UserDetail from './models/UserDetail.js';
import fs from 'fs';

async function verifySchema() {
  try {
    console.log('Verifying database schema matches Sequelize model...\n');
    
    // Get all columns from the database
    const [dbColumns] = await sequelize.query('DESCRIBE userdetails');
    const dbColumnNames = dbColumns.map(col => col.Field);
    
    // Get all attributes from the Sequelize model
    const modelAttributes = Object.keys(UserDetail.rawAttributes);
    
    console.log('Model attributes count:', modelAttributes.length);
    console.log('Database columns count:', dbColumnNames.length);
    console.log('');
    
    // Find missing columns (in model but not in database)
    const missingInDb = modelAttributes.filter(attr => !dbColumnNames.includes(attr));
    
    // Find extra columns (in database but not in model)
    const extraInDb = dbColumnNames.filter(col => !modelAttributes.includes(col));
    
    if (missingInDb.length > 0) {
      console.log('⚠️  Columns defined in model but MISSING in database:');
      missingInDb.forEach(col => console.log('  -', col));
      console.log('');
    } else {
      console.log('✓ All model attributes exist in database');
      console.log('');
    }
    
    if (extraInDb.length > 0) {
      console.log('ℹ️  Columns in database but NOT in model:');
      extraInDb.forEach(col => console.log('  -', col));
      console.log('');
    }
    
    const result = {
      missingInDb,
      extraInDb,
      otherEducationExists: dbColumnNames.includes('otherEducation')
    };
    
    fs.writeFileSync('schema_diff.json', JSON.stringify(result, null, 2));
    console.log('Schema diff written to schema_diff.json');
    
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifySchema();
