const { sequelize } = require('../config');
const MLService = require('../services/ml.service');
const logger = require('../utils/logger');

class AnalyticsController {
  static async getAttendanceTrends(req, res) {
    try {
      const { courseId, startDate, endDate, interval = 'daily' } = req.query;
      const facultyId = req.user.uid;

      // Verify faculty has access to this course
      if (req.user.role === 'faculty') {
        const facultyCourse = await sequelize.models.FacultyCourse.findOne({
          where: { facultyId, courseId }
        });

        if (!facultyCourse) {
          return res.status(403).json({ error: 'Access denied for this course' });
        }
      }

      let query;
      if (interval === 'daily') {
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
          FROM attendance_records
          WHERE course_id = :courseId
            AND created_at BETWEEN :startDate AND :endDate
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at)
        `;
      } else {
        query = `
          SELECT 
            DATE_TRUNC('week', created_at) as week,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
          FROM attendance_records
          WHERE course_id = :courseId
            AND created_at BETWEEN :startDate AND :endDate
          GROUP BY DATE_TRUNC('week', created_at)
          ORDER BY DATE_TRUNC('week', created_at)
        `;
      }

      const results = await sequelize.query(query, {
        replacements: { courseId, startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      const trends = results.map(row => ({
        date: interval === 'daily' ? row.date : row.week,
        attendanceRate: (row.present / row.total) * 100
      }));

      res.json({
        success: true,
        trends
      });
    } catch (error) {
      logger.error('Get attendance trends error:', error);
      res.status(400).json({ error: 'Failed to fetch attendance trends' });
    }
  }

  static async getStudentPerformance(req, res) {
    try {
      const { studentId } = req.params;
      const requestingUserId = req.user.uid;

      // Verify access
      if (req.user.role === 'student' && studentId !== requestingUserId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const query = `
        SELECT 
          c.course_name,
          COUNT(*) as total_classes,
          SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as attended_classes,
          (SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as attendance_percentage
        FROM attendance_records ar
        JOIN courses c ON ar.course_id = c.id
        WHERE ar.student_id = :studentId
        GROUP BY c.course_name
        ORDER BY attendance_percentage DESC
      `;

      const results = await sequelize.query(query, {
        replacements: { studentId },
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        performance: results
      });
    } catch (error) {
      logger.error('Get student performance error:', error);
      res.status(400).json({ error: 'Failed to fetch student performance' });
    }
  }

  static async getPredictions(req, res) {
    try {
      const { studentId } = req.params;
      const requestingUserId = req.user.uid;

      // Verify access
      if (req.user.role === 'student' && studentId !== requestingUserId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const predictions = await MLService.predictAttendanceRisk(studentId);

      res.json({
        success: true,
        predictions
      });
    } catch (error) {
      logger.error('Get predictions error:', error);
      res.status(400).json({ error: 'Failed to generate predictions' });
    }
  }

  static async generateReport(req, res) {
    try {
      const { reportType, parameters } = req.body;

      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      let report;
      switch (reportType) {
        case 'attendance_summary':
          report = await this.generateAttendanceSummaryReport(parameters);
          break;
        case 'student_risk':
          report = await this.generateStudentRiskReport(parameters);
          break;
        case 'faculty_compliance':
          report = await this.generateFacultyComplianceReport(parameters);
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }

      res.json({
        success: true,
        report
      });
    } catch (error) {
      logger.error('Generate report error:', error);
      res.status(400).json({ error: 'Failed to generate report' });
    }
  }

  static async generateAttendanceSummaryReport(params) {
    // Implementation for attendance summary report
    // This would query the database and format the results
    return {
      type: 'attendance_summary',
      generatedAt: new Date(),
      data: {} // Actual report data
    };
  }

  static async generateStudentRiskReport(params) {
    // Implementation for student risk report
    return {
      type: 'student_risk',
      generatedAt: new Date(),
      data: {} // Actual report data
    };
  }

  static async generateFacultyComplianceReport(params) {
    // Implementation for faculty compliance report
    return {
      type: 'faculty_compliance',
      generatedAt: new Date(),
      data: {} // Actual report data
    };
  }
}

module.exports = AnalyticsController;