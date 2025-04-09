import React, { useState } from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FaMoneyCheckAlt, FaChartLine, FaUsers, FaClipboardCheck } from 'react-icons/fa';

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
          className={`w-3 h-3 ms-1 ${trendColor}`}
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

// Modern Loan Disbursement Card
const LoanDisbursementCard = () => {
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  
  const weeklyData = [150000, 200000, 180000, 220000];
  const weeklyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <h5 className="text-xl font-bold text-gray-800 mb-1">Savings Disbursement</h5>
          <p className="text-sm text-gray-500 mb-4">Total disbursed this month</p>
          <div className="text-3xl font-bold text-gray-900">
            <CountUp start={0} end={750000} duration={2.5} separator="," prefix="₱" />
          </div>
        </div>
        <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-500 text-sm font-semibold">
          +23%
          <svg
            className="w-3 h-3 ms-1"
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
              d="M5 13V1m0 0L1 5m4-4 4 4"
            />
          </svg>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 h-48">
        <Line
          data={{
            labels: weeklyLabels,
            datasets: [
              {
                label: 'Disbursement',
                data: weeklyData,
                borderColor: 'rgba(79, 70, 229, 1)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: 'rgba(79, 70, 229, 1)',
                pointBorderWidth: 2,
              },
            ],
          }}
          options={{
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
                displayColors: false,
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
            },
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center"
          >
            {timeRange}
            <svg
              className="w-4 h-4 ml-1.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg z-10 w-40">
              <ul className="py-1 text-sm text-gray-700">
                {["Today", "Yesterday", "Last 7 days", "Last 30 days", "Last 90 days"].map((text) => (
                  <li key={text}>
                    <button
                      onClick={() => {
                        setTimeRange(text);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <a
          href="#"
          className="text-sm font-semibold flex items-center text-indigo-600 hover:text-indigo-500"
        >
          Full Report
          <svg
            className="w-4 h-4 ml-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

// Savings Performance Analytics Card
const SavingsAnalyticsCard = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const savingsData = {
    labels: months,
    datasets: [
      {
        label: 'New Deposits',
        data: [8500, 7200, 9000, 10500, 11200, 12000],
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 6,
        barThickness: 16,
      },
      {
        label: 'Withdrawals',
        data: [3500, 2800, 4000, 3200, 2900, 3500],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
        barThickness: 16,
      }
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
        <h3 className="text-xl font-bold text-gray-800">Savings Performance</h3>
        <select className="text-sm border-gray-200 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
          <option>Last 6 Months</option>
        </select>
      </div>
      <div className="h-64">
        <Bar data={savingsData} options={options} />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Average Deposit</p>
          <p className="text-xl font-bold text-gray-800">₱9,733</p>
          <p className="text-xs text-green-500 mt-1">+8.2% vs. previous period</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Average Withdrawal</p>
          <p className="text-xl font-bold text-gray-800">₱3,316</p>
          <p className="text-xs text-red-500 mt-1">-2.5% vs. previous period</p>
        </div>
      </div>
    </div>
  );
};

// Member Distribution Card
const MemberDistributionCard = () => {
  const data = {
    labels: ['Regular Savers', 'Goal-based Savers', 'Auto-deposit Program', 'Youth Savers', 'Senior Savers'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)', // Indigo
          'rgba(245, 158, 11, 0.8)', // Amber
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(139, 92, 246, 0.8)', // Purple
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
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
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
          <span>2,500 members</span>
        </div>
        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
          <span>Growth Rate</span>
          <span className="text-green-500 font-medium">+12% vs. last quarter</span>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const SavingsDashboard = () => {
  const stats = [
    { 
      title: 'Total Savings', 
      value: 3250000, 
      trend: '+15%', 
      icon: <FaMoneyCheckAlt size={20} className="text-white" />, 
      color: 'bg-indigo-500' 
    },
    { 
      title: 'Active Savers', 
      value: 1250, 
      trend: '+8%', 
      icon: <FaUsers size={20} className="text-white" />, 
      color: 'bg-green-500' 
    },
    { 
      title: 'New Applications', 
      value: 92, 
      trend: '+12%', 
      icon: <FaClipboardCheck size={20} className="text-white" />, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Savings Growth', 
      value: 24, 
      trend: '+5%', 
      icon: <FaChartLine size={20} className="text-white" />, 
      color: 'bg-purple-500' 
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Regular Savings Dashboard</h1>
        <p className="text-gray-600 mt-1">Track and analyze your savings program performance</p>
      </header>

      <main className="w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((item, idx) => (
            <StatCard key={idx} {...item} />
          ))}
        </div>

        {/* Main Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LoanDisbursementCard />
          <SavingsAnalyticsCard />
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MemberDistributionCard />
          
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Savings Goal Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Emergency Fund', current: 15000, target: 25000, color: 'bg-indigo-500' },
                { name: 'Vacation', current: 5000, target: 12000, color: 'bg-green-500' },
                { name: 'Education', current: 30000, target: 50000, color: 'bg-blue-500' },
                { name: 'Home Purchase', current: 80000, target: 200000, color: 'bg-purple-500' },
              ].map((goal, idx) => {
                const percentage = Math.round((goal.current / goal.target) * 100);
                return (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-700">{goal.name}</h4>
                      <span className="text-sm font-medium text-gray-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${goal.color} h-2.5 rounded-full`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>₱{goal.current.toLocaleString()}</span>
                      <span>₱{goal.target.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavingsDashboard;