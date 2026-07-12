const geminiService = require('../services/geminiService');
const { buildFinancialPrompt } = require('../prompts/financialPrompt');

async function analyze(financialEvidence) {
    const startTime = Date.now();

    // Structure the financial evidence and construct the prompt
    const preparedEvidence = prepareFinancialEvidence(financialEvidence);
    const prompt = buildFinancialPrompt(preparedEvidence);

    const MAX_RETRIES = 3;
    let lastError = null;
    let lastRawResponse = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const geminiStartTime = Date.now();
        // Generate financial analysis by invoking the Gemini API wrapper
        const geminiResponse = await geminiService.generate(prompt);
        const geminiResponseTime = Date.now() - geminiStartTime;
        lastRawResponse = geminiResponse.response;

        if (!geminiResponse.success) {
            lastError = "Failed to generate financial analysis";
            
            continue;
        }

        try {
            // Parse the returned response string to extract valid JSON data
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
    
    // Limit array elements to the first four entries to control token length
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
                
                // Limit history logs or other arrays to the first 4 recent records
                if (Array.isArray(val)) {
                    prepared[provider][key] = extractRecent(val, 4);
                } 
                // Handle objects recursively checking for nested arrays
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
                else {
                    prepared[provider][key] = val;
                }
            }
        }
    }
    
    return prepared;
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
    analyze
};
