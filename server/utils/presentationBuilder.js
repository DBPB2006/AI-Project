/**
 * PURE PRESENTATION LAYER UTILITY
 * 
 * Transforms LangGraph AI pipeline outputs into a canonical, frontend-ready object.
 * Exposes canonical data and provider discrepancies separately.
 * Never performs business logic, financial analysis, AI reasoning, or chart guessing.
 */

const buildPresentationData = (finalState) => {
  const {
    company = '',
    symbol = '',
    evidence = {},
    financialReport = {},
    marketReport = {},
    validationReport = {},
    investmentReport = {},
    suitabilityReport = null,
  } = finalState;

  // Helpers to safely get provider data
  const getFmp = (path) => evidence?.[path]?.fmp || {};
  const getFinn = (path) => evidence?.[path]?.finnhub || {};

  const fmpCompany = getFmp('company');
  const finnCompany = getFinn('company');
  const fmpStock = getFmp('stock');
  const finnStock = getFinn('stock');
  const fmpFin = getFmp('financials');
  const finnFin = getFinn('financials');
  const fmpRatios = getFmp('ratios');
  const finnRatios = getFinn('ratios');

  const resolveValue = (fmpVal, finnVal) => {
    const resolved = fmpVal !== undefined && fmpVal !== null ? fmpVal : (finnVal !== undefined && finnVal !== null ? finnVal : null);
    const hasDiscrepancy = (fmpVal !== undefined && fmpVal !== null) &&
      (finnVal !== undefined && finnVal !== null) &&
      (fmpVal !== finnVal);

    return {
      resolved,
      discrepancy: hasDiscrepancy ? { fmp: fmpVal, finnhub: finnVal } : null
    };
  };

  const fmpPrice = fmpStock.currentPrice;
  const finnPrice = finnStock.currentPrice;
  const fmpPrevClose = fmpStock.previousClose;
  const finnPrevClose = finnStock.previousClose;

  const fmpChange = (fmpPrice !== null && fmpPrevClose !== null) ? (fmpPrice - fmpPrevClose) : null;
  const finnChange = (finnPrice !== null && finnPrevClose !== null) ? (finnPrice - finnPrevClose) : null;

  const fmpChangePct = (fmpChange !== null && fmpPrevClose) ? (fmpChange / fmpPrevClose) * 100 : null;
  const finnChangePct = (finnChange !== null && finnPrevClose) ? (finnChange / finnPrevClose) * 100 : null;

  // Company Canonical Resolution
  const exchangeRes = resolveValue(fmpCompany.exchange, finnCompany.exchange);
  const sectorRes = resolveValue(fmpCompany.sector, finnCompany.sector);
  const industryRes = resolveValue(fmpCompany.industry, finnCompany.industry);
  const descriptionRes = resolveValue(fmpCompany.description, finnCompany.description);

  // Market cap handling: FMP returns full value, Finnhub returns in millions
  const fmpCap = fmpCompany.marketCap;
  const finnCap = finnCompany.marketCap ? finnCompany.marketCap * 1000000 : null;
  const mktCapRes = resolveValue(fmpCap, finnCap);

  const priceRes = resolveValue(fmpPrice, finnPrice);
  const prevCloseRes = resolveValue(fmpPrevClose, finnPrevClose);
  const changeRes = resolveValue(fmpChange, finnChange);
  const changesPctRes = resolveValue(fmpChangePct, finnChangePct);

  const canonicalCompany = {
    exchange: exchangeRes.resolved,
    sector: sectorRes.resolved,
    industry: industryRes.resolved,
    description: descriptionRes.resolved,
    marketCap: mktCapRes.resolved,
    price: priceRes.resolved,
    previousClose: prevCloseRes.resolved,
    change: changeRes.resolved,
    changesPercentage: changesPctRes.resolved
  };

  const companyDiscrepancies = {
    exchange: exchangeRes.discrepancy,
    sector: sectorRes.discrepancy,
    industry: industryRes.discrepancy,
    description: descriptionRes.discrepancy,
    marketCap: mktCapRes.discrepancy,
    price: priceRes.discrepancy,
    previousClose: prevCloseRes.discrepancy,
    change: changeRes.discrepancy,
    changesPercentage: changesPctRes.discrepancy
  };

  // Financials Canonical Resolution
  const revRes = resolveValue(fmpFin.revenue, finnFin.revenue);
  const netRes = resolveValue(fmpFin.netIncome, finnFin.netIncome);

  // Gross Profit can be estimated from Revenue * Gross Margin if not explicitly in financials
  const fmpGross = fmpFin.grossProfit || (fmpFin.revenue && fmpRatios.grossMargin ? fmpFin.revenue * fmpRatios.grossMargin : null);
  const finnGross = finnFin.grossProfit || (finnFin.revenue && finnRatios.grossMargin ? finnFin.revenue * finnRatios.grossMargin : null);
  const grossRes = resolveValue(fmpGross, finnGross);

  const fcfRes = resolveValue(fmpFin.cashFlow, finnFin.cashFlow);

  // EPS can be calculated from Price / PE if missing
  const fmpEps = fmpFin.eps || (fmpPrice && fmpRatios.pe ? fmpPrice / fmpRatios.pe : null);
  const finnEps = finnFin.eps || (finnPrice && finnRatios.pe ? finnPrice / finnRatios.pe : null);
  const epsRes = resolveValue(fmpEps, finnEps);

  const roeRes = resolveValue(fmpRatios.roe, finnRatios.roe);
  const peRes = resolveValue(fmpRatios.pe, finnRatios.pe);

  // Debt to Equity
  const fmpDebtToEquity = fmpFin.debtToEquity || (fmpFin.debt !== null && fmpFin.equity ? fmpFin.debt / fmpFin.equity : null);
  const finnDebtToEquity = finnFin.debtToEquity || (finnFin.debt !== null && finnFin.equity ? finnFin.debt / finnFin.equity : null);
  const debtRes = resolveValue(fmpDebtToEquity, finnDebtToEquity);

  const canonicalFinancials = {
    revenue: revRes.resolved,
    grossProfit: grossRes.resolved,
    netIncome: netRes.resolved,
    freeCashFlow: fcfRes.resolved,
    eps: epsRes.resolved,
    roe: roeRes.resolved,
    peRatio: peRes.resolved,
    debtToEquity: debtRes.resolved
  };

  const financialsDiscrepancies = {
    revenue: revRes.discrepancy,
    grossProfit: grossRes.discrepancy,
    netIncome: netRes.discrepancy,
    freeCashFlow: fcfRes.discrepancy,
    eps: epsRes.discrepancy,
    roe: roeRes.discrepancy,
    peRatio: peRes.discrepancy,
    debtToEquity: debtRes.discrepancy
  };

  const providerComparisons = {
    company: Object.fromEntries(Object.entries(companyDiscrepancies).filter(([_, v]) => v !== null)),
    financials: Object.fromEntries(Object.entries(financialsDiscrepancies).filter(([_, v]) => v !== null))
  };

  if (Object.keys(providerComparisons.company).length === 0) delete providerComparisons.company;
  if (Object.keys(providerComparisons.financials).length === 0) delete providerComparisons.financials;

  // Chart Datasets (Canonical Arrays)
  const rawFmpPrices = evidence?.historicalPrices?.fmp;
  const rawFinnPrices = evidence?.historicalPrices?.finnhub;
  const canonicalPrices = (Array.isArray(rawFmpPrices) && rawFmpPrices.length > 0) ? rawFmpPrices :
    (Array.isArray(rawFinnPrices) && rawFinnPrices.length > 0) ? rawFinnPrices : null;

  // The frontend needs arrays for historical charts
  const rawFmpFin = evidence?.financials?.fmp;
  const rawFinnFin = evidence?.financials?.finnhub;
  
  const fmpHist = evidence?.historicalFinancials?.fmp;
  const finnHist = evidence?.historicalFinancials?.finnhub;

  const historicalFin = (Array.isArray(fmpHist) && fmpHist.length > 0)
    ? fmpHist
    : ((Array.isArray(finnHist) && finnHist.length > 0)
      ? finnHist
      : (Array.isArray(rawFmpFin) ? rawFmpFin : (rawFmpFin && typeof rawFmpFin === 'object' && Object.keys(rawFmpFin).length > 0
        ? [rawFmpFin]
        : (Array.isArray(rawFinnFin) ? rawFinnFin : null))));

  const charts = {
    historicalPrices: canonicalPrices,
    historicalFinancials: historicalFin
  };

  // News Normalization (Preserve all valid news items from providers)
  const mergedNews = Array.isArray(evidence?.news?.merged) ? evidence.news.merged : [];

  const cleanNews = mergedNews.map(item => ({
    sentiment: item.sentiment || 'NEUTRAL',
    source: item.source || 'News Source',
    title: item.title || item.headline || 'News Alert',
    url: item.url || null,
    publishedAt: item.publishedAt || item.datetime || null
  }));

  // Preserve Providers
  const providers = {
    fmp: {
      company: evidence?.company?.fmp,
      stock: evidence?.stock?.fmp,
      financials: evidence?.financials?.fmp,
      historicalFinancials: evidence?.historicalFinancials?.fmp,
      ratios: evidence?.ratios?.fmp,
      earnings: evidence?.earnings?.fmp,
      recommendations: evidence?.recommendations?.fmp,
      insiderSentiment: evidence?.insiderSentiment?.fmp,
      historicalPrices: evidence?.historicalPrices?.fmp
    },
    finnhub: {
      company: evidence?.company?.finnhub,
      stock: evidence?.stock?.finnhub,
      financials: evidence?.financials?.finnhub,
      historicalFinancials: evidence?.historicalFinancials?.finnhub,
      ratios: evidence?.ratios?.finnhub,
      earnings: evidence?.earnings?.finnhub,
      recommendations: evidence?.recommendations?.finnhub,
      insiderSentiment: evidence?.insiderSentiment?.finnhub,
      historicalPrices: evidence?.historicalPrices?.finnhub
    },
    newsApi: evidence?.news?.newsApi,
    finnhubNews: evidence?.news?.finnhub
  };

  // Build Final Target Architecture
  return {
    company: {
      symbol: symbol || 'TICKER',
      name: fmpCompany.companyName || fmpCompany.name || finnCompany.name || company || symbol
    },
    evidence: {
      providers,
      canonical: {
        company: canonicalCompany,
        financials: canonicalFinancials
      },
      charts,
      news: cleanNews,
      providerComparisons
    },
    reports: {
      financial: financialReport || null,
      market: marketReport || null,
      validation: validationReport || null,
      investment: investmentReport || null,
      suitability: suitabilityReport || null
    },
    metadata: {
      validationStatus: validationReport?.overallEvidenceQuality?.rating || validationReport?.auditStatus || null,
      reportBlueprint: investmentReport?.reportBlueprint || finalState.reportBlueprint || null
    },
    ui: {}
  };
};

module.exports = {
  buildPresentationData
};
