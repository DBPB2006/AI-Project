const axios = require("axios");

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

async function fetch(companyData) {
    const startTime = Date.now();
    let status = 'SUCCESS';
    let dataSize = 0;
    let errors = null;
    let resultData = null;

    try {
        const { symbol } = companyData;
        
        // Define the from/to date range spanning the last 14 days for the news API query
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - 14);

        const toStr = toDate.toISOString().split("T")[0];
        const fromStr = fromDate.toISOString().split("T")[0];

        const { data } = await axios.get(`${BASE_URL}/company-news`, {
            params: {
                symbol: symbol,
                from: fromStr,
                to: toStr,
                token: API_KEY
            }
        });

        if (!data || !Array.isArray(data)) {
            resultData = { news: [] };
        } else {
            dataSize = Buffer.byteLength(JSON.stringify(data), 'utf8');

            const news = data.map(article => ({
                title: article.headline || "No Title",
                description: article.summary || "No Description",
                source: article.source || "Unknown Source",
                publishedAt: new Date(article.datetime * 1000).toISOString(),
                url: article.url || "",
                provider: "finnhub"
            }));

            // Restrict the results to the top 15 news articles for performance
            resultData = { news: news.slice(0, 15) };
        }
    } catch (error) {
        status = 'FAILED';
        errors = error.message;
        resultData = { news: [] };
    }

    const executionTime = Date.now() - startTime;
    const normalizedSize = Buffer.byteLength(JSON.stringify(resultData), 'utf8');
    
    let missingFields = [];
    if (resultData.news.length === 0) missingFields.push("news");

    
    return resultData;
}

module.exports = {
    fetch
};
