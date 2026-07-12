import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const formatCurrencyTick = (val) => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-black text-white px-3.5 py-2.5 rounded-none border border-black/80 shadow-md text-xs font-sans">
        <p className="text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="font-bold text-white text-sm">
          Revenue: {formatCurrencyTick(val)}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * RevenueChart - Displays Revenue for the last four reported periods.
 */
const RevenueChart = ({ periods = [], source = 'FMP Income Statements', className = '' }) => {
  const chartData = React.useMemo(() => {
    if (!periods || !Array.isArray(periods) || periods.length === 0) return [];
    // Take up to last 4 periods and format
    const valid = periods
      .filter((p) => p && p.revenue !== undefined && p.revenue !== null)
      .map((p, i) => ({
        period: p.period || p.fiscalYear || p.calendarYear || p.date || (periods.length === 1 ? 'Reported' : `Period ${i + 1}`),
        revenue: Number(p.revenue)
      }));
    // Sort oldest to newest
    return valid.slice(0, 4).reverse();
  }, [periods]);

  if (chartData.length === 0) {
    return (
      <div className={`bg-white rounded-none border border-black/20 p-6 shadow-xs ${className}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-sans font-bold text-lg text-black">Revenue Trend</h3>
        </div>
        <div className="h-56 flex items-center justify-center bg-gray-50 rounded-none text-gray-500 font-sans">
          Revenue historical periods unavailable.
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-none border border-black/20 p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-3">
        <div>
          <h3 className="font-sans font-bold text-lg text-black">Revenue Trend</h3>
          <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">
            Last {chartData.length} Reported Periods
          </p>
        </div>
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
            <Bar dataKey="revenue" fill="#1a1a1a" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
