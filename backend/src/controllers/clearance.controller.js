const { firebase } = require('../config');
const logger = require('../utils/logger');

class ClearanceController {
  static async submitClearance(req, res) {
    try {
      const studentId = req.user.uid;
      const { formType, documents } = req.body;

      const clearanceData = {
        studentId,
        formType,
        status: 'pending',
        submittedAt: firebase.fieldValue.serverTimestamp(),
        approvals: [],
        documents
      };

      const clearanceRef = await firebase.db.collection('clearance_forms').add(clearanceData);

      logger.info(`Clearance form submitted by ${studentId}`);

      res.status(201).json({
        success: true,
        formId: clearanceRef.id,
        message: 'Clearance form submitted successfully'
      });
    } catch (error) {
      logger.error('Submit clearance error:', error);
      res.status(400).json({ error: 'Failed to submit clearance form' });
    }
  }

  static async getPendingClearances(req, res) {
    try {
      const facultyId = req.user.uid;
      const userDoc = await firebase.db.collection('users').doc(facultyId).get();
      const userRole = userDoc.data().role;

      if (!['admin', 'faculty'].includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const pendingClearances = await firebase.db.collection('clearance_forms')
        .where('status', '==', 'pending')
        .get();

      const result = pendingClearances.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        clearances: result
      });
    } catch (error) {
      logger.error('Get pending clearances error:', error);
      res.status(400).json({ error: 'Failed to fetch pending clearances' });
    }
  }

  static async approveClearance(req, res) {
    try {
      const facultyId = req.user.uid;
      const { formId, comments } = req.body;

      const userDoc = await firebase.db.collection('users').doc(facultyId).get();
      const userRole = userDoc.data().role;

      const approval = {
        approverRole: userRole,
        approverId: facultyId,
        status: 'approved',
        timestamp: firebase.fieldValue.serverTimestamp(),
        comments
      };

      const formRef = firebase.db.collection('clearance_forms').doc(formId);
      await formRef.update({
        approvals: firebase.fieldValue.arrayUnion(approval)
      });

      // Check if all required approvals are completed
      await this.checkClearanceCompletion(formId);

      logger.info(`Clearance form ${formId} approved by ${facultyId}`);

      res.json({
        success: true,
        message: 'Clearance approved successfully'
      });
    } catch (error) {
      logger.error('Approve clearance error:', error);
      res.status(400).json({ error: 'Failed to approve clearance' });
    }
  }

  static async checkClearanceCompletion(formId) {
    const formDoc = await firebase.db.collection('clearance_forms').doc(formId).get();
    const formData = formDoc.data();
    
    // Logic to determine if all required approvals are completed
    // This would depend on your specific business rules
    const allApproved = true; // Replace with actual logic
    
    if (allApproved) {
      await formDoc.ref.update({
        status: 'approved'
      });
    }
  }

  static async getClearanceStatus(req, res) {
    try {
      const studentId = req.params.studentId || req.user.uid;
      
      const clearances = await firebase.db.collection('clearance_forms')
        .where('studentId', '==', studentId)
        .get();

      const result = clearances.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        clearances: result
      });
    } catch (error) {
      logger.error('Get clearance status error:', error);
      res.status(400).json({ error: 'Failed to fetch clearance status' });
    }
  }
}

module.exports = ClearanceController;