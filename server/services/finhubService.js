const axios = require("axios");

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

async function getCompanyProfile(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`);

        if (data && Object.keys(data).length > 0) {
            return {
                name: data.name || "Unknown",
                ticker: data.ticker || symbol,
                exchange: data.exchange || "Unknown",
                country: data.country || "Unknown",
                currency: data.currency || "USD",
                ipoDate: data.ipo || null,
                marketCapitalization: data.marketCapitalization || null
            };
        }

        return null;
    } catch (error) {
        return null;
    }
}

async function getCurrentPrice(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
        
        if (data && data.c !== undefined) {
            return {
                currentPrice: data.c,
                open: data.o,
                high: data.h,
                low: data.l,
                previousClose: data.pc,
                timestamp: data.t
            };
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function getHistoricalPrices(symbol) {
    try {
        // Fetch last 30 days roughly (or we can just fetch a set time range)
        const to = Math.floor(Date.now() / 1000);
        const from = to - (30 * 24 * 60 * 60); // 30 days ago
        
        const { data } = await axios.get(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`);
        
        if (data && data.s === "ok") {
            // Map Finnhub arrays into FMP-style historical objects
            return data.t.map((timestamp, index) => {
                // FMP format expects date string like 'YYYY-MM-DD'
                const dateObj = new Date(timestamp * 1000);
                const dateString = dateObj.toISOString().split('T')[0];
                return {
                    date: dateString,
                    open: data.o[index],
                    high: data.h[index],
                    low: data.l[index],
                    close: data.c[index],
                    volume: data.v[index]
                };
            }).reverse(); // Most recent first to match FMP
        }
        return [];
    } catch (error) {
        return [];
    }
}

async function getBasicFinancials(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`);

        if (data && data.metric) {
            return {
                high52Week: data.metric['52WeekHigh'] || null,
                low52Week: data.metric['52WeekLow'] || null,
                peRatio: data.metric.peBasicExclExtraTTM || null,
                pbRatio: data.metric.pbAnnual || null,
                beta: data.metric.beta || null
            };
        }

        return null;
    } catch (error) {
        return null;
    }
}

async function getEarnings(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/stock/earnings?symbol=${symbol}&token=${API_KEY}`);

        if (data && Array.isArray(data)) {
            return data.slice(0, 4);
        }

        return [];
    } catch (error) {
        return [];
    }
}

async function getInsiderSentiment(symbol) {
    try {
        const today = new Date().toISOString().split("T")[0];
        const from = new Date();
        from.setFullYear(from.getFullYear() - 1);
        const fromDate = from.toISOString().split("T")[0];

        const { data } = await axios.get(`${BASE_URL}/stock/insider-sentiment?symbol=${symbol}&from=${fromDate}&to=${today}&token=${API_KEY}`);

        if (data && data.data) {
            return data.data;
        }

        return [];
    } catch (error) {
        return [];
    }
}

async function getRecommendationTrends(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/stock/recommendation?symbol=${symbol}&token=${API_KEY}`);

        if (data && Array.isArray(data)) {
            return data.slice(0, 3);
        }

        return [];
    } catch (error) {
        return [];
    }
}

async function fetch(symbol) {
    const startTime = Date.now();
    let status = 'SUCCESS';
    let dataSize = 0;
    let errors = null;
    let resultData = null;

    try {
        const [
            company,
            financials,
            earnings,
            insiderSentiment,
            recommendations,
            quote,
            historicalPrices
        ] = await Promise.all([
            getCompanyProfile(symbol),
            getBasicFinancials(symbol),
            getEarnings(symbol),
            getInsiderSentiment(symbol),
            getRecommendationTrends(symbol),
            getCurrentPrice(symbol),
            getHistoricalPrices(symbol)
        ]);

        // Normalize Company
        const normCompany = {
            symbol: company?.ticker || null,
            name: company?.name || null,
            exchange: company?.exchange || null,
            industry: company?.finnhubIndustry || null, // Finnhub returns finnhubIndustry on profile2
            sector: null, // Basic finnhub profile doesn't strictly have sector
            country: company?.country || null,
            currency: company?.currency || null,
            website: company?.weburl || null, // weburl
            description: null, // Basic profile doesn't have description
            marketCap: company?.marketCapitalization || null
        };

        // Normalize Stock
        const normStock = {
            currentPrice: quote?.currentPrice || null,
            open: quote?.open || null,
            high: quote?.high || null,
            low: quote?.low || null,
            previousClose: quote?.previousClose || null,
            volume: null, // quote endpoint doesn't return volume directly here, wait actually candle might
            averageVolume: null,
            high52Week: financials?.high52Week || null,
            low52Week: financials?.low52Week || null,
            historicalPrices: historicalPrices || [] // Handled by evidence later
        };

        // Normalize Financials
        // Finnhub free doesn't easily expose full statements here in basic metrics
        const normFinancials = {
            revenue: null,
            netIncome: null,
            operatingIncome: null,
            cashFlow: null,
            assets: null,
            liabilities: null,
            debt: null,
            equity: null
        };

        // Normalize Ratios
        const normRatios = {
            pe: financials?.peRatio || null,
            pb: financials?.pbRatio || null,
            ps: null,
            roe: null,
            roa: null,
            grossMargin: null,
            operatingMargin: null,
            netMargin: null
        };

        resultData = {
            company: normCompany,
            stock: normStock,
            financials: normFinancials,
            ratios: normRatios,
            historicalFinancials: [], // Finnhub basic doesn't provide this
            earnings: earnings || [],
            recommendations: recommendations || [],
            insiderSentiment: insiderSentiment || [],
            historicalPrices: historicalPrices || []
        };

        const rawArray = [company, financials, earnings, insiderSentiment, recommendations, quote, historicalPrices];
        dataSize = Buffer.byteLength(JSON.stringify(rawArray), 'utf8');

    } catch (err) {
        status = 'FAILED';
        errors = err.message;
        
        resultData = {
            company: { symbol: null, name: null, exchange: null, industry: null, sector: null, country: null, currency: null, website: null, description: null, marketCap: null },
            stock: { currentPrice: null, open: null, high: null, low: null, previousClose: null, volume: null, averageVolume: null, high52Week: null, low52Week: null },
            financials: { revenue: null, netIncome: null, operatingIncome: null, cashFlow: null, assets: null, liabilities: null, debt: null, equity: null },
            ratios: { pe: null, pb: null, ps: null, roe: null, roa: null, grossMargin: null, operatingMargin: null, netMargin: null },
            historicalFinancials: [],
            earnings: [],
            recommendations: [],
            insiderSentiment: [],
            historicalPrices: []
        };
    }

    const executionTime = Date.now() - startTime;
    const normalizedSize = Buffer.byteLength(JSON.stringify(resultData), 'utf8');
    
    let missingFields = [];
    if (!resultData.company.symbol) missingFields.push("company_profile");

    
    return resultData;
}

module.exports = {
    fetch
};