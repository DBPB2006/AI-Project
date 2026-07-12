const evidenceValidationAgent = require('../../agents/evidenceValidationAgent');

async function validationNode(state) {
    // Skip execution if there is an error in the graph state
    if (state.error) {
        return {};
    }

    try {
        // Track the execution duration of the validation analysis
        const startTime = Date.now();
        const validationReport = await evidenceValidationAgent.analyze(
            state.evidence, 
            state.financialReport, 
            state.marketReport
        );
        const executionTime = Date.now() - startTime;
        
        // Return error details if the validation agent encountered a failure
        if (validationReport.error) {
            return { error: validationReport.details || validationReport.error };
        }

        const metrics = validationReport.metrics || {};
        delete validationReport.metrics;

        return { validationReport: validationReport, metrics: metrics };
    } catch (error) {
        // Capture and return any unexpected exception errors
        return { error: error.message };
    }
}

module.exports = validationNode;
