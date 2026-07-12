import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/config';

const API_URL = `${API_BASE_URL}/api/auth`;

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Preference fields
  const [riskTolerance, setRiskTolerance] = useState(user?.preferences?.riskTolerance || 'Moderate');
  const [investmentGoal, setInvestmentGoal] = useState(user?.preferences?.investmentGoal || 'Long-term Wealth Growth');
  const [investmentHorizon, setInvestmentHorizon] = useState(user?.preferences?.investmentHorizon || '5+ Years');
  const [preferredSectors, setPreferredSectors] = useState((user?.preferences?.preferredSectors || []).join(', '));
  const [avoidedSectors, setAvoidedSectors] = useState((user?.preferences?.avoidedSectors || []).join(', '));

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setIsSubmitting(true);
      const prefObj = {
        riskTolerance,
        investmentGoal,
        investmentHorizon,
        preferredSectors: preferredSectors.split(',').map((s) => s.trim()).filter(Boolean),
        avoidedSectors: avoidedSectors.split(',').map((s) => s.trim()).filter(Boolean)
      };

      const res = await axios.put(`${API_URL}/profile`, {
        name,
        email,
        preferences: prefObj
      });

      updateUser(res.data.user);
      setMessage('Analyst mandate and investment preferences updated successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword || !newPassword) {
      setError('Please provide current and new password.');
      return;
    }

    try {
      await axios.put(`${API_URL}/password`, { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Security credentials changed successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change password.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-v-dark font-sans">
      {/* Editorial Analyst Profile Masthead with Signature Stripe Texture */}
      <section className="bg-texture relative pt-36 pb-16 px-8 md:px-16 lg:px-24 border-b border-v-dark/15">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-v-dark text-white rounded">
                  ANALYST MANDATE &amp; CREDENTIALS
                </span>
                <span className="text-xs font-mono text-v-dark/60 uppercase tracking-widest">
                  &bull; PORTFOLIO SUITABILITY CONFIGURATION
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[80px] font-medium tracking-tight text-v-dark leading-[0.94]">
                Analyst Dossier
              </h1>
            </div>

            {/* Cyan Pinstriped Mandate Summary Card */}
            <div className="bg-v-cyan bg-pinstripe-dense rounded border border-v-dark/20 shadow-sm p-6 max-w-sm w-full">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-v-dark/70 block mb-1">
                ACTIVE SUITABILITY PROFILE
              </span>
              <div className="text-2xl font-mono font-bold text-v-dark mb-1">
                {riskTolerance.toUpperCase()} RISK
              </div>
              <p className="text-xs font-mono text-v-dark uppercase">
                HORIZON: {investmentHorizon} &bull; MANDATE ACTIVE
              </p>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono">
              [CONFIRMATION]: {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded bg-rose-50 border border-rose-300 text-rose-900 text-xs font-mono">
              [SYSTEM ERROR]: {error}
            </div>
          )}
        </div>
      </section>

      {/* Forms & Mandate Configuration Section */}
      <section className="py-20 px-8 md:px-16 lg:px-24 bg-v-gray">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* PROFILE & PREFERENCES FORM — Refined 1px Border Card */}
            <div className="lg:col-span-2 bg-white border border-v-dark/15 rounded p-8 md:p-10 shadow-sm">
              <form onSubmit={handleProfileSubmit} className="space-y-10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-1">
                    IDENTITY RECORD
                  </span>
                  <h3 className="text-2xl font-medium text-v-dark border-b border-v-dark/15 pb-3 mb-6">
                    Account Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-v-dark/20 bg-[#fcfcfc] text-v-dark font-sans text-sm focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                        INSTITUTIONAL EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-v-dark/20 bg-[#fcfcfc] text-v-dark font-sans text-sm focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-1">
                    SUITABILITY CONSTRAINTS
                  </span>
                  <h3 className="text-2xl font-medium text-v-dark border-b border-v-dark/15 pb-3 mb-3">
                    Investment Mandate &amp; Risk Parameters
                  </h3>
                  <p className="text-sm font-sans text-v-dark/70 leading-relaxed mb-6">
                    These parameters direct our LangGraph Suitability Agent when assessing candidate equities against your existing portfolio schedule.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                        RISK TOLERANCE
                      </label>
                      <select
                        value={riskTolerance}
                        onChange={(e) => setRiskTolerance(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-v-dark/20 bg-white text-v-dark font-mono text-sm focus:outline-none focus:ring-2 focus:ring-v-dark"
                      >
                        <option value="Conservative">Conservative</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                        INVESTMENT OBJECTIVE
                      </label>
                      <input
                        type="text"
                        value={investmentGoal}
                        onChange={(e) => setInvestmentGoal(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-v-dark/20 bg-[#fcfcfc] text-v-dark font-sans text-sm focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                        MANDATE HORIZON
                      </label>
                      <input
                        type="text"
                        value={investmentHorizon}
                        onChange={(e) => setInvestmentHorizon(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-v-dark/20 bg-[#fcfcfc] text-v-dark font-sans text-sm focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                        PREFERRED SECTORS (COMMA SEPARATED)
                      </label>
                      <input
                        type="text"
                        value={preferredSectors}
                        onChange={(e) => setPreferredSectors(e.target.value)}
                        placeholder="Technology, Healthcare"
                        className="w-full px-4 py-3 rounded border border-v-dark/20 bg-[#fcfcfc] text-v-dark font-sans text-sm focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                        RESTRICTED SECTORS (COMMA SEPARATED)
                      </label>
                      <input
                        type="text"
                        value={avoidedSectors}
                        onChange={(e) => setAvoidedSectors(e.target.value)}
                        placeholder="Tobacco, Speculative"
                        className="w-full px-4 py-3 rounded border border-v-dark/20 bg-[#fcfcfc] text-v-dark font-sans text-sm focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-v-dark/10">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-v-dark text-white rounded font-mono font-bold px-8 py-4 text-xs uppercase tracking-wider cursor-pointer hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isSubmitting ? 'SAVING MANDATE RECORD...' : 'SAVE MANDATE & PREFERENCES'}
                  </button>
                </div>
              </form>
            </div>

            {/* PASSWORD CHANGE SCHEDULE — Cyan Accent Card */}
            <div className="bg-white border border-v-dark/15 rounded p-8 shadow-sm h-fit">
              <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-1">
                ACCESS CONTROLS
              </span>
              <h3 className="text-2xl font-medium text-v-dark mb-6 border-b border-v-dark/15 pb-3">
                Security Credentials
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                    CURRENT PASSWORD
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-v-dark/20 bg-[#fcfcfc] text-v-dark text-sm focus:outline-none focus:ring-2 focus:ring-v-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-v-dark mb-2">
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-v-dark/20 bg-[#fcfcfc] text-v-dark text-sm focus:outline-none focus:ring-2 focus:ring-v-dark"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-v-dark text-white rounded py-3.5 hover:bg-black transition-colors text-xs font-mono font-bold uppercase tracking-wider cursor-pointer mt-2 shadow-sm"
                >
                  UPDATE CREDENTIALS
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Selective Dark Storytelling Block — Suitability Mandate Integration */}
      <section className="bg-[#1a1a1a] text-white py-24 px-8 md:px-16 lg:px-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#a5f3fc] block mb-3">
              MANDATE COUPLING
            </span>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
              Automated Suitability Screening
            </h2>
            <p className="text-sm font-sans text-gray-300 leading-relaxed">
              When enabled during analysis, our AI agents verify candidate equities against your exact preferred and restricted sector parameters above, providing custom institutional alignment scoring.
            </p>
          </div>

          <div className="bg-[#262626] border border-white/10 rounded p-6 max-w-xs w-full">
            <span className="text-xs font-mono uppercase tracking-widest text-[#a5f3fc] block mb-1 font-bold">
              SUITABILITY STATUS
            </span>
            <p className="text-sm font-mono text-white">
              AUTOMATICALLY LINKED TO AGENT WORKFLOW
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

export default Profile;
