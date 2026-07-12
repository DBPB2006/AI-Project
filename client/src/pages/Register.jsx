import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name, email, password, consent);
      navigate('/portfolio', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Editorial Header Banner matching Home.jsx */}
      <section className="bg-texture relative w-full pt-36 pb-20 px-8 md:px-16 lg:px-24 flex flex-col border-b border-v-dark/15">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-2">
            Research Workspace Access
          </span>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-v-dark">
            Create Research Account
          </h1>
        </div>

        {/* Signature Floating Squares */}
        <div className="floating-square hidden lg:block z-0" style={{ top: '12%', right: '4%', opacity: 0.15 }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ top: '22%', right: '8%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '10%', left: '2%' }}></div>
        <div className="floating-square hidden lg:block z-0" style={{ bottom: '25%', left: '1%', opacity: 0.25 }}></div>
      </section>

      {/* Main Form Body */}
      <section className="py-20 px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl mx-auto bg-v-gray rounded border border-v-dark/15 p-10 md:p-14 shadow-sm relative">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-800 border border-red-200 px-5 py-4 rounded text-sm font-sans flex items-center gap-2">
                <span className="font-extrabold">&times;</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-v-dark/70 block">
                  NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-5 py-4 rounded bg-[#fcfcfc] text-v-dark border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all font-sans"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-v-dark/70 block">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-5 py-4 rounded bg-[#fcfcfc] text-v-dark border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all font-sans"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-v-dark/70 block">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded bg-[#fcfcfc] text-v-dark border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all font-sans"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-v-dark/70 block">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded bg-[#fcfcfc] text-v-dark border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all font-sans"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                id="portfolioConsent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-v-dark/20 text-v-dark focus:ring-v-dark cursor-pointer mt-0.5"
              />
              <label htmlFor="portfolioConsent" className="text-xs text-v-dark/80 font-sans cursor-pointer select-none leading-normal">
                I consent to use my portfolio holding details for research validation and suitability checks.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-v-dark text-white font-mono font-bold uppercase tracking-widest text-xs rounded hover:bg-black transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Registering Account...' : 'Create Research Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-v-dark/10 flex justify-between items-center text-xs text-v-dark/70">
            <span>Already registered?</span>
            <Link
              to="/login"
              className="font-bold text-v-dark uppercase tracking-wider hover:underline font-mono"
            >
              Sign In &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
