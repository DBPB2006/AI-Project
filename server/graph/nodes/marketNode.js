const { getMarketEvidence } = require('../../services/researchEngine');
const marketAnalysisAgent = require('../../agents/marketAnalysisAgent');

async function marketNode(state) {
    // Skip execution if there is an error in the graph state
    if (state.error) {
        return {};
    }

    try {
        // Track the execution duration of the market analysis
        const startTime = Date.now();
        const marketEvidence = getMarketEvidence(state.evidence, state.financialReport);
        const marketReport = await marketAnalysisAgent.analyze(marketEvidence);
        const executionTime = Date.now() - startTime;
        
        // Return error details if the market analysis agent encountered a failure
        if (marketReport.error) {
            return { error: marketReport.details || marketReport.error };
        }

        const metrics = marketReport.metrics || {};
        delete marketReport.metrics;

        return { marketReport: marketReport, metrics: metrics };
    } catch (error) {
        // Capture and return any unexpected exception errors
        return { error: error.message };
    }
}

module.exports = marketNode;
