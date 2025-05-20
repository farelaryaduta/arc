import express from 'express';
import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Utility: Log system events
db.collection('system_logs'); // Ensure collection exists
const logEvent = async (action, details, adminId = null) => {
  await db.collection('system_logs').add({
    id: uuidv4(),
    action,
    details,
    adminId,
    timestamp: new Date(),
    type: 'USER'
  });
};

// Get all users
router.get('/', async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, users });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userRef = await db.collection('users').add({ name, email, password, createdAt: new Date() });
    await logEvent('CREATE_USER', { userId: userRef.id, name, email }, req.user?.id);
    res.json({ success: true, id: userRef.id });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, password } = req.body;
    const updateData = { name };
    if (password) updateData.password = password;
    await db.collection('users').doc(req.params.id).update(updateData);
    await logEvent('UPDATE_USER', { userId: req.params.id, ...updateData }, req.user?.id);
    res.json({ success: true });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    await logEvent('DELETE_USER', { userId: req.params.id }, req.user?.id);
    res.json({ success: true });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Analytics: User count only (no growth or active analytics possible)
router.get('/analytics/summary', async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const total = users.length;
    res.json({ success: true, total });
  } catch (err) {
    await logEvent('ERROR', { error: err.message }, req.user?.id);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router; 