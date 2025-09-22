const admin = require('../config/firebase');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ 
      where: { firebaseUid: decodedToken.uid },
      include: ['entrepreneur', 'ally', 'client']
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const isSuperUser = (req, res, next) => {
  if (req.user.role !== 'super_user') {
    return res.status(403).json({ error: 'Super user access required' });
  }
  next();
};

const isEntrepreneur = (req, res, next) => {
  if (req.user.role !== 'entrepreneur') {
    return res.status(403).json({ error: 'Entrepreneur access required' });
  }
  next();
};

const isAlly = (req, res, next) => {
  if (req.user.role !== 'ally') {
    return res.status(403).json({ error: 'Ally access required' });
  }
  next();
};

const isClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ error: 'Client access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  isSuperUser,
  isEntrepreneur,
  isAlly,
  isClient
};