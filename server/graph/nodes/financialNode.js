const { getFinancialEvidence } = require('../../services/researchEngine');
const financialAnalysisAgent = require('../../agents/financialAnalysisAgent');

async function financialNode(state) {
    // Skip execution if there is an error in the graph state
    if (state.error) {
        return {};
    }

    try {
        // Track the execution duration of the financial analysis
        const startTime = Date.now();
        const financialEvidence = getFinancialEvidence(state.evidence);
        const financialReport = await financialAnalysisAgent.analyze(financialEvidence);
        const executionTime = Date.now() - startTime;
        
        // Return error details if the financial analysis agent encountered a failure
        if (financialReport.error) {
            return { error: financialReport.details || financialReport.error };
        }

        const metrics = financialReport.metrics || {};
        delete financialReport.metrics;

        return { financialReport: financialReport, metrics: metrics };
    } catch (error) {
        // Capture and return any unexpected exception errors
        return { error: error.message };
    }
}

module.exports = financialNode;
