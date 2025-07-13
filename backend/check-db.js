const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: console.log
});

async function checkAndSetupDatabase() {
  try {
    console.log('🔍 Checking database...');
    
    // Check if database file exists
    const dbPath = path.join(__dirname, 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      console.log('✅ Database file exists');
    } else {
      console.log('❌ Database file does not exist - will create it');
    }
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if Users table exists
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Existing tables:', tables.map(t => t.name));
    
    if (tables.some(t => t.name === 'Users')) {
      console.log('✅ Users table exists');
      
      // Check if admin user exists
      const [users] = await sequelize.query("SELECT id, email, role FROM Users WHERE email = 'admin@vedant.edu'");
      if (users.length > 0) {
        console.log('✅ Admin user exists:', users[0]);
      } else {
        console.log('❌ Admin user does not exist');
      }
    } else {
      console.log('❌ Users table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAndSetupDatabase(); 