const { getMarketEvidence } = require('../../services/researchEngine');
const marketAnalysisAgent = require('../../agents/marketAnalysisAgent');

async function marketNode(state) {
    
    if (state.error) {
        return {};
    }

    try {
        const startTime = Date.now();
                const marketEvidence = getMarketEvidence(state.evidence, state.financialReport);
        const marketReport = await marketAnalysisAgent.analyze(marketEvidence);
        const executionTime = Date.now() - startTime;
        
        
        if (marketReport.error) {
            return { error: marketReport.details || marketReport.error };
        }

        const metrics = marketReport.metrics || {};
        delete marketReport.metrics;

        return { marketReport: marketReport, metrics: metrics };
    } catch (error) {
        
        
        return { error: error.message };
    }
}

module.exports = marketNode;
