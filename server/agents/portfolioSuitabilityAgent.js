const geminiService = require('../services/geminiService');
const { buildPortfolioSuitabilityPrompt } = require('../prompts/portfolioSuitabilityPrompt');

async function analyze(evidence, financialReport, marketReport, validationReport, investmentReport, portfolio) {
    const startTime = Date.now();
    
    // Skip suitability analysis if preceding agents encountered execution failures
    if (investmentReport?.error) return investmentReport;
    if (validationReport?.error) return validationReport;

    // Return standard skip status if no portfolio data is provided
    if (!portfolio) {
        return {
            portfolioAnalysisSkipped: true,
            reason: "No portfolio information was provided.",
            overallSummary: "Portfolio suitability analysis was skipped because no portfolio information is available.",
            metrics: {
                "Suitability Agent": { executionTime: Date.now() - startTime }
            }
        };
    }

    if (portfolio.consent === false) {
        return {
            portfolioAnalysisSkipped: true,
            reason: "The user did not consent to portfolio analysis.",
            overallSummary: "Portfolio suitability analysis was skipped because the user declined portfolio personalization.",
            metrics: {
                "Suitability Agent": { executionTime: Date.now() - startTime }
            }
        };
    }

    // Format suitability context from previous agent outputs and metadata
    const decisionEvidence = preparePortfolioSuitabilityContext(evidence, validationReport, investmentReport);
    
    // Measure raw context size vs prepared payload size to check token reduction
    const originalContextSize = JSON.stringify({ evidence, validationReport, investmentReport }).length;
    const preparedContextSize = JSON.stringify(decisionEvidence).length;
    const reductionPercent = ((originalContextSize - preparedContextSize) / originalContextSize * 100).toFixed(2);

    const prompt = buildPortfolioSuitabilityPrompt(decisionEvidence, portfolio);

    const MAX_RETRIES = 3;
    let lastError = null;
    let lastRawResponse = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const geminiStartTime = Date.now();
        // Invoke the Gemini API wrapper to evaluate portfolio suitability
        const geminiResponse = await geminiService.generate(prompt);
        const geminiResponseTime = Date.now() - geminiStartTime;
        lastRawResponse = geminiResponse.response;

        if (!geminiResponse.success) {
            lastError = "Failed to generate portfolio suitability analysis";
            
            continue;
        }

        try {
            const parsedData = extractAndParseJSON(geminiResponse.response);
            
            // Enforce proper boolean and array formats on response properties
            if (typeof parsedData.portfolioAnalysisSkipped !== 'boolean') {
                parsedData.portfolioAnalysisSkipped = parsedData.portfolioAnalysisSkipped === "true" || parsedData.portfolioAnalysisSkipped === true;
            }
            parsedData.portfolioConflicts = Array.isArray(parsedData.portfolioConflicts) ? parsedData.portfolioConflicts : [];
            parsedData.strengths = Array.isArray(parsedData.strengths) ? parsedData.strengths : [];
            parsedData.limitations = Array.isArray(parsedData.limitations) ? parsedData.limitations : [];

            // Verify the parsed object contains all necessary output fields
            const requiredFields = [
                'portfolioAnalysisSkipped', 'portfolioFit', 'riskAlignment', 'diversificationImpact', 
                'sectorExposure', 'cashAssessment', 'investmentHorizonFit', 'allocationSuggestion',
                'positionGuidance', 'portfolioConflicts', 'strengths', 'limitations', 
                'personalizedRecommendation', 'overallSummary'
            ];
            
            for (const field of requiredFields) {
                if (parsedData[field] === undefined) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            parsedData.metrics = {
                "Suitability Agent": {
                    executionTime: Date.now() - startTime,
                    geminiResponseTime: geminiResponseTime,
                    promptSize: prompt.length,
                    originalContextSize: originalContextSize,
                    preparedContextSize: preparedContextSize,
                    reductionPercent: `${reductionPercent}%`
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

function preparePortfolioSuitabilityContext(evidence, validationReport, investmentReport) {
    return {
        investmentDecision: {
            recommendation: investmentReport.recommendation,
            confidence: investmentReport.confidence,
            confidenceReason: investmentReport.confidenceReason,
            investmentThesis: investmentReport.investmentThesis,
            keyStrengths: investmentReport.keyStrengths,
            keyRisks: investmentReport.keyRisks,
            watchItems: investmentReport.watchItems,
            decisionFactors: investmentReport.decisionFactors,
            limitations: investmentReport.limitations,
            overallSummary: investmentReport.overallSummary
        },
        validationSummary: {
            overallEvidenceQuality: validationReport.overallEvidenceQuality,
            validatedStrengths: validationReport.validatedStrengths,
            validatedWeaknesses: validationReport.validatedWeaknesses,
            validatedRisks: validationReport.validatedRisks,
            validatedWatchItems: validationReport.validatedWatchItems,
            validatedLimitations: validationReport.validatedLimitations,
            providerDiscrepancies: validationReport.providerDiscrepancies
        },
        company: {
            symbol: evidence?.metadata?.symbol || "",
            companyName: evidence?.metadata?.companyName || "",
            sector: evidence?.company?.fmp?.sector || evidence?.company?.finnhub?.sector || "",
            industry: evidence?.company?.fmp?.industry || evidence?.company?.finnhub?.industry || "",
            marketCap: evidence?.company?.fmp?.marketCap || evidence?.company?.finnhub?.marketCap || ""
        },
        metadata: {
            generatedAt: evidence?.metadata?.generatedAt || ""
        }
    };
}

// Extract and parse the first valid JSON substring from the model response text
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
    analyze,
    preparePortfolioSuitabilityContext
};
