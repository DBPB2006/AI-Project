const fmpService = require('./fmpService');
const finnhubService = require('./finhubService');
const newsApiService = require('./newsApiService');
const finnhubNewsService = require('./finnhubNewsService');
const Company = require('../models/Company');

/**
 * Gather research data on a stock ticker from various external database and API sources.
 * Compiles financial reports, stock performance, ratios, news feeds, and historical data.
 */
async function research(symbol) {
    
    if (!symbol) {
        throw new Error('A stock symbol is required to start research.');
    }

    const ticker = symbol.toUpperCase();
    

    // Find the company metadata inside MongoDB using the uppercase ticker
    
    
    
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

    // Structure the target data schema for compiling multiple API responses
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

    // Execute calls to all third-party data providers asynchronously
    
    
    
    
    
    // Run fetches for FMP, Finnhub, NewsAPI, and Finnhub News in parallel
    const results = await Promise.allSettled([
        fmpService.fetch(ticker).catch(e => {  throw e; }),
        finnhubService.fetch(ticker).catch(e => {  throw e; }),
        newsApiService.fetch({ name: companyName, symbol: ticker, exchange: companyData.exchange }).catch(e => {  throw e; }),
        finnhubNewsService.fetch({ symbol: ticker }).catch(e => {  throw e; })
    ]);

    // Map Financial Modeling Prep API data fields to standard structure
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

    // Map Finnhub profile, metrics, quote, and sentiment data to standard structure
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

    // Map NewsAPI article results to news array
    if (results[2].status === 'fulfilled' && results[2].value) {
        evidence.news.newsApi = results[2].value.news || [];
        allNews = allNews.concat(evidence.news.newsApi);
        evidence.metadata.successfulSources.push('newsApi');
    } else {
        evidence.news.newsApi = [];
        evidence.metadata.failedSources.push('newsApi');
        evidence.metadata.errors.newsApi = results[2].reason ? results[2].reason.toString() : 'Failed to fetch NewsAPI data';
    }

    // Map Finnhub company-specific news articles to news array
    if (results[3].status === 'fulfilled' && results[3].value) {
        evidence.news.finnhub = results[3].value.news || [];
        allNews = allNews.concat(evidence.news.finnhub);
        evidence.metadata.successfulSources.push('finnhubNews');
    } else {
        evidence.news.finnhub = [];
        evidence.metadata.failedSources.push('finnhubNews');
        evidence.metadata.errors.finnhubNews = results[3].reason ? results[3].reason.toString() : 'Failed to fetch Finnhub News data';
    }

    // Remove punctuation and extra whitespace from title strings for canonical mapping
    const normalize = (str) => (str || '').toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();

    // Compute relevance scores using keyword matching weights
    const scoredNews = allNews.map(article => {
        let score = 0;
        const title = (article.title || '').toLowerCase();
        const desc = (article.description || '').toLowerCase();
        const fullText = title + " " + desc;
        const compName = companyName.toLowerCase();
        const compTicker = ticker.toLowerCase();

        // Increment relevance score for target company matching keywords
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

        // Deduct score heavily for entertainment, sports, or political topics to filter noise
        if (fullText.includes('movie')) score -= 100;
        if (fullText.includes('tv')) score -= 100;
        if (fullText.includes('entertainment')) score -= 100;
        if (fullText.includes('celebrity')) score -= 100;
        if (fullText.includes('sports')) score -= 100;
        if (fullText.includes('politics')) score -= 100;
        if (fullText.includes('awards')) score -= 100;
        if (fullText.includes('gaming')) score -= 100;
        if (fullText.includes('lifestyle')) score -= 100;
        
        // Apply negative weights for general technology releases without investment relevance
        if (fullText.includes('software update') || fullText.includes('beta release')) score -= 20;

        return { ...article, score, normalizedTitle: normalize(article.title), fullText };
    });

    // Filter out news articles with negative overall matching scores
    const filteredNews = scoredNews.filter(article => article.score >= 0);

    // Deduplicate articles having identical normalized titles, choosing the highest score/newest date
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

    // Sort unique articles descending by match score, falling back to publication timestamp
    uniqueNews.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const dateA = new Date(a.publishedAt).getTime() || 0;
        const dateB = new Date(b.publishedAt).getTime() || 0;
        return dateB - dateA;
    });

    // Group the final articles ensuring diverse thematic coverage
    const selectedNews = [];
    const usedThemes = new Set();
    const fallbackNews = [];

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

    // Supplement selected news list with fallback articles up to a limit of 10
    while (selectedNews.length < 10 && fallbackNews.length > 0) {
        selectedNews.push(fallbackNews.shift());
    }

    // Sort the selected articles in descending order of relevance score
    selectedNews.sort((a, b) => b.score - a.score);

    // Reference the selected articles under the merged news attribute
    evidence.news.merged = selectedNews;

    return evidence;
}

/**
 * Extract only the financial datasets from the evidence payload.
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
 * Extract the news feeds and metadata from the evidence payload, attaching optional financial report context.
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
