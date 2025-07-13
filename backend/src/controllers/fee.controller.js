const { firebase } = require('../config');
const logger = require('../utils/logger');

class FeeController {
  static async getFeeStatus(req, res) {
    try {
      const studentId = req.params.studentId || req.user.uid;
      const feeDoc = await firebase.db.collection('fee_records').doc(studentId).get();

      if (!feeDoc.exists) {
        return res.status(404).json({ error: 'Fee record not found' });
      }

      res.json({
        success: true,
        feeStatus: feeDoc.data()
      });
    } catch (error) {
      logger.error('Get fee status error:', error);
      res.status(400).json({ error: 'Failed to fetch fee status' });
    }
  }

  static async updateFeeStatus(req, res) {
    try {
      const { studentId, amount, reference, isPayment } = req.body;
      const adminId = req.user.uid;

      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const feeRef = firebase.db.collection('fee_records').doc(studentId);
      const feeDoc = await feeRef.get();

      const currentData = feeDoc.exists ? feeDoc.data() : {
        studentId,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        paymentHistory: []
      };

      const transaction = {
        amount,
        date: firebase.fieldValue.serverTimestamp(),
        reference,
        processedBy: adminId
      };

      let updateData;
      if (isPayment) {
        updateData = {
          paidAmount: currentData.paidAmount + amount,
          pendingAmount: currentData.pendingAmount - amount,
          paymentHistory: [...currentData.paymentHistory, transaction],
          lastUpdated: firebase.fieldValue.serverTimestamp()
        };
      } else {
        updateData = {
          totalAmount: currentData.totalAmount + amount,
          pendingAmount: currentData.pendingAmount + amount,
          lastUpdated: firebase.fieldValue.serverTimestamp()
        };
      }

      await feeRef.set(updateData, { merge: true });

      logger.info(`Fee record updated for ${studentId} by ${adminId}`);

      res.json({
        success: true,
        message: 'Fee record updated successfully'
      });
    } catch (error) {
      logger.error('Update fee status error:', error);
      res.status(400).json({ error: 'Failed to update fee status' });
    }
  }

  static async getPendingFees(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const pendingFees = await firebase.db.collection('fee_records')
        .where('pendingAmount', '>', 0)
        .get();

      const result = pendingFees.docs.map(doc => doc.data());

      res.json({
        success: true,
        pendingFees: result
      });
    } catch (error) {
      logger.error('Get pending fees error:', error);
      res.status(400).json({ error: 'Failed to fetch pending fees' });
    }
  }

  static async bulkUpdateFees(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const { updates } = req.body;
      const batch = firebase.db.batch();

      updates.forEach(update => {
        const feeRef = firebase.db.collection('fee_records').doc(update.studentId);
        batch.set(feeRef, update.data, { merge: true });
      });

      await batch.commit();

      logger.info(`Bulk fee update performed by ${req.user.uid}`);

      res.json({
        success: true,
        message: 'Bulk update completed successfully'
      });
    } catch (error) {
      logger.error('Bulk update fees error:', error);
      res.status(400).json({ error: 'Bulk update failed' });
    }
  }
}

module.exports = FeeController;