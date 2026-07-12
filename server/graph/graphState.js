const { Annotation } = require('@langchain/langgraph');

const GraphState = Annotation.Root({
    company: Annotation(),
    symbol: Annotation(),
    portfolio: Annotation(),
    userConsent: Annotation(),
    evidence: Annotation(),
    financialReport: Annotation(),
    marketReport: Annotation(),
    validationReport: Annotation(),
    investmentReport: Annotation(),
    suitabilityReport: Annotation(),
    error: Annotation({
        reducer: (curr, next) => {
            if (curr && next) return `${curr} | ${next}`;
            return next || curr;
        },
        default: () => null
    }),
    metrics: Annotation({
        reducer: (curr, next) => ({ ...curr, ...next }),
        default: () => ({})
    })
});

module.exports = { GraphState };
