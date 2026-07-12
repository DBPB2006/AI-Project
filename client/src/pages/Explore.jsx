import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/config';

const Explore = () => {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      setIsSearching(true);
      axios.get(`${API_BASE_URL}/api/companies?q=${searchQuery}`)
        .then((res) => {
          setCompanies(res.data.data || []);
          setLoading(false);
          setIsSearching(false);
        })
        .catch((err) => {
          setLoading(false);
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const sectors = ['ALL', 'Technology', 'Healthcare', 'Financial', 'Consumer', 'Energy'];

  const filteredCompanies = companies.filter((c) => {
    const matchesQuery =
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector =
      selectedSector === 'ALL' || (c.sector && c.sector.toLowerCase().includes(selectedSector.toLowerCase()));
    return matchesQuery && matchesSector;
  });

  return (
    <div className="w-full min-h-screen bg-white text-v-dark font-sans">
      {/* 1. Hero Section with Signature Stripe Texture */}
      <section className="bg-texture relative w-full pt-36 pb-20 px-8 md:px-16 lg:px-24 flex flex-col border-b border-v-dark/15">
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-14">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-v-dark text-white rounded">
                  EXPLORE COMPANIES
                </span>
                <span className="text-xs font-mono text-v-dark/60 uppercase tracking-widest">
                  &bull; SEC FILINGS &amp; LIVE MARKET DATA
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[84px] font-medium leading-[0.94] tracking-tight text-v-dark">
                Company<br />Directory
              </h1>
            </div>

            {/* Signature Cyan Pinstripe Insight Panel */}
            <div className="bg-v-cyan bg-pinstripe-dense p-6 rounded border border-v-dark/20 shadow-sm max-w-sm w-full relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-v-dark/70 block mb-2">
                  AI RESEARCH ENGINE
                </span>
                <p className="text-sm font-medium leading-snug text-v-dark mb-4">
                  Select any company below to deploy our 5-stage multi-agent research engine.
                </p>
                <div className="flex items-center justify-between text-xs font-mono font-bold pt-3 border-t border-v-dark/15 text-v-dark">
                  <span>SEARCH STATUS</span>
                  <span>{isSearching ? 'SEARCHING...' : 'READY'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Refined Search & Filter Card (1px thin border) */}
          <div className="bg-white border border-v-dark/15 rounded p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH TICKER OR COMPANY NAME (E.G. AAPL, TESLA)..."
                  className="w-full px-5 py-3.5 rounded bg-[#fcfcfc] text-v-dark font-mono text-sm uppercase placeholder-gray-400 border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all"
                />
              </div>

              {/* Sector Index Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {sectors.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSector(sec)}
                    className={`px-4 py-3 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedSector === sec
                        ? 'bg-v-dark text-white font-bold border-v-dark'
                        : 'bg-white text-v-dark border-v-dark/15 hover:border-v-dark/40 hover:bg-gray-50'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block z-0" style={{ top: '12%', right: '4%', opacity: 0.15 }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ top: '22%', right: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '10%', left: '2%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '25%', left: '1%', opacity: 0.25 }}></div>
      </section>

      {/* Directory Grid Section */}
      <section className="py-24 px-8 md:px-16 lg:px-24 bg-v-gray">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12 pb-4 border-b border-v-dark/15">
            <span className="text-xs font-mono uppercase tracking-widest text-v-dark/70 font-bold">
              SEARCH RESULTS ({filteredCompanies.length} FOUND)
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-v-dark/50">
              CLICK COMPANY TO LAUNCH AI RESEARCH
            </span>
          </div>

          {loading ? (
            <div className="py-24 text-center font-mono text-xs uppercase tracking-widest text-v-dark/60">
              SEARCHING COMPANIES...
            </div>
          ) : !searchQuery.trim() ? (
            <div className="py-20 text-center border border-v-dark/15 rounded p-12 bg-white shadow-sm max-w-lg mx-auto">
              <p className="text-v-dark font-serif text-2xl mb-2">Start your research</p>
              <p className="text-gray-500 text-sm">Type a company name or ticker symbol in the search box above to find companies.</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-20 text-center border border-v-dark/15 rounded p-12 bg-white shadow-sm max-w-lg mx-auto">
              <p className="text-v-dark font-serif text-2xl mb-2">No companies match your search</p>
              <p className="text-gray-500 text-sm">Try broadening your search query or switching to 'ALL' sectors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompanies.map((c, idx) => (
                <article
                  key={c.symbol}
                  onClick={() => navigate('/processing', { state: { symbol: c.symbol } })}
                  className="bg-white rounded border border-v-dark/15 flex flex-col justify-between cursor-pointer hover:border-v-dark/40 shadow-sm hover:shadow transition-all group overflow-hidden"
                >
                  {/* Home.jsx Signature Cyan Pinstripe Card Header */}
                  <div className="h-40 bg-v-cyan bg-pinstripe-dense overflow-hidden relative border-b border-v-dark/10">
                    <div
                      className="absolute inset-0 opacity-30 mix-blend-multiply"
                      style={{
                        backgroundImage: `radial-gradient(circle at ${idx % 2 === 0 ? 'top left' : 'bottom right'}, #9AD9EA 10%, transparent 80%)`,
                        backgroundSize: '25px 25px'
                      }}
                    ></div>
                    <div className="absolute top-5 left-6 right-6 flex justify-between items-start z-10">
                      <span className="text-sm font-mono font-bold px-3 py-1 rounded bg-v-dark text-white">
                        {c.symbol}
                      </span>
                      {c.sector && (
                        <span className="text-xs font-mono text-v-dark/80 font-semibold uppercase tracking-widest bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded border border-v-dark/15">
                          {c.sector}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-3xl font-medium text-v-dark leading-tight mb-3 group-hover:text-black">
                      {c.name}
                    </h3>
                    <p className="text-xs text-v-dark/60 font-mono uppercase tracking-wider mb-8">
                      {c.exchange || 'NASDAQ'} &bull; LISTED STOCK
                    </p>

                    <div className="mt-auto pt-4 border-t border-v-dark/10 flex justify-between items-center text-xs font-mono">
                      <span className="text-v-dark/50">STATUS: ACTIVE</span>
                      <span className="text-v-dark font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        VIEW AI RESEARCH &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Dark Feature Section matching Home.jsx */}
      <section className="bg-[#1a1a1a] text-white py-28 px-8 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-16 relative z-10">
          <div className="lg:w-1/2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#a5f3fc] block mb-3">
              HOW AI RESEARCH WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
              AI Research Pipeline
            </h2>
            <p className="text-sm md:text-base text-gray-300 font-sans leading-relaxed max-w-lg">
              When you select any company, our system coordinates five specialized agents—Research, Financial Analysis, News Sentiment, Evidence Validation, and Investment Recommendation—to deliver comprehensive, evidence-backed investment research.
            </p>
          </div>

          <div className="lg:w-1/2 bg-[#a5f3fc] p-12 w-full max-w-lg rounded">
            <ul className="space-y-4">
              {[
                'SEC Filings & Financial Reports',
                'Standardized Financial Statements',
                'Market News & Sentiment Analysis',
                'Automated Fact-Checking & Verification'
              ].map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-base font-medium text-black border-b border-black/10 pb-4 last:border-0 last:pb-0">
                  {item}
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block" style={{ top: '25%', left: '4%' }}></div>
        <div className="floating-square hidden lg:block" style={{ bottom: '20%', right: '8%' }}></div>
      </section>

    </div>
  );
};

export default Explore;
