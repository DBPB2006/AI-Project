const { research } = require('../../services/researchEngine');

async function researchNode(state) {
    // Skip execution if there is an error in the graph state
    if (state.error) {
        return {};
    }

    try {
        // Track the execution duration of the research agent
        const startTime = Date.now();
        const evidence = await research(state.symbol);
        const executionTime = Date.now() - startTime;
        
        // Return error details if the research agent failed or returned an empty evidence package
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
        // Capture and return any unexpected exception errors
        return { error: error.message };
    }
}

module.exports = researchNode;
