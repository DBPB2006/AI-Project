const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'evidence_ai_secure_secret_key_2026';

/**
 * Middleware to enforce authentication by validating the Bearer token in the Authorization header.
 * Attaches the authenticated user object to the request.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify the JWT token signature and decode its payload
      const decoded = jwt.verify(token, JWT_SECRET);

      // Retrieve the user document from the database using the decoded user ID
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user profile no longer exists.'
        });
      }

      next();
    } catch (error) {
      // Handle token verification failure or database lookup error
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
 * Middleware to optionally authenticate a request by checking for a Bearer token.
 * Attaches the user object if a valid token is found, or leaves req.user null.
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
