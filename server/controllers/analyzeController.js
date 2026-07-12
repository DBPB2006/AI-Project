const { runInvestmentGraph } = require('../graph');
const Company = require('../models/Company');
const Analysis = require('../models/Analysis');
const { buildPresentationData } = require('../utils/presentationBuilder');

/**
 * Route handler for the stock analysis request.
 * Orchestrates fetching the company data and calling the AI pipeline.
 */
exports.analyzeStock = async (req, res) => {
  try {
    const { symbol, portfolio, userConsent } = req.body;

    // Verify the stock symbol is present in the request body
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid stock symbol is required in the request body.'
      });
    }

    // Find the company matching the requested ticker symbol in the database
    const ticker = symbol.toUpperCase().trim();
    const companyData = await Company.findOne({ symbol: ticker });
    if (!companyData) {
      return res.status(404).json({
        success: false,
        message: `Company with symbol ${ticker} not found in database.`
      });
    }

    // Retrieve and format user portfolio and preference details based on user authentication status
    let resolvedPortfolio = null;
    if (req.user && req.user.portfolio && req.user.portfolio.consent) {
      const userPortfolio = req.user.portfolio.toObject ? req.user.portfolio.toObject() : req.user.portfolio;
      const userPreferences = req.user.preferences ? (req.user.preferences.toObject ? req.user.preferences.toObject() : req.user.preferences) : {};
      
      // Merge portfolio holdings/cash data with user risk preferences
      resolvedPortfolio = {
        ...userPortfolio,
        ...userPreferences
      };
    } else if (portfolio) {
      resolvedPortfolio = portfolio.toObject ? portfolio.toObject() : portfolio;
    }
    // Proceed without portfolio context if the request lacks auth or manual portfolio data

    // Execute the LangGraph workflow to process investment, market, and validation agents
    const finalState = await runInvestmentGraph(
      companyData.name,
      ticker,
      resolvedPortfolio,
      userConsent || Boolean(resolvedPortfolio)
    );

    // Store the resulting analysis report in the database history for authenticated users
    if (req.user) {
      try {
        await Analysis.create({
          user: req.user._id,
          symbol: ticker,
          company: companyData.name,
          recommendation: finalState?.investmentReport?.recommendation || 'HOLD',
          confidence: finalState?.investmentReport?.confidence || 'N/A',
          reportData: finalState
        });
      } catch (historyErr) {
        // Silently catch history logging errors to avoid failing the analysis response
      }
    }

    // Formulate standard display structures from the pipeline results
    finalState.presentationData = buildPresentationData(finalState);

    // Respond with the completed analysis state object
    return res.status(200).json({
      success: true,
      data: finalState
    });
  } catch (error) {
    

    // Send a 404 response if the database lookup reveals the ticker is missing
    if (error.message.includes('not found in database')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Catch and return any unhandled execution errors with a 500 status code
    return res.status(500).json({
      success: false,
      message: 'An error occurred while executing the AI pipeline.',
      error: error.message
    });
  }
};
