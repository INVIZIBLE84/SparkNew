const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    console.log('✅ Password hashed');
    
    // Check if admin user already exists
    const [existingUsers] = await sequelize.query(
      "SELECT id, email FROM Users WHERE email = 'admin@vedant.edu'"
    );
    
    if (existingUsers.length > 0) {
      console.log('⚠️  Admin user already exists');
      console.log('📋 Admin credentials:');
      console.log('Email: admin@vedant.edu');
      console.log('Password: Admin@123');
      return;
    }
    
    // Create admin user
    const adminId = uuidv4();
    const username = 'admin'; // Generate username from email
    
    await sequelize.query(`
      INSERT INTO Users (id, uid, email, username, role, name, department, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        adminId,
        'admin-001',
        'admin@vedant.edu',
        username,
        'admin',
        'System Administrator',
        'Administration',
        hashedPassword,
        new Date(),
        new Date()
      ]
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin credentials:');
    console.log('Email: admin@vedant.edu');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser }; 