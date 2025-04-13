import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { FaMoneyCheckAlt, FaChartLine, FaUsers, FaClipboardCheck, FaCoins, FaClock } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

// Enhanced Card with Trend Indicator
const StatCard = ({ title, value, trend, icon, color }) => {
  const trendColor = trend.startsWith('+') ? 'text-green-500' : 'text-red-500';

  return (
    <div className="rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-800">
            <CountUp start={0} end={value} duration={2} separator="," />
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

// SavingsAnalyticsCard now receives summary data via props.
const SavingsAnalyticsCard = ({ summary }) => {
  const chartData = summary ? {
    labels: ['Total Deposited', 'Total Withdrawn'],
    datasets: [
      {
        label: 'Amount (₱)',
        data: [
          parseFloat(summary.totalDeposits),
          Math.abs(parseFloat(summary.totalWithdrawals))
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderRadius: 6,
        barThickness: 40,
      }
    ]
  } : null;

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
        ticks: { color: '#4b5563', font: { weight: 'bold' } }
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
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Savings Performance</h3>
        <select className="text-sm border-gray-200 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
          <option>Last 6 Months</option>
        </select>
      </div>
      <div className="h-64">
        {summary ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-red-500">No data available</div>
        )}
      </div>
      {summary ? (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Deposited</p>
            <p className="text-xl font-bold text-gray-800">
              ₱<CountUp start={0} end={parseFloat(summary.totalDeposits)} duration={2} separator="," decimals={2} />
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Withdrawn</p>
            <p className="text-xl font-bold text-gray-800">
              ₱<CountUp start={0} end={Math.abs(parseFloat(summary.totalWithdrawals))} duration={2} separator="," decimals={2} />
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center text-red-500">Summary data not available</div>
      )}
    </div>
  );
};

const MemberDistributionCard = ({ summary }) => {
  // Destructure summary with defaults; we need previousMembersCount for growth rate calculation.
  const {
    partialMembersCount = 0,
    regularMembersCount = 0,
    totalMembersCount = 0,
    previousMembersCount = 0,
  } = summary || {};

  // Calculate percentages based on partial and regular member counts.
  const sumForChart = partialMembersCount + regularMembersCount;
  const partialPercentage = sumForChart ? Math.round((partialMembersCount / sumForChart) * 100) : 0;
  const regularPercentage = sumForChart ? Math.round((regularMembersCount / sumForChart) * 100) : 0;

  // Calculate dynamic growth rate.
  const growthRate =
    previousMembersCount > 0
      ? Math.round(((totalMembersCount - previousMembersCount) / previousMembersCount) * 100)
      : 0;
  const growthLabel = growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`;

  const data = {
    labels: ['Partial Members', 'Regular Members'],
    datasets: [
      {
        data: [partialPercentage, regularPercentage],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
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
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Member Distribution</h3>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Total Members</span>
          <span>{totalMembersCount} members</span>
        </div>
        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
          <span>Growth Rate</span>
          <span className="text-green-500 font-medium">{growthLabel} vs. last quarter</span>
        </div>
      </div>
    </div>
  );
};

const ShareCapitalAnalyticsCard = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const shareCapitalData = {
    labels: months,
    datasets: [
      {
        label: 'New Contributions',
        data: [120000, 135000, 150000, 175000, 190000, 210000],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(16, 185, 129, 1)',
        pointBorderWidth: 2,
      },
      {
        label: 'Cumulative Growth',
        data: [1200000, 1335000, 1485000, 1660000, 1850000, 2060000],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(245, 158, 11, 1)',
        pointBorderWidth: 2,
        yAxisID: 'y1',
      },
    ],
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
          padding: 20,
          color: '#4b5563',
        },
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
        position: 'left',
        grid: { color: '#f3f4f6' },
        ticks: { 
          color: '#9ca3af',
          callback: function(value) {
            return '₱' + (value / 1000) + 'k';
          }
        },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monthly Contributions',
          color: '#4b5563',
        }
      },
      y1: {
        position: 'right',
        grid: { display: false },
        ticks: { 
          color: '#9ca3af',
          callback: function(value) {
            return '₱' + (value / 1000000).toFixed(1) + 'M';
          }
        },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cumulative Amount',
          color: '#4b5563',
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Share Capital Growth</h3>
          <p className="text-sm text-gray-500 mt-1">Track member share capital contributions</p>
        </div>
        <select className="text-sm border-gray-200 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>Last 6 Months</option>
          <option>Last Year</option>
          <option>Last 2 Years</option>
        </select>
      </div>
      
      <div className="h-64 mb-6">
        <Line data={shareCapitalData} options={options} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Share Capital</p>
          <p className="text-xl font-bold text-gray-800">₱{parseFloat(207700.00).toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">+11.4% vs. previous period</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg. per Member</p>
          <p className="text-xl font-bold text-gray-800">₱16,480</p>
          <p className="text-xs text-green-500 mt-1">+5.2% vs. previous period</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">New Contributors</p>
          <p className="text-xl font-bold text-gray-800">75</p>
          <p className="text-xs text-green-500 mt-1">+15.0% vs. previous period</p>
        </div>
      </div>
    </div>
  );
};

const TimeDepositAnalyticsCard = () => {
  const depositCategories = ['30 Days', '90 Days', '180 Days', '1 Year', '2 Years', '5 Years'];
  
  const timeDepositData = {
    labels: depositCategories,
    datasets: [
      {
        label: 'Amount (in ₱)',
        data: [250000, 750000, 1250000, 2000000, 1500000, 500000],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(220, 38, 38, 0.8)',
        ],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      }
    ],
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
            return `₱${context.parsed.toLocaleString()}`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Time Deposit Analytics</h3>
        <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
          <span className="text-xs font-medium text-blue-800">Total: ₱6,250,000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64">
          <Pie data={timeDepositData} options={options} />
        </div>
        
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Current Interest Rates</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-52 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-gray-500">Term</th>
                    <th className="text-left font-medium text-gray-500">Rate</th>
                    <th className="text-left font-medium text-gray-500">Popularity</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { term: '30 Days', rate: '2.25%', popularity: 'Low' },
                    { term: '90 Days', rate: '3.00%', popularity: 'Medium' },
                    { term: '180 Days', rate: '3.75%', popularity: 'High' },
                    { term: '1 Year', rate: '4.50%', popularity: 'Very High' },
                    { term: '2 Years', rate: '5.25%', popularity: 'Medium' },
                    { term: '5 Years', rate: '6.00%', popularity: 'Low' },
                  ].map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="py-2 text-gray-700">{item.term}</td>
                      <td className="py-2 text-gray-700 font-medium">{item.rate}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.popularity === 'Very High' ? 'bg-green-100 text-green-800' :
                          item.popularity === 'High' ? 'bg-blue-100 text-blue-800' :
                          item.popularity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.popularity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Time Deposit Growth</h4>
            <p className="text-2xl font-bold text-gray-800">+15.8%</p>
            <p className="text-xs text-blue-600 mt-1">Compared to previous quarter</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeDepositMaturityCard = () => {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const maturityData = {
    labels: months,
    datasets: [
      {
        label: 'Maturing Time Deposits',
        data: [125000, 180000, 75000, 210000, 150000, 320000, 90000, 175000, 230000],
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 6,
        barThickness: 16,
      },
    ],
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
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
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
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Time Deposit Maturity Timeline</h3>
          <p className="text-sm text-gray-500 mt-1">Upcoming maturities for the next 9 months</p>
        </div>
        <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
          <span className="text-xs font-medium text-indigo-800">Total: ₱1,555,000</span>
        </div>
      </div>
      
      <div className="h-64">
        <Bar data={maturityData} options={options} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Next 30 Days</p>
          <p className="text-xl font-bold text-gray-800">₱125,000</p>
          <p className="text-xs text-indigo-600 mt-1">5 accounts</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Renewal Rate</p>
          <p className="text-xl font-bold text-gray-800">78.5%</p>
          <p className="text-xs text-green-500 mt-1">+3.2% vs. previous period</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Avg. Interest Payout</p>
          <p className="text-xl font-bold text-gray-800">₱12,440</p>
          <p className="text-xs text-green-500 mt-1">+5.8% vs. previous period</p>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component – handles API call once and passes data as props.
const SavingsDashboard = () => {
  const [savingsSummary, setSavingsSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('savings');

  // Fetch summary data once when the dashboard mounts
  useEffect(() => {
    axios.get('http://localhost:3001/api/summary')
      .then((response) => {
        if (response.data && response.data.success) {
          setSavingsSummary(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching savings summary:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Calculate dynamic statistics using current and previous period values from summary
  const totalSavings = savingsSummary 
    ? parseFloat(savingsSummary.regularSavings) + parseFloat(savingsSummary.disbursementSavings)
    : 0;
  const previousTotalSavings = savingsSummary 
    ? (parseFloat(savingsSummary.previousRegularSavings || 0) + parseFloat(savingsSummary.previousDisbursementSavings || 0))
    : 0;
  const totalSavingsTrend = previousTotalSavings > 0 
    ? Math.round(((totalSavings - previousTotalSavings) / previousTotalSavings) * 100)
    : 0;
  const totalSavingsTrendLabel = totalSavingsTrend > 0 ? `+${totalSavingsTrend}%` : `${totalSavingsTrend}%`;

  const activeSavers = savingsSummary ? parseFloat(savingsSummary.activeSavers) : 0;
  const previousActiveSavers = savingsSummary ? parseFloat(savingsSummary.previousActiveSavers || 0) : 0;
  const activeSaversTrend = previousActiveSavers > 0 
    ? Math.round(((activeSavers - previousActiveSavers) / previousActiveSavers) * 100)
    : 0;
  const activeSaversTrendLabel = activeSaversTrend > 0 ? `+${activeSaversTrend}%` : `${activeSaversTrend}%`;

  const totalShareCapital = savingsSummary ? parseFloat(savingsSummary.totalShareCapital) : 0;
  const previousShareCapital = savingsSummary ? parseFloat(savingsSummary.previousShareCapital || 0) : 0;
  const shareCapitalTrend = previousShareCapital > 0 
    ? Math.round(((totalShareCapital - previousShareCapital) / previousShareCapital) * 100)
    : 0;
  const shareCapitalTrendLabel = shareCapitalTrend > 0 ? `+${shareCapitalTrend}%` : `${shareCapitalTrend}%`;

  const totalTimedeposit = savingsSummary ? parseFloat(savingsSummary.totalTimedeposit) : 0;
  const previousTimedeposit = savingsSummary ? parseFloat(savingsSummary.previousTimedeposit || 0) : 0;
  const timeDepositTrend = previousTimedeposit > 0 
    ? Math.round(((totalTimedeposit - previousTimedeposit) / previousTimedeposit) * 100)
    : 0;
  const timeDepositTrendLabel = timeDepositTrend > 0 ? `+${timeDepositTrend}%` : `${timeDepositTrend}%`;

  const stats = [
    { 
      title: 'Total Savings', 
      value: totalSavings, 
      trend: totalSavingsTrendLabel,
      icon: <FaMoneyCheckAlt size={20} className="text-white" />, 
      color: 'bg-indigo-500' 
    },
    { 
      title: 'Active Savers', 
      value: activeSavers, 
      trend: activeSaversTrendLabel, 
      icon: <FaUsers size={20} className="text-white" />, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Share Capital', 
      value: totalShareCapital, 
      trend: shareCapitalTrendLabel, 
      icon: <FaCoins size={20} className="text-white" />, 
      color: 'bg-amber-500' 
    },
    { 
      title: 'Time Deposits', 
      value: totalTimedeposit, 
      trend: timeDepositTrendLabel, 
      icon: <FaClock size={20} className="text-white" />, 
      color: 'bg-blue-500' 
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-600 mt-1">Track and analyze savings, share capital, and time deposits</p>
      </header>

      <main className="w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((item, idx) => (
            <StatCard key={idx} {...item} />
          ))}
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'savings', name: 'Savings' },
                { id: 'shareCapital', name: 'Share Capital' },
                { id: 'timeDeposit', name: 'Time Deposits' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conditional rendering based on active tab */}
        {activeTab === 'savings' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-gray-500">Loading chart...</div>
              ) : (
                <SavingsAnalyticsCard summary={savingsSummary} />
              )}
              <MemberDistributionCard summary={savingsSummary} />
            </div>
          </>
        )}

        {activeTab === 'shareCapital' && (
          <>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <ShareCapitalAnalyticsCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Share Capital by Member Type</h3>
                <div className="h-64">
                  <Doughnut 
                    data={{
                      labels: ['Regular Members', 'Associate Members', 'New Members (< 1 year)', 'Senior Members (> 5 years)', 'Institutional Members'],
                      datasets: [
                        {
                          data: [40, 15, 20, 22, 3],
                          backgroundColor: [
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                          ],
                        }
                      ]
                    }} 
                    options={{
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
                          },
                        }
                      },
                      cutout: '60%',
                    }} 
                  />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Top Contributor</p>
                    <p className="text-lg font-bold text-gray-800">Juan Dela Cruz</p>
                    <p className="text-xs text-gray-500 mt-1">₱75,000 share capital</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Dividend Rate</p>
                    <p className="text-lg font-bold text-gray-800">7.5%</p>
                    <p className="text-xs text-green-500 mt-1">+0.5% vs. previous year</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Share Capital Projection</h3>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: ['Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                      datasets: [
                        {
                          label: 'Projected Growth',
                          data: [207700, 225000, 245000, 270000, 300000, 340000],
                          borderColor: 'rgba(16, 185, 129, 1)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                        },
                        {
                          label: 'Conservative Estimate',
                          data: [207700, 215000, 227500, 240000, 255000, 270000],
                          borderColor: 'rgba(245, 158, 11, 1)',
                          borderWidth: 2,
                          borderDash: [5, 5],
                          tension: 0.4,
                          fill: false,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 12,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            color: '#4b5563',
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `₱${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: {
                            callback: function(value) {
                              return '₱' + (value / 1000000).toFixed(1) + 'M';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Growth Strategy</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Increase minimum monthly contribution by 5%
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Recruitment drive targeting 150 new members by Q3
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Enhanced member benefits based on share capital tiers
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'timeDeposit' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TimeDepositAnalyticsCard />
              <TimeDepositMaturityCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Time Deposit Volume Trends</h3>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                      datasets: [
                        {
                          label: 'New Time Deposits',
                          data: [350000, 420000, 380000, 500000, 550000, 480000, 620000, 580000, 650000],
                          borderColor: 'rgba(59, 130, 246, 1)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          ticks: {
                            callback: function(value) {
                              return '₱' + (value / 1000) + 'k';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Average Deposit</p>
                    <p className="text-lg font-bold text-gray-800">₱125,000</p>
                    <p className="text-xs text-green-500 mt-1">+10.5% vs. previous period</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Most Popular Term</p>
                    <p className="text-lg font-bold text-gray-800">1 Year</p>
                    <p className="text-xs text-gray-500 mt-1">32% of all deposits</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Avg. Interest Earned</p>
                    <p className="text-lg font-bold text-gray-800">₱5,625</p>
                    <p className="text-xs text-green-500 mt-1">Per account monthly</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Depositor Age Distribution</h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
                      datasets: [
                        {
                          label: 'Number of Depositors',
                          data: [12, 45, 68, 92, 75, 43],
                          backgroundColor: 'rgba(79, 70, 229, 0.8)',
                          borderRadius: 6,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: {
                          grid: { display: false },
                          title: {
                            display: true,
                            text: 'Age Group',
                            color: '#4b5563',
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Number of Depositors',
                            color: '#4b5563',
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
                  <p className="text-sm text-gray-600">
                    The 46-55 age group has the highest number of time deposits, suggesting an opportunity for targeted promotions for retirement planning. Younger demographics (18-35) show potential for growth with appropriately designed products.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SavingsDashboard;
