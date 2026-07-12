const axios = require("axios");

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

async function fetch(companyData) {
    const startTime = Date.now();
    let status = 'SUCCESS';
    let dataSize = 0;
    let errors = null;
    let resultData = null;

    try {
        const { name, symbol, exchange } = companyData;
        
        const query2 = exchange 
            ? `("${symbol}" OR "${exchange}:${symbol}") AND (stock OR shares OR earnings)`
            : `"${symbol}" AND (stock OR shares OR earnings)`;

        const queries = [
            `"${name}" AND (stock OR earnings OR revenue OR profit)`,
            query2,
            `"${name}" AND (analyst OR guidance OR dividend OR regulatory OR supply chain)`
        ];

        const fetchQuery = async (query) => {
            try {
                const { data } = await axios.get(`${BASE_URL}/everything`, {
                    params: {
                        q: query,
                        language: "en",
                        sortBy: "relevancy",
                        pageSize: 10,
                        apiKey: API_KEY
                    }
                });

                if (!data || !Array.isArray(data.articles)) {
                    return [];
                }

                dataSize += Buffer.byteLength(JSON.stringify(data), 'utf8');

                return data.articles.map(article => ({
                    title: article.title || "No Title",
                    description: article.description || "No Description",
                    source: article.source?.name || "Unknown Source",
                    author: article.author || "Unknown Author",
                    publishedAt: new Date(article.publishedAt).toISOString(),
                    url: article.url || "",
                    provider: "newsApi"
                }));
            } catch (err) {
                
                throw err;
            }
        };

        const results = await Promise.all(queries.map(q => fetchQuery(q)));
        const news = results.flat();

        resultData = { news };
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