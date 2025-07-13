const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration for SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: console.log
});

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create Users table
    console.log('📋 Creating Users table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id VARCHAR(255) PRIMARY KEY,
        uid VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE,
        role VARCHAR(255) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        password VARCHAR(255),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    // Create Sessions table
    console.log('📋 Creating Sessions table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Sessions (
        id VARCHAR(255) PRIMARY KEY,
        courseId VARCHAR(255) NOT NULL,
        facultyId VARCHAR(255) NOT NULL,
        startTime DATETIME NOT NULL,
        endTime DATETIME,
        status VARCHAR(255) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
        location VARCHAR(255),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    // Create Attendance table
    console.log('📋 Creating Attendance table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Attendance (
        id VARCHAR(255) PRIMARY KEY,
        sessionId VARCHAR(255) NOT NULL,
        studentId VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
        checkInTime DATETIME,
        checkOutTime DATETIME,
        location VARCHAR(255),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    // Create Courses table
    console.log('📋 Creating Courses table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Courses (
        id VARCHAR(255) PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        credits INTEGER NOT NULL,
        facultyId VARCHAR(255),
        schedule TEXT,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    // Create Enrollments table
    console.log('📋 Creating Enrollments table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Enrollments (
        id VARCHAR(255) PRIMARY KEY,
        studentId VARCHAR(255) NOT NULL,
        courseId VARCHAR(255) NOT NULL,
        status VARCHAR(255) DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
        enrolledAt DATETIME NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    // Create Notifications table
    console.log('📋 Creating Notifications table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Notifications (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(255) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
        read BOOLEAN DEFAULT FALSE,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    // Create Fees table
    console.log('📋 Creating Fees table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Fees (
        id VARCHAR(255) PRIMARY KEY,
        studentId VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        dueDate DATE NOT NULL,
        status VARCHAR(255) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
        paidAt DATETIME,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    // Create Clearances table
    console.log('📋 Creating Clearances table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Clearances (
        id VARCHAR(255) PRIMARY KEY,
        studentId VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        status VARCHAR(255) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        approvedBy VARCHAR(255),
        approvedAt DATETIME,
        notes TEXT,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    console.log('✅ All migrations completed successfully!');
    
    // Verify tables were created
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Created tables:', tables.map(t => t.name));
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 