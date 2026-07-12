import React from 'react';

/**
 * EvidenceBadge - Displays evidence status, quality rating, or verification state
 * (e.g., Verified, Supported, Conflicting, Quantitative, High Quality).
 */
const EvidenceBadge = ({ status, quality, label, className = '' }) => {
  const displayLabel = label || status || quality || 'Evidence';

  const getStyle = () => {
    const s = String(displayLabel).toUpperCase();
    if (s.includes('VERIFIED') || s.includes('SUPPORTED') || s.includes('HIGH')) {
      return 'bg-green-100 text-green-900 border-green-300';
    }
    if (s.includes('MODERATE') || s.includes('PARTIAL') || s.includes('NEUTRAL')) {
      return 'bg-yellow-100 text-yellow-900 border-yellow-300';
    }
    if (s.includes('CONFLICT') || s.includes('UNSUPPORTED') || s.includes('LOW') || s.includes('MISSING')) {
      return 'bg-red-100 text-red-900 border-red-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-bold tracking-widest uppercase border ${getStyle()} ${className}`}
    >
      {displayLabel}
    </span>
  );
};

export default EvidenceBadge;
