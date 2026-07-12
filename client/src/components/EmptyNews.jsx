import React from 'react';

const EmptyNews = () => {
  return (
    <div className="p-8 border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
        <span className="text-lg">⌀</span>
      </div>
      <div>
        <h4 className="text-sm font-sans font-bold text-gray-600 uppercase tracking-widest">No Validated News</h4>
        <p className="text-xs font-sans text-gray-500 mt-1">
          No institutional news articles met the strictly audited threshold.
        </p>
      </div>
    </div>
  );
};

export default EmptyNews;
