import { Sequelize } from 'sequelize';
import sequelize from './config/database.js';

async function addIsDeletedColumn() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('userdetails');

    if (!tableDescription.is_deleted) {
      console.log('Adding is_deleted column...');
      await queryInterface.addColumn('userdetails', 'is_deleted', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      console.log('is_deleted column added successfully.');
    } else {
      console.log('is_deleted column already exists.');
    }
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await sequelize.close();
  }
}

addIsDeletedColumn();
