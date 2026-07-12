import React from 'react';

const EmptyMetric = ({ label = 'METRIC', message = 'Not available in backend dataset.' }) => {
  return (
    <div className="p-4 border border-gray-200 bg-gray-50 flex flex-col justify-center">
      <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-gray-400 block mb-1">
        {label}
      </span>
      <span className="text-sm font-sans font-semibold text-gray-400 italic">
        {message}
      </span>
    </div>
  );
};

export default EmptyMetric;
