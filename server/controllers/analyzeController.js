const { runInvestmentGraph } = require('../graph');
const Company = require('../models/Company');
const Analysis = require('../models/Analysis');
const { buildPresentationData } = require('../utils/presentationBuilder');

/**
 * Controller for the /api/analyze endpoint.
 * Acts as a bridge between the frontend and the AI Investment Pipeline (LangGraph).
 *
 * Expects a POST request with a JSON body containing a 'symbol' property.
 */
exports.analyzeStock = async (req, res) => {
  try {
    const { symbol, portfolio, userConsent } = req.body;

    // 1. Validate the Request
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid stock symbol is required in the request body.'
      });
    }

    // 2. Lookup Company Name
    const ticker = symbol.toUpperCase().trim();
    const companyData = await Company.findOne({ symbol: ticker });
    if (!companyData) {
      return res.status(404).json({
        success: false,
        message: `Company with symbol ${ticker} not found in database.`
      });
    }

    // 3. Determine portfolio object based on authenticated user consent or request
    let resolvedPortfolio = null;
    if (req.user && req.user.portfolio && req.user.portfolio.consent) {
      const userPortfolio = req.user.portfolio.toObject ? req.user.portfolio.toObject() : req.user.portfolio;
      const userPreferences = req.user.preferences ? (req.user.preferences.toObject ? req.user.preferences.toObject() : req.user.preferences) : {};
      
      // Combine portfolio holdings/cash with user risk preferences for the Suitability Agent
      resolvedPortfolio = {
        ...userPortfolio,
        ...userPreferences
      };
    } else if (portfolio) {
      resolvedPortfolio = portfolio.toObject ? portfolio.toObject() : portfolio;
    }
    // Unauthenticated users without a provided portfolio will just skip suitability mapping.

    // 4. Run the AI Investment Pipeline (LangGraph)
    const finalState = await runInvestmentGraph(
      companyData.name,
      ticker,
      resolvedPortfolio,
      userConsent || Boolean(resolvedPortfolio)
    );

    // 5. Save report to Analysis History if user is authenticated
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
        
      }
    }

    // 6. Build the canonical Presentation Object
    finalState.presentationData = buildPresentationData(finalState);

    // 7. Return the Final State to Frontend
    return res.status(200).json({
      success: true,
      data: finalState
    });
  } catch (error) {
    

    // Handle MongoDB "not found" error elegantly
    if (error.message.includes('not found in database')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: 'An error occurred while executing the AI pipeline.',
      error: error.message
    });
  }
};
