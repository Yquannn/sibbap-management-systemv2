

// components/SavingsAnalyticsCard.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';

const SavingsAnalyticsCard = ({ data }) => {
  // Group transactions by type and month
  const processTransactions = () => {
    const months = [...new Set(data.transactionHistory.map(t => t.month))];
    const depositTypes = ['Deposit', 'Initial Savings Deposit'];
    
    const deposits = months.map(month => {
      const monthTransactions = data.transactionHistory.filter(t => 
        t.month === month && depositTypes.includes(t.transaction_type)
      );
      return monthTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
    });

    const withdrawals = months.map(month => {
      const monthTransactions = data.transactionHistory.filter(t => 
        t.month === month && t.transaction_type === 'Withdrawal'
      );
      return monthTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount), 0);
    });

    return {
      months: months.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleString('default', { month: 'short' });
      }),
      deposits,
      withdrawals
    };
  };

  const { months, deposits, withdrawals } = processTransactions();

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Deposits',
        data: deposits,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Withdrawals',
        data: withdrawals,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
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
            return `₱${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#4b5563' }
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          color: '#4b5563',
          callback: function(value) {
            return '₱' + value.toLocaleString();
          }
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Savings Performance</h3>
        <div className="text-sm text-gray-500">
          Last {months.length} months
        </div>
      </div>
      
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Deposits</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp 
              start={0} 
              end={parseFloat(data.totalDeposits)} 
              duration={2} 
              separator="," 
              decimals={2} 
            />
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Withdrawals</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp 
              start={0} 
              end={parseFloat(data.totalWithdrawals)} 
              duration={2} 
              separator="," 
              decimals={2} 
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsAnalyticsCard;