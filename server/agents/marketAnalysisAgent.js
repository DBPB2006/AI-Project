const geminiService = require('../services/geminiService');
const { buildMarketPrompt } = require('../prompts/marketPrompt');

async function analyze(marketEvidence) {
    const startTime = Date.now();
    
    // Prepare the evidence and build the prompt for Gemini
    const preparedEvidence = prepareMarketEvidence(marketEvidence);
    const prompt = buildMarketPrompt(preparedEvidence);

    const MAX_RETRIES = 3;
    let lastError = null;
    let lastRawResponse = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const geminiStartTime = Date.now();
        // Call the Gemini AI service
        const geminiResponse = await geminiService.generate(prompt);
        const geminiResponseTime = Date.now() - geminiStartTime;
        lastRawResponse = geminiResponse.response;

        if (!geminiResponse.success) {
            lastError = "Failed to generate market analysis";
            
            continue;
        }

        try {
            // Attempt to extract JSON from Gemini's text response
            const parsedData = extractAndParseJSON(geminiResponse.response);
            parsedData.metrics = {
                "Market Agent": {
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

function prepareMarketEvidence(evidence) {
    if (!evidence) return {};
    
    // 1. Collect articles
    let allArticles = [];
    if (evidence.news && Array.isArray(evidence.news.newsApi)) {
        allArticles = allArticles.concat(evidence.news.newsApi.map(a => ({ ...a, _provider: 'NewsAPI' })));
    }
    if (evidence.news && Array.isArray(evidence.news.finnhub)) {
        allArticles = allArticles.concat(evidence.news.finnhub.map(a => ({ ...a, _provider: 'Finnhub' })));
    }
    const originalArticleCount = allArticles.length;

    // 2. Normalize
    const normalizedArticles = allArticles.map(article => ({
        title: article.title || "",
        description: article.description || "",
        content: article.content || "",
        source: typeof article.source === 'object' ? (article.source?.name || "") : (article.source || ""),
        provider: article._provider || "",
        publishedAt: article.publishedAt || "",
        url: article.url || ""
    }));

    // 3. Sort Newest to Oldest before deduplication
    normalizedArticles.sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || 0).getTime();
        return dateB - dateA; // Newest first
    });

    // 4. Deduplicate (priority: URL, Title + Source, Normalized Title)
    let seenUrls = new Set();
    let seenTitleSource = new Set();
    let seenTitles = new Set();
    let uniqueArticles = [];

    for (const article of normalizedArticles) {
        const url = article.url ? article.url.toLowerCase() : "";
        const titleSource = (article.title + "|" + article.source).toLowerCase().trim();
        const normTitle = article.title ? article.title.toLowerCase().trim().replace(/[^a-z0-9]/g, "") : "";

        if (url && seenUrls.has(url)) continue;
        if (titleSource && seenTitleSource.has(titleSource)) continue;
        if (normTitle && seenTitles.has(normTitle)) continue;

        if (url) seenUrls.add(url);
        if (titleSource) seenTitleSource.add(titleSource);
        if (normTitle) seenTitles.add(normTitle);

        uniqueArticles.push(article);
    }

    const uniqueArticleCount = uniqueArticles.length;

    // 5. Limit to 15 most recent unique articles
    const limitedArticles = uniqueArticles.slice(0, 15);
    const articlesSentToLLM = limitedArticles.length;

    return {
        news: limitedArticles,
        metadata: {
            successfulSources: evidence.metadata?.successfulSources || [],
            failedSources: evidence.metadata?.failedSources || [],
            generatedAt: evidence.metadata?.generatedAt || "",
            allArticles: allArticles,
            uniqueArticles: uniqueArticles,
            originalArticleCount: originalArticleCount,
            uniqueArticleCount: uniqueArticleCount,
            articlesSentToLLM: articlesSentToLLM
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
