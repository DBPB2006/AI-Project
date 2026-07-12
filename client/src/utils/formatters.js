export const formatCurrency = (val) => {
  if (val === undefined || val === null || val === '' || isNaN(Number(val))) return null;
  const num = Number(val);
  if (num === 0) return '$0.00';
  const abs = Math.abs(num);
  if (abs >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatRatio = (val, suffix = 'x') => {
  if (val === undefined || val === null || val === '' || isNaN(Number(val))) return null;
  return `${Number(val).toFixed(2)}${suffix}`;
};
