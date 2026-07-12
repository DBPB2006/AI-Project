const fmpService = require('./fmpService');
const finnhubService = require('./finhubService');
const newsApiService = require('./newsApiService');
const finnhubNewsService = require('./finnhubNewsService');
const Company = require('../models/Company');

/**
 * The Research Engine orchestrates all API services and compiles their responses
 * into a single, standardized Evidence Package.
 * 
 * It acts purely as a data-gathering layer.
 * 
 * @param {string} symbol - The stock ticker symbol (e.g., "AAPL")
 * @returns {object} evidence - The compiled Evidence Package
 */
async function research(symbol) {
    
    if (!symbol) {
        throw new Error('A stock symbol is required to start research.');
    }

    const ticker = symbol.toUpperCase();
    

    // 1. Fetch Company Information from MongoDB
    
    
    
    let companyData;
    try {
        companyData = await Company.findOne({ symbol: ticker });
        
    } catch (err) {
        
        
        throw err;
    }

    if (!companyData) {
        
        throw new Error(`Company with symbol ${ticker} not found in database.`);
    }
    
    
    
    
    const companyName = companyData.name;

    // 2. Initialize the Evidence Package
    const evidence = {
        company: { fmp: {}, finnhub: {} },
        stock: { fmp: {}, finnhub: {} },
        financials: { fmp: {}, finnhub: {} },
        historicalFinancials: { fmp: [], finnhub: [] },
        ratios: { fmp: {}, finnhub: {} },
        earnings: { fmp: [], finnhub: [] },
        recommendations: { fmp: [], finnhub: [] },
        insiderSentiment: { fmp: [], finnhub: [] },
        historicalPrices: { fmp: [], finnhub: [] },
        news: { newsApi: [], finnhub: [] },
        metadata: {
            symbol: ticker,
            companyName: companyName,
            generatedAt: new Date().toISOString(),
            totalSources: 4,
            successfulSources: [],
            failedSources: [],
            errors: {
                fmp: null,
                finnhub: null,
                newsApi: null,
                finnhubNews: null
            }
        }
    };

    // 3. Execute all services concurrently
    
    
    
    
    
    // FMP, Finnhub use the ticker. NewsAPI and GNews use the company name.
    const results = await Promise.allSettled([
        fmpService.fetch(ticker).catch(e => {  throw e; }),
        finnhubService.fetch(ticker).catch(e => {  throw e; }),
        newsApiService.fetch({ name: companyName, symbol: ticker, exchange: companyData.exchange }).catch(e => {  throw e; }),
        finnhubNewsService.fetch({ symbol: ticker }).catch(e => {  throw e; })
    ]);

    // --- DATA MAPPING --- //

    // 1. FMP Data
    if (results[0].status === 'fulfilled' && results[0].value) {
        const fmp = results[0].value;
        evidence.company.fmp = fmp.company || {};
        evidence.stock.fmp = fmp.stock || {};
        evidence.financials.fmp = fmp.financials || {};
        evidence.historicalFinancials.fmp = fmp.historicalFinancials || [];
        evidence.ratios.fmp = fmp.ratios || {};
        evidence.earnings.fmp = fmp.earnings || [];
        evidence.recommendations.fmp = fmp.recommendations || [];
        evidence.insiderSentiment.fmp = fmp.insiderSentiment || [];
        evidence.historicalPrices.fmp = fmp.historicalPrices || [];
        evidence.metadata.successfulSources.push('fmp');
    } else {
        evidence.metadata.failedSources.push('fmp');
        evidence.metadata.errors.fmp = results[0].reason ? results[0].reason.toString() : 'Failed to fetch FMP data';
    }

    // 2. Finnhub Data
    if (results[1].status === 'fulfilled' && results[1].value) {
        const finnhub = results[1].value;
        evidence.company.finnhub = finnhub.company || {};
        evidence.stock.finnhub = finnhub.stock || {};
        evidence.financials.finnhub = finnhub.financials || {};
        evidence.historicalFinancials.finnhub = finnhub.historicalFinancials || [];
        evidence.ratios.finnhub = finnhub.ratios || {};
        evidence.earnings.finnhub = finnhub.earnings || [];
        evidence.recommendations.finnhub = finnhub.recommendations || [];
        evidence.insiderSentiment.finnhub = finnhub.insiderSentiment || [];
        evidence.historicalPrices.finnhub = finnhub.historicalPrices || [];
        evidence.metadata.successfulSources.push('finnhub');
    } else {
        evidence.metadata.failedSources.push('finnhub');
        evidence.metadata.errors.finnhub = results[1].reason ? results[1].reason.toString() : 'Failed to fetch Finnhub data';
    }

    let allNews = [];

    // 3. NewsAPI Data
    if (results[2].status === 'fulfilled' && results[2].value) {
        evidence.news.newsApi = results[2].value.news || [];
        allNews = allNews.concat(evidence.news.newsApi);
        evidence.metadata.successfulSources.push('newsApi');
    } else {
        evidence.news.newsApi = [];
        evidence.metadata.failedSources.push('newsApi');
        evidence.metadata.errors.newsApi = results[2].reason ? results[2].reason.toString() : 'Failed to fetch NewsAPI data';
    }

    // 4. Finnhub News Data
    if (results[3].status === 'fulfilled' && results[3].value) {
        evidence.news.finnhub = results[3].value.news || [];
        allNews = allNews.concat(evidence.news.finnhub);
        evidence.metadata.successfulSources.push('finnhubNews');
    } else {
        evidence.news.finnhub = [];
        evidence.metadata.failedSources.push('finnhubNews');
        evidence.metadata.errors.finnhubNews = results[3].reason ? results[3].reason.toString() : 'Failed to fetch Finnhub News data';
    }

    // --- Deduplication & Relevance Scoring --- //
    // Helper to normalize string for comparison
    const normalize = (str) => (str || '').toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();

    // 1. Calculate Score for all articles
    const scoredNews = allNews.map(article => {
        let score = 0;
        const title = (article.title || '').toLowerCase();
        const desc = (article.description || '').toLowerCase();
        const fullText = title + " " + desc;
        const compName = companyName.toLowerCase();
        const compTicker = ticker.toLowerCase();

        // Positive Weights
        if (title.includes(compName)) score += 30;
        if (title.includes(compTicker)) score += 25;
        if (desc.includes(compName)) score += 15;
        
        if (fullText.includes('earnings')) score += 25;
        if (fullText.includes('revenue')) score += 20;
        if (fullText.includes('profit')) score += 20;
        if (fullText.includes('stock')) score += 20;
        if (fullText.includes('shares')) score += 15;
        if (fullText.includes('analyst')) score += 15;
        if (fullText.includes('guidance')) score += 15;
        if (fullText.includes('dividend')) score += 15;
        if (fullText.includes('sec')) score += 10;
        if (fullText.includes('supply chain')) score += 10;
        if (fullText.includes('manufacturing')) score += 10;
        if (fullText.includes('ai strategy')) score += 10;

        // Negative Weights
        // Massive Negative Weights for strict filtering
        if (fullText.includes('movie')) score -= 100;
        if (fullText.includes('tv')) score -= 100;
        if (fullText.includes('entertainment')) score -= 100;
        if (fullText.includes('celebrity')) score -= 100;
        if (fullText.includes('sports')) score -= 100;
        if (fullText.includes('politics')) score -= 100;
        if (fullText.includes('awards')) score -= 100;
        if (fullText.includes('gaming')) score -= 100;
        if (fullText.includes('lifestyle')) score -= 100;
        
        // General tech without investment impact heuristic (rough approximation)
        if (fullText.includes('software update') || fullText.includes('beta release')) score -= 20;

        return { ...article, score, normalizedTitle: normalize(article.title), fullText };
    });

    // 1.5 Strict Filtering
    const filteredNews = scoredNews.filter(article => article.score >= 0);

    // 2. Advanced Deduplication
    const uniqueNewsMap = new Map();
    for (const article of filteredNews) {
        if (!article.url || !article.title) continue;
        
        const key = article.normalizedTitle;
        if (uniqueNewsMap.has(key)) {
            const existing = uniqueNewsMap.get(key);
            // Better score -> Newer publication -> Longer description
            if (article.score > existing.score) {
                uniqueNewsMap.set(key, article);
            } else if (article.score === existing.score) {
                const dateA = new Date(article.publishedAt).getTime() || 0;
                const dateE = new Date(existing.publishedAt).getTime() || 0;
                if (dateA > dateE) {
                    uniqueNewsMap.set(key, article);
                } else if (dateA === dateE) {
                    if ((article.description || '').length > (existing.description || '').length) {
                        uniqueNewsMap.set(key, article);
                    }
                }
            }
        } else {
            uniqueNewsMap.set(key, article);
        }
    }

    const uniqueNews = Array.from(uniqueNewsMap.values());

    // Sort by relevance score (descending), then Published Date (newest first)
    uniqueNews.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const dateA = new Date(a.publishedAt).getTime() || 0;
        const dateB = new Date(b.publishedAt).getTime() || 0;
        return dateB - dateA;
    });

    // 3. Diversity Selection
    const selectedNews = [];
    const usedThemes = new Set();
    const fallbackNews = [];

    // Simple heuristic themes mapping
    const themeKeywords = {
        earnings: ['earnings', 'quarterly', 'results'],
        guidance: ['guidance', 'outlook', 'forecast'],
        analyst: ['analyst', 'upgrade', 'downgrade', 'price target'],
        regulatory: ['regulatory', 'sec', 'lawsuit', 'investigation'],
        corporate: ['acquisition', 'merger', 'partnership', 'dividend', 'buyback'],
        product: ['product launch', 'new feature', 'release'],
        supply: ['supply chain', 'manufacturing', 'supplier']
    };

    const getTheme = (text) => {
        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            if (keywords.some(kw => text.includes(kw))) return theme;
        }
        return 'general';
    };

    for (const article of uniqueNews) {
        const theme = getTheme(article.fullText);
        if (!usedThemes.has(theme) && selectedNews.length < 10) {
            selectedNews.push(article);
            usedThemes.add(theme);
        } else {
            fallbackNews.push(article);
        }
    }

    // Fill remaining slots if we didn't hit 10 diverse articles
    while (selectedNews.length < 10 && fallbackNews.length > 0) {
        selectedNews.push(fallbackNews.shift());
    }

    // Sort final selection by score
    selectedNews.sort((a, b) => b.score - a.score);

    // Keep top 10 unique, most relevant articles as a separate merged view
    evidence.news.merged = selectedNews;

    // LOG THE COMPLETED EVIDENCE PACKAGE
    
    
    return evidence;
}

/**
 * Helper to extract only the financial context from the Evidence Package.
 * Used by the Financial Analysis Agent.
 * 
 * @param {object} evidence - The complete Evidence Package
 * @returns {object} Financial subset of the evidence
 */
function getFinancialEvidence(evidence) {
    return {
        company: evidence.company,
        stock: evidence.stock,
        financials: evidence.financials,
        ratios: evidence.ratios,
        earnings: evidence.earnings,
        recommendations: evidence.recommendations,
        insiderSentiment: evidence.insiderSentiment,
        historicalPrices: evidence.historicalPrices,
        metadata: evidence.metadata
    };
}

/**
 * Helper to extract the market/news context from the Evidence Package.
 * Accepts the optional Financial Report to give the Market Analysis Agent full context.
 * 
 * @param {object} evidence - The complete Evidence Package
 * @param {object} [financialReport] - Optional report from the Financial Analysis Agent
 * @returns {object} Market subset of the evidence combined with the financial report
 */
function getMarketEvidence(evidence, financialReport = null) {
    return {
        news: evidence.news,
        metadata: evidence.metadata,
        financialReport: financialReport
    };
}

module.exports = {
    research,
    getFinancialEvidence,
    getMarketEvidence
};
