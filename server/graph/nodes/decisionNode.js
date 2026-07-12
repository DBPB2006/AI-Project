const investmentDecisionAgent = require('../../agents/investmentDecisionAgent');

async function decisionNode(state) {
    
    if (state.error) {
        return {};
    }

    try {
        const startTime = Date.now();
                const decisionReport = await investmentDecisionAgent.analyze(
            state.evidence,
            state.financialReport,
            state.marketReport,
            state.validationReport
        );
        const executionTime = Date.now() - startTime;
        
        
        if (decisionReport.error) {
            return { error: decisionReport.details || decisionReport.error };
        }

        return { investmentReport: decisionReport };
    } catch (error) {
        
        
        return { error: error.message };
    }
}

module.exports = decisionNode;
