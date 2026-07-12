const axios = require('axios');

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

/**
 * Fetches the latest stock quote for a symbol.
 * Falls back gracefully if external quote API is unavailable.
 */
async function fetchLatestPrice(symbol) {
  try {
    if (!FMP_API_KEY) return null;
    const { data } = await axios.get(
      `${BASE_URL}/quote?symbol=${symbol.toUpperCase()}&apikey=${FMP_API_KEY}`
    );
    if (data && data.length > 0 && data[0].price !== undefined) {
      return Number(data[0].price);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Calculates complete runtime portfolio metrics dynamically.
 * Controllers must delegate all portfolio math to this service.
 *
 * @param {object} portfolioDoc - The user.portfolio subdocument
 * @returns {object} Full calculated portfolio summary and enriched holdings
 */
async function calculatePortfolioMetrics(portfolioDoc) {
  const holdings = portfolioDoc?.holdings || [];
  const cashAvailable = Number(portfolioDoc?.cashAvailable || 0);
  const monthlyInvestment = Number(portfolioDoc?.monthlyInvestment || 0);
  const consent = Boolean(portfolioDoc?.consent);

  // Fetch prices concurrently for all symbols
  const uniqueSymbols = [...new Set(holdings.map((h) => h.symbol))];
  const priceMap = {};

  await Promise.all(
    uniqueSymbols.map(async (sym) => {
      const price = await fetchLatestPrice(sym);
      priceMap[sym] = price;
    })
  );

  let totalInvestment = 0;
  let portfolioValue = 0;
  const sectorMap = {};

  // Enrich holdings with calculated fields
  const enrichedHoldings = holdings.map((h) => {
    const qty = Number(h.quantity || 0);
    const avgPrice = Number(h.averageBuyPrice || 0);
    const currentPrice =
      priceMap[h.symbol] !== null && priceMap[h.symbol] !== undefined
        ? priceMap[h.symbol]
        : avgPrice;

    const investedValue = qty * avgPrice;
    const currentValue = qty * currentPrice;
    const profitLoss = currentValue - investedValue;
    const profitLossPercentage =
      investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

    totalInvestment += investedValue;
    portfolioValue += currentValue;

    const sector = h.sector || 'General';
    sectorMap[sector] = (sectorMap[sector] || 0) + currentValue;

    return {
      _id: h._id,
      symbol: h.symbol,
      company: h.company || h.symbol,
      quantity: qty,
      averageBuyPrice: avgPrice,
      currentPrice: Math.round(currentPrice * 100) / 100,
      investedValue: Math.round(investedValue * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      profitLoss: Math.round(profitLoss * 100) / 100,
      profitLossPercentage: Math.round(profitLossPercentage * 100) / 100,
      sector,
      exchange: h.exchange || 'US',
      purchaseDate: h.purchaseDate
    };
  });

  // Calculate allocation % for each holding now that portfolioValue is known
  enrichedHoldings.forEach((h) => {
    h.allocationPercentage =
      portfolioValue > 0 ? Math.round((h.currentValue / portfolioValue) * 10000) / 100 : 0;
  });

  // Summary calculations
  const totalProfitLoss = portfolioValue - totalInvestment;
  const totalProfitLossPercentage =
    totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
  const netWorth = portfolioValue + cashAvailable;

  // Sector Allocation Breakdown
  const sectorAllocation = Object.entries(sectorMap).map(([sector, value]) => ({
    sector,
    value: Math.round(value * 100) / 100,
    percentage:
      portfolioValue > 0 ? Math.round((value / portfolioValue) * 10000) / 100 : 0
  }));

  sectorAllocation.sort((a, b) => b.value - a.value);

  // Diversification Assessment
  const holdingCount = enrichedHoldings.length;
  const sectorCount = sectorAllocation.length;
  const topSectorWeight = sectorAllocation[0]?.percentage || 0;
  let status = 'Not Invested';

  if (holdingCount > 0) {
    if (holdingCount >= 5 && sectorCount >= 3 && topSectorWeight <= 45) {
      status = 'Well Diversified';
    } else if (holdingCount >= 3 && sectorCount >= 2) {
      status = 'Moderately Concentrated';
    } else {
      status = 'Highly Concentrated';
    }
  }

  return {
    consent,
    cashAvailable: Math.round(cashAvailable * 100) / 100,
    monthlyInvestment: Math.round(monthlyInvestment * 100) / 100,
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    portfolioValue: Math.round(portfolioValue * 100) / 100,
    profitLoss: Math.round(totalProfitLoss * 100) / 100,
    profitLossPercentage: Math.round(totalProfitLossPercentage * 100) / 100,
    netWorth: Math.round(netWorth * 100) / 100,
    diversification: {
      holdingCount,
      sectorCount,
      topSector: sectorAllocation[0]?.sector || 'None',
      topSectorWeight,
      status
    },
    sectorAllocation,
    holdings: enrichedHoldings
  };
}

module.exports = {
  calculatePortfolioMetrics,
  fetchLatestPrice
};
