import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const guestLinks = [
    { name: 'WORKSPACE', path: '/' },
    { name: 'START RESEARCH', path: '/explore' },
    { name: 'ABOUT', path: '/about' },
    { name: 'LOGIN', path: '/login' },
    { name: 'REGISTER', path: '/register' }
  ];

  const authLinks = [
    { name: 'WORKSPACE', path: '/' },
    { name: 'START RESEARCH', path: '/explore' },
    { name: 'PORTFOLIO', path: '/portfolio' },
    { name: 'RESEARCH HISTORY', path: '/history' },
    { name: 'PROFILE', path: '/profile' }
  ];

  const activeLinks = isAuthenticated ? authLinks : guestLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="absolute top-0 left-0 right-0 flex flex-wrap justify-between items-center w-full z-50 py-6 px-8 md:px-16 lg:px-24 border-b border-black/10">
      {/* Editorial Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-xl tracking-tight font-serif font-bold text-black hover:opacity-80 transition-opacity">
          EVIDENCE AI
        </Link>

      </div>

      {/* Navigation Links */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold tracking-wider">
        {activeLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`px-3.5 py-2 transition-all font-mono text-xs uppercase ${isActive
                  ? 'bg-black text-white font-bold'
                  : 'text-black hover:bg-black/5 hover:text-black border border-transparent hover:border-black/20'
                }`}
            >
              {link.name}
            </Link>
          );
        })}

        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="ml-2 px-3.5 py-2 bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors font-mono text-xs uppercase tracking-wider cursor-pointer border border-gray-700"
          >
            LOGOUT
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
