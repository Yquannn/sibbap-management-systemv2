import React from 'react';
import { Pie } from 'react-chartjs-2';
import CountUp from 'react-countup';

const TimeDepositAnalyticsCard = ({ data }) => {
  const timeDepositAnalytics = data?.analytics?.timeDeposit || [];

  // Safe calculations with null checks
  const totalAmount = timeDepositAnalytics.reduce((sum, item) => 
    sum + (parseFloat(item?.total_amount) || 0), 0);
  const totalAccounts = timeDepositAnalytics.reduce((sum, item) => 
    sum + (parseInt(item?.count) || 0), 0);
  const averageAmount = totalAccounts > 0 ? totalAmount / totalAccounts : 0;

  const chartData = {
    labels: timeDepositAnalytics.map(item => `${item?.fixedTerm || 0} Months`),
    datasets: [{
      data: timeDepositAnalytics.map(item => parseFloat(item?.total_amount) || 0),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(79, 70, 229, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(220, 38, 38, 0.8)',
      ],
      borderWidth: 2,
      borderColor: 'white'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          color: '#4b5563',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
            return `₱${context.raw.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Time Deposit Distribution</h3>
        <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
          <span className="text-xs font-medium text-blue-800">
            Total: ₱<CountUp end={totalAmount} separator="," decimals={2} />
          </span>
        </div>
      </div>

      <div className="h-64">
        {timeDepositAnalytics.length > 0 ? (
          <Pie data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No time deposit data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Accounts</p>
          <p className="text-xl font-bold text-gray-800">
            <CountUp end={totalAccounts} separator="," />
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Average Amount</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp end={averageAmount} separator="," decimals={2} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeDepositAnalyticsCard;