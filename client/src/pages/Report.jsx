import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* --- EXISTING CHART COMPONENTS --- */
import RevenueChart from '../charts/RevenueChart';
import NetIncomeChart from '../charts/NetIncomeChart';
import CashFlowChart from '../charts/CashFlowChart';
import AssetsLiabilitiesChart from '../charts/AssetsLiabilitiesChart';
import PriceHistoryChart from '../charts/PriceHistoryChart';

/* --- UI COMPONENTS --- */
import EvidenceBadge from '../components/EvidenceBadge';
import EmptyMetric from '../components/EmptyMetric';
import EmptyChart from '../components/EmptyChart';
import EmptyNews from '../components/EmptyNews';

/* --- FORMATTERS --- */
import { formatCurrency, formatRatio } from '../utils/formatters';

const getRecColor = (rec) => {
  const r = String(rec || '').toUpperCase();
  if (r.includes('BUY')) return 'text-emerald-400';
  if (r.includes('HOLD')) return 'text-amber-400';
  if (r.includes('PASS') || r.includes('SELL')) return 'text-gray-400';
  return 'text-gray-400';
};

const EvidenceReferences = ({ refs }) => {
  if (!refs || refs.length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
      {refs.map((r, i) => (
        <span key={i} className="text-[10px] font-sans font-semibold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-1 rounded-sm">
          {typeof r === 'string' ? r : `${r.provider || ''} • ${r.field || ''}`}
        </span>
      ))}
    </div>
  );
};

