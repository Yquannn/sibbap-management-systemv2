import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';

const ShareCapitalAnalyticsCard = ({ data }) => {
  // Safely access data with null checks
  const processShareCapitalData = () => {
    const transactions = data?.analytics?.transactionHistory || [];
    
    return transactions
      .filter(tx => tx?.transaction_type === 'Initial Savings Deposit')
      .map(tx => ({
        month: tx.month || '',
        amount: parseFloat(tx.total_amount || 0),
        count: parseInt(tx.transaction_count || 0)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const shareCapitalTrends = processShareCapitalData();

  // Calculate growth metrics with safe defaults
  const calculateGrowthMetrics = () => {
    const currentMonthSavings = parseFloat(data?.trends?.previousPeriod?.current_month_savings || 0);
    const previousMonthSavings = parseFloat(data?.trends?.previousPeriod?.previous_month_savings || 0);
    const growthRate = previousMonthSavings === 0 ? 0 : 
      ((currentMonthSavings - previousMonthSavings) / previousMonthSavings) * 100;

    return {
      growthRate: isNaN(growthRate) ? 0 : growthRate,
      averagePerMember: (data?.totalShareCapital || 0) / (data?.membershipStats?.total || 1),
      totalShareCapital: data?.totalShareCapital || 0
    };
  };

  const metrics = calculateGrowthMetrics();

  // Chart data with null checks
  const trendChartData = {
    labels: shareCapitalTrends.map(item => {
      const [year, month] = (item.month || '').split('-');
      return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Share Capital Contributions',
        data: shareCapitalTrends.map(item => item.amount || 0),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Number of Contributors',
        data: shareCapitalTrends.map(item => item.count || 0),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'contributors',
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            if (context.dataset.yAxisID === 'contributors') {
              return `Contributors: ${context.parsed.y}`;
            }
            return `Amount: ₱${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          callback: value => `₱${(value/1000).toFixed(0)}k`,
          color: '#6b7280'
        },
        beginAtZero: true
      },
      contributors: {
        position: 'right',
        grid: { display: false },
        ticks: {
          color: '#6b7280'
        },
        beginAtZero: true
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280' }
      }
    }
  };

  // Member distribution data with safe defaults
  const memberDistribution = {
    labels: ['Regular Members', 'Partial Members'],
    datasets: [{
      data: [
        parseFloat(data?.membershipStats?.distribution?.regularPercentage || 0),
        parseFloat(data?.membershipStats?.distribution?.partialPercentage || 0)
      ],
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)'],
    }]
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Share Capital Analysis</h3>
          <p className="text-sm text-gray-500">
            Updated {new Date(data?.metadata?.lastUpdated || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Share Capital</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp 
              start={0} 
              end={metrics.totalShareCapital} 
              duration={2} 
              separator="," 
              decimals={2} 
            />
          </p>
          <p className={`text-xs ${metrics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'} mt-1`}>
            {metrics.growthRate >= 0 ? '↑' : '↓'} {Math.abs(metrics.growthRate).toFixed(1)}% vs. last month
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Average per Member</p>
          <p className="text-xl font-bold text-gray-800">
            ₱<CountUp 
              start={0} 
              end={metrics.averagePerMember} 
              duration={2} 
              separator="," 
              decimals={2} 
            />
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Across {data?.membershipStats?.total || 0} members
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Member Distribution</p>
          <p className="text-xl font-bold text-gray-800">
            {data?.membershipStats?.distribution?.regularPercentage || '0'}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Regular members</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Monthly Trends</h4>
          {shareCapitalTrends.length > 0 ? (
            <Line data={trendChartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No trend data available
            </div>
          )}
        </div>
        <div className="h-64">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Member Type Distribution</h4>
          <Bar 
            data={memberDistribution}
            options={{
              indexAxis: 'y',
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { callback: value => `${value}%` }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ShareCapitalAnalyticsCard;