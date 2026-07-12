import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/history`;

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setHistory(res.data.data || []);
    } catch (err) {
      setError('Could not fetch research history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved research report?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setHistory(history.filter((h) => h._id !== id));
    } catch (err) {
      setError('Failed to delete report.');
    }
  };

  const handleOpenReport = (item) => {
    if (item && item.reportData && typeof item.reportData === 'object') {
      const payload = {
        symbol: item.symbol,
        company: item.company,
        ...item.reportData
      };
      navigate('/report', { state: { reportData: payload } });
    } else {
      navigate('/processing', { state: { symbol: item.symbol } });
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white pt-36 pb-24 px-8 md:px-16 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-v-dark">
        LOADING RESEARCH HISTORY...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-v-dark font-sans">
      {/* Editorial History Header with Signature Texture */}
      <section className="bg-texture relative pt-36 pb-16 px-8 md:px-16 lg:px-24 border-b border-v-dark/15">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-v-dark text-white rounded">
                  RESEARCH HISTORY
                </span>
                <span className="text-xs font-mono text-v-dark/60 uppercase tracking-widest">
                  &bull; SAVED RESEARCH REPORTS
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[80px] font-medium tracking-tight text-v-dark leading-[0.94]">
                Research History
              </h1>
            </div>

            {/* Editorial Archive Summary Badge with Cyan Pinstripe Texture */}
            <div className="bg-v-cyan bg-pinstripe-dense rounded border border-v-dark/20 shadow-sm p-6 max-w-xs w-full">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-v-dark/70 block mb-1">
                SAVED RESEARCH REPORTS
              </span>
              <div className="text-3xl font-mono font-bold text-v-dark mb-1">
                {history.length} REPORTS
              </div>
              <p className="text-xs text-v-dark/70 font-mono">
                ARCHIVE OF COMPLETED RESEARCH
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded bg-rose-50 border border-rose-300 text-rose-900 text-xs font-mono">
              [SYSTEM ERROR]: {error}
            </div>
          )}
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block z-0" style={{ top: '22%', right: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '15%', left: '5%' }}></div>
      </section>

      {/* Chronological Table Section */}
      <section className="py-20 px-8 md:px-16 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-v-dark/15">
            <span className="text-xs font-mono uppercase tracking-widest text-v-dark/70 font-bold">
              SAVED RESEARCH REPORTS
            </span>
            <button
              onClick={() => navigate('/explore')}
              className="text-xs font-mono font-bold uppercase tracking-wider text-v-dark hover:underline cursor-pointer"
            >
              + START NEW RESEARCH &rarr;
            </button>
          </div>

          {history.length === 0 ? (
            <div className="py-24 text-center rounded border border-v-dark/15 p-12 bg-v-cyan bg-pinstripe-dense shadow-sm max-w-2xl mx-auto">
              <p className="text-v-dark font-serif text-2xl mb-2">No saved research reports yet</p>
              <p className="text-v-dark/70 text-sm mb-6">Research any company to save and track your investment research here.</p>
              <button
                onClick={() => navigate('/explore')}
                className="bg-v-dark text-white rounded font-mono font-bold px-8 py-3.5 text-xs uppercase tracking-wider cursor-pointer hover:bg-black shadow-sm"
              >
                START RESEARCH
              </button>
            </div>
          ) : (
            <div className="border border-v-dark/15 rounded shadow-sm overflow-x-auto bg-white">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-v-dark/15 bg-v-cyan bg-pinstripe-dense text-v-dark text-xs font-mono uppercase tracking-widest font-bold">
                    <th className="py-4 px-6">TIMESTAMP</th>
                    <th className="py-4 px-6">TICKER</th>
                    <th className="py-4 px-6">COMPANY NAME</th>
                    <th className="py-4 px-6">VERDICT</th>
                    <th className="py-4 px-6">CONVICTION</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-v-dark/10 font-sans text-sm">
                  {history.map((item) => {
                    const rec = String(item.recommendation || 'HOLD').toUpperCase();
                    return (
                      <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-5 px-6 font-mono text-xs text-v-dark/60">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-5 px-6">
                          <span className="font-mono font-bold text-sm rounded bg-v-dark text-white px-2.5 py-1">
                            {item.symbol}
                          </span>
                        </td>
                        <td className="py-5 px-6 font-medium text-base text-v-dark">
                          {item.company}
                        </td>
                        <td className="py-5 px-6">
                          <span
                            className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-widest border ${
                              rec === 'BUY' || rec === 'STRONG BUY'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : rec === 'PASS' || rec === 'SELL'
                                ? 'bg-rose-50 text-rose-900 border-rose-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            {rec}
                          </span>
                        </td>
                        <td className="py-5 px-6 font-mono text-sm font-bold text-v-dark">
                          {item.confidence || 'N/A'}
                        </td>
                        <td className="py-5 px-6 text-right space-x-6">
                          <button
                            onClick={() => handleOpenReport(item)}
                            className="text-xs font-mono uppercase font-bold text-v-dark hover:underline cursor-pointer"
                          >
                            VIEW RESEARCH REPORT &rarr;
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-xs font-mono uppercase font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Selective Dark Block — Compliance & Immutable Trace */}
      <section className="bg-[#1a1a1a] text-white py-24 px-8 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#a5f3fc] block mb-3">
              COMPLETE RESEARCH RECORDS
            </span>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
              Saved Research Snapshots
            </h2>
            <p className="text-sm font-sans text-gray-300 leading-relaxed">
              Each research report saved in your history preserves the complete AI analysis, financial data, and evidence references present at the time of research.
            </p>
          </div>

          <div className="bg-[#262626] border border-white/10 rounded p-6 max-w-xs w-full">
            <span className="text-xs font-mono uppercase tracking-widest text-[#a5f3fc] block mb-1 font-bold">
              RECORD VERIFICATION
            </span>
            <p className="text-sm font-mono text-white">
              VERIFIED AI RESEARCH
            </p>
          </div>
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block" style={{ top: '25%', left: '5%' }}></div>
        <div className="floating-square hidden lg:block" style={{ bottom: '20%', right: '10%' }}></div>
      </section>
    </div>
  );
};

export default History;
