import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/portfolio';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Editorial Header Banner matching Home.jsx */}
      <section className="bg-texture relative w-full pt-36 pb-20 px-8 md:px-16 lg:px-24 flex flex-col border-b border-v-dark/15">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-2">
            Institutional Research Access
          </span>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-v-dark">
            Sign in to AI Investment Research Agent
          </h1>
        </div>
      </section>

      {/* Form Container */}
      <section className="py-20 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto flex justify-center">
        <div className="max-w-xl w-full bg-white border border-v-dark/15 p-10 md:p-14 rounded shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded bg-rose-50 border border-rose-300 text-rose-900 text-sm font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase font-bold tracking-wider text-v-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@institution.com"
                className="w-full px-5 py-4 rounded bg-[#fcfcfc] text-v-dark border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold tracking-wider text-v-dark mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-5 py-4 rounded bg-[#fcfcfc] text-v-dark border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-v-dark text-white font-mono font-bold uppercase tracking-widest text-xs rounded hover:bg-black transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-v-dark/10 flex justify-between items-center text-xs text-v-dark/70">
            <span>Don't have an institutional account?</span>
            <Link
              to="/register"
              className="font-bold text-v-dark uppercase tracking-wider hover:underline font-mono"
            >
              Register Now &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
