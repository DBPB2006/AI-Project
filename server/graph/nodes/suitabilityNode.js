const portfolioSuitabilityAgent = require('../../agents/portfolioSuitabilityAgent');

async function suitabilityNode(state) {
    // Skip execution if there is an error in the graph state
    if (state.error) {
        return {};
    }

    try {
        // Track the execution duration of the portfolio suitability analysis
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
        
        // Return error details if the suitability agent encountered a failure
        if (suitabilityReport.error) {
            return { error: suitabilityReport.details || suitabilityReport.error };
        }

        const metrics = suitabilityReport.metrics || {};
        delete suitabilityReport.metrics;

        return { suitabilityReport: suitabilityReport, metrics: metrics };
    } catch (error) {
        // Capture and return any unexpected exception errors
        return { error: error.message };
    }
}

module.exports = suitabilityNode;
