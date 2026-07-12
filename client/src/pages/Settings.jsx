import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    if (window.confirm('Are you certain you wish to delete your institutional researcher account? This action cannot be undone.')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Editorial Header Banner matching Home.jsx */}
      <section className="bg-texture relative w-full pt-36 pb-20 px-8 md:px-16 lg:px-24 flex flex-col border-b border-v-dark/20">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-mono uppercase tracking-widest text-v-dark/70 block mb-2">
            System & Environment Controls
          </span>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black">
            Platform Settings
          </h1>
        </div>
      </section>

      {/* Body Content */}
      <section className="py-16 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="bg-white border border-v-dark rounded p-8 md:p-12 shadow-sm space-y-12">
          {/* Account Settings */}
          <section className="border-b border-gray-200 pb-8">
            <h3 className="text-2xl font-bold text-black mb-4">Account Settings</h3>
            <p className="text-sm text-gray-600 mb-6">
              Institutional Account ID: <span className="font-mono font-bold text-black">{user?._id || 'GUEST'}</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="bg-v-dark text-white px-8 py-3.5 rounded hover:bg-black transition-colors text-xs font-medium uppercase cursor-pointer"
              >
                Edit Account Details
              </button>
            </div>
          </section>

          {/* Security */}
          <section className="border-b border-gray-200 pb-8">
            <h3 className="text-2xl font-bold text-black mb-4">Security & Authentication</h3>
            <p className="text-sm text-gray-600 mb-6">
              Authenticated sessions use JWT bearer tokens with secure bcrypt encryption.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3.5 border border-v-dark text-v-dark rounded hover:bg-gray-100 transition-colors text-xs font-medium uppercase cursor-pointer"
            >
              Update Password
            </button>
          </section>

          {/* Theme Placeholder */}
          <section className="border-b border-gray-200 pb-8">
            <h3 className="text-2xl font-bold text-black mb-4">Theme & Aesthetics</h3>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-v-dark text-white font-mono text-xs uppercase rounded">
                Editorial Monochrome (Active)
              </span>
              <span className="text-xs text-gray-500">
                Institutional editorial design system locked to high-contrast monochrome & emerald highlights.
              </span>
            </div>
          </section>

          {/* Notifications Placeholder */}
          <section className="border-b border-gray-200 pb-8">
            <h3 className="text-2xl font-bold text-black mb-4">Research Notifications</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked disabled className="h-4 w-4" />
                <span>Notify when new Earnings Consensus or Validation Audits complete</span>
              </label>
            </div>
          </section>

          {/* Delete Account */}
          <section className="pt-2">
            <h3 className="text-xl font-bold text-rose-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-6">
              Permanently delete your account, saved research reports, and embedded portfolio positions.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-3.5 bg-rose-600 text-white rounded text-xs font-medium uppercase hover:bg-rose-700 transition cursor-pointer"
            >
              Delete Account
            </button>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Settings;
