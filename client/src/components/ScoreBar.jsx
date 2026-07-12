import React from 'react';

/**
 * ScoreBar component to render progress bars for scores (0-100), displaying N/A if score is missing.
 */
const ScoreBar = ({
  label,
  value,
  max = 100,
  unit = '%',
  subtitle,
  className = ''
}) => {
  const isAvailable =
    value !== null &&
    value !== undefined &&
    !isNaN(Number(value));

  const numericValue = isAvailable ? Math.min(Math.max(Number(value), 0), max) : 0;
  const percent = isAvailable ? (numericValue / max) * 100 : 0;

  const getColorClass = (pct) => {
    if (!isAvailable) return 'bg-gray-300';
    if (pct >= 75) return 'bg-emerald-600';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-600';
  };

  return (
    <div className={`py-2 ${className}`}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
          {label}
        </span>
        <span className="text-sm font-extrabold font-mono text-gray-900">
          {isAvailable ? `${Math.round(numericValue)}${unit}` : 'N/A'}
        </span>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        {isAvailable ? (
          <div
            className={`h-full transition-all duration-700 rounded-full ${getColorClass(
              percent
            )}`}
            style={{ width: `${percent}%` }}
          />
        ) : (
          <div className="h-full bg-gray-300 w-full opacity-30" />
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] font-serif text-gray-500 mt-1 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default ScoreBar;
