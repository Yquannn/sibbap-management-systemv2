// components/StatCard.js
import React from 'react';
import CountUp from 'react-countup';

const StatCard = ({ title, value, trend, icon, color }) => {
  const trendColor = trend.startsWith('+') ? 'text-green-500' : 'text-red-500';

  return (
    <div className="rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-800">
            ₱<CountUp start={0} end={value} duration={2} separator="," decimals={2} />
          </h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${trendColor}`}>{trend}</span>
        <svg
          className={`w-3 h-3 ml-1 ${trendColor}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={trend.startsWith('+') ? "M5 13V1m0 0L1 5m4-4 4 4" : "M5 1v12m0 0l4-4m-4 4l-4-4"}
          />
        </svg>
        <span className="ml-2 text-xs text-gray-500">vs. last month</span>
      </div>
    </div>
  );
};

export default StatCard;