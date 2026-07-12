import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="w-full min-h-screen bg-white text-v-dark font-sans">
      {/* Editorial Methodology & Whitepaper Masthead with Signature Stripe Texture */}
      <section className="bg-texture relative pt-36 pb-16 px-8 md:px-16 lg:px-24 border-b border-v-dark/15">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-v-dark text-white rounded">
                  METHODOLOGY DOSSIER
                </span>
                <span className="text-xs font-mono text-v-dark/60 uppercase tracking-widest">
                  &bull; DETERMINISTIC STATE ENGINE
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[84px] font-medium leading-[0.93] tracking-tight text-v-dark mb-6">
                Architecture &amp; Protocol
              </h1>
              <p className="text-lg md:text-xl font-serif text-v-dark/80 leading-relaxed max-w-2xl">
                Replacing generative speculation with verifiable multi-agent research pipelines. How we coordinate specialized AI agents to inspect financial filings, balance sheet consistency, and market catalysts.
              </p>
            </div>

            {/* Architectural Spec Card with Cyan Pinstripe Texture */}
            <div className="bg-v-cyan bg-pinstripe-dense rounded border border-v-dark/20 shadow-sm p-6 max-w-sm w-full">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-v-dark/70 block mb-2">
                CORE SPECIFICATION
              </span>
              <div className="text-xl font-medium text-v-dark mb-2">
                LangGraph State Protocol
              </div>
              <p className="text-xs font-mono text-v-dark/80 leading-relaxed">
                ZERO HALLUCINATION MANDATE &bull; EVIDENCE CITATION TRACKING &bull; VERIFIABLE METRIC EXTRACTION
              </p>
            </div>
          </div>
        </div>

        {/* Floating geometric accents matching Home.jsx */}
        <div className="floating-square hidden lg:block z-0" style={{ top: '22%', right: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '15%', left: '5%' }}></div>
      </section>

      {/* 1. Architectural Manifesto — Two Column Monograph */}
      <section className="py-20 px-8 md:px-16 lg:px-24 bg-v-gray border-b border-v-dark/15">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-2">
                01 &bull; THE PROBLEM STATEMENT
              </span>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-v-dark mb-4">
                Why Standard Financial LLMs Fail
              </h2>
              <p className="text-base font-sans text-v-dark/80 leading-relaxed mb-4">
                Standard large language models synthesize answers from statistical weights rather than deterministic evidence. In institutional finance, a single hallucinated EBITDA margin or overlooked off-balance-sheet liability invalidates the entire analysis.
              </p>
              <p className="text-base font-sans text-v-dark/80 leading-relaxed">
                Furthermore, monolithic prompts mix data ingestion, numerical verification, and qualitative thesis generation into a single opaque step—making formal audit trails impossible.
              </p>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-2">
                02 &bull; OUR METHODOLOGY
              </span>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-v-dark mb-4">
                Graph-Directed Multi-Agent Audits
              </h2>
              <p className="text-base font-sans text-v-dark/80 leading-relaxed mb-4">
                Our architecture isolates responsibilities across five autonomous nodes in a deterministic LangGraph state machine. Each agent receives only the validated state of its predecessors and must provide concrete citations for every numerical assertion.
              </p>
              <p className="text-base font-sans text-v-dark/80 leading-relaxed">
                Before any thesis reaches the investment committee summary, an independent Evidence Validation Layer cross-checks all quantitative claims against raw provider payloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Multi-Agent Node Specification Schedule */}
      <section className="py-24 px-8 md:px-16 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-6 border-b border-v-dark/15">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-1">
                EXECUTION TOPOLOGY
              </span>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-v-dark">
                The 5-Node Agent Schedule
              </h2>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 mt-4 md:mt-0 font-bold">
              STATE GRAPH EXECUTION ORDER &bull; DETERMINISTIC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                node: 'NODE 01',
                title: 'Research & Ingestion Engine',
                spec: 'Queries FMP, Finnhub, and News APIs to construct a normalized JSON Evidence Package containing multi-year income statements, balance sheets, and real-time market quote tape.'
              },
              {
                node: 'NODE 02',
                title: 'Quantitative Financial Agent',
                spec: 'Audits historical margins, operating cash flows, DuPont ROE decomposition, and debt maturity schedules. Flags statistical discrepancies across data vendors.'
              },
              {
                node: 'NODE 03',
                title: 'Market & News Sentiment Agent',
                spec: 'Aggregates press coverage and regulatory disclosures to score macro headwinds, upcoming catalysts, and executive commentary momentum.'
              },
              {
                node: 'NODE 04',
                title: 'Evidence Validation Layer',
                spec: 'Performs rigorous automated fact-checking. Strips or marks any assertion that cannot be explicitly referenced to a verified source document line.'
              },
              {
                node: 'NODE 05',
                title: 'Investment Decision Agent',
                spec: 'Synthesizes all validated quantitative and qualitative vectors into an authoritative Investment Memorandum with explainable INVEST / PASS verdict.'
              },
              {
                node: 'OPTIONAL NODE',
                title: 'Portfolio Suitability Agent',
                spec: 'Couples objective equities research with your custom institutional mandate, checking personal risk tolerance and sector diversification constraints.'
              }
            ].map((card, idx) => (
              <article
                key={idx}
                className="p-8 border border-v-dark/15 rounded bg-white flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold bg-v-dark text-white rounded px-2.5 py-1">
                      {card.node}
                    </span>
                    <span className="text-[11px] font-mono text-v-dark/60 uppercase">
                      AUDIT ACTIVE
                    </span>
                  </div>
                  <h3 className="text-2xl font-medium text-v-dark mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm font-sans text-v-dark/80 leading-relaxed">
                    {card.spec}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-v-dark/10 flex items-center justify-between text-xs font-mono text-v-dark/60">
                  <span>STATE VERIFIED</span>
                  <span>ZERO HALLUCINATIONS</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Institutional Data Feed Schedule */}
      <section className="py-24 px-8 md:px-16 lg:px-24 bg-[#1a1a1a] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-5">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#a5f3fc] block mb-2">
              DATA FEED INTEGRATION
            </span>
            <h2 className="text-4xl font-medium tracking-tight text-white mb-4">
              Institutional Data Providers
            </h2>
            <p className="text-sm font-sans text-gray-300 leading-relaxed mb-6">
              Our multi-agent graph ingests raw payloads directly from regulated institutional APIs. No intermediate caching layers or outdated model weights are used for quantitative metrics.
            </p>
            <Link
              to="/explore"
              className="inline-block bg-[#a5f3fc] text-black rounded font-mono font-bold uppercase tracking-widest text-xs px-8 py-4 hover:bg-white transition-colors shadow-sm"
            >
              LAUNCH RESEARCH DIRECTORY &rarr;
            </Link>
          </div>

          <div className="lg:col-span-7 bg-[#262626] border border-white/10 rounded p-8">
            <div className="space-y-5">
              {[
                { name: 'FMP SEC Filing Interface', detail: 'Real-time 10-K Annual and 10-Q Quarterly filings and standardized metrics' },
                { name: 'Financial Modeling Prep (FMP)', detail: 'Standardized Multi-Year Income Statements & Financial Ratios' },
                { name: 'Finnhub Institutional Feed', detail: 'Live Exchange Price Action, Intraday Quotes & 52-Week Bands' },
                { name: 'NewsAPI Macro Wire', detail: 'Curated Financial Journalism & Regulatory Press Release Sentiment' }
              ].map((feed, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 last:border-none last:pb-0 gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#a5f3fc] rounded-full shrink-0"></span>
                    <span className="font-serif font-bold text-white text-lg">{feed.name}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-400 uppercase">{feed.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block" style={{ top: '22%', left: '4%' }}></div>
        <div className="floating-square hidden lg:block" style={{ bottom: '18%', right: '8%' }}></div>
      </section>

      {/* 4. Editorial FAQ Dossier */}
      <section className="py-24 px-8 md:px-16 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 pb-4 border-b border-v-dark/15">
            <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-1">
              INQUIRIES &amp; COMPLIANCE
            </span>
            <h2 className="text-4xl font-medium tracking-tight text-v-dark">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="border border-v-dark/15 rounded p-8 bg-v-cyan bg-pinstripe-dense shadow-sm">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-v-dark/60 block mb-2">
                FAQ 01
              </span>
              <h3 className="text-2xl font-medium text-v-dark mb-3">
                Does the platform guarantee investment returns?
              </h3>
              <p className="text-sm font-sans text-v-dark/80 leading-relaxed">
                No. The platform is an autonomous research tool designed to accelerate institutional diligence by compiling verified data and structured memos. All recommendations require independent human verification.
              </p>
            </div>

            <div className="border border-v-dark/15 rounded p-8 bg-v-cyan bg-pinstripe-dense shadow-sm">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-v-dark/60 block mb-2">
                FAQ 02
              </span>
              <h3 className="text-2xl font-medium text-v-dark mb-3">
                How does the Evidence Validation Layer work?
              </h3>
              <p className="text-sm font-sans text-v-dark/80 leading-relaxed">
                A specialized verification agent inspects every sentence of the draft report and verifies whether its numbers and claims appear verbatim or mathematically derived in the original FMP/Finnhub payloads. Unverified statements are purged.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
