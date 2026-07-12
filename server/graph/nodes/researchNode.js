const { research } = require('../../services/researchEngine');

async function researchNode(state) {
    
    if (state.error) {
        return {};
    }

    try {
        const startTime = Date.now();
                const evidence = await research(state.symbol);
        const executionTime = Date.now() - startTime;
        
                
        if (!evidence || evidence.error) {
            return { error: evidence?.error || "Research Engine failed to return evidence" };
        }

        return { 
            evidence: evidence,
            metrics: {
                "Research Engine": {
                    executionTime: executionTime
                }
            }
        };
    } catch (error) {
        
        
        return { error: error.message };
    }
}

module.exports = researchNode;
