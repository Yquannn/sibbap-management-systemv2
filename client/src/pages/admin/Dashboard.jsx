import React, { useState, useMemo } from 'react';
import CountUp from 'react-countup';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  FaMoneyCheckAlt,
  FaPiggyBank,
  FaUsers,
  FaHandHoldingUsd,
  FaCalendarAlt,
  FaChartLine,
  FaExclamationCircle,
} from 'react-icons/fa';

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
  ChartDataLabels
);

// Enhanced StatsCard with trend indicator and subtitle
const StatsCard = ({ icon, label, value, growth, prefix = "", subtitle }) => {
  const isPositive = growth.startsWith('+');
  
  return (
    <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="p-3 bg-indigo-50 rounded-lg">{icon}</div>
        <div className={`text-sm font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {growth}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-gray-800">
          <CountUp start={0} end={value} duration={2.5} separator="," prefix={prefix} />
        </div>
        <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
};

// Alert Component for Important Notifications
const AlertCard = ({ alerts }) => (
  <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">Important Alerts</h2>
      <div className="p-2 bg-red-50 rounded-lg">
        <FaExclamationCircle className="text-red-600" />
      </div>
    </div>
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
          <span className="text-sm text-red-700">{alert}</span>
        </div>
      ))}
    </div>
  </div>
);

// Time Range Dropdown Component
const TimeRangeDropdown = ({ selectedRange, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ranges = ["Today", "This Week", "This Month", "This Quarter", "This Year"];
  
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center w-full rounded-lg border border-gray-200 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {selectedRange}
        <svg className="w-5 h-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => {
                  onChange(range);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("This Month");

  // Enhanced stats data with more relevant metrics
  const stats = [
    {
      label: 'Active Members',
      value: 1250,
      growth: '+8%',
      icon: <FaUsers size={24} className="text-indigo-600" />,
      subtitle: '150 new this month'
    },
    {
      label: 'Total Loans',
      value: 2500000,
      growth: '+15%',
      prefix: "₱",
      icon: <FaHandHoldingUsd size={24} className="text-emerald-600" />,
      subtitle: '45 active loans'
    },
    {
      label: 'Regular Savings',
      value: 3750000,
      growth: '+12%',
      prefix: "₱",
      icon: <FaPiggyBank size={24} className="text-violet-600" />,
      subtitle: 'Avg. ₱3,000/member'
    },
    {
      label: 'Share Capital',
      value: 5000000,
      growth: '+10%',
      prefix: "₱",
      icon: <FaMoneyCheckAlt size={24} className="text-amber-600" />,
      subtitle: '850 shareholders'
    },
  ];

  // Important alerts data
  const alerts = [
    "25 loans due for payment this week",
    "10 time deposits maturing in 7 days",
    "5 member accounts require verification",
    "System maintenance scheduled for next weekend"
  ];

  // Enhanced loan performance data
  const loanPerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Loan Disbursements',
        data: [300000, 450000, 400000, 600000, 450000, 550000],
        borderColor: 'rgba(99,102,241,1)',
        backgroundColor: 'rgba(99,102,241,0.1)',
        tension: 0.3,
      },
      {
        label: 'Loan Collections',
        data: [250000, 400000, 350000, 550000, 400000, 500000],
        borderColor: 'rgba(16,185,129,1)',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.3,
      }
    ]
  };

  // Member activity data
  const memberActivityData = {
    labels: ['Regular Savings', 'Time Deposits', 'Share Capital', 'Loan Applications', 'Withdrawals'],
    datasets: [{
      data: [65, 45, 35, 28, 20],
      backgroundColor: [
        'rgba(99,102,241,0.8)',
        'rgba(16,185,129,0.8)',
        'rgba(245,158,11,0.8)',
        'rgba(244,63,94,0.8)',
        'rgba(168,85,247,0.8)'
      ],
    }]
  };

  // Financial distribution data
  const financialDistributionData = {
    labels: ['Regular Savings', 'Time Deposits', 'Share Capital', 'Outstanding Loans'],
    datasets: [{
      data: [3750000, 2800000, 5000000, 2500000],
      backgroundColor: [
        'rgba(99,102,241,0.8)',
        'rgba(16,185,129,0.8)',
        'rgba(245,158,11,0.8)',
        'rgba(244,63,94,0.8)'
      ],
    }]
  };

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cooperative Dashboard</h1>
              <p className="text-gray-500 mt-1">Comprehensive overview of all cooperative activities</p>
            </div>
            <TimeRangeDropdown selectedRange={timeRange} onChange={setTimeRange} />
          </div>
        </header>

        <main className="w-full space-y-6">
          {/* Top Stats Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((item, idx) => (
              <StatsCard key={idx} {...item} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Loan Performance Chart */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Loan Performance</h2>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Disbursements</span>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Collections</span>
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <Line
                    data={loanPerformanceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          titleColor: '#6366F1',
                          bodyColor: '#4B5563',
                          borderColor: '#E5E7EB',
                          borderWidth: 1,
                          padding: 10,
                          cornerRadius: 8,
                          titleFont: { weight: 'bold' },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: value => '₱' + value.toLocaleString()
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Member Activity Chart */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Member Activity Distribution</h2>
                <div className="h-80">
                  <Bar
                    data={memberActivityData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          titleColor: '#6366F1',
                          bodyColor: '#4B5563',
                          borderColor: '#E5E7EB',
                          borderWidth: 1,
                          padding: 10,
                          cornerRadius: 8,
                          titleFont: { weight: 'bold' },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Transactions'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Alerts Section */}
              <AlertCard alerts={alerts} />

              {/* Financial Distribution */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Distribution</h2>
                <div className="h-80">
                  <Pie
                    data={financialDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12 }
                          }
                        },
                        datalabels: {
                          formatter: (value, ctx) => {
                            const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / sum) * 100).toFixed(1) + '%';
                            return `₱${(value/1000000).toFixed(1)}M\n${percentage}`;
                          },
                          color: '#fff',
                          font: { weight: 'bold', size: 12 },
                          textAlign: 'center'
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.raw;
                              return `${context.label}: ₱${value.toLocaleString()}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;