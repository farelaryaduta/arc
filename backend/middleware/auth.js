import { auth, db } from '../config/firebase.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get user data from Firestore
    const userDoc = await db.collection('admin_users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    if (userData.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active'
      });
    }

    req.user = {
      id: uid,
      ...userData
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}; 