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
    type: 'MESSAGE'
  });
};

// Get all messages
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('messages').get();
    const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, messages });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create message
router.post('/', async (req, res) => {
  try {
    const { sender, receiver, content, type } = req.body;
    const ref = await db.collection('messages').add({ sender, receiver, content, type, createdAt: new Date() });
    await logEvent('CREATE_MESSAGE', { messageId: ref.id, sender, receiver }, req.user?.id);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete message
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('messages').doc(req.params.id).delete();
    await logEvent('DELETE_MESSAGE', { messageId: req.params.id }, req.user?.id);
    res.json({ success: true });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Analytics: Messages per month using timestamp field
router.get('/analytics/summary', async (req, res) => {
  try {
    const snap = await db.collection('messages').get();
    const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const total = messages.length;
    // Messages per month using timestamp
    const perMonth = {};
    messages.forEach(m => {
      if (m.timestamp && typeof m.timestamp.toDate === 'function') {
        const d = m.timestamp.toDate();
        const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
        perMonth[key] = (perMonth[key] || 0) + 1;
      }
    });
    res.json({ success: true, total, perMonth });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router; 