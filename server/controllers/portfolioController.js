const User = require('../models/User');
const { calculatePortfolioMetrics } = require('../services/portfolioService');

// Calculate and retrieve complete portfolio metrics for the authenticated user
exports.getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const metrics = await calculatePortfolioMetrics(user.portfolio);
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Server error fetching portfolio.',
      error: error.message
    });
  }
};

// Add a new stock holding to the authenticated user's portfolio and save to database
exports.addHolding = async (req, res) => {
  try {
    const { symbol, company, quantity, averageBuyPrice, sector, exchange, purchaseDate } = req.body;

    if (!symbol || quantity === undefined || averageBuyPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide symbol, quantity, and average buy price.'
      });
    }

    if (Number(quantity) <= 0 || Number(averageBuyPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be positive and buy price cannot be negative.'
      });
    }

    const user = await User.findById(req.user._id);
    const upperSymbol = symbol.toUpperCase().trim();

    // Check if a holding with the same ticker symbol already exists in the user's portfolio
    const existingIdx = user.portfolio.holdings.findIndex(
      (h) => h.symbol === upperSymbol
    );

    if (existingIdx !== -1) {
      return res.status(400).json({
        success: false,
        message: `Holding for ${upperSymbol} already exists. Please update the existing holding instead.`
      });
    }

    user.portfolio.holdings.push({
      symbol: upperSymbol,
      company: company || upperSymbol,
      quantity: Number(quantity),
      averageBuyPrice: Number(averageBuyPrice),
      sector: sector || 'General',
      exchange: exchange || 'US',
      purchaseDate: purchaseDate || Date.now()
    });

    await user.save();

    const metrics = await calculatePortfolioMetrics(user.portfolio);
    return res.status(201).json({
      success: true,
      message: `${upperSymbol} added to portfolio.`,
      data: metrics
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Server error adding holding.',
      error: error.message
    });
  }
};

// Update holding properties (quantity, buy price, sector, company) for a specific symbol in the user's portfolio
exports.updateHolding = async (req, res) => {
  try {
    const symbolParam = req.params.symbol.toUpperCase().trim();
    const { quantity, averageBuyPrice, sector, company } = req.body;

    const user = await User.findById(req.user._id);
    const holding = user.portfolio.holdings.find(
      (h) => h.symbol === symbolParam
    );

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: `Holding for ${symbolParam} not found in portfolio.`
      });
    }

    if (quantity !== undefined) {
      if (Number(quantity) <= 0) {
        return res.status(400).json({ success: false, message: 'Quantity must be positive.' });
      }
      holding.quantity = Number(quantity);
    }
    if (averageBuyPrice !== undefined) {
      if (Number(averageBuyPrice) < 0) {
        return res.status(400).json({ success: false, message: 'Average buy price cannot be negative.' });
      }
      holding.averageBuyPrice = Number(averageBuyPrice);
    }
    if (sector !== undefined) holding.sector = sector;
    if (company !== undefined) holding.company = company;

    await user.save();

    const metrics = await calculatePortfolioMetrics(user.portfolio);
    return res.status(200).json({
      success: true,
      message: `${symbolParam} holding updated.`,
      data: metrics
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Server error updating holding.',
      error: error.message
    });
  }
};

// Remove a specific stock holding from the authenticated user's portfolio
exports.removeHolding = async (req, res) => {
  try {
    const symbolParam = req.params.symbol.toUpperCase().trim();
    const user = await User.findById(req.user._id);

    const initialLength = user.portfolio.holdings.length;
    user.portfolio.holdings = user.portfolio.holdings.filter(
      (h) => h.symbol !== symbolParam
    );

    if (user.portfolio.holdings.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: `Holding ${symbolParam} not found.`
      });
    }

    await user.save();

    const metrics = await calculatePortfolioMetrics(user.portfolio);
    return res.status(200).json({
      success: true,
      message: `${symbolParam} removed from portfolio.`,
      data: metrics
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: 'Server error removing holding.',
      error: error.message
    });
  }
};

// Update the user's available cash and monthly target investment amount
exports.updateCash = async (req, res) => {
  try {
    const { cashAvailable, monthlyInvestment } = req.body;
    const user = await User.findById(req.user._id);

    if (cashAvailable !== undefined) {
      if (Number(cashAvailable) < 0) {
        return res.status(400).json({ success: false, message: 'Cash cannot be negative.' });
      }
      user.portfolio.cashAvailable = Number(cashAvailable);
    }
    if (monthlyInvestment !== undefined) {
      if (Number(monthlyInvestment) < 0) {
        return res.status(400).json({ success: false, message: 'Monthly investment cannot be negative.' });
      }
      user.portfolio.monthlyInvestment = Number(monthlyInvestment);
    }

    await user.save();

    const metrics = await calculatePortfolioMetrics(user.portfolio);
    return res.status(200).json({
      success: true,
      message: 'Cash preferences updated.',
      data: metrics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating cash preferences.'
    });
  }
};

// Update the AI personalization consent status for the user's portfolio
exports.updateConsent = async (req, res) => {
  try {
    const { consent } = req.body;
    const user = await User.findById(req.user._id);

    user.portfolio.consent = Boolean(consent);
    await user.save();

    const metrics = await calculatePortfolioMetrics(user.portfolio);
    return res.status(200).json({
      success: true,
      message: `AI personalization consent ${user.portfolio.consent ? 'enabled' : 'disabled'}.`,
      data: metrics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating AI personalization consent.'
    });
  }
};

// Clear all holdings and reset cash, monthly investment, and consent values to defaults
exports.resetPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.portfolio.holdings = [];
    user.portfolio.cashAvailable = 0;
    user.portfolio.monthlyInvestment = 0;
    user.portfolio.consent = false;

    await user.save();

    const metrics = await calculatePortfolioMetrics(user.portfolio);
    return res.status(200).json({
      success: true,
      message: 'Portfolio reset successfully.',
      data: metrics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error resetting portfolio.'
    });
  }
};
