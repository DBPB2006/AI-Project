const geminiService = require('../services/geminiService');
const { buildFinancialPrompt } = require('../prompts/financialPrompt');

async function analyze(financialEvidence) {
    const startTime = Date.now();

    // Prepare the evidence and build the prompt for Gemini
    const preparedEvidence = prepareFinancialEvidence(financialEvidence);
    const prompt = buildFinancialPrompt(preparedEvidence);

    const MAX_RETRIES = 3;
    let lastError = null;
    let lastRawResponse = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const geminiStartTime = Date.now();
        // Call the Gemini service to analyze financial evidence
        const geminiResponse = await geminiService.generate(prompt);
        const geminiResponseTime = Date.now() - geminiStartTime;
        lastRawResponse = geminiResponse.response;

        if (!geminiResponse.success) {
            lastError = "Failed to generate financial analysis";
            
            continue;
        }

        try {
            // Extract and parse JSON from the Gemini response
            const parsedData = extractAndParseJSON(geminiResponse.response);
            parsedData.metrics = {
                "Financial Agent": {
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

function prepareFinancialEvidence(evidence) {
    if (!evidence) return {};
    
    const prepared = {};
    
    // Helper to safely slice large arrays (historical records, lists)
    const extractRecent = (data, count = 4) => {
        if (Array.isArray(data)) {
            return data.slice(0, count);
        }
        return data;
    };

    for (const provider of Object.keys(evidence)) {
        if (evidence[provider]) {
            prepared[provider] = {};
            for (const key of Object.keys(evidence[provider])) {
                const val = evidence[provider][key];
                
                // If it's an array of historical data (e.g. financials, earnings, technicals)
                if (Array.isArray(val)) {
                    prepared[provider][key] = extractRecent(val, 4);
                } 
                // If it's an object that might contain large arrays inside
                else if (typeof val === 'object' && val !== null) {
                    prepared[provider][key] = {};
                    for (const subkey of Object.keys(val)) {
                        if (Array.isArray(val[subkey])) {
                            prepared[provider][key][subkey] = extractRecent(val[subkey], 4);
                        } else {
                            prepared[provider][key][subkey] = val[subkey];
                        }
                    }
                } 
                // Simple values or other objects
                else {
                    prepared[provider][key] = val;
                }
            }
        }
    }
    
    return prepared;
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
