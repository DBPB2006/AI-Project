const geminiService = require('../services/geminiService');
const { buildValidationPrompt } = require('../prompts/validationPrompt');

async function analyze(evidence, financialReport, marketReport) {
    const startTime = Date.now();

    // Prepare a reduced dataset for the AI to validate evidence
    const preparedEvidence = prepareValidationEvidence(evidence, financialReport, marketReport);
    
    // Build the prompt using the prepared evidence
    const prompt = buildValidationPrompt(preparedEvidence);

    const MAX_RETRIES = 3;
    let lastError = null;
    let lastRawResponse = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const geminiStartTime = Date.now();
        // Request validation analysis from Gemini
        const geminiResponse = await geminiService.generate(prompt);
        const geminiResponseTime = Date.now() - geminiStartTime;
        lastRawResponse = geminiResponse.response;

        if (!geminiResponse.success) {
            lastError = "Failed to generate validation analysis";
            
            continue;
        }

        try {
            // Extract and parse JSON from the AI response
            const parsedData = extractAndParseJSON(geminiResponse.response);
            parsedData.metrics = {
                "Validation Agent": {
                    executionTime: Date.now() - startTime,
                    geminiResponseTime: geminiResponseTime,
                    promptSize: prompt.length,
                    preparedEvidenceSize: JSON.stringify(preparedEvidence).length
                }
            };

            
            return parsedData;
        } catch (err) {
            
            lastError = err.message;
        }
    }

    

    
    return {
        error: "Failed to parse JSON from Gemini response after retries",
        details: lastError,
        rawResponse: lastRawResponse
    };
}

function prepareValidationEvidence(evidence, financialReport, marketReport) {
    if (!evidence || !financialReport || !marketReport) return {};

    // Keep token usage minimal, only keep 2 recent observations
    const extractMinimal = (data, count = 2) => {
        if (Array.isArray(data)) return data.slice(0, count);
        return data;
    };

    const trimmedEvidence = {};

    for (const category of Object.keys(evidence)) {
        if (category === 'metadata' || category === 'news') continue;
        
        if (evidence[category]) {
            trimmedEvidence[category] = {};
            for (const provider of Object.keys(evidence[category])) {
                const val = evidence[category][provider];
                if (Array.isArray(val)) {
                    trimmedEvidence[category][provider] = extractMinimal(val, 2);
                } else if (typeof val === 'object' && val !== null) {
                    trimmedEvidence[category][provider] = {};
                    for (const subkey of Object.keys(val)) {
                        if (Array.isArray(val[subkey])) {
                            trimmedEvidence[category][provider][subkey] = extractMinimal(val[subkey], 2);
                        } else {
                            trimmedEvidence[category][provider][subkey] = val[subkey];
                        }
                    }
                } else {
                    trimmedEvidence[category][provider] = val;
                }
            }
        }
    }

    let newsData = [];
    if (evidence.news) {
        if (Array.isArray(evidence.news.newsApi)) {
            newsData = newsData.concat(evidence.news.newsApi.map(a => ({ title: a.title, source: a.source?.name || a.source })));
        }
        if (Array.isArray(evidence.news.finnhub)) {
            newsData = newsData.concat(evidence.news.finnhub.map(a => ({ title: a.title, source: a.source?.name || a.source })));
        }
    }
    const limitedNews = newsData.slice(0, 10);

    // Minimize reports significantly to reduce tokens
    const financialContext = {
        overallSummary: financialReport.overallSummary || "",
        companyOverview: financialReport.companyOverview?.summary || "",
        financialHealth: financialReport.financialHealth?.summary || "",
        profitability: financialReport.profitability?.summary || "",
        valuation: financialReport.valuation?.summary || "",
        growth: financialReport.growth?.summary || "",
        technicalAnalysis: financialReport.technicalAnalysis?.summary || "",
        analystConsensus: financialReport.analystConsensus?.summary || "",
        insiderActivity: financialReport.insiderActivity?.summary || "",
        providerDiscrepancies: financialReport.providerDiscrepancies || [],
        missingEvidence: financialReport.missingEvidence || []
    };

    const marketContext = {
        newsSummary: marketReport.newsSummary || "",
        majorTopics: marketReport.majorTopics ? marketReport.majorTopics.map(t => ({ topic: t.topic, sentiment: t.sentiment, summary: t.summary })) : [],
        overallSentiment: marketReport.overallSentiment || "",
        missingEvidence: marketReport.missingEvidence || []
    };

    // Return context objects directly
    return {
        financialContext: financialContext,
        marketContext: marketContext,
        originalEvidence: trimmedEvidence,
        originalNewsTitles: limitedNews,
        metadata: {
            successfulSources: evidence.metadata?.successfulSources || [],
            failedSources: evidence.metadata?.failedSources || [],
            generatedAt: evidence.metadata?.generatedAt || ""
        }
    };
}

// Utility function to cleanly extract JSON from markdown or raw text
function extractAndParseJSON(responseStr) {
    let text = responseStr.trim();
    
    try {
        return JSON.parse(text);
    } catch (e) {}

    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        try {
            return JSON.parse(match[1].trim());
        } catch (e) {}
    }

    const startIndex = text.indexOf('{');
    if (startIndex !== -1) {
        let openBraces = 0;
        let endIndex = -1;
        let inString = false;
        let escapeNext = false;
        
        for (let i = startIndex; i < text.length; i++) {
            const char = text[i];
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            if (char === '"') {
                inString = !inString;
                continue;
            }
            if (!inString) {
                if (char === '{') openBraces++;
                if (char === '}') {
                    openBraces--;
                    if (openBraces === 0) {
                        endIndex = i;
                        break;
                    }
                }
            }
        }
        
        if (endIndex !== -1) {
            try {
                return JSON.parse(text.substring(startIndex, endIndex + 1));
            } catch (e) {}
        }
    }

    throw new Error("Failed to extract valid JSON from response");
}

module.exports = {
    analyze
};
