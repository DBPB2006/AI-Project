const portfolioSuitabilityAgent = require('../../agents/portfolioSuitabilityAgent');

async function suitabilityNode(state) {
    
    if (state.error) {
        return {};
    }

    try {
        const startTime = Date.now();
                const suitabilityReport = await portfolioSuitabilityAgent.analyze(
            state.evidence,
            state.financialReport,
            state.marketReport,
            state.validationReport,
            state.investmentReport,
            state.portfolio
        );
        const executionTime = Date.now() - startTime;
        
        
        if (suitabilityReport.error) {
            return { error: suitabilityReport.details || suitabilityReport.error };
        }

        const metrics = suitabilityReport.metrics || {};
        delete suitabilityReport.metrics;

        return { suitabilityReport: suitabilityReport, metrics: metrics };
    } catch (error) {
        
        
        return { error: error.message };
    }
}

module.exports = suitabilityNode;
