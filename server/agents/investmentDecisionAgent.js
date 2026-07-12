const geminiService = require('../services/geminiService');
const { buildInvestmentDecisionPrompt } = require('../prompts/investmentDecisionPrompt');

async function analyze(evidence, financialReport, marketReport, validationReport) {
    const startTime = Date.now();
    
    // Guard clauses: abort if any previous agent failed
    if (financialReport.error) return financialReport;
    if (marketReport.error) return marketReport;
    if (validationReport.error) return validationReport;

    // Combine all previous reports into a single evidence payload
    const preparedEvidence = prepareInvestmentDecisionEvidence(evidence, financialReport, marketReport, validationReport);
    
    // Build the final decision prompt
    const prompt = buildInvestmentDecisionPrompt(preparedEvidence);

    const MAX_RETRIES = 3;
    let lastError = null;
    let lastRawResponse = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const geminiStartTime = Date.now();
        // Request the final decision from Gemini
        const geminiResponse = await geminiService.generate(prompt);
        const geminiResponseTime = Date.now() - geminiStartTime;
        lastRawResponse = geminiResponse.response;

        if (!geminiResponse.success) {
            lastError = "Failed to generate investment decision analysis";
            
            continue;
        }

        try {
            const parsedData = extractAndParseJSON(geminiResponse.response);
            
            // Schema Validation
            const requiredFields = ['recommendation', 'confidence', 'investmentThesis', 'overallSummary'];
            for (const field of requiredFields) {
                if (!parsedData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Recommendation Validation
            const allowedRecs = ["BUY", "HOLD", "PASS"];
            let rec = parsedData.recommendation?.toUpperCase();
            if (rec === "SELL") rec = "PASS";
            if (rec === "NEUTRAL") rec = "HOLD";
            
            if (!allowedRecs.includes(rec)) {
                throw new Error(`Invalid recommendation returned: ${parsedData.recommendation}`);
            }
            parsedData.recommendation = rec;

            // Confidence Validation
            const allowedConf = ["High", "Medium", "Low"];
            let conf = parsedData.confidence?.charAt(0).toUpperCase() + parsedData.confidence?.slice(1).toLowerCase();
            if (conf === "Moderate") conf = "Medium";
            if (conf === "Strong") conf = "High";
            if (conf === "Weak") conf = "Low";
            
            if (!allowedConf.includes(conf)) {
                throw new Error(`Invalid confidence returned: ${parsedData.confidence}`);
            }
            parsedData.confidence = conf;

            parsedData.metrics = {
                "Decision Agent": {
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
        error: "Failed to parse or validate JSON from Gemini response after retries",
        details: lastError,
        rawResponse: lastRawResponse
    };
}

function prepareInvestmentDecisionEvidence(evidence, financialReport, marketReport, validationReport) {
    if (!evidence || !financialReport || !marketReport || !validationReport) return {};

    const sliceArray = (arr, limit) => Array.isArray(arr) ? arr.slice(0, limit) : arr;

    // 1. Build a new trimmed evidence object directly to avoid deep copying the massive payload
    const trimmedEvidence = {
        company: evidence.company || {},
        stock: evidence.stock || {},
        financials: {},
        ratios: {},
        earnings: {},
        recommendations: {},
        technicals: {},
        insiderSentiment: {},
        news: {}
    };

    // Safely copy and trim each category while preserving provider separation
    const categoriesToTrim = [
        { name: 'financials', limit: 1 },
        { name: 'ratios', limit: 1 },
        { name: 'earnings', limit: 2 },
        { name: 'recommendations', limit: 2 },
        { name: 'technicals', limit: 2 },
        { name: 'insiderSentiment', limit: 2 }
    ];

    for (const cat of categoriesToTrim) {
        const catName = cat.name;
        if (evidence[catName]) {
            for (const provider of Object.keys(evidence[catName])) {
                const val = evidence[catName][provider];
                if (Array.isArray(val)) {
                    trimmedEvidence[catName][provider] = sliceArray(val, cat.limit);
                } else if (typeof val === 'object' && val !== null) {
                    trimmedEvidence[catName][provider] = {};
                    for (const subkey of Object.keys(val)) {
                        if (Array.isArray(val[subkey])) {
                            trimmedEvidence[catName][provider][subkey] = sliceArray(val[subkey], cat.limit);
                        } else {
                            trimmedEvidence[catName][provider][subkey] = val[subkey];
                        }
                    }
                } else {
                    trimmedEvidence[catName][provider] = val;
                }
            }
        }
    }

    if (evidence.news) {
        if (evidence.news.newsApi) trimmedEvidence.news.newsApi = sliceArray(evidence.news.newsApi, 5);
        if (evidence.news.finnhub) trimmedEvidence.news.finnhub = sliceArray(evidence.news.finnhub, 5);
    }

    // 2. Financial Context
    const financialContext = {
        overallSummary: financialReport.overallSummary || "",
        companyOverview: financialReport.companyOverview || {},
        financialHealth: financialReport.financialHealth || {},
        profitability: financialReport.profitability || {},
        valuation: financialReport.valuation || {},
        growth: financialReport.growth || {},
        technicalAnalysis: financialReport.technicalAnalysis || {},
        analystConsensus: financialReport.analystConsensus || {},
        insiderActivity: financialReport.insiderActivity || {},
        strengths: financialReport.strengths || [],
        weaknesses: financialReport.weaknesses || [],
        providerDiscrepancies: financialReport.providerDiscrepancies || [],
        missingEvidence: financialReport.missingEvidence || []
    };

    // 3. Market Context
    const marketContext = {
        newsSummary: marketReport.newsSummary || "",
        majorTopics: (marketReport.majorTopics || []).map(t => ({
            topic: t.topic,
            summary: t.summary,
            sentiment: t.sentiment
        })),
        overallSentiment: marketReport.overallSentiment || "",
        positiveCatalysts: marketReport.positiveCatalysts || [],
        negativeCatalysts: marketReport.negativeCatalysts || [],
        keyRisks: marketReport.keyRisks || [],
        marketOutlook: marketReport.marketOutlook || "",
        missingEvidence: marketReport.missingEvidence || []
    };

    // 4. Validation Context
    const validationContext = {
        financialValidation: validationReport.financialValidation || {},
        marketValidation: validationReport.marketValidation || {},
        providerDiscrepancies: validationReport.providerDiscrepancies || [],
        contradictions: validationReport.contradictions || [],
        missingEvidence: validationReport.missingEvidence || [],
        overallEvidenceQuality: validationReport.overallEvidenceQuality || {},
        decisionGuidance: validationReport.decisionGuidance || [],
        validatedStrengths: validationReport.validatedStrengths || [],
        validatedWeaknesses: validationReport.validatedWeaknesses || [],
        validatedRisks: validationReport.validatedRisks || [],
        validatedWatchItems: validationReport.validatedWatchItems || [],
        validatedCatalysts: validationReport.validatedCatalysts || [],
        validatedLimitations: validationReport.validatedLimitations || [],
        overallSummary: validationReport.overallSummary || ""
    };

    return {
        evidence: trimmedEvidence,
        financialReport: financialContext,
        marketReport: marketContext,
        validationReport: validationContext,
        metadata: {
            generatedAt: evidence.metadata?.generatedAt || "",
            successfulSources: evidence.metadata?.successfulSources || [],
            failedSources: evidence.metadata?.failedSources || [],
            totalSources: evidence.metadata?.totalSources || 0
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
