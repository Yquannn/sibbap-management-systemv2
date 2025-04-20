import React from 'react';
import { Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';

const TimeDepositMaturityCard = ({ data }) => {
  const { maturityTimeline } = data;

  const chartData = {
    labels: maturityTimeline.map(item => {
      const [year, month] = item.month.split('-');
      return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
    }),
    datasets: [{
      label: 'Maturing Amount',
      data: maturityTimeline.map(item => item.total_amount),
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

  const totalMaturingAmount = maturityTimeline.reduce((sum, item) => sum + item.total_amount, 0);
  const totalMaturingAccounts = maturityTimeline.reduce((sum, item) => sum + item.count, 0);
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
        <Bar data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Next Month Maturity</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp end={nearestMaturity.total_amount} separator="," decimals={2} />
          </p>
          <p className="text-xs text-indigo-600 mt-1">{nearestMaturity.count} accounts</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Maturing</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp end={totalMaturingAmount} separator="," decimals={2} />
          </p>
          <p className="text-xs text-indigo-600 mt-1">Next 9 months</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Maturing Accounts</p>
          <p className="text-xl font-bold text-gray-800">
            <CountUp end={totalMaturingAccounts} separator="," />
          </p>
          <p className="text-xs text-indigo-600 mt-1">Total accounts</p>
        </div>
      </div>
    </div>
  );
};

export default TimeDepositMaturityCard;