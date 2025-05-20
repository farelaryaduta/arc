import express from 'express';
import { db } from '../config/firebase.js';

const router = express.Router();

// Get system logs with optional filters (type, action, adminId, date range)
router.get('/', async (req, res) => {
  try {
    let query = db.collection('system_logs');
    const { type, action, adminId, start, end } = req.query;
    if (type) query = query.where('type', '==', type);
    if (action) query = query.where('action', '==', action);
    if (adminId) query = query.where('adminId', '==', adminId);
    if (start) query = query.where('timestamp', '>=', new Date(start));
    if (end) query = query.where('timestamp', '<=', new Date(end));
    const snap = await query.orderBy('timestamp', 'desc').limit(200).get();
    const logs = snap.docs.map(doc => doc.data());
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router; 