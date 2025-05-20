import express from 'express';
import { auth, db } from '../config/firebase.js';

const router = express.Router();

// Login route - This will verify the Firebase ID token
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'ID token is required'
      });
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user data from Firestore
    const userDoc = await db.collection('admin_users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User not found in admin database'
      });
    }

    const userData = userDoc.data();

    // Check if user is active
    if (userData.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Update last login
    await db.collection('admin_users').doc(uid).update({
      lastLogin: new Date()
    });

    // Create a custom session token
    const customToken = await auth.createCustomToken(uid, {
      role: userData.role
    });

    res.json({
      success: true,
      data: {
        user: {
          id: uid,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          status: userData.status
        },
        customToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token or authentication failed'
    });
  }
});

// Verify token route
router.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'ID token is required'
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user data
    const userDoc = await db.collection('admin_users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      data: {
        user: {
          id: uid,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          status: userData.status
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Firebase handles token revocation on the client side
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router; 