import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

const Processing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const symbol = location.state?.symbol;
  const userConsent = location.state?.userConsent || false;

  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!symbol || hasFetched.current) return;
    hasFetched.current = true;

    axios
      .post(`${API_BASE_URL}/api/analyze`, { symbol, userConsent })
      .then((res) => {
        navigate('/report', { state: { reportData: res.data.data } });
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Error running LangGraph pipeline');
      });
  }, [symbol, userConsent, navigate]);

  if (!symbol) return <Navigate to="/" />;

  return (
    <div className="w-full min-h-screen bg-white text-v-dark font-sans flex flex-col justify-center">
      {/* Editorial Telemetry Masthead with Signature Stripe Texture */}
      <section className="bg-texture relative py-36 px-8 md:px-16 lg:px-24 flex-grow flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-v-dark text-white rounded">
              AI RESEARCH PIPELINE
            </span>
            <span className="text-xs font-mono text-v-dark/60 uppercase tracking-widest">
              &bull; TARGET COMPANY: {symbol}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-medium leading-[0.95] tracking-tight text-v-dark mb-10">
            {error ? 'Analysis Interrupted' : 'Analyzing Data...'}
          </h1>

          {!error ? (
            <div className="flex flex-col items-center">
              <span className="w-4 h-4 bg-v-dark animate-ping rounded-full mb-6"></span>
              <p className="text-sm font-mono text-v-dark/60 uppercase tracking-widest">
                EVIDENCE-DRIVEN AI &bull; FACT VERIFIED &bull; PLEASE WAIT
              </p>
            </div>
          ) : (
            <div className="p-8 rounded border border-rose-300 bg-rose-50 max-w-xl w-full shadow-sm">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-700 block mb-2">
                RUN-TIME EXCEPTION
              </span>
              <p className="text-sm font-sans text-rose-800 mb-6">{error}</p>
              <Link
                to="/explore"
                className="inline-block bg-v-dark text-white rounded font-mono font-bold uppercase tracking-widest text-xs px-8 py-3.5 hover:bg-black transition-colors"
              >
                &larr; RETURN TO DIRECTORY
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Selective Dark Storytelling Block — Anti-Hallucination Guardrails */}
      <section className="bg-[#1a1a1a] text-white py-16 px-8 md:px-16 lg:px-24 relative overflow-hidden shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#a5f3fc] block mb-3">
              HOW AI VERIFIES DATA
            </span>
            <h2 className="text-2xl font-medium tracking-tight text-white mb-2">
              Fact-Checking &amp; Evidence Verification
            </h2>
            <p className="text-sm font-sans text-gray-300 leading-relaxed">
              Every step in our AI research process requires source citations. If a claim cannot be verified against official financial reports or live data, it is removed or flagged.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 max-w-sm">
            {['Official Filings', 'Fact Checked', 'Evidence Backed', 'Full Transparency'].map((tag, i) => (
              <span
                key={i}
                className="px-3.5 py-2 rounded bg-[#262626] border border-white/10 text-xs font-mono uppercase tracking-wider text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block z-0" style={{ top: '12%', right: '4%', opacity: 0.15 }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ top: '22%', right: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '10%', left: '2%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '25%', left: '1%', opacity: 0.25 }}></div>
      </section>
    </div>
  );
};

export default Processing;
