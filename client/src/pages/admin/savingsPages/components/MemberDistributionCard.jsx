// components/MemberDistributionCard.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const MemberDistributionCard = ({ data }) => {
  const { partialMembersCount, regularMembersCount, totalMembersCount } = data;

  const chartData = {
    labels: ['Partial Members', 'Regular Members'],
    datasets: [{
      data: [partialMembersCount, regularMembersCount],
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderWidth: 0,
      hoverOffset: 5,
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
            const percentage = ((context.raw / totalMembersCount) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const membersTrend = data.previousPeriodComparisons.previous_month_members > 0
    ? ((data.previousPeriodComparisons.current_month_members - 
        data.previousPeriodComparisons.previous_month_members) / 
       data.previousPeriodComparisons.previous_month_members * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Member Distribution</h3>
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Total Members</span>
          <span>{totalMembersCount.toLocaleString()} members</span>
        </div>
        <div className="mt-2 flex justify-between items-center text-sm">
          <span className="text-gray-500">Growth Rate</span>
          <span className={membersTrend > 0 ? 'text-green-500' : 'text-red-500'}>
            {membersTrend > 0 ? '+' : ''}{membersTrend}% vs. last month
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemberDistributionCard;


// components/TimeDepositMaturityCard.js
