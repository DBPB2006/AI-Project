const investmentDecisionAgent = require('../../agents/investmentDecisionAgent');

async function decisionNode(state) {
    // Skip execution if there is an error in the graph state
    if (state.error) {
        return {};
    }

    try {
        // Track the execution duration of the investment decision analysis
        const startTime = Date.now();
        const decisionReport = await investmentDecisionAgent.analyze(
            state.evidence,
            state.financialReport,
            state.marketReport,
            state.validationReport
        );
        const executionTime = Date.now() - startTime;
        
        // Return error details if the investment decision analysis encountered a failure
        if (decisionReport.error) {
            return { error: decisionReport.details || decisionReport.error };
        }

        return { investmentReport: decisionReport };
    } catch (error) {
        // Capture and return any unexpected exception errors
        return { error: error.message };
    }
}

module.exports = decisionNode;
