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
        // Calculate Unix timestamps for the past 30 days time window
        const to = Math.floor(Date.now() / 1000);
        const from = to - (30 * 24 * 60 * 60);
        
        const { data } = await axios.get(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`);
        
        if (data && data.s === "ok") {
            // Map candles array data into historical price entries
            return data.t.map((timestamp, index) => {
                // Extract the date portion from the parsed ISO string
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
            }).reverse(); // Reverse the order of entries to put the most recent prices first
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

        // Map API company profile metrics into standard schema format
        const normCompany = {
            symbol: company?.ticker || null,
            name: company?.name || null,
            exchange: company?.exchange || null,
            industry: company?.finnhubIndustry || null, // Map finnhubIndustry attribute to industry
            sector: null, // Note: basic profile contains no sector information
            country: company?.country || null,
            currency: company?.currency || null,
            website: company?.weburl || null,
            description: null, // Note: basic profile contains no description details
            marketCap: company?.marketCapitalization || null
        };

        // Map quote and metrics to standard stock details format
        const normStock = {
            currentPrice: quote?.currentPrice || null,
            open: quote?.open || null,
            high: quote?.high || null,
            low: quote?.low || null,
            previousClose: quote?.previousClose || null,
            volume: null, // Volume data is omitted here as quote endpoint does not provide it
            averageVolume: null,
            high52Week: financials?.high52Week || null,
            low52Week: financials?.low52Week || null,
            historicalPrices: historicalPrices || [] // Populate historical prices array
        };

        // Initialize empty standard financials since free tier does not support it
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

        // Map metrics to standard valuation ratios structure
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
            historicalFinancials: [], // Basic tier does not provide historical statement sheets
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