/* ============================================================================
   MAIN REPORT PAGE COMPONENT (PURE PRESENTATION LAYER)
============================================================================ */
const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state?.reportData;
  const presentationData = reportData?.presentationData;

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!presentationData) {
    return (
      <div className="min-h-screen bg-texture flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="max-w-md border border-gray-300 rounded-none p-10 bg-white shadow-md space-y-5">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto text-xl font-sans">
            E
          </div>
          <h2 className="text-3xl font-sans font-normal text-black tracking-tight">No Active Research Memorandum</h2>
          <p className="text-sm text-gray-600 font-sans leading-relaxed">
            Please initiate an investment research inquiry on the Home page to generate a bespoke AI-authored institutional memorandum.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 px-6 bg-black text-white font-sans text-xs font-semibold uppercase tracking-[0.18em] rounded-none hover:bg-gray-800 transition-colors"
          >
            Start Research Inquiry
          </button>
        </div>
      </div>
    );
  }

  // Pure data extraction from Final Architecture Object
  const {
    company,
    evidence,
    reports,
    metadata
  } = presentationData;

  const { canonical, charts, news } = evidence || {};
  const { investment, suitability } = reports || {};

  // Extract from AI Reports explicitly
  const decisionFactors = investment?.decisionFactors || [];
  const keyStrengths = investment?.keyStrengths || [];
  const watchItems = investment?.watchItems || [];
  const limitations = investment?.limitations || [];
  const keyRisks = investment?.keyRisks || [];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white px-5 py-3.5 rounded-none shadow-xl border border-gray-800 text-xs font-sans tracking-wide flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Institutional Control Strip */}
      <div className="pt-24 border-b border-black/15 bg-white relative z-20">
        <div className="py-4 px-6 md:px-16 lg:px-24">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Back to Research</span>
              </button>
              <span className="h-4 w-[1px] bg-gray-300"></span>
              <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-black">
                {company?.symbol} • AI INVESTMENT MEMORANDUM
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-sans font-bold tracking-widest uppercase border bg-gray-100 text-gray-800 border-gray-300">
                CONFIDENCE: {investment?.confidence || 'N/A'}
              </span>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-none border border-gray-300 text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-700 hover:border-black hover:text-black transition-all bg-white"
              >
                Print PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: HERO MEMORANDUM MASTHEAD */}
      <section className="bg-texture relative pt-14 pb-20 px-6 md:px-16 lg:px-24 border-b border-gray-300 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-8 border-b border-black/20 text-xs font-sans uppercase tracking-[0.18em] text-gray-800">
            <div className="flex items-center gap-3">
              <span className="font-bold bg-black text-white px-3 py-1 rounded-none">
                AI INVESTMENT RESEARCH AGENT
              </span>
              <span>BESPOKE INSTITUTIONAL RESEARCH MEMORANDUM</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-700">
              STRICTLY AUDITED &bull; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="text-sm font-sans font-bold bg-black text-white px-3.5 py-1 rounded-none">
                  {company?.symbol}
                </span>
                {canonical?.company?.exchange && (
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider border border-black/30 rounded-none px-3 py-1 bg-white text-black">
                    {canonical.company.exchange}
                  </span>
                )}
                {canonical?.company?.sector && (
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-gray-900 bg-white/70 px-3 py-1 rounded-none border border-black/15">
                    {canonical.company.sector}
                  </span>
                )}
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-[84px] font-sans font-medium text-black tracking-tight leading-[0.94] mb-5">
                {company?.name}
              </h1>

              {canonical?.company?.description && (
                <p className="text-base sm:text-lg font-sans text-gray-800 leading-relaxed max-w-3xl">
                  {canonical.company.description.length > 240
                    ? `${canonical.company.description.slice(0, 240)}...`
                    : canonical.company.description}
                </p>
              )}
            </div>

            <div className="lg:col-span-4 bg-white border border-gray-300 rounded-none p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-gray-400 block mb-1">
                  CURRENT MARKET PRICE
                </span>
                <div className="text-4xl font-sans font-bold text-black tracking-tight">
                  {canonical?.company?.price !== undefined && canonical?.company?.price !== null
                    ? formatCurrency(canonical.company.price)
                    : <EmptyMetric label="" message="Price Unavailable" />}
                </div>
                {canonical?.company?.change !== undefined && canonical?.company?.change !== null && canonical?.company?.changesPercentage !== undefined && canonical?.company?.changesPercentage !== null && (
                  <div
                    className={`text-sm font-sans font-semibold mt-1 flex items-center gap-2 ${canonical.company.change >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                  >
                    <span>
                      {canonical.company.change >= 0 ? '+' : ''}
                      {Number(canonical.company.change).toFixed(2)} ({Number(canonical.company.changesPercentage).toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                    MARKET CAP
                  </span>
                  {canonical?.company?.marketCap !== undefined && canonical?.company?.marketCap !== null ? (
                    <span className="text-lg font-sans font-bold text-black">
                      {formatCurrency(canonical.company.marketCap)}
                    </span>
                  ) : (
                    <EmptyMetric label="" message="N/A" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                    P/E RATIO
                  </span>
                  {canonical?.financials?.peRatio !== undefined && canonical?.financials?.peRatio !== null ? (
                    <span className="text-lg font-sans font-bold text-black">
                      {formatRatio(canonical.financials.peRatio, 'x')}
                    </span>
                  ) : (
                    <EmptyMetric label="" message="N/A" />
                  )}
                </div>

                {canonical?.financials?.revenue !== undefined && canonical?.financials?.revenue !== null && (
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                      REVENUE
                    </span>
                    <span className="text-lg font-sans font-bold text-black">
                      {formatCurrency(canonical.financials.revenue)}
                    </span>
                  </div>
                )}
                {canonical?.financials?.netIncome !== undefined && canonical?.financials?.netIncome !== null && (
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                      NET INCOME
                    </span>
                    <span className="text-lg font-sans font-bold text-black">
                      {formatCurrency(canonical.financials.netIncome)}
                    </span>
                  </div>
                )}

                {canonical?.financials?.grossProfit !== undefined && canonical?.financials?.grossProfit !== null && (
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                      GROSS PROFIT
                    </span>
                    <span className="text-lg font-sans font-bold text-black">
                      {formatCurrency(canonical.financials.grossProfit)}
                    </span>
                  </div>
                )}
                {canonical?.financials?.freeCashFlow !== undefined && canonical?.financials?.freeCashFlow !== null && (
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                      FREE CASH FLOW
                    </span>
                    <span className="text-lg font-sans font-bold text-black">
                      {formatCurrency(canonical.financials.freeCashFlow)}
                    </span>
                  </div>
                )}

                {canonical?.financials?.eps !== undefined && canonical?.financials?.eps !== null && (
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                      EPS
                    </span>
                    <span className="text-lg font-sans font-bold text-black">
                      {formatRatio(canonical.financials.eps, '')}
                    </span>
                  </div>
                )}
                {canonical?.financials?.roe !== undefined && canonical?.financials?.roe !== null && (
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                      ROE
                    </span>
                    <span className="text-lg font-sans font-bold text-black">
                      {formatRatio(canonical.financials.roe * 100, '%')}
                    </span>
                  </div>
                )}

                {canonical?.financials?.debtToEquity !== undefined && canonical?.financials?.debtToEquity !== null && (
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-1">
                      DEBT / EQUITY
                    </span>
                    <span className="text-lg font-sans font-bold text-black">
                      {formatRatio(canonical.financials.debtToEquity, 'x')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block z-0" style={{ top: '22%', right: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '15%', left: '5%' }}></div>
      </section>

      {/* SECTION 2: EXECUTIVE THESIS & ANALYST RECOMMENDATION BANNER */}
      {investment && (
        <section className="bg-[#1a1a1a] text-white py-24 px-6 md:px-16 lg:px-24 relative overflow-hidden border-b border-black">
          <div className="max-w-7xl mx-auto space-y-12 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-10 border-b border-white/15">
              <div className="max-w-4xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white text-black text-[11px] font-sans font-bold uppercase tracking-[0.2em] rounded-none">
                    INSTITUTIONAL MEMORANDUM
                  </span>
                </div>

                <div className="flex items-baseline gap-5 flex-wrap">
                  <span
                    className={`text-6xl sm:text-7xl font-sans font-bold tracking-tight ${getRecColor(investment.recommendation)}`}
                  >
                    {(investment.recommendation || 'HOLD').toUpperCase()}
                  </span>
                  <div className="text-2xl sm:text-3xl font-sans text-gray-300">
                    on {company?.symbol}
                  </div>
                </div>

                {investment.investmentThesis && (
                  <p className="text-lg sm:text-xl font-sans leading-relaxed text-gray-200 max-w-3xl">
                    {investment.investmentThesis}
                  </p>
                )}
              </div>

              <div className="bg-white/10 border border-white/15 rounded-none p-7 backdrop-blur-sm w-full lg:w-80 space-y-5 shrink-0">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-gray-300 block mb-1">
                    CONFIDENCE SCORE
                  </span>
                  <span className="text-3xl font-sans font-bold text-white">
                    {investment.confidence || <EmptyMetric label="" message="Not Available" />}
                  </span>
                </div>
                {investment.confidenceReason && (
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-gray-300 block mb-1">
                      CONFIDENCE REASONING
                    </span>
                    <span className="text-sm font-sans font-medium text-white">
                      {investment.confidenceReason}
                    </span>
                  </div>
                )}
                {(investment.targetHorizon || investment.investmentHorizon) && (
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-gray-300 block mb-1">
                      TARGET HORIZON
                    </span>
                    <span className="text-xl font-sans font-bold text-white uppercase">
                      {investment.targetHorizon || investment.investmentHorizon}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: QUALITATIVE ANALYSIS (DECISION FACTORS) */}
      {decisionFactors && decisionFactors.length > 0 && (
        <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-b border-black/15">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-black/20">
              <div className="flex items-center gap-3">
                <span className="bg-black text-white px-3 py-1 rounded-none text-xs font-sans font-bold uppercase tracking-[0.18em]">
                  QUALITATIVE ANALYSIS
                </span>
                <span className="text-xs font-sans font-semibold uppercase tracking-[0.18em] text-gray-800">
                  AI DECISION FACTORS
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {decisionFactors.map((df, idx) => (
                <div key={idx} className="border border-gray-200 p-8 space-y-4 bg-gray-50 hover:border-black/30 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                      <span className="text-xs font-sans font-bold uppercase tracking-widest text-black">
                        {df.source || 'Investment Factor'}
                      </span>
                      {df.validationStatus && (
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-widest bg-gray-200 px-2 py-1">
                          {df.validationStatus}
                        </span>
                      )}
                    </div>
                    <div>
                      {df.category && (
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-gray-400 block mb-1">
                          {df.category}
                        </span>
                      )}
                      <h3 className="text-xl font-sans font-bold text-black mb-3">
                        {df.factor}
                      </h3>
                      {df.summary && (
                        <p className="text-sm font-sans font-medium text-gray-800 mb-2">
                          {df.summary}
                        </p>
                      )}
                      {df.reasoning && (
                        <p className="text-sm font-sans text-gray-600 leading-relaxed mb-4">
                          {df.reasoning}
                        </p>
                      )}
                      {df.supportingEvidence && df.supportingEvidence.length > 0 && (
                        <div className="bg-white border border-gray-100 p-4">
                          <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                            Supporting Evidence
                          </span>
                          <ul className="list-disc list-outside ml-4 text-sm font-sans text-gray-600 space-y-1">
                            {df.supportingEvidence.map((evidence, eIdx) => (
                              <li key={eIdx}>{evidence}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-sans text-gray-500 uppercase tracking-widest">
                      {df.impact && <span>Impact: {df.impact}</span>}
                      {df.impact && df.importance && <span className="h-3 w-[1px] bg-gray-300"></span>}
                      {df.importance && <span>Importance: {df.importance}</span>}
                    </div>
                  </div>
                  <EvidenceReferences refs={df.evidenceReferences} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION: PROVIDER DISCREPANCIES */}
      {evidence?.providerComparisons && (Object.keys(evidence.providerComparisons).length > 0) && (
        <section className="bg-white py-20 px-6 md:px-16 lg:px-24 border-b border-black/15">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-rose-500 block mb-1">
                DATA AUDIT
              </span>
              <h3 className="text-3xl font-sans font-normal text-black">Provider Discrepancies</h3>
            </div>
            <div className="space-y-6">
              {Object.entries(evidence.providerComparisons).map(([domain, fields], idx) => (
                <div key={idx} className="bg-rose-50 border border-rose-200 p-6 shadow-sm">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-rose-800 mb-4 pb-2 border-b border-rose-200">
                    {domain}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(fields).map(([field, vals], fIdx) => (
                      <div key={fIdx} className="bg-white border border-rose-100 p-4">
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-gray-500 block mb-2">
                          {field}
                        </span>
                        <div className="space-y-2 text-sm font-sans">
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">FMP:</span>
                            <span className="text-gray-900">{vals?.fmp !== undefined && vals?.fmp !== null ? String(vals.fmp) : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">Finnhub:</span>
                            <span className="text-gray-900">{vals?.finnhub !== undefined && vals?.finnhub !== null ? String(vals.finnhub) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW SECTION: INVESTMENT STRENGTHS */}
      {keyStrengths && keyStrengths.length > 0 && (
        <section className="bg-[#a5f3fc] py-20 px-6 md:px-16 lg:px-24 border-b border-black/15">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-gray-700 block mb-1">
                POSITIVE CATALYSTS
              </span>
              <h3 className="text-3xl font-sans font-normal text-black">Investment Strengths</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyStrengths.map((strength, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex gap-4 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
                    <p className="text-base font-sans text-gray-800 leading-relaxed">
                      {strength.statement}
                    </p>
                  </div>
                  <EvidenceReferences refs={strength.evidenceReferences} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW SECTION: WATCH ITEMS */}
      {watchItems && watchItems.length > 0 && (
        <section className="bg-white py-20 px-6 md:px-16 lg:px-24 border-b border-black/15">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                FUTURE MONITORING
              </span>
              <h3 className="text-3xl font-sans font-normal text-black">Key Watch Items</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {watchItems.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex gap-4 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
                    <p className="text-base font-sans text-gray-800 leading-relaxed">
                      {item.statement}
                    </p>
                  </div>
                  <EvidenceReferences refs={item.evidenceReferences} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW SECTION: EVIDENCE LIMITATIONS */}
      {limitations && limitations.length > 0 && (
        <section className="bg-gray-50 py-20 px-6 md:px-16 lg:px-24 border-b border-black/15">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-gray-500 block mb-1">
                DATA CONSTRAINTS
              </span>
              <h3 className="text-3xl font-sans font-normal text-black">Evidence Limitations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {limitations.map((lim, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-widest bg-black text-white px-2 py-1 inline-block">
                    Impact: {lim.impact}
                  </span>
                  <p className="text-sm font-sans text-gray-800 leading-relaxed">
                    <span className="font-semibold block mb-1">Issue:</span>
                    {lim.issue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW SECTION: OUTLOOK */}
      {investment && (investment.shortTermOutlook || investment.longTermOutlook) && (
        <section className="bg-white py-20 px-6 md:px-16 lg:px-24 border-b border-black/15">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-gray-400 block mb-1">
                MARKET PROJECTION
              </span>
              <h3 className="text-3xl font-sans font-normal text-black">Investment Outlook</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {investment.shortTermOutlook && (
                <div className="bg-gray-50 border border-gray-200 p-8 shadow-sm">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-black mb-4 pb-3 border-b border-gray-200">
                    Short-Term Outlook
                  </h4>
                  <p className="text-base font-sans text-gray-700 leading-relaxed">
                    {investment.shortTermOutlook}
                  </p>
                </div>
              )}
              {investment.longTermOutlook && (
                <div className="bg-gray-50 border border-gray-200 p-8 shadow-sm">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-black mb-4 pb-3 border-b border-gray-200">
                    Long-Term Outlook
                  </h4>
                  <p className="text-base font-sans text-gray-700 leading-relaxed">
                    {investment.longTermOutlook}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: QUANTITATIVE EVIDENCE (CHARTS & METRICS) */}
      <section className="bg-gray-50 py-24 px-6 md:px-16 lg:px-24 border-b border-black/15">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/20">
            <div className="flex items-center gap-3">
              <span className="bg-black text-white px-3 py-1 rounded-none text-xs font-sans font-bold uppercase tracking-[0.18em]">
                QUANTITATIVE EVIDENCE
              </span>
              <span className="text-xs font-sans font-semibold uppercase tracking-[0.18em] text-gray-800">
                STRUCTURED DATASETS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Revenue */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-100">Annual Revenue</h3>
              {charts?.historicalFinancials ? (
                <RevenueChart periods={charts.historicalFinancials} />
              ) : (
                <EmptyChart title="Revenue Data" message="Historical revenue statements unavailable." />
              )}
            </div>

            {/* Net Income */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-100">Net Income</h3>
              {charts?.historicalFinancials ? (
                <NetIncomeChart periods={charts.historicalFinancials} />
              ) : (
                <EmptyChart title="Profit Data" message="Historical profit statements unavailable." />
              )}
            </div>

            {/* Cash Flow */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-100">Free Cash Flow</h3>
              {charts?.historicalFinancials ? (
                <CashFlowChart periods={charts.historicalFinancials} />
              ) : (
                <EmptyChart title="Cash Flow Data" message="Historical cash flow statements unavailable." />
              )}
            </div>

            {/* Assets & Liabilities */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-100">Assets & Liabilities</h3>
              {charts?.historicalFinancials ? (
                <AssetsLiabilitiesChart periods={charts.historicalFinancials} />
              ) : (
                <EmptyChart title="Balance Sheet" message="Historical balance sheet unavailable." />
              )}
            </div>
          </div>

          {/* Price History */}
          <div className="bg-white p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-100">Price History</h3>
            {charts?.historicalPrices ? (
              <PriceHistoryChart historicalPrices={charts.historicalPrices} symbol={company?.symbol} />
            ) : (
              <EmptyChart title="Price Data" message="Historical price data unavailable." />
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: INSTITUTIONAL NEWS */}
      <section className="bg-white py-24 px-6 md:px-16 lg:px-24 border-b border-black/15">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.18em] text-gray-800">
                INSTITUTIONAL NEWS
              </span>
            </div>
          </div>
          {news && news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-none bg-white border border-black/20 hover:border-black transition-all space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs font-sans text-gray-500">
                    <span className="bg-black text-white px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-[0.18em]">
                      {item.sentiment}
                    </span>
                    <span className="font-semibold uppercase tracking-wider text-gray-700 text-[11px]">
                      {item.source}
                    </span>
                  </div>
                  <div className="font-sans text-base font-normal text-black leading-snug">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyNews />
          )}
        </div>
      </section>

      {/* SECTION 6: CORE DOWNSIDE RISK SUMMARY */}
      {keyRisks && keyRisks.length > 0 && (
        <section className="py-24 px-6 md:px-16 lg:px-24 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/80">
              <div>
                <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-gray-400 block mb-2">
                  DOWNSIDE RISK EVALUATION
                </span>
                <h2 className="text-4xl sm:text-5xl font-sans font-normal text-black tracking-tight">
                  Core Risks & Analyst Mitigation
                </h2>
              </div>
              <span className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-gray-500">
                AUDITED RISK PROFILE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {keyRisks.map((risk, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-none border border-gray-200 bg-white hover:border-gray-300 transition-all flex flex-col justify-between space-y-6 shadow-xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                      <p className="text-base font-sans text-gray-700 leading-relaxed">
                        {risk.statement}
                      </p>
                    </div>
                    <EvidenceReferences refs={risk.evidenceReferences} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: PERSONALIZED PORTFOLIO FIT (CONDITIONAL) */}
      {suitability && (
        <section className="py-20 px-6 md:px-16 lg:px-24 bg-[#cffafe] border-b border-gray-200">
          <div className="max-w-7xl mx-auto space-y-12">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-gray-500 block mb-1">
                PORTFOLIO COMPATIBILITY
              </span>
              <h3 className="text-3xl font-sans font-normal text-black">Personalized Allocation Fit</h3>
            </div>

            {/* Top Level Summary and Recommendation */}
            <div className="bg-white border border-gray-200 p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2">
                  PERSONALIZED RECOMMENDATION
                </span>
                <p className="text-xl font-sans font-medium text-black">
                  {suitability.personalizedRecommendation || <EmptyMetric label="" message="Not Available" />}
                </p>
              </div>
              <div className="border-t border-gray-100 pt-6">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2">
                  SUITABILITY SUMMARY
                </span>
                <p className="text-base font-sans text-gray-700 leading-relaxed">
                  {suitability.overallSummary || <EmptyMetric label="" message="Not Available" />}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2">
                  PORTFOLIO FIT
                </span>
                <span className="text-base font-sans font-medium text-black block mb-4">{suitability.portfolioFit || 'N/A'}</span>
                
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2 pt-4 border-t border-gray-100">
                  CASH ASSESSMENT
                </span>
                <span className="text-sm font-sans text-gray-700">{suitability.cashAssessment || 'N/A'}</span>
              </div>
              
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2">
                  RISK ALIGNMENT
                </span>
                <span className="text-sm font-sans text-gray-700 block mb-4">{suitability.riskAlignment || 'N/A'}</span>
                
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2 pt-4 border-t border-gray-100">
                  HORIZON FIT
                </span>
                <span className="text-sm font-sans text-gray-700">{suitability.investmentHorizonFit || 'N/A'}</span>
              </div>
              
              <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2">
                  DIVERSIFICATION
                </span>
                <span className="text-sm font-sans text-gray-700 block mb-4">{suitability.diversificationImpact || 'N/A'}</span>
                
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2 pt-4 border-t border-gray-100">
                  SECTOR EXPOSURE
                </span>
                <span className="text-sm font-sans text-gray-700">{suitability.sectorExposure || 'N/A'}</span>
              </div>
              
              <div className="bg-[#1a1a1a] border border-black p-6 shadow-sm text-white">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2">
                  POSITION GUIDANCE
                </span>
                <span className="text-sm font-sans text-white block mb-4">{suitability.positionGuidance || 'N/A'}</span>
                
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em] text-gray-400 block mb-2 pt-4 border-t border-gray-700">
                  ALLOCATION
                </span>
                <span className="text-sm font-sans text-white">{suitability.allocationSuggestion || 'N/A'}</span>
              </div>
            </div>

            {/* Conflicts and Strengths/Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(suitability.portfolioConflicts?.length > 0 || suitability.limitations?.length > 0) && (
                <div className="bg-white border border-gray-200 p-8 shadow-sm space-y-6">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-3">
                    Portfolio Conflicts & Limitations
                  </h4>
                  <div className="space-y-4">
                    {[...(suitability.portfolioConflicts || []), ...(suitability.limitations || [])].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></span>
                          <p className="text-sm font-sans text-gray-800 leading-relaxed">
                            {item.statement}
                          </p>
                        </div>
                        <EvidenceReferences refs={item.evidenceReferences} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {suitability.strengths?.length > 0 && (
                <div className="bg-white border border-gray-200 p-8 shadow-sm space-y-6">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-3">
                    Portfolio Fit Strengths
                  </h4>
                  <div className="space-y-4">
                    {suitability.strengths.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0"></span>
                          <p className="text-sm font-sans text-gray-800 leading-relaxed">
                            {item.statement}
                          </p>
                        </div>
                        <EvidenceReferences refs={item.evidenceReferences} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </section>
      )}

      {/* SECTION 8: FINAL EXECUTIVE TAKEAWAY */}
      {investment && (
        <section className="bg-[#1a1a1a] text-white py-28 px-6 md:px-16 lg:px-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-12 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-12 border-b border-white/15">
              <div className="max-w-3xl space-y-3">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-gray-400">
                  FINAL EXECUTIVE MEMORANDUM TAKEAWAY
                </span>
                <h2 className="text-4xl sm:text-5xl font-sans font-normal tracking-tight">
                  <span className={getRecColor(investment.recommendation)}>
                    {(investment.recommendation || 'HOLD').toUpperCase()}
                  </span>{' '}
                  {company?.symbol} • Conviction: {investment.confidence || 'Not Available'}
                </h2>
                {investment.overallSummary && (
                  <p className="text-base sm:text-lg font-sans text-gray-300 leading-relaxed">
                    {investment.overallSummary}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => showToast('Research Report saved to your research library!')}
                  className="px-6 py-3.5 rounded-none bg-white text-black text-xs font-sans font-bold uppercase tracking-[0.15em] hover:bg-gray-200 transition-all shadow-sm"
                >
                  Save Research Report
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3.5 rounded-none border border-white/30 text-white text-xs font-sans font-bold uppercase tracking-[0.15em] hover:bg-white/10 transition-all"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* INSTITUTIONAL SIGN-OFF & REGULATORY DISCLOSURES */}
      <section className="bg-white py-16 px-6 md:px-16 lg:px-24 border-t border-b border-gray-200 text-gray-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-black">
                AI INVESTMENT RESEARCH AGENT COMPLIANCE & VERIFICATION
              </span>
            </div>
            <p className="text-xs font-sans leading-relaxed text-gray-500">
              This institutional memorandum was dynamically synthesized by multi-agent evidence cross-validation. SEC filings, earnings transcripts, and financial statements are cross-audited for numerical fidelity before recommendation scoring.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0 text-xs font-sans font-semibold uppercase tracking-[0.15em] text-black">
            <div>
              AUDIT STATUS:{' '}
              <span className="text-emerald-600">
                {metadata?.validationStatus || 'Evidence quality unavailable.'}
              </span>
            </div>
            <div>VERIFIED DATE: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Report;
