import React, { useState, useEffect, useMemo } from 'react';
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
  FaExclamationTriangle,
  FaTimesCircle 
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

// LoanDisbursementCard component with updated data
const LoanDisbursementCard = ({ totalLoanDisbursed, monthlyStats }) => {
  const [timeRange, setTimeRange] = useState("Last 7 days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const disbursementData = useMemo(() => {
    // Default to zeros
    const baseData = [0, 0, 0, 0];
    
    // If monthly stats are available, use the most recent month's data
    if (monthlyStats && monthlyStats.length > 0) {
      const latestMonth = monthlyStats[0];
      baseData[3] = parseFloat(latestMonth.disbursed_amount) || 0;
    }
    
    return baseData;
  }, [timeRange, monthlyStats]);

  // Calculate growth rate based on available data
  const calculateGrowthRate = () => {
    if (!monthlyStats || monthlyStats.length < 2) return "0%";
    
    const currentMonth = parseFloat(monthlyStats[0]?.disbursed_amount) || 0;
    const previousMonth = parseFloat(monthlyStats[1]?.disbursed_amount) || 0;
    
    if (previousMonth === 0) return "0%";
    
    const growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;
    return `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">
            <CountUp
              start={0}
              end={parseFloat(totalLoanDisbursed) || 0}
              duration={2.5}
              separator=","
              decimals={2}
              prefix="₱"
            />
          </h5>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Total disbursed this month
          </p>
        </div>
        <div className="flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
          {calculateGrowthRate()}
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

// Updated Risk Assessment Card with loan type data
const RiskAssessmentCard = ({ loansByType }) => {
  // Calculate total loans
  const totalLoans = loansByType ? loansByType.reduce((acc, item) => acc + item.count, 0) : 0;
  
  // Generate colors based on number of loan types
  const generateColors = (count) => {
    const baseColors = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];
    const colors = [];
    
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  };
  
  // Prepare data for the pie chart
  const riskScoreData = {
    labels: loansByType ? loansByType.map(item => item.loan_type) : [],
    datasets: [
      {
        label: 'Loan Types',
        data: loansByType ? loansByType.map(item => item.count) : [],
        backgroundColor: generateColors(loansByType ? loansByType.length : 0),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Loan Types Distribution</h3>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <FaChartLine className="text-indigo-600" />
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
                    const percentage = totalLoans > 0 ? Math.round((value / totalLoans) * 100) : 0;
                    return `${label}: ${percentage}% (${value} loans)`;
                  }
                }
              }
            },
            cutout: '60%',
          }}
        />
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
          <div className="flex items-center">
            <FaInfoCircle className="text-indigo-600 mr-2" />
            <span className="text-sm font-medium text-gray-800">Total Loans</span>
          </div>
          <span className="text-sm font-bold text-indigo-600">{totalLoans}</span>
        </div>
      </div>
    </div>
  );
};

// Loan Repayment Analytics Card - Fixed to use real data
const LoanRepaymentAnalyticsCard = ({ averageLoanAmount, repaymentRate, overdueLoanCount, monthlyStats }) => {
  // Generate months from current month backward
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const labels = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);
    }
    
    return labels.reverse();
  };
  
  const months = getMonthLabels();
  
  // Create data based on monthly statistics
  const generateMonthlyData = () => {
    // Initialize with zeros
    const expectedRepayments = [0, 0, 0, 0, 0, 0];
    const actualRepayments = [0, 0, 0, 0, 0, 0];
    const rates = [0, 0, 0, 0, 0, 0];
    
    // If we have monthly statistics, use them
    if (monthlyStats && monthlyStats.length > 0) {
      for (let i = 0; i < Math.min(monthlyStats.length, 6); i++) {
        // Use the data in reverse (most recent first)
        const idx = 5 - i;
        if (idx >= 0) {
          const monthStat = monthlyStats[i];
          expectedRepayments[idx] = parseFloat(monthStat.disbursed_amount) || 0;
          
          // Calculate actual repayments based on repayment rate
          const rate = parseFloat(repaymentRate) || 0;
          actualRepayments[idx] = expectedRepayments[idx] * (rate / 100);
          
          // Use the actual repayment rate
          rates[idx] = rate;
        }
      }
    }
    
    return {
      expected: expectedRepayments,
      actual: actualRepayments,
      rates: rates
    };
  };
  
  const repaymentData = generateMonthlyData();
  
  const repaymentChartData = {
    labels: months,
    datasets: [
      {
        type: 'bar',
        label: 'Expected Repayments',
        data: repaymentData.expected,
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        type: 'bar',
        label: 'Actual Repayments',
        data: repaymentData.actual,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        type: 'line',
        label: 'Repayment Rate',
        data: repaymentData.rates,
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

  // Format the average loan amount
  const formattedAvgLoanAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(averageLoanAmount || 0);

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Loan Analytics</h3>
        <div className="flex items-center">
          <div className="p-2 bg-amber-50 rounded-lg">
            <FaPercentage className="text-amber-600" />
          </div>
        </div>
      </div>
      <div className="h-72">
        <Bar
          data={repaymentChartData}
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
          <p className="text-xs font-medium text-gray-500">Average Loan Amount</p>
          <p className="text-lg font-bold text-indigo-600">{formattedAvgLoanAmount}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <p className="text-xs font-medium text-gray-500">Repayment Rate</p>
          <p className="text-lg font-bold text-green-600">{parseFloat(repaymentRate) || 0}%</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg text-center">
          <p className="text-xs font-medium text-gray-500">Overdue Loans</p>
          <p className="text-lg font-bold text-red-600">{overdueLoanCount || 0}</p>
        </div>
      </div>
    </div>
  );
};

// Loan Performance Radar Chart - Fixed to use performanceMetrics
const LoanPerformanceCard = ({ monthlyStats, performanceMetrics }) => {
  // Use actual data from performanceMetrics with fallbacks to 0
  const performanceData = {
    labels: ['Applications', 'Approvals', 'Disbursements', 'Processing Speed', 'Customer Satisfaction'],
    datasets: [
      {
        label: 'Current Period',
        data: [
          (performanceMetrics?.applicationRate || 0) * 50, // Scale for radar chart
          parseFloat(performanceMetrics?.approvalRate) || 0,
          parseFloat(performanceMetrics?.disbursementRate) || 0,
          performanceMetrics?.processingSpeed || 0,
          performanceMetrics?.satisfaction || 0
        ],
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
        data: [0, 0, 0, 0, 0], // Default to 0 for previous period
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

  // Use real data from performanceMetrics
  const approvalRate = performanceMetrics?.approvalRate ? parseFloat(performanceMetrics.approvalRate).toFixed(1) : 0;
  const disbursementRate = performanceMetrics?.disbursementRate ? parseFloat(performanceMetrics.disbursementRate).toFixed(1) : 0;
  const avgProcessingDays = performanceMetrics?.avgProcessingDays || 0;

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
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                  stepSize: 20,
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
          <span className="text-xs font-medium text-gray-500">Approval Rate</span>
          <span className="text-lg font-bold text-indigo-600">{approvalRate}%</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg">
          <span className="text-xs font-medium text-gray-500">Disbursement Rate</span>
          <span className="text-lg font-bold text-indigo-600">{disbursementRate}%</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg">
          <span className="text-xs font-medium text-gray-500">Avg. Processing</span>
          <span className="text-lg font-bold text-indigo-600">{avgProcessingDays} days</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced StatsCard Component with dynamic growth calculation
const StatsCard = ({ icon, label, value, color }) => {
  // Calculate the growth dynamically based on value
  // Setting to 0% for now, as we don't have historical data
  const growth = "0%";
  const isPositive = !growth.startsWith('-');
  
  // Define color classes mapping
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600"
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-600"
    }
  };
  
  // Get the correct color classes
  const colorClass = colorClasses[color] || colorClasses.indigo;
  
  return (
    <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 ${colorClass.bg} rounded-lg`}>
          {icon}
        </div>
        <div className={`text-sm font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {growth}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-gray-800">
          {typeof value === 'number' ? (
            <CountUp start={0} end={value} duration={2.5} separator="," />
          ) : (
            value
          )}
        </div>
        <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
};

// LoanDashboard - Main Component
const LoanDashboard = () => {
  const [loanSummary, setLoanSummary] = useState({
    totalLoanApplications: 0,
    totalApproved: 0,
    totalPending: 0,
    totalDisbursed: 0,
    totalLoanDisbursed: "0",
    totalRejected: 0,
    averageLoanAmount: "0",
    overdueLoanCount: 0,
    repaymentRate: "0",
    performanceMetrics: {
      avgProcessingDays: 0,
      approvalRate: "0",
      disbursementRate: "0",
      avgCompletionDays: 0,
      applicationRate: 0,
      processingSpeed: 0,
      satisfaction: 0,
      successRate: 0
    },
    loansByType: [],
    monthlyStatistics: [],
    loanAnalysis: []
  });

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
  
    fetch('http://localhost:3001/api/loan-summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLoanSummary(data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching loan summary:', error);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-lg font-semibold text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Loan Management Dashboard</h1>
       <p className="text-gray-600">Analytics and overview of loan operations</p>
     </div>

     {/* Top Stats Row */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
       <StatsCard
         icon={<FaClipboardList className="text-indigo-600" />}
         label="Total Applications"
         value={loanSummary.totalLoanApplications}
         color="indigo"
       />
       <StatsCard
         icon={<FaClipboardCheck className="text-emerald-600" />}
         label="Approved Loans"
         value={loanSummary.totalApproved}
         color="emerald"
       />
       <StatsCard
         icon={<FaTimesCircle className="text-red-600" />}
         label="Rejected Applications"
         value={loanSummary.totalRejected}
         color="amber"
       />
       <StatsCard
         icon={<FaExclamationTriangle className="text-violet-600" />}
         label="Pending Applications"
         value={loanSummary.totalPending}
         color="violet"
       />
     </div>

     {/* Charts Row 1 */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
       <LoanDisbursementCard 
         totalLoanDisbursed={loanSummary.totalLoanDisbursed} 
         monthlyStats={loanSummary.monthlyStatistics}
       />
       <RiskAssessmentCard loansByType={loanSummary.loansByType} />
     </div>

     {/* Charts Row 2 */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
       <LoanRepaymentAnalyticsCard 
         averageLoanAmount={loanSummary.averageLoanAmount} 
         repaymentRate={loanSummary.repaymentRate} 
         overdueLoanCount={loanSummary.overdueLoanCount} 
         monthlyStats={loanSummary.monthlyStatistics}
       />
       <LoanPerformanceCard 
         monthlyStats={loanSummary.monthlyStatistics} 
         performanceMetrics={loanSummary.performanceMetrics}
       />
     </div>
   </div>
 );
};

export default LoanDashboard;