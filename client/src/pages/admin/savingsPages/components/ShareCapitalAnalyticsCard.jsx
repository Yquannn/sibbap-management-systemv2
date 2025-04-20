import React from 'react';
import { Line } from 'react-chartjs-2';
import CountUp from 'react-countup';

const ShareCapitalAnalyticsCard = ({ data }) => {
  // Process transaction history for share capital data
  const processShareCapitalData = () => {
    if (!data?.transactionHistory) return [];
    
    const monthlyData = data.transactionHistory.reduce((acc, transaction) => {
      const month = transaction.month;
      if (!acc[month]) {
        acc[month] = {
          amount: 0,
          contributor_count: 0
        };
      }
      acc[month].amount += parseFloat(transaction.total_amount);
      acc[month].contributor_count += parseInt(transaction.transaction_count);
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const shareCapitalTrends = processShareCapitalData();

  const chartData = {
    labels: shareCapitalTrends.map(item => {
      const [year, month] = item.month.split('-');
      return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Share Capital',
        data: shareCapitalTrends.map(item => item.amount),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
            return `₱${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return '₱' + (value / 1000) + 'k';
          }
        },
        beginAtZero: true
      }
    }
  };

  const latestTrend = shareCapitalTrends.length >= 2
    ? ((shareCapitalTrends[shareCapitalTrends.length - 1].amount - 
        shareCapitalTrends[shareCapitalTrends.length - 2].amount) / 
       shareCapitalTrends[shareCapitalTrends.length - 2].amount * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Share Capital Growth</h3>
          <p className="text-sm text-gray-500 mt-1">Monthly contribution trends</p>
        </div>
      </div>

      <div className="h-64">
        {shareCapitalTrends.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No share capital data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Share Capital</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp 
              start={0} 
              end={parseFloat(data?.totalShareCapital || 0)} 
              duration={2} 
              separator="," 
              decimals={2} 
            />
          </p>
          <p className="text-xs text-green-500 mt-1">
            {latestTrend >= 0 ? '+' : ''}{latestTrend.toFixed(1)}% vs. previous month
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Monthly Average</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp 
              start={0} 
              end={parseFloat(data?.totalShareCapital || 0) / (data?.totalMembersCount || 1)} 
              duration={2} 
              separator="," 
              decimals={2} 
            />
          </p>
          <p className="text-xs text-gray-500 mt-1">Per member</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Contributors</p>
          <p className="text-xl font-bold text-gray-800">
            <CountUp 
              start={0} 
              end={data?.totalMembersCount || 0} 
              duration={2} 
            />
          </p>
          <p className="text-xs text-gray-500 mt-1">Active this month</p>
        </div>
      </div>
    </div>
  );
};

export default ShareCapitalAnalyticsCard;