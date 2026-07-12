import React from 'react';

/**
 * SourceBadge - Professional attribution badge for evidence sources.
 * Displays where specific financial data, metrics, or AI conclusions originated.
 */
const SourceBadge = ({ source, type = 'default', className = '' }) => {
  if (!source) return null;

  const getBadgeStyles = (src) => {
    const s = String(src).toUpperCase();
    if (s.includes('FMP')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (s.includes('FINNHUB')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    if (s.includes('NEWSAPI') || s.includes('NEWS')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (s.includes('VALIDATION')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (s.includes('DECISION') || s.includes('INVESTMENT')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold tracking-wider uppercase border ${getBadgeStyles(
        source
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5"></span>
      {source}
    </span>
  );
};

export default SourceBadge;
