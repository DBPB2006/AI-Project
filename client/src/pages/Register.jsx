import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      await register(name, email, password);
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
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-mono uppercase tracking-widest text-v-dark/60 block mb-2">
            Institutional Research Access
          </span>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-v-dark">
            Create Research Account
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
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-v-dark mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-5 py-4 rounded bg-[#fcfcfc] text-v-dark border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-v-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your_name@firm.com"
                className="w-full px-5 py-4 rounded bg-[#fcfcfc] text-v-dark border border-v-dark/20 focus:outline-none focus:ring-2 focus:ring-v-dark focus:bg-white transition-all font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-v-dark mb-2">
                  Password
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

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-v-dark mb-2">
                  Confirm Password
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-v-dark text-white font-mono font-bold uppercase tracking-widest text-xs rounded hover:bg-black transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Registering Account...' : 'Create Institutional Account'}
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
