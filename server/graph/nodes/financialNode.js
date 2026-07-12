const { getFinancialEvidence } = require('../../services/researchEngine');
const financialAnalysisAgent = require('../../agents/financialAnalysisAgent');

async function financialNode(state) {
    
    if (state.error) {
        return {};
    }

    try {
        const startTime = Date.now();
                const financialEvidence = getFinancialEvidence(state.evidence);
        const financialReport = await financialAnalysisAgent.analyze(financialEvidence);
        const executionTime = Date.now() - startTime;
        
        
        if (financialReport.error) {
            return { error: financialReport.details || financialReport.error };
        }

        const metrics = financialReport.metrics || {};
        delete financialReport.metrics;

        return { financialReport: financialReport, metrics: metrics };
    } catch (error) {
        
        
        return { error: error.message };
    }
}

module.exports = financialNode;
