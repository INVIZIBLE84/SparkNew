const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Import seed files
const adminUserSeed = require('./0001-admin-user');
const departmentsSeed = require('./0002-departments');
const facultyUsersSeed = require('./0003-faculty-users');
const coursesSeed = require('./0004-courses');
const studentUsersSeed = require('./0005-student-users');
const enrollmentsSeed = require('./0006-enrollments');
const attendanceSessionsSeed = require('./0007-attendance-sessions');
const attendanceRecordsSeed = require('./0008-attendance-records');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
});

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('Current directory:', __dirname);
    
    // Check if required modules exist
    try {
      require('uuid');
      console.log('✅ uuid module found');
    } catch (e) {
      console.log('❌ uuid module not found:', e.message);
    }
    
    try {
      require('../utils/encryption');
      console.log('✅ encryption module found');
    } catch (e) {
      console.log('❌ encryption module not found:', e.message);
    }
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create seeds tracking table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sequelize_seeds (
        name VARCHAR(255) NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check which seeds have been run
    const [executedSeeds] = await sequelize.query('SELECT name FROM sequelize_seeds');
    const executedSeedNames = executedSeeds.map(row => row.name);
    
    const seeds = [
      { name: '0001-admin-user', fn: adminUserSeed },
      { name: '0002-departments', fn: departmentsSeed },
      { name: '0003-faculty-users', fn: facultyUsersSeed },
      { name: '0004-courses', fn: coursesSeed },
      { name: '0005-student-users', fn: studentUsersSeed },
      { name: '0006-enrollments', fn: enrollmentsSeed },
      { name: '0007-attendance-sessions', fn: attendanceSessionsSeed },
      { name: '0008-attendance-records', fn: attendanceRecordsSeed }
    ];
    
    for (const seed of seeds) {
      if (!executedSeedNames.includes(seed.name)) {
        console.log(`🌱 Running seed: ${seed.name}`);
        await seed.fn.up(sequelize.getQueryInterface());
        await sequelize.query('INSERT INTO sequelize_seeds (name) VALUES (?)', {
          replacements: [seed.name]
        });
        console.log(`✅ Completed seed: ${seed.name}`);
      } else {
        console.log(`⏭️  Skipping seed: ${seed.name} (already executed)`);
      }
    }
    
    console.log('🎉 All seeds completed successfully!');
    console.log('\n📋 Admin credentials:');
    console.log('Email: admin@vedant.edu');
    console.log('Password: Admin@123');
    
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds }; 