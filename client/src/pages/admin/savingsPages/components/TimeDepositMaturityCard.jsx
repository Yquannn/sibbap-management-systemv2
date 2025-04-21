import React from 'react';
import { Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';

const TimeDepositMaturityCard = ({ data }) => {
  // Safely access maturity timeline with null check
  const maturityTimeline = data?.analytics?.maturityTimeline || [];

  // Process chart data with safe checks
  const chartData = {
    labels: maturityTimeline.map(item => {
      try {
        const [year, month] = (item?.month || '').split('-');
        return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
      } catch (error) {
        return '';
      }
    }),
    datasets: [{
      label: 'Maturing Amount',
      data: maturityTimeline.map(item => parseFloat(item?.total_amount) || 0),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 6,
      barThickness: 16,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            return `₱${(context.parsed.y || 0).toLocaleString()}`;
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
            return '₱' + ((value || 0) / 1000) + 'k';
          }
        },
        beginAtZero: true
      }
    }
  };

  // Safe calculations with null checks
  const totalMaturingAmount = maturityTimeline.reduce((sum, item) => 
    sum + (parseFloat(item?.total_amount) || 0), 0);
  const totalMaturingAccounts = maturityTimeline.reduce((sum, item) => 
    sum + (parseInt(item?.count) || 0), 0);
  const nearestMaturity = maturityTimeline[0] || { total_amount: 0, count: 0 };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Maturity Timeline</h3>
          <p className="text-sm text-gray-500 mt-1">Upcoming maturities</p>
        </div>
      </div>

      <div className="h-64">
        {maturityTimeline.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No maturity data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Next Month Maturity</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp 
              end={parseFloat(nearestMaturity.total_amount) || 0} 
              separator="," 
              decimals={2} 
              duration={2}
            />
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            {nearestMaturity.count || 0} accounts
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Maturing</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp 
              end={totalMaturingAmount} 
              separator="," 
              decimals={2} 
              duration={2}
            />
          </p>
          <p className="text-xs text-indigo-600 mt-1">Next 9 months</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Maturing Accounts</p>
          <p className="text-xl font-bold text-gray-800">
            <CountUp 
              end={totalMaturingAccounts} 
              separator="," 
              duration={2}
            />
          </p>
          <p className="text-xs text-indigo-600 mt-1">Total accounts</p>
        </div>
      </div>
    </div>
  );
};

export default TimeDepositMaturityCard;