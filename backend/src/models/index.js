const User = require('./user.model');
const Course = require('./course.model');
const Enrollment = require('./enrollment.model');
const Session = require('./session.model');
const Attendance = require('./attendance.model');
const Fee = require('./fee.model');
const Clearance = require('./clearance.model');

// User-Course Enrollment Relationship
User.belongsToMany(Course, {
  through: Enrollment,
  as: 'courses',
  foreignKey: 'studentId',
  otherKey: 'courseId'
});

Course.belongsToMany(User, {
  through: Enrollment,
  as: 'students',
  foreignKey: 'courseId',
  otherKey: 'studentId'
});

// Attendance Relationships
Attendance.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

Attendance.belongsTo(Session, {
  foreignKey: 'sessionId',
  as: 'session'
});

Attendance.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// Session Relationships
Session.belongsTo(User, {
  foreignKey: 'facultyId',
  as: 'faculty'
});

Session.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// Fee Relationships
Fee.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

// Clearance Relationships
Clearance.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

module.exports = {
  User,
  Course,
  Enrollment,
  Session,
  Attendance,
  Fee,
  Clearance
};