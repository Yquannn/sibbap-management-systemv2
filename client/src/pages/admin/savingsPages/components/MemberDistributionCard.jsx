import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const MemberDistributionCard = ({ data }) => {
  // Safely access member counts with defaults
  const partialMembers = data?.membershipStats?.partial || 0;
  const regularMembers = data?.membershipStats?.regular || 0;
  const totalMembers = data?.membershipStats?.total || 0;

  const chartData = {
    labels: ['Partial Members', 'Regular Members'],
    datasets: [{
      data: [partialMembers, regularMembers],
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
            const percentage = totalMembers > 0 ? 
              ((context.raw / totalMembers) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  // Safe calculation of member trend
  const currentMonthMembers = data?.trends?.previousPeriod?.current_month_members || 0;
  const previousMonthMembers = data?.trends?.previousPeriod?.previous_month_members || 0;
  const membersTrend = previousMonthMembers > 0 ?
    ((currentMonthMembers - previousMonthMembers) / previousMonthMembers * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Member Distribution</h3>
      <div className="h-64">
        {totalMembers > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No member data available
          </div>
        )}
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Total Members</span>
          <span>{totalMembers.toLocaleString()} members</span>
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