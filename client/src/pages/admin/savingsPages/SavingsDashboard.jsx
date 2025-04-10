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

// NEW: Share Capital Analytics Card
const ShareCapitalAnalyticsCard = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const shareCapitalData = {
    labels: months,
    datasets: [
      {
        label: 'New Contributions',
        data: [120000, 135000, 150000, 175000, 190000, 210000],
        borderColor: 'rgba(16, 185, 129, 1)', // Green
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
        borderColor: 'rgba(245, 158, 11, 1)', // Amber
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
        grid: { 
          display: false,
        },
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
          <p className="text-xl font-bold text-gray-800">₱2,060,000</p>
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

// NEW: Time Deposit Analytics Card
const TimeDepositAnalyticsCard = () => {
  const depositCategories = ['30 Days', '90 Days', '180 Days', '1 Year', '2 Years', '5 Years'];
  
  const timeDepositData = {
    labels: depositCategories,
    datasets: [
      {
        label: 'Amount (in ₱)',
        data: [250000, 750000, 1250000, 2000000, 1500000, 500000],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(79, 70, 229, 0.8)',  // Indigo
          'rgba(245, 158, 11, 0.8)', // Amber
          'rgba(139, 92, 246, 0.8)',  // Purple
          'rgba(220, 38, 38, 0.8)',   // Red
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
            return `₱${context.parsed.toLocaleString()}`;
          }
        }
      }
    },
  };

  // Time Deposit Interest Rate data
  const interestRates = [
    { term: '30 Days', rate: '2.25%', popularity: 'Low' },
    { term: '90 Days', rate: '3.00%', popularity: 'Medium' },
    { term: '180 Days', rate: '3.75%', popularity: 'High' },
    { term: '1 Year', rate: '4.50%', popularity: 'Very High' },
    { term: '2 Years', rate: '5.25%', popularity: 'Medium' },
    { term: '5 Years', rate: '6.00%', popularity: 'Low' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Time Deposit Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution by term length</p>
        </div>
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
                  {interestRates.map((item, index) => (
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

// NEW: Time Deposit Maturity Timeline Card
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
      legend: {
        display: false,
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
    </div>);
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
      title: 'Share Capital', 
      value: 2060000, 
      trend: '+11%', 
      icon: <FaCoins size={20} className="text-white" />, 
      color: 'bg-amber-500' 
    },
    { 
      title: 'Time Deposits', 
      value: 6250000, 
      trend: '+16%', 
      icon: <FaClock size={20} className="text-white" />, 
      color: 'bg-blue-500' 
    },
  ];

  // Tab state for different dashboard sections
  const [activeTab, setActiveTab] = useState('savings');

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
            {/* Main Analytics Section - Savings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <LoanDisbursementCard />
              <SavingsAnalyticsCard />
            </div>

            {/* Additional Analytics - Savings */}
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
          </>
        )}

        {activeTab === 'shareCapital' && (
          <>
            {/* Share Capital Analytics */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <ShareCapitalAnalyticsCard />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Share Capital Distribution by Member Type */}
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
                            'rgba(16, 185, 129, 0.8)', // Green
                            'rgba(59, 130, 246, 0.8)', // Blue
                            'rgba(245, 158, 11, 0.8)', // Amber
                            'rgba(139, 92, 246, 0.8)', // Purple
                            'rgba(239, 68, 68, 0.8)',  // Red
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
              
              {/* Share Capital Growth Projection */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Share Capital Projection</h3>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: ['Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                      datasets: [
                        {
                          label: 'Projected Growth',
                          data: [2060000, 2250000, 2450000, 2700000, 3000000, 3400000],
                          borderColor: 'rgba(16, 185, 129, 1)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                        },
                        {
                          label: 'Conservative Estimate',
                          data: [2060000, 2150000, 2275000, 2400000, 2550000, 2700000],
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
            {/* Time Deposit Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TimeDepositAnalyticsCard />
              <TimeDepositMaturityCard />
            </div>
            
            {/* Additional Time Deposit Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Time Deposit Volume Trends */}
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
                      plugins: {
                        legend: {
                          display: false
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
                        x: {
                          grid: { display: false }
                        },
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
              
              {/* Customer Age Distribution for Time Deposits */}
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
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
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