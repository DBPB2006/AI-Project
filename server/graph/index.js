const { investmentApp } = require('./investmentGraph');

async function runInvestmentGraph(company, symbol, portfolio, userConsent) {
    const initialState = {
        company: company,
        symbol: symbol,
        portfolio: portfolio || null,
        userConsent: userConsent !== undefined ? userConsent : (portfolio ? true : false),
        evidence: null,
        financialReport: null,
        marketReport: null,
        validationReport: null,
        investmentReport: null,
        suitabilityReport: null,
        error: null
    };

        const startTime = Date.now();
    const finalState = await investmentApp.invoke(initialState);
    const executionTime = Date.now() - startTime;
        
    
    
    


    return finalState;
}

module.exports = { runInvestmentGraph };
