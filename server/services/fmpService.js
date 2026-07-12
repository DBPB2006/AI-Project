const axios = require("axios");

const API_KEY = process.env.FMP_API_KEY;
const BASE_URL = "https://financialmodelingprep.com/stable";

async function getCompanyProfile(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/profile?symbol=${symbol}&apikey=${API_KEY}`);

        // Return the first item if the array has data
        if (data && data.length > 0) {
            return data[0];
        }

        return null;
    } catch (error) {
        
        
        
        return null;
    }
}

async function getIncomeStatement(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/income-statement?symbol=${symbol}&apikey=${API_KEY}`);

        if (data && data.length > 0) {
            return data.slice(0, 4);
        }

        return null;
    } catch (error) {
        
        
        
        return null;
    }
}

async function getBalanceSheet(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/balance-sheet-statement?symbol=${symbol}&apikey=${API_KEY}`);

        if (data && data.length > 0) {
            return data.slice(0, 4);
        }

        return null;
    } catch (error) {
        
        
        
        return null;
    }
}

async function getCashFlow(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/cash-flow-statement?symbol=${symbol}&apikey=${API_KEY}`);

        if (data && data.length > 0) {
            return data.slice(0, 4);
        }

        return null;
    } catch (error) {
        
        
        
        return null;
    }
}

async function getRatios(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/ratios?symbol=${symbol}&apikey=${API_KEY}`);

        if (data && data.length > 0) {
            return data.slice(0, 4);
        }

        return null;
    } catch (error) {

        
        
        return null;
    }
}

async function getCurrentPrice(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`);

        if (data && data.length > 0) {
            return data[0];
        }

        return null;
    } catch (error) {

        
        
        
        return null;
    }
}

async function getHistoricalPrices(symbol) {
    try {
        const { data } = await axios.get(`${BASE_URL}/historical-price-eod/full?symbol=${symbol}&apikey=${API_KEY}`);

        // If the data is already a direct array
        if (Array.isArray(data)) {
            return data.slice(0, 30);
        }

        // If the data is an object with a .historical property
        if (data && data.historical) {
            return data.historical.slice(0, 30);
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
            incomeStatement,
            balanceSheet,
            cashFlow,
            ratios,
            currentPrice,
            historicalPrices
        ] = await Promise.all([
            getCompanyProfile(symbol),
            getIncomeStatement(symbol),
            getBalanceSheet(symbol),
            getCashFlow(symbol),
            getRatios(symbol),
            getCurrentPrice(symbol),
            getHistoricalPrices(symbol)
        ]);

        // Normalize Company
        const normCompany = {
            symbol: company?.symbol || null,
            name: company?.companyName || null,
            exchange: company?.exchangeShortName || null,
            industry: company?.industry || null,
            sector: company?.sector || null,
            country: company?.country || null,
            currency: company?.currency || null,
            website: company?.website || null,
            description: company?.description || null,
            marketCap: company?.mktCap || null
        };

        // Normalize Stock
        const normStock = {
            currentPrice: currentPrice?.price || null,
            open: currentPrice?.open || null,
            high: currentPrice?.dayHigh || null,
            low: currentPrice?.dayLow || null,
            previousClose: currentPrice?.previousClose || null,
            volume: currentPrice?.volume || null,
            averageVolume: currentPrice?.avgVolume || null,
            high52Week: currentPrice?.yearHigh || null,
            low52Week: currentPrice?.yearLow || null,
            historicalPrices: historicalPrices || [] // handled by evidence historicalPrices later
        };

        // Normalize Financials
        // FMP arrays have most recent first (index 0)
        const latestIncome = (incomeStatement && incomeStatement.length > 0) ? incomeStatement[0] : null;
        const latestBalance = (balanceSheet && balanceSheet.length > 0) ? balanceSheet[0] : null;
        const latestCashFlow = (cashFlow && cashFlow.length > 0) ? cashFlow[0] : null;

        const normFinancials = {
            revenue: latestIncome?.revenue || null,
            netIncome: latestIncome?.netIncome || null,
            operatingIncome: latestIncome?.operatingIncome || null,
            cashFlow: latestCashFlow?.freeCashFlow || null,
            assets: latestBalance?.totalAssets || null,
            liabilities: latestBalance?.totalLiabilities || null,
            debt: latestBalance?.totalDebt || null,
            equity: latestBalance?.totalStockholdersEquity || null
        };

        // Normalize Ratios
        const latestRatios = (ratios && ratios.length > 0) ? ratios[0] : null;
        const normRatios = {
            pe: latestRatios?.priceEarningsRatio || null,
            pb: latestRatios?.priceToBookRatio || null,
            ps: latestRatios?.priceToSalesRatio || null,
            roe: latestRatios?.returnOnEquity || null,
            roa: latestRatios?.returnOnAssets || null,
            grossMargin: latestRatios?.grossProfitMargin || null,
            operatingMargin: latestRatios?.operatingProfitMargin || null,
            netMargin: latestRatios?.netProfitMargin || null
        };

        // Extract historical financials without fabricating periods
        const historicalFinancials = incomeStatement ? incomeStatement.map(inc => {
            const bal = balanceSheet?.find(b => (b.calendarYear === inc.calendarYear) || (b.date === inc.date)) || {};
            const cf = cashFlow?.find(c => (c.calendarYear === inc.calendarYear) || (c.date === inc.date)) || {};
            return {
                calendarYear: inc.calendarYear || null,
                date: inc.date || null,
                revenue: inc.revenue || null,
                netIncome: inc.netIncome || null,
                operatingIncome: inc.operatingIncome || null,
                cashFlow: cf.freeCashFlow || null,
                assets: bal.totalAssets || null,
                liabilities: bal.totalLiabilities || null,
                debt: bal.totalDebt || null,
                equity: bal.totalStockholdersEquity || null
            };
        }) : [];

        resultData = {
            company: normCompany,
            stock: normStock,
            financials: normFinancials,
            ratios: normRatios,
            historicalFinancials: historicalFinancials,
            earnings: [],
            recommendations: [],
            insiderSentiment: [],
            historicalPrices: historicalPrices || []
        };

        // Approximate raw data size (rough estimation for tracking)
        const rawArray = [company, incomeStatement, balanceSheet, cashFlow, ratios, currentPrice, historicalPrices];
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
    if (resultData.financials.revenue === null) missingFields.push("income_statement");

    // The endpoint used is generally the FMP base url + multiple routes
    
    return resultData;
}

module.exports = {
    fetch
};