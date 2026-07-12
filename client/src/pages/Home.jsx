import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/config';

const Home = () => {
  const [symbol, setSymbol] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!symbol.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      axios.get(`${API_BASE_URL}/api/companies?q=${symbol}`)
        .then(res => {
          setResults(res.data.data);
          setShowDropdown(true);
          setIsSearching(false);
        })
        .catch(err => {
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [symbol]);

  const [userConsent, setUserConsent] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      navigate('/processing', { state: { symbol: symbol.toUpperCase(), userConsent } });
    }
  };
  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="bg-texture relative w-full pt-32 pb-24 px-8 md:px-16 lg:px-24 flex flex-col">
        <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col">
          <h1 className="text-6xl md:text-8xl lg:text-[110px] leading-[0.95] tracking-tight font-medium mb-24 max-w-[1100px] text-black">
            AI Investment<br /> Research Agent
          </h1>

          <div className="flex flex-col md:flex-row justify-end md:items-end w-full pb-12">
            <div className="flex flex-col max-w-5xl">
              <p className="text-lg leading-snug text-v-dark mb-8 max-w-md">
                It takes a company name, does its research, and decides whether to invest or pass — with the reasoning behind its decision.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 max-w-xl w-full mb-6 relative">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Search for a company (e.g., AAPL, TSLA)..."
                    className="w-full px-6 py-4 rounded bg-white text-v-dark border border-v-dark focus:outline-none focus:ring-2 focus:ring-v-dark uppercase"
                  />
                  {showDropdown && results.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-v-dark rounded shadow-lg z-50 max-h-64 overflow-y-auto">
                      {results.map(company => (
                        <div
                          key={company.symbol}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-0"
                          onClick={() => {
                            setSymbol(company.symbol);
                            setShowDropdown(false);
                            navigate('/processing', { state: { symbol: company.symbol, userConsent } });
                          }}
                        >
                          <div className="text-left">
                            <div className="font-bold text-v-dark">{company.symbol}</div>
                            <div className="text-xs text-gray-500 capitalize">{company.name.toLowerCase()}</div>
                          </div>
                          <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{company.exchange}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="inline-flex items-center justify-center space-x-2 bg-v-dark text-white px-8 py-4 rounded hover:bg-black transition-colors text-sm font-medium whitespace-nowrap">
                  <span>SEARCH</span>
                  <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </form>

              <div className="flex items-center space-x-3 mb-6 text-sm font-medium text-v-dark">
                <input
                  type="checkbox"
                  id="portfolioConsent"
                  checked={userConsent}
                  onChange={(e) => setUserConsent(e.target.checked)}
                  className="w-4 h-4 rounded border-v-dark text-v-dark focus:ring-v-dark"
                />
                <label htmlFor="portfolioConsent" className="cursor-pointer select-none">
                  ✔ Include Portfolio Fit Analysis (Personalize against your investment preferences)
                </label>
              </div>


            </div>
          </div>
        </div>

        {/* Floating Squares */}
        <div className="floating-square hidden lg:block z-0" style={{ top: '15%', right: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ top: '28%', right: '18%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ top: '45%', right: '5%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ top: '65%', right: '12%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ top: '35%', left: '60%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '15%', left: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '25%', left: '15%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '35%', left: '5%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '45%', left: '25%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '10%', left: '35%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '20%', left: '65%' }}></div>
      </section>

      {/* 2. Coverage / Specialized AI Agents Section */}
      <section className="py-24 px-8 bg-v-gray" data-purpose="coverage-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-20">
            <h2 className="text-5xl font-medium tracking-tight leading-tight max-w-md text-v-dark">Specialized AI<br />Agents</h2>
            <p className="text-lg max-w-sm leading-snug text-v-dark/80">
              Each AI agent performs one well-defined task for better reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <article className="bg-white flex flex-col h-full shadow-sm" data-purpose="coverage-card">
              <div className="h-48 bg-v-cyan bg-pinstripe-dense overflow-hidden relative">
                <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at top left, #9AD9EA 10%, transparent 80%)', backgroundSize: '25px 25px' }}></div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-3xl font-medium mb-4 leading-tight text-v-dark">Multi-Source<br />Research</h3>
                <p className="text-sm leading-snug mt-auto text-v-dark/80">Aggregates structured and unstructured data from multiple trusted sources to build a holistic company profile.</p>
              </div>
            </article>

            {/* Card 2 */}
            <article className="bg-white flex flex-col h-full shadow-sm" data-purpose="coverage-card">
              <div className="h-48 bg-v-cyan bg-pinstripe-dense overflow-hidden relative">
                <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #9AD9EA 10%, transparent 80%)', backgroundSize: '20px 20px' }}></div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-3xl font-medium mb-4 leading-tight text-v-dark">Financial<br />Analysis</h3>
                <p className="text-sm leading-snug mt-auto text-v-dark/80">Analyzes revenue growth, profitability, cash flow, debt, liquidity, and valuation ratios.</p>
              </div>
            </article>

            {/* Card 3 */}
            <article className="bg-white flex flex-col h-full shadow-sm" data-purpose="coverage-card">
              <div className="h-48 bg-v-cyan bg-pinstripe-dense overflow-hidden relative">
                <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at top right, #9AD9EA 10%, transparent 80%)', backgroundSize: '30px 30px' }}></div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-3xl font-medium mb-4 leading-tight text-v-dark">News<br />Analysis</h3>
                <p className="text-sm leading-snug mt-auto text-v-dark/80">Detects opportunities, business risks, industry trends, and regulatory developments.</p>
              </div>
            </article>

            {/* Card 4 */}
            <article className="bg-white flex flex-col h-full shadow-sm" data-purpose="coverage-card">
              <div className="h-48 bg-v-cyan bg-pinstripe-dense overflow-hidden relative">
                <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at bottom left, #9AD9EA 10%, transparent 80%)', backgroundSize: '25px 25px' }}></div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-3xl font-medium mb-4 leading-tight text-v-dark">Evidence<br />Validation</h3>
                <p className="text-sm leading-snug mt-auto text-v-dark/80">Verifies if analyses are supported by available evidence and detects contradictions.</p>
              </div>
            </article>

            {/* Card 5 */}
            <article className="bg-white flex flex-col h-full shadow-sm md:col-span-2 lg:col-span-1 lg:col-start-2" data-purpose="coverage-card">
              <div className="h-48 bg-v-cyan bg-pinstripe-dense overflow-hidden relative">
                <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at bottom right, #9AD9EA 10%, transparent 80%)', backgroundSize: '20px 20px' }}></div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-3xl font-medium mb-4 leading-tight text-v-dark">Investment<br />Recommendation</h3>
                <p className="text-sm leading-snug mt-auto text-v-dark/80">Synthesizes all findings to generate an explainable investment recommendation (Invest or Pass).</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 3. Dark Section */}
      <section className="bg-[#1a1a1a] w-full py-32 px-8 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-16 relative z-10">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl tracking-tight font-medium text-white mb-6">
              How It Works
            </h2>
            <p className="text-sm text-gray-400 font-medium max-w-sm">
              Our autonomous agents work together in a sequence to produce reliable and explainable insights.
            </p>
          </div>

          <div className="lg:w-1/2 bg-[#a5f3fc] p-12 w-full max-w-lg">
            <ul className="space-y-4">
              <li className="flex justify-between items-center text-base font-medium text-black border-b border-black/10 pb-4">
                1. Search Company
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </li>
              <li className="flex justify-between items-center text-base font-medium text-black border-b border-black/10 pb-4">
                2. Collect Company Information
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </li>
              <li className="flex justify-between items-center text-base font-medium text-black border-b border-black/10 pb-4">
                3. Analyze Financial Data
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </li>
              <li className="flex justify-between items-center text-base font-medium text-black border-b border-black/10 pb-4">
                4. Analyze Market News
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </li>
              <li className="flex justify-between items-center text-base font-medium text-black border-b border-black/10 pb-4">
                5. Validate Evidence
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </li>
              <li className="flex justify-between items-center text-base font-medium text-black">
                6. Generate Recommendation
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </li>
            </ul>
          </div>
        </div>

        {/* Floating dark squares */}
        <div className="absolute w-8 h-8 bg-[#2a2a2a]" style={{ top: '20%', left: '10%' }}></div>
        <div className="absolute w-8 h-8 bg-[#2a2a2a]" style={{ top: '60%', left: '15%' }}></div>
        <div className="absolute w-8 h-8 bg-[#2a2a2a]" style={{ top: '80%', left: '5%' }}></div>
        <div className="absolute w-8 h-8 bg-[#2a2a2a]" style={{ top: '30%', left: '40%' }}></div>
        <div className="absolute w-8 h-8 bg-[#2a2a2a]" style={{ top: '70%', left: '35%' }}></div>
      </section>


      {/* 5. Architecture Benefits */}
      <section className="bg-[#cffafe] w-full py-24 px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <h2 className="text-4xl md:text-5xl tracking-tight font-medium text-black">
              Why This<br /> Architecture?
            </h2>
          </div>

          <div className="lg:w-2/3 flex flex-col">
            {[
              { text: "Separates the investment process into specialized responsibilities for better reasoning.", author: "EXPLAINABILITY" },
              { text: "Modular design improves maintainability, debuggability, and extensibility.", author: "RELIABILITY" },
              { text: "Better evidence leads to better reasoning. The LLM does not hallucinate from memory.", author: "EVIDENCE-DRIVEN" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-start md:items-center py-8 border-b border-black/20 gap-8">
                <div className="w-3 h-3 bg-black flex-shrink-0"></div>
                <p className="text-lg font-medium text-black flex-1">"{item.text}"</p>
                <div className="text-xs font-bold tracking-widest text-black mt-4 md:mt-0">{item.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
