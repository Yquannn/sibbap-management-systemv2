import React, { useState, useMemo } from 'react';
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
} from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import { 
  FaMoneyCheckAlt, 
  FaChartLine, 
  FaClipboardCheck, 
  FaClipboardList, 
  FaUsers, 
  FaInfoCircle, 
  FaCalendarAlt,
  FaPercentage, 
  FaExclamationTriangle 
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
  RadialLinearScale
);

// Enhanced Loan Disbursement Card with interactive elements
const LoanDisbursementCard = () => {
  const [timeRange, setTimeRange] = useState("Last 7 days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const disbursementData = useMemo(() => {
    switch(timeRange) {
      case "Yesterday":
        return [0, 0, 0, 180000];
      case "Today":
        return [0, 0, 0, 50000];
      case "Last 30 days":
        return [180000, 220000, 200000, 240000];
      case "Last 90 days":
        return [160000, 190000, 220000, 250000];
      default: // Last 7 days
        return [150000, 200000, 180000, 220000];
    }
  }, [timeRange]);

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">
            <CountUp start={0} end={750000} duration={2.5} separator="," prefix="₱" />
          </h5>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Total disbursed this month
          </p>
        </div>
        <div className="flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
          23%
          <svg
            className="w-3 h-3 ml-1"
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

      {/* Improved Chart */}
      <div className="mt-4">
        <Line
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                label: 'Disbursement',
                data: disbursementData,
                borderColor: 'rgba(99,102,241,1)',
                backgroundColor: 'rgba(99,102,241,0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { display: false },
              tooltip: { 
                mode: 'index', 
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#6366F1',
                bodyColor: '#4B5563',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                titleFont: { weight: 'bold' },
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += new Intl.NumberFormat('en-PH', {
                        style: 'currency',
                        currency: 'PHP'
                      }).format(context.parsed.y);
                    }
                    return label;
                  }
                }
              }
            },
            scales: { 
              x: { display: false }, 
              y: { display: false }
            },
            elements: {
              point: {
                radius: 0,
                hoverRadius: 6,
                backgroundColor: '#6366F1',
                borderWidth: 2,
                borderColor: '#fff'
              }
            },
          }}
          height={100}
        />
      </div>

      {/* Improved Footer */}
      <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-200">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 inline-flex items-center rounded-lg hover:bg-gray-50 px-3 py-2 transition-colors duration-200"
            type="button"
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

          {isDropdownOpen && (
            <div className="absolute left-0 z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 border border-gray-200">
              <ul className="py-2 text-sm text-gray-700">
                {["Yesterday", "Today", "Last 7 days", "Last 30 days", "Last 90 days"].map((text) => (
                  <li key={text}>
                    <button
                      onClick={() => {
                        setTimeRange(text);
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
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
          className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2 transition-colors duration-200"
        >
          Full Report
          <svg
            className="w-4 h-4 ml-1.5"
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

// Risk Assessment Card Component
const RiskAssessmentCard = () => {
  const riskScoreData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk'],
    datasets: [
      {
        label: 'Current Borrowers',
        data: [45, 35, 15, 5],
        backgroundColor: ['#10B981', '#F59E0B', '#F43F5E', '#F43F5E'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Risk Assessment</h3>
        <div className="p-2 bg-red-50 rounded-lg">
          <FaExclamationTriangle className="text-red-500" />
        </div>
      </div>
      <div className="h-64">
        <Pie 
          data={riskScoreData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: { size: 12 },
                }
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#4B5563',
                bodyColor: '#4B5563',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${percentage}% (${value} borrowers)`;
                  }
                }
              }
            },
            cutout: '60%',
          }}
        />
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <FaInfoCircle className="text-red-500 mr-2" />
            <span className="text-sm font-medium text-gray-800">High Risk Alert</span>
          </div>
          <span className="text-sm font-bold text-red-500">20% of portfolio</span>
        </div>
      </div>
    </div>
  );
};

// Loan Repayment Analytics Card
const LoanRepaymentAnalyticsCard = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const repaymentData = {
    labels: months,
    datasets: [
      {
        type: 'bar',
        label: 'Expected Repayments',
        data: [400000, 420000, 450000, 470000, 490000, 510000],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        type: 'bar',
        label: 'Actual Repayments',
        data: [380000, 400000, 440000, 420000, 460000, 490000],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        type: 'line',
        label: 'Repayment Rate',
        data: [95, 95.2, 97.8, 89.4, 93.9, 96.1],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y1',
      }
    ],
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Loan Repayment Analytics</h3>
        <div className="flex items-center">
          <div className="p-2 bg-amber-50 rounded-lg">
            <FaPercentage className="text-amber-600" />
          </div>
        </div>
      </div>
      <div className="h-72">
        <Bar
          data={repaymentData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: { size: 12 },
                }
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#4B5563',
                bodyColor: '#4B5563',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.datasetIndex === 2) {
                      label += context.parsed.y + '%';
                    } else {
                      label += new Intl.NumberFormat('en-PH', {
                        style: 'currency',
                        currency: 'PHP'
                      }).format(context.parsed.y);
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: { size: 12 },
                  color: '#9CA3AF',
                },
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Amount (₱)',
                  font: { size: 12 },
                  color: '#4B5563',
                },
                ticks: {
                  callback: function(value) {
                    return '₱' + value.toLocaleString();
                  },
                  font: { size: 12 },
                  color: '#9CA3AF',
                },
                grid: {
                  color: 'rgba(243, 244, 246, 1)',
                },
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Repayment Rate (%)',
                  font: { size: 12 },
                  color: '#4B5563',
                },
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  },
                  font: { size: 12 },
                  color: '#9CA3AF',
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          }}
        />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="p-3 bg-indigo-50 rounded-lg text-center">
          <p className="text-xs font-medium text-gray-500">Overall Repayment</p>
          <p className="text-lg font-bold text-indigo-600">94.5%</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <p className="text-xs font-medium text-gray-500">On-time Payments</p>
          <p className="text-lg font-bold text-green-600">87.2%</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg text-center">
          <p className="text-xs font-medium text-gray-500">Delinquency Rate</p>
          <p className="text-lg font-bold text-red-600">5.5%</p>
        </div>
      </div>
    </div>
  );
};

// Loan Performance Radar Chart
const LoanPerformanceCard = () => {
  const performanceData = {
    labels: ['Approval Rate', 'Repayment Rate', 'Retention Rate', 'Disbursement Speed', 'Risk Score', 'Customer Satisfaction'],
    datasets: [
      {
        label: 'Current Period',
        data: [85, 94, 78, 88, 82, 90],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
        pointRadius: 4,
      },
      {
        label: 'Previous Period',
        data: [80, 90, 75, 82, 78, 85],
        backgroundColor: 'rgba(209, 213, 219, 0.2)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(156, 163, 175, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(156, 163, 175, 1)',
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Loan Performance Metrics</h3>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <FaChartLine className="text-indigo-600" />
        </div>
      </div>
      <div className="h-80">
        <Radar
          data={performanceData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: {
                  display: true,
                  color: 'rgba(243, 244, 246, 1)',
                },
                grid: {
                  color: 'rgba(243, 244, 246, 1)',
                },
                pointLabels: {
                  font: {
                    size: 12,
                  },
                  color: '#4B5563',
                },
                suggestedMin: 50,
                suggestedMax: 100,
                ticks: {
                  stepSize: 10,
                  backdropColor: 'transparent',
                  font: {
                    size: 10,
                  },
                  color: '#9CA3AF',
                },
              },
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#4B5563',
                bodyColor: '#4B5563',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.raw || 0;
                    return `${label}: ${value}%`;
                  }
                }
              },
            },
          }}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg">
          <span className="text-xs font-medium text-gray-500">Avg. Processing Time</span>
          <span className="text-lg font-bold text-indigo-600">2.5 days</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg">
          <span className="text-xs font-medium text-gray-500">Avg. Loan Amount</span>
          <span className="text-lg font-bold text-indigo-600">₱35,000</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg">
          <span className="text-xs font-medium text-gray-500">Avg. Loan Term</span>
          <span className="text-lg font-bold text-indigo-600">24 months</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced StatsCard Component
const StatsCard = ({ icon, label, value, growth, color }) => {
  const isPositive = growth.startsWith('+');
  
  return (
    <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 bg-${color}-50 rounded-lg`}>
          {icon}
        </div>
        <div className={`text-sm font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {growth}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-gray-800">
          <CountUp start={0} end={value} duration={2.5} separator="," />
        </div>
        <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
};

// Upcoming Due Loans Component
const UpcomingDueLoansCard = () => {
  const upcomingLoans = [
    { id: 'LN-2025-1201', borrower: 'Juan Dela Cruz', amount: 25000, dueDate: 'Apr 15, 2025' },
    { id: 'LN-2025-1187', borrower: 'Maria Santos', amount: 50000, dueDate: 'Apr 18, 2025' },
    { id: 'LN-2025-1210', borrower: 'Pedro Reyes', amount: 15000, dueDate: 'Apr 20, 2025' },
    { id: 'LN-2025-1225', borrower: 'Ana Garcia', amount: 30000, dueDate: 'Apr 25, 2025' },
  ];

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Upcoming Due Loans</h3>
        <div className="p-2 bg-amber-50 rounded-lg">
          <FaCalendarAlt className="text-amber-600" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {upcomingLoans.map((loan, index) => (
              <tr key={loan.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{loan.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{loan.borrower}</td>
                <td className="px-4 py-3 text-sm text-gray-500">₱{loan.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{loan.dueDate}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                    Upcoming
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
          View All Due Loans →
        </a>
      </div>
    </div>
  );
};

const LoanDashboard = () => {
  // Enhanced stats with better icons and data
  const stats = [
    { 
      label: 'Total Applications', 
      value: 100, 
      growth: '+10%', 
      icon: <FaClipboardList size={24} className="text-indigo-600" />,
      color: 'indigo'
    },
    { 
      label: 'Approved Applications', 
      value: 70, 
      growth: '+8%', 
      icon: <FaClipboardCheck size={24} className="text-emerald-600" />,
      color: 'emerald'
    },
    { 
      label: 'Pending Applications', 
      value: 30, 
      growth: '-2%', 
      icon: <FaMoneyCheckAlt size={24} className="text-amber-600" />,
      color: 'amber'
    },
    { 
      label: 'Total Borrowers', 
      value: 90, 
      growth: '+5%', 
      icon: <FaUsers size={24} className="text-violet-600" />,
      color: 'violet'
    },
  ];

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Loan Management Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor loan performance and borrower analytics</p>
        </header>

        <main className="w-full space-y-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((item, idx) => (
              <StatsCard key={idx} {...item} />
            ))}
          </div>

          {/* First Row: Loan Disbursement and Repayment Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoanDisbursementCard />
            <LoanRepaymentAnalyticsCard />
          </div>

          {/* Second Row: Loan Performance and Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoanPerformanceCard />
            <RiskAssessmentCard />
          </div>

          {/* Third Row: Upcoming Due Loans */}
          <div className="grid grid-cols-1 gap-6">
            <UpcomingDueLoansCard />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoanDashboard;