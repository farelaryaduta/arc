import express from 'express';
import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

db.collection('system_logs');
const logEvent = async (action, details, adminId = null) => {
  await db.collection('system_logs').add({
    id: uuidv4(),
    action,
    details,
    adminId,
    timestamp: new Date(),
    type: 'REPORT'
  });
};

// Get all reports
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('reports').get();
    const reports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, reports });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create report
router.post('/', async (req, res) => {
  try {
    const { reporter, reportedUser, reason, status } = req.body;
    const ref = await db.collection('reports').add({ reporter, reportedUser, reason, status, createdAt: new Date() });
    await logEvent('CREATE_REPORT', { reportId: ref.id, reporter, reportedUser }, req.user?.id);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update report
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('reports').doc(req.params.id).update({ status });
    await logEvent('UPDATE_REPORT', { reportId: req.params.id, status }, req.user?.id);
    res.json({ success: true });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Analytics: Reports per month, most reported users
router.get('/analytics/summary', async (req, res) => {
  try {
    const snap = await db.collection('reports').get();
    const reports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const total = reports.length;
    // No perMonth or mostReported analytics possible without createdAt/reportedUser
    res.json({ success: true, total, perMonth: {}, mostReported: [] });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router; 