const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * Generate a JWT token for an authenticated user
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Create a new user account if the provided name, email, and password are valid and email is unique
exports.register = async (req, res) => {
  try {
    const { name, email, password, consent } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if the provided email is already registered in the database
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      portfolio: {
        consent: Boolean(consent),
        cashAvailable: 0,
        monthlyInvestment: 0,
        holdings: []
      }
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        portfolio: {
          consent: user.portfolio.consent,
          cashAvailable: user.portfolio.cashAvailable,
          monthlyInvestment: user.portfolio.monthlyInvestment
        }
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message
    });
  }
};

// Authenticate user credentials and return a session token upon successful validation
exports.login = async (req, res) => {
  try {
    const { email, password, consent } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Retrieve the user document matching the email, selecting the password field since it is hidden by default
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (consent !== undefined) {
      user.portfolio.consent = Boolean(consent);
      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        portfolio: {
          consent: user.portfolio.consent,
          cashAvailable: user.portfolio.cashAvailable,
          monthlyInvestment: user.portfolio.monthlyInvestment
        }
      }
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message
    });
  }
};

// Retrieve the authenticated user's profile details from the database
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        portfolio: {
          consent: user.portfolio.consent,
          cashAvailable: user.portfolio.cashAvailable,
          monthlyInvestment: user.portfolio.monthlyInvestment
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching profile.'
    });
  }
};

// Update the user's name, email, or investment preferences in the database
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const { name, email, preferences } = req.body;

    if (name) user.name = name;
    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'That email is already registered.'
        });
      }
      user.email = email.toLowerCase();
    }

    if (preferences) {
      user.preferences = {
        ...user.preferences.toObject(),
        ...preferences
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        portfolio: {
          consent: user.portfolio.consent,
          cashAvailable: user.portfolio.cashAvailable,
          monthlyInvestment: user.portfolio.monthlyInvestment
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.',
      error: error.message
    });
  }
};

// Verify the current password and update it to the new password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating password.',
      error: error.message
    });
  }
};

// Invalidate the user session by returning a successful logout response
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};
