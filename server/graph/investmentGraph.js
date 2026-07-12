const { StateGraph, END, START } = require('@langchain/langgraph');
const { GraphState } = require('./graphState');

const researchNode = require('./nodes/researchNode');
const financialNode = require('./nodes/financialNode');
const marketNode = require('./nodes/marketNode');
const validationNode = require('./nodes/validationNode');
const decisionNode = require('./nodes/decisionNode');
const suitabilityNode = require('./nodes/suitabilityNode');

const workflow = new StateGraph(GraphState)
    .addNode("research", researchNode)
    .addNode("financial", financialNode)
    .addNode("market", marketNode)
    .addNode("validation", validationNode)
    .addNode("decision", decisionNode)
    .addNode("suitability", suitabilityNode)
    
    .addEdge(START, "research")
    
    .addConditionalEdges("research", (state) => state.error ? END : ["financial", "market"])
    
    .addEdge(["financial", "market"], "validation")
    
    .addConditionalEdges("validation", (state) => state.error ? END : "decision")
    .addConditionalEdges("decision", (state) => {
        if (state.error) return END;
        if (state.portfolio && state.userConsent !== false) return "suitability";
        return END;
    })
    
    .addEdge("suitability", END);

const investmentApp = workflow.compile();

module.exports = { investmentApp };
