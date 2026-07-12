import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/portfolio`;

const Portfolio = () => {
  const { user, updateUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for Add Holding
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSector, setNewSector] = useState('Technology');

  // Form states for Cash
  const [editCash, setEditCash] = useState(false);
  const [cashVal, setCashVal] = useState('');
  const [monthlyVal, setMonthlyVal] = useState('');

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setPortfolio(res.data.data);
      setCashVal(res.data.data.cashAvailable);
      setMonthlyVal(res.data.data.monthlyInvestment);
    } catch (err) {
      setError('Failed to load portfolio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleConsentToggle = async () => {
    try {
      setError('');
      const nextConsent = !portfolio.consent;
      const res = await axios.put(`${API_URL}/consent`, { consent: nextConsent });
      setPortfolio(res.data.data);
      if (user) {
        updateUser({
          ...user,
          portfolio: { ...user.portfolio, consent: nextConsent }
        });
      }
      setSuccessMsg(`AI Personalization ${nextConsent ? 'Enabled' : 'Disabled'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Could not update AI personalization consent.');
    }
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/add`, {
        symbol: newSymbol,
        company: newCompany || newSymbol,
        quantity: Number(newQty),
        averageBuyPrice: Number(newPrice),
        sector: newSector
      });
      setPortfolio(res.data.data);
      setShowAddModal(false);
      setNewSymbol('');
      setNewCompany('');
      setNewQty('');
      setNewPrice('');
      setSuccessMsg('Holding added successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding holding.');
    }
  };

  const handleRemoveHolding = async (symbol) => {
    if (!window.confirm(`Remove ${symbol} from portfolio?`)) return;
    try {
      const res = await axios.delete(`${API_URL}/remove/${symbol}`);
      setPortfolio(res.data.data);
      setSuccessMsg(`${symbol} removed.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Error removing holding.');
    }
  };

  const handleSaveCash = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/cash`, {
        cashAvailable: Number(cashVal),
        monthlyInvestment: Number(monthlyVal)
      });
      setPortfolio(res.data.data);
      setEditCash(false);
      setSuccessMsg('Cash & monthly preferences saved.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Error saving cash values.');
    }
  };

  const handleResetPortfolio = async () => {
    if (!window.confirm('Are you sure you want to reset your entire portfolio and cash?')) return;
    try {
      const res = await axios.delete(`${API_URL}/reset`);
      setPortfolio(res.data.data);
      setSuccessMsg('Portfolio reset complete.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Error resetting portfolio.');
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white pt-36 pb-24 px-8 md:px-16 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-v-dark">
        COMPUTING FUND VALUATIONS...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-v-dark font-sans">
      {/* Editorial Fund Workspace Header with Signature Texture */}
      <section className="bg-texture relative pt-36 pb-16 px-8 md:px-16 lg:px-24 border-b border-v-dark/15">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-v-dark text-white rounded">
                  PORTFOLIO SUMMARY
                </span>
                <span className="text-xs font-mono text-v-dark/60 uppercase tracking-widest">
                  &bull; HOLDINGS &amp; ALLOCATION
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[80px] font-medium tracking-tight text-v-dark leading-[0.95]">
                Your Portfolio
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-v-dark text-white px-6 py-3.5 rounded hover:bg-black transition-colors text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-sm"
              >
                + ADD POSITION
              </button>
              <button
                onClick={handleResetPortfolio}
                className="px-5 py-3.5 rounded border border-v-dark/20 text-v-dark hover:border-v-dark hover:bg-gray-50 transition-colors text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
              >
                RESET PORTFOLIO
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded bg-rose-50 border border-rose-300 text-rose-900 text-xs font-mono">
              [SYSTEM ERROR]: {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono">
              [CONFIRMATION]: {successMsg}
            </div>
          )}

          {/* Institutional Key Metrics Strip (1px thin border) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-v-dark/15 rounded shadow-sm bg-white overflow-hidden">
            <div className="p-7 border-b sm:border-b lg:border-b-0 border-r-0 sm:border-r border-v-dark/15">
              <span className="text-[11px] font-mono uppercase tracking-widest text-v-dark/60 block mb-1">
                TOTAL PORTFOLIO VALUE
              </span>
              <span className="text-3xl lg:text-4xl font-mono font-bold text-v-dark">
                ${Number(portfolio?.netWorth || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-7 border-b lg:border-b-0 lg:border-r border-v-dark/15">
              <span className="text-[11px] font-mono uppercase tracking-widest text-v-dark/60 block mb-1">
                INVESTED BALANCE
              </span>
              <span className="text-3xl lg:text-4xl font-mono font-bold text-v-dark">
                ${Number(portfolio?.portfolioValue || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-7 border-b sm:border-b-0 border-r-0 sm:border-r border-v-dark/15">
              <span className="text-[11px] font-mono uppercase tracking-widest text-v-dark/60 block mb-1">
                CASH BALANCE
              </span>
              <span className="text-3xl lg:text-4xl font-mono font-bold text-v-dark">
                ${Number(portfolio?.cashAvailable || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-7 bg-v-cyan bg-pinstripe-dense">
              <span className="text-[11px] font-mono uppercase tracking-widest text-v-dark/70 block mb-1 font-bold">
                TOTAL GAIN / LOSS
              </span>
              <span
                className={`text-3xl lg:text-4xl font-mono font-bold ${
                  portfolio?.profitLoss >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {portfolio?.profitLoss >= 0 ? '+' : ''}
                ${Number(portfolio?.profitLoss || 0).toLocaleString()} ({portfolio?.profitLossPercentage || 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block z-0" style={{ top: '22%', right: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '15%', left: '5%' }}></div>
      </section>

      {/* Selective Dark Storytelling Block — AI Suitability Mandate */}
      <section className="bg-[#1a1a1a] text-white py-14 px-8 md:px-16 lg:px-24 border-b border-v-dark/15">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-3xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#a5f3fc] block mb-2">
              PORTFOLIO PREFERENCES
            </span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-2">
              AI Portfolio Fit &amp; Risk Profile
            </h2>
            <p className="text-sm font-sans text-gray-300 leading-relaxed">
              When active, our AI checks every investment recommendation against your current holdings and cash balance before tailoring its advice.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#262626] border border-white/10 p-4 rounded shrink-0">
            <span className="text-xs font-mono font-bold text-gray-200">PERSONALIZED EVIDENCE ANALYSIS</span>
            <button
              onClick={handleConsentToggle}
              className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
                portfolio?.consent
                  ? 'bg-[#a5f3fc] text-black hover:bg-white'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {portfolio?.consent ? '✔ ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Schedule & Allocation Grid */}
      <section className="py-20 px-8 md:px-16 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Liquidity Controls Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-6 border-b border-v-dark/15">
            <div>
              <h3 className="text-2xl font-medium text-v-dark">Cash &amp; Monthly Savings</h3>
              <p className="text-xs font-mono text-v-dark/60 uppercase mt-1">
                AVAILABLE: ${Number(portfolio?.cashAvailable || 0).toLocaleString()} &bull; MONTHLY INFLOW: ${Number(portfolio?.monthlyInvestment || 0).toLocaleString()}
              </p>
            </div>
            {!editCash && (
              <button
                onClick={() => setEditCash(true)}
                className="px-4 py-2.5 rounded border border-v-dark/20 text-xs font-mono uppercase font-bold text-v-dark hover:border-v-dark transition-colors cursor-pointer"
              >
                EDIT CASH SETTINGS
              </button>
            )}
          </div>

          {editCash && (
            <form onSubmit={handleSaveCash} className="mb-14 p-6 rounded bg-gray-50 border border-v-dark/15 flex flex-wrap items-end gap-5">
              <div>
                <label className="block text-xs font-mono uppercase text-v-dark/70 mb-1.5 font-bold">
                  CASH BALANCE ($)
                </label>
                <input
                  type="number"
                  value={cashVal}
                  onChange={(e) => setCashVal(e.target.value)}
                  className="px-4 py-2.5 rounded border border-v-dark/20 bg-white text-v-dark font-mono text-sm w-48"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-v-dark/70 mb-1.5 font-bold">
                  MONTHLY SAVINGS PLAN ($)
                </label>
                <input
                  type="number"
                  value={monthlyVal}
                  onChange={(e) => setMonthlyVal(e.target.value)}
                  className="px-4 py-2.5 rounded border border-v-dark/20 bg-white text-v-dark font-mono text-sm w-48"
                />
              </div>
              <button
                type="submit"
                className="bg-v-dark text-white rounded font-mono font-bold px-6 py-2.5 text-xs uppercase cursor-pointer hover:bg-black"
              >
                SAVE PREFERENCES
              </button>
              <button
                type="button"
                onClick={() => setEditCash(false)}
                className="px-4 py-2.5 text-xs font-mono uppercase text-gray-500 cursor-pointer hover:text-v-dark"
              >
                CANCEL
              </button>
            </form>
          )}

          {/* Holdings Table */}
          <div className="mb-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-medium text-v-dark">Holdings</h3>
              <span className="text-xs font-mono text-v-dark/60 uppercase tracking-widest">
                {portfolio?.holdings?.length || 0} POSITIONS LISTED
              </span>
            </div>

            {(!portfolio?.holdings || portfolio.holdings.length === 0) ? (
              <div className="py-20 text-center rounded border border-v-dark/15 p-12 bg-v-cyan bg-pinstripe-dense shadow-sm max-w-2xl mx-auto">
                <p className="text-v-dark font-serif text-2xl mb-2">No positions listed yet</p>
                <p className="text-v-dark/70 text-sm mb-6">Add your existing stock holdings to receive personalized AI portfolio advice.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-v-dark text-white rounded font-mono font-bold px-8 py-3.5 text-xs uppercase tracking-wider cursor-pointer hover:bg-black shadow-sm"
                >
                  + ADD POSITION
                </button>
              </div>
            ) : (
              <div className="border border-v-dark/15 rounded shadow-sm overflow-x-auto bg-white">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-v-dark/15 bg-v-cyan bg-pinstripe-dense text-v-dark text-xs font-mono uppercase tracking-widest font-bold">
                      <th className="py-4 px-5">TICKER</th>
                      <th className="py-4 px-5">SECTOR</th>
                      <th className="py-4 px-5 text-right">QTY</th>
                      <th className="py-4 px-5 text-right">COST BASIS</th>
                      <th className="py-4 px-5 text-right">MKT PRICE</th>
                      <th className="py-4 px-5 text-right">MKT VALUE</th>
                      <th className="py-4 px-5 text-right">GAIN / LOSS</th>
                      <th className="py-4 px-5 text-right">WEIGHT</th>
                      <th className="py-4 px-5 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-v-dark/10 font-sans text-sm">
                    {portfolio.holdings.map((h) => (
                      <tr key={h.symbol} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 px-5 font-bold font-mono text-v-dark">
                          {h.symbol}
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-gray-100 text-v-dark border border-gray-200">
                            {h.sector}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right font-mono text-v-dark">{h.quantity}</td>
                        <td className="py-4 px-5 text-right font-mono text-gray-600">${h.averageBuyPrice}</td>
                        <td className="py-4 px-5 text-right font-mono font-bold text-v-dark">${h.currentPrice}</td>
                        <td className="py-4 px-5 text-right font-mono font-bold text-v-dark">${h.currentValue}</td>
                        <td
                          className={`py-4 px-5 text-right font-mono font-bold ${
                            h.profitLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {h.profitLoss >= 0 ? '+' : ''}${h.profitLoss} ({h.profitLossPercentage}%)
                        </td>
                        <td className="py-4 px-5 text-right font-mono font-bold">{h.allocationPercentage}%</td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleRemoveHolding(h.symbol)}
                            className="text-xs uppercase font-mono text-rose-600 hover:underline cursor-pointer font-bold"
                          >
                            REMOVE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sector Exposure & Diversification Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="border border-v-dark/15 rounded shadow-sm p-8 bg-white">
              <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-2">
                SECTOR ALLOCATION
              </span>
              <h3 className="text-2xl font-serif font-bold text-v-dark mb-6">Sector Breakdown</h3>
              {portfolio?.sectorAllocation && portfolio.sectorAllocation.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.sectorAllocation.map((s) => (
                    <div key={s.sector} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono font-bold text-v-dark">
                        <span className="uppercase">{s.sector}</span>
                        <span>${s.value} ({s.percentage}%)</span>
                      </div>
                      <div className="w-full rounded bg-gray-100 h-2 border border-v-dark/10 overflow-hidden">
                        <div
                          className="bg-v-dark h-full rounded"
                          style={{ width: `${Math.min(100, Number(s.percentage || 0))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No holdings recorded to determine exposure weights.</p>
              )}
            </div>

            <div className="border border-v-dark/15 rounded shadow-sm p-8 bg-v-cyan bg-pinstripe-dense">
              <div className="bg-white/95 backdrop-blur-sm border border-v-dark/15 rounded p-7 h-full flex flex-col justify-between shadow-xs">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-v-dark/70 block mb-2 font-bold">
                    DIVERSIFICATION
                  </span>
                  <h3 className="text-3xl font-serif font-bold text-v-dark mb-4">
                    {portfolio?.diversification?.status || 'Unrated Allocation'}
                  </h3>
                  <p className="text-sm text-v-dark/80 leading-relaxed mb-6">
                    Diversification helps balance individual company risks across multiple sectors.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-v-dark/15 font-mono text-xs">
                  <div>
                    <span className="text-gray-500 block">POSITIONS</span>
                    <span className="text-lg font-bold text-v-dark">{portfolio?.diversification?.holdingCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">SECTORS</span>
                    <span className="text-lg font-bold text-v-dark">{portfolio?.diversification?.sectorCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">TOP SECTOR</span>
                    <span className="text-lg font-bold text-v-dark">{portfolio?.diversification?.topSectorWeight || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADD HOLDING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-v-dark/15 rounded-lg p-8 max-w-md w-full shadow-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-v-dark/60 block mb-1">
              NEW POSITION
            </span>
            <h3 className="text-2xl font-serif font-bold text-v-dark mb-6">Add Holding</h3>
            <form onSubmit={handleAddHolding} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-v-dark mb-1.5">Stock Ticker</label>
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className="w-full px-4 py-2.5 rounded border border-v-dark/20 uppercase font-mono text-sm focus:outline-none focus:ring-2 focus:ring-v-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-v-dark mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Apple Inc."
                  className="w-full px-4 py-2.5 rounded border border-v-dark/20 text-sm focus:outline-none focus:ring-2 focus:ring-v-dark"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-v-dark mb-1.5">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2.5 rounded border border-v-dark/20 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-v-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-v-dark mb-1.5">Avg Cost Basis ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="175.50"
                    className="w-full px-4 py-2.5 rounded border border-v-dark/20 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-v-dark"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-v-dark mb-1.5">Sector Classification</label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-v-dark/20 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-v-dark"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Financial">Financial</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Energy">Energy</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-v-dark/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider text-gray-500 cursor-pointer hover:text-v-dark"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-v-dark text-white rounded px-6 py-2.5 hover:bg-black transition-colors text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  RECORD POSITION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
