import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

/**
 * PriceHistoryChart component to display stock close price trends over the last 30 trading days.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-black text-white px-3.5 py-2.5 rounded-none border border-black/80 shadow-md text-xs font-sans">
        <p className="text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-bold text-white">
          Close: ${Number(payload[0].value).toFixed(2)}
        </p>
        {dataPoint.open !== undefined && (
          <p className="text-gray-300 mt-1">Open: ${Number(dataPoint.open).toFixed(2)}</p>
        )}
        {dataPoint.high !== undefined && (
          <p className="text-gray-300">High: ${Number(dataPoint.high).toFixed(2)}</p>
        )}
        {dataPoint.low !== undefined && (
          <p className="text-gray-300">Low: ${Number(dataPoint.low).toFixed(2)}</p>
        )}
      </div>
    );
  }
  return null;
};

const PriceHistoryChart = ({ historicalPrices = [], source = 'FMP Historical', className = '' }) => {
  // Structure pricing arrays chronologically ascending by trading date
  const cleanedData = React.useMemo(() => {
    if (!historicalPrices || !Array.isArray(historicalPrices) || historicalPrices.length === 0) {
      return [];
    }
    const validPoints = historicalPrices
      .filter((p) => p && (p.close !== undefined || p.price !== undefined) && p.date)
      .map((p) => ({
        date: p.date,
        close: Number(p.close !== undefined ? p.close : p.price),
        open: p.open !== undefined ? Number(p.open) : undefined,
        high: p.high !== undefined ? Number(p.high) : undefined,
        low: p.low !== undefined ? Number(p.low) : undefined
      }));

    // Sort points in ascending order of date
    validPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
    return validPoints.slice(-30);
  }, [historicalPrices]);

  if (cleanedData.length === 0) {
    return (
      <div className={`bg-white rounded-none border border-black/20 p-6 shadow-xs ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-sans font-bold text-lg text-black">Stock Price Performance</h3>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-none text-gray-500 font-sans">
          Historical price data unavailable for the last 30 trading days.
        </div>
      </div>
    );
  }

  // Formulate custom chart Y-axis lower and upper bounds using min and max values plus padding
  const minPrice = Math.min(...cleanedData.map((d) => d.close));
  const maxPrice = Math.max(...cleanedData.map((d) => d.close));
  const padding = Math.max((maxPrice - minPrice) * 0.08, 1);
  const domainMin = Math.max(0, Math.floor((minPrice - padding) * 100) / 100);
  const domainMax = Math.ceil((maxPrice + padding) * 100) / 100;

  return (
    <div className={`bg-white rounded-none border border-black/20 p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-3">
        <div>
          <h3 className="font-sans font-bold text-lg text-black">Stock Price Performance</h3>
          <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">
            Last {cleanedData.length} Trading Days &bull; Daily Close
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cleanedData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0891b2" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(dateStr) => {
                const d = new Date(dateStr);
                return !isNaN(d) ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : dateStr;
              }}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dy={5}
            />
            <YAxis
              domain={[domainMin, domainMax]}
              tickFormatter={(val) => `$${Number(val).toFixed(0)}`}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#1a1a1a"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorClose)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
