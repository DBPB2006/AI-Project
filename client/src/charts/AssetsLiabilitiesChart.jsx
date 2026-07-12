import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import SourceBadge from '../components/SourceBadge';

const formatCurrencyTick = (val) => {
  if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2.5 rounded shadow-lg border border-gray-700 text-xs font-mono">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p
            key={idx}
            className="font-bold"
            style={{ color: item.color || item.fill }}
          >
            {item.name}: {formatCurrencyTick(item.value)} (${Number(item.value).toLocaleString()})
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * AssetsLiabilitiesChart - Displays grouped bars Assets vs Liabilities for each financial period.
 */
const AssetsLiabilitiesChart = ({ periods = [], source = 'FMP Balance Sheet', className = '' }) => {
  const chartData = React.useMemo(() => {
    if (!periods || !Array.isArray(periods) || periods.length === 0) return [];
    const valid = periods
      .filter((p) => p && p.assets !== undefined && p.liabilities !== undefined && p.assets !== null && p.liabilities !== null)
      .map((p, i) => ({
        period: p.period || p.calendarYear || p.date || (periods.length === 1 ? 'Reported' : `Period ${i + 1}`),
        Assets: Number(p.assets),
        Liabilities: Number(p.liabilities)
      }));
    return valid.slice(0, 4).reverse();
  }, [periods]);

  if (chartData.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-serif font-bold text-lg text-gray-900">Assets vs Liabilities</h3>
          <SourceBadge source={source} />
        </div>
        <div className="h-56 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 italic font-serif">
          Balance sheet historical periods unavailable.
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-serif font-bold text-lg text-gray-900">Assets vs Liabilities</h3>
          <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">
            Grouped Balance Sheet Comparison
          </p>
        </div>
        <SourceBadge source={source} />
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              tickFormatter={formatCurrencyTick}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="Assets" fill="#0284c7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Liabilities" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetsLiabilitiesChart;
