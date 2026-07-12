const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'evidence_ai_secure_secret_key_2026';

/**
 * Required authentication middleware.
 * Verifies Bearer JWT token in Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch user profile excluding password
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user profile no longer exists.'
        });
      }

      next();
    } catch (error) {
      
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token.'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided.'
    });
  }
};

/**
 * Optional authentication middleware.
 * Attaches req.user if a valid token exists, otherwise sets req.user = null.
 */
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  JWT_SECRET
};
