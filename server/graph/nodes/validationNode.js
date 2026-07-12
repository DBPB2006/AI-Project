const evidenceValidationAgent = require('../../agents/evidenceValidationAgent');

async function validationNode(state) {
    
    if (state.error) {
        return {};
    }

    try {
        const startTime = Date.now();
                const validationReport = await evidenceValidationAgent.analyze(
            state.evidence, 
            state.financialReport, 
            state.marketReport
        );
        const executionTime = Date.now() - startTime;
        
        
        if (validationReport.error) {
            return { error: validationReport.details || validationReport.error };
        }

        const metrics = validationReport.metrics || {};
        delete validationReport.metrics;

        return { validationReport: validationReport, metrics: metrics };
    } catch (error) {
        
        
        return { error: error.message };
    }
}

module.exports = validationNode;
