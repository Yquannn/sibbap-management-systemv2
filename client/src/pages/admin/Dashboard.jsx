import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  RadialLinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line, Pie, Bar, Radar } from 'react-chartjs-2';
import {
  FaMoneyCheckAlt,
  FaPiggyBank,
  FaUsers,
  FaHandHoldingUsd,
  FaCalendarAlt,
  FaChartLine,
  FaExclamationCircle,
  FaRegClock,
  FaHandHoldingHeart,
  FaHourglassHalf,
  FaRegCalendarCheck,
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
  RadialLinearScale,
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
          <CountUp start={0} end={parseFloat(value)} duration={2.5} separator="," prefix={prefix} decimals={value % 1 !== 0 ? 2 : 0} />
        </div>
        <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
};

// Alert Component with Criticality Levels
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
        <div key={index} className={`flex items-center p-3 rounded-lg ${
          alert.level === 'critical' ? 'bg-red-50' : 
          alert.level === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-3 ${
            alert.level === 'critical' ? 'bg-red-500' : 
            alert.level === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
          }`}></div>
          <span className={`text-sm ${
            alert.level === 'critical' ? 'text-red-700' : 
            alert.level === 'warning' ? 'text-amber-700' : 'text-blue-700'
          }`}>{alert.message}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 text-right">
      <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
        View All Alerts
      </button>
    </div>
  </div>
);

// KPI Trend Card Component
const KPITrendCard = ({ title, value, prefix, trend, trendPercentage, data }) => {
  const isPositive = trend === 'up';
  
  // Configuration for the sparkline
  const chartData = {
    labels: Array(data.length).fill(''),
    datasets: [
      {
        data: data.map(val => typeof val === 'string' ? parseFloat(val) : val),
        borderColor: isPositive ? 'rgba(16,185,129,1)' : 'rgba(239,68,68,1)',
        backgroundColor: isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { point: { radius: 0 } }
  };
  
  return (
    <div className="rounded-xl bg-white p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`text-sm font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isPositive ? '▲' : '▼'} {trendPercentage}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-800 mb-3">
        {prefix}{parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
      </div>
      <div className="h-16">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

// Time Range Dropdown Component
const TimeRangeDropdown = ({ selectedRange, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ranges = ["Today", "This Week", "This Month", "This Quarter", "This Year", "Custom Range"];
  
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center w-full rounded-lg border border-gray-200 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <FaCalendarAlt className="mr-2 text-gray-500" />
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
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Function to fetch dashboard data from API
  const fetchDashboardData = async (selectedTimeRange) => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/dashboard-summary', {
        params: { timeRange: selectedTimeRange }
      });
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data when component mounts or time range changes
  useEffect(() => {
    fetchDashboardData(timeRange);
  }, [timeRange]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-xl mb-4">Error Loading Dashboard</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => fetchDashboardData(timeRange)}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no data yet, show empty state
  if (!dashboardData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  // Define icons for stats cards
  const statsIcons = [
    <FaUsers size={24} className="text-indigo-600" />,
    <FaHandHoldingUsd size={24} className="text-emerald-600" />,
    <FaPiggyBank size={24} className="text-violet-600" />,
    <FaMoneyCheckAlt size={24} className="text-amber-600" />
  ];

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cooperative Dashboard</h1>
              <p className="text-gray-500 mt-1">Comprehensive overview of all cooperative activities</p>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading && (
                <div className="text-sm text-indigo-600 flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing data...
                </div>
              )}
              <TimeRangeDropdown selectedRange={timeRange} onChange={handleTimeRangeChange} />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </header>

        <main className="w-full space-y-6">
          {/* Top Stats Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dashboardData.stats.map((item, idx) => (
              <StatsCard key={idx} {...item} icon={statsIcons[idx]} />
            ))}
          </div>
          
          {/* KPI Trends Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dashboardData.kpiTrends.map((kpi, idx) => (
              <KPITrendCard key={idx} {...kpi} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column - Main Charts */}
            <div className="lg:col-span-8 space-y-6">
              {/* Loan Performance Chart */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Loan Performance Analytics</h2>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Disbursements</span>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Collections</span>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Delinquent</span>
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <Line
                    data={{
                      labels: dashboardData.loanPerformance.labels,
                      datasets: dashboardData.loanPerformance.datasets.map((dataset, idx) => ({
                        ...dataset,
                        data: dataset.data.map(val => typeof val === 'string' ? parseFloat(val) : val),
                        borderColor: idx === 0 ? 'rgba(99,102,241,1)' : idx === 1 ? 'rgba(16,185,129,1)' : 'rgba(244,63,94,1)',
                        backgroundColor: idx === 0 ? 'rgba(99,102,241,0.1)' : idx === 1 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                        tension: 0.3,
                      }))
                    }}
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
                          callbacks: {
                            label: (context) => {
                              const value = context.raw;
                              return `${context.dataset.label}: ₱${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                            }
                          }
                        },
                        datalabels: { display: false }
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
                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <FaRegCalendarCheck className="mr-2" />
                  <span>Collection rate: {dashboardData.moduleSummaries.loan.collection_rate}% | Average loan amount: 
                  ₱{dashboardData.moduleSummaries.loan.active_count > 0 
                    ? (parseFloat(dashboardData.moduleSummaries.loan.total_amount) / dashboardData.moduleSummaries.loan.active_count).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                    : '0.00'}</span>
                </div>
              </div>

              {/* Member Growth Analysis */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Member Growth Analysis</h2>
                  <select className="text-sm border rounded-md px-2 py-1 bg-white">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: dashboardData.memberGrowth.labels,
                      datasets: dashboardData.memberGrowth.datasets.map((dataset, idx) => ({
                        ...dataset,
                        borderColor: idx === 0 ? 'rgba(99,102,241,1)' : 'rgba(244,63,94,1)',
                        backgroundColor: idx === 0 ? 'rgba(99,102,241,0.8)' : 'rgba(244,63,94,0.8)',
                        barPercentage: 0.6,
                      }))
                    }}
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
                        datalabels: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Members'
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 p-3 rounded-lg text-center">
                    <span className="text-sm text-gray-600">Net Growth</span>
                    <div className="text-lg font-bold text-indigo-600">
                      +{dashboardData.memberGrowth.datasets[0].data.reduce((sum, val) => sum + (typeof val === 'string' ? parseFloat(val) : val), 0) - 
                        dashboardData.memberGrowth.datasets[1].data.reduce((sum, val) => sum + (typeof val === 'string' ? parseFloat(val) : val), 0)} Members
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg text-center">
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <div className="text-lg font-bold text-indigo-600">
                      {Math.round((dashboardData.stats[0].value - dashboardData.memberGrowth.datasets[1].data.reduce((sum, val) => sum + (typeof val === 'string' ? parseFloat(val) : val), 0)) / dashboardData.stats[0].value * 100)}%
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg text-center">
                    <span className="text-sm text-gray-600">Average Age</span>
                    <div className="text-lg font-bold text-indigo-600">~40 Years</div>
                  </div>
                </div>
              </div>
              
              {/* Age-based Loan Analysis */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Age-based Financial Analysis</h2>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: dashboardData.ageAnalysis.labels,
                      datasets: dashboardData.ageAnalysis.datasets.map((dataset, idx) => ({
                        ...dataset,
                        data: dataset.data.map(val => typeof val === 'string' ? parseFloat(val) : val),
                        backgroundColor: idx === 0 ? 'rgba(99,102,241,0.8)' : 'rgba(16,185,129,0.8)',
                      }))
                    }}
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
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          titleColor: '#6366F1',
                          bodyColor: '#4B5563',
                          borderColor: '#E5E7EB',
                          borderWidth: 1,
                          padding: 10,
                          cornerRadius: 8,
                          titleFont: { weight: 'bold' },
                          callbacks: {
                            label: (context) => {
                              const value = context.raw;
                              return `${context.dataset.label}: ₱${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                            }
                          }
                        },
                        datalabels: { display: false }
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
                <div className="mt-4 text-sm text-gray-500">
                  <p>The 30-40 age group has the highest loan utilization and savings activity.</p>
                </div>
              </div>
            </div>

            {/* Right Column - Insights & Summaries */}
            <div className="lg:col-span-4 space-y-6">
              {/* Alerts Section */}
              <AlertCard alerts={dashboardData.alerts} />

              {/* Cooperative Health Radar */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Cooperative Health Index</h2>
                <div className="h-80">
                  <Radar
                    data={{
                      labels: dashboardData.cooperativeHealth.labels,
                      datasets: dashboardData.cooperativeHealth.datasets.map((dataset, idx) => ({
                        ...dataset,
                        backgroundColor: idx === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(209,213,219,0.2)',
                        borderColor: idx === 0 ? 'rgba(99,102,241,0.8)' : 'rgba(209,213,219,0.8)',
                        pointBackgroundColor: idx === 0 ? 'rgba(99,102,241,1)' : 'rgba(209,213,219,1)',
                      }))
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      elements: {
                        line: {
                          borderWidth: 2
                        },
                        point: {
                          radius: 3
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12 }
                          }
                        },
                        datalabels: { display: false }
                      },
                      scales: {
                        r: {
                          angleLines: {
                            display: true,
                            color: 'rgba(209, 213, 219, 0.5)'
                          },
                          suggestedMin: 0,
                          suggestedMax: 100,
                          ticks: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                  <span className="text-sm text-gray-600">Overall Health Score</span>
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(dashboardData.cooperativeHealth.datasets[0].data.reduce((sum, val) => sum + val, 0) / dashboardData.cooperativeHealth.datasets[0].data.length)}/100
                  </div>
                  <span className="text-xs text-gray-500">
                    +{Math.round((dashboardData.cooperativeHealth.datasets[0].data.reduce((sum, val) => sum + val, 0) / dashboardData.cooperativeHealth.datasets[0].data.length) -
                              (dashboardData.cooperativeHealth.datasets[1].data.reduce((sum, val) => sum + val, 0) / dashboardData.cooperativeHealth.datasets[1].data.length))} points from last period
                  </span>
                </div>
              </div>

              {/* Financial Distribution */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Distribution</h2>
                <div className="h-80">
                  <Pie
                    data={{
                      labels: dashboardData.financialDistribution.labels,
                      datasets: [{
                        data: dashboardData.financialDistribution.datasets[0].data.map(val => typeof val === 'string' ? parseFloat(val) : val),
                        backgroundColor: dashboardData.financialDistribution.datasets[0].backgroundColor
                      }]
                    }}
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
                            return percentage;
                          },
                          color: '#fff',
                          font: { weight: 'bold', size: 11 },
                          textAlign: 'center'
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.raw;
                              return `${context.label}: ₱${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <div className="grid grid-cols-2 gap-2">
                    {dashboardData.financialDistribution.labels.map((label, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: dashboardData.financialDistribution.datasets[0].backgroundColor[idx] }}></div>
                        <span>{label}: ₱{(parseFloat(dashboardData.financialDistribution.datasets[0].data[idx]) / 1000000).toFixed(2)}M</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Member Activity Distribution */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Member Activity</h2>
                <div className="h-80">
                  <Bar
                    data={dashboardData.memberActivity}
                    options={{
                      indexAxis: 'y',
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
                        datalabels: {
                          align: 'end',
                          anchor: 'end',
                          color: '#4B5563',
                          font: { size: 11 },
                        }
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Transaction Count'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Analytics Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Recent Transaction Activity */}
            {/* <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Recent Transaction Activity</h2>
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentTransactions.map((tx, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tx.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tx.member_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${tx.type === 'Regular Savings' ? 'bg-green-100 text-green-800' : 
                            tx.type === 'Loan Application' ? 'bg-purple-100 text-purple-800' : 
                            tx.type === 'Share Capital' ? 'bg-amber-100 text-amber-800' : 
                            tx.type === 'Time Deposit' ? 'bg-indigo-100 text-indigo-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₱{parseFloat(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${tx.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                            tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            tx.status === 'Waiting for Approval' ? 'bg-orange-100 text-orange-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Module Performance Summary Cards */}
              <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 shadow-md hover:shadow-lg transition-all duration-300 text-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Loan Module</h3>
                  <FaHandHoldingUsd size={20} />
                </div>
                <div className="text-3xl font-bold mb-2">₱{parseFloat(dashboardData.moduleSummaries.loan.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div className="text-sm opacity-80">{dashboardData.moduleSummaries.loan.active_count} active loans</div>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <div className="text-xs opacity-75">Approval Rate</div>
                    <div className="text-sm font-semibold">{dashboardData.moduleSummaries.loan.approval_rate}%</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75">Collection Rate</div>
                    <div className="text-sm font-semibold">{dashboardData.moduleSummaries.loan.collection_rate}%</div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 p-6 shadow-md hover:shadow-lg transition-all duration-300 text-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Regular Savings</h3>
                  <FaPiggyBank size={20} />
                </div>
                <div className="text-3xl font-bold mb-2">₱{parseFloat(dashboardData.moduleSummaries.savings.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div className="text-sm opacity-80">{dashboardData.moduleSummaries.savings.savers_count} savers</div>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <div className="text-xs opacity-75">Avg. Balance</div>
                    <div className="text-sm font-semibold">₱{dashboardData.moduleSummaries.savings.avg_balance.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75">Growth Rate</div>
                    <div className="text-sm font-semibold">{dashboardData.moduleSummaries.savings.growth_rate}%</div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-6 shadow-md hover:shadow-lg transition-all duration-300 text-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Share Capital</h3>
                  <FaMoneyCheckAlt size={20} />
                </div>
                <div className="text-3xl font-bold mb-2">₱{parseFloat(dashboardData.moduleSummaries.share_capital.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div className="text-sm opacity-80">{dashboardData.moduleSummaries.share_capital.shareholders_count} shareholders</div>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <div className="text-xs opacity-75">Avg. Holding</div>
                    <div className="text-sm font-semibold">₱{dashboardData.moduleSummaries.share_capital.avg_holding.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75">Growth Rate</div>
                    <div className="text-sm font-semibold">{dashboardData.moduleSummaries.share_capital.growth_rate}%</div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 shadow-md hover:shadow-lg transition-all duration-300 text-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Kalinga Fund</h3>
                  <FaHandHoldingHeart size={20} />
                </div>
                <div className="text-3xl font-bold mb-2">₱{parseFloat(dashboardData.moduleSummaries.kalinga.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div className="text-sm opacity-80">{dashboardData.moduleSummaries.kalinga.beneficiaries_count} beneficiaries</div>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <div className="text-xs opacity-75">Disbursed</div>
                    <div className="text-sm font-semibold">₱{dashboardData.moduleSummaries.kalinga.disbursed.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-75">Growth Rate</div>
                    <div className="text-sm font-semibold">{dashboardData.moduleSummaries.kalinga.growth_rate}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Section with Action Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg flex items-center justify-between transition-all duration-300">
                  <span className="font-medium">New Loan Application</span>
                  <FaHandHoldingUsd />
                </button>
                <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg flex items-center justify-between transition-all duration-300">
                  <span className="font-medium">Record Savings Deposit</span>
                  <FaPiggyBank />
                </button>
                <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg flex items-center justify-between transition-all duration-300">
                  <span className="font-medium">Add Share Capital</span>
                  <FaMoneyCheckAlt />
                </button>
                <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg flex items-center justify-between transition-all duration-300">
                  <span className="font-medium">Process Kalinga Claim</span>
                  <FaHandHoldingHeart />
                </button>
              </div>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Due Dates</h2>
              <div className="space-y-3">
                {dashboardData.dueDates.map((dueDate, idx) => (
                  <div key={idx} className={`p-3 ${
                    dueDate.type === 'critical' ? 'bg-red-50' : 
                    dueDate.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                  } rounded-lg flex items-center justify-between`}>
                    <div>
                      <div className={`font-medium ${
                        dueDate.type === 'critical' ? 'text-red-700' : 
                        dueDate.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
                      }`}>{dueDate.title}</div>
                      <div className={`text-sm ${
                        dueDate.type === 'critical' ? 'text-red-600' : 
                        dueDate.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                      }`}>{dueDate.count} accounts</div>
                    </div>
                    <div className="flex items-center">
                      {dueDate.type === 'critical' ? <FaRegClock className="text-red-500 mr-1" /> : 
                       dueDate.type === 'warning' ? <FaHourglassHalf className="text-amber-500 mr-1" /> : 
                       <FaRegCalendarCheck className="text-blue-500 mr-1" />}
                      <span className={`text-sm ${
                        dueDate.type === 'critical' ? 'text-red-600' : 
                        dueDate.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                      }`}>{dueDate.days} days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Goals</h2>
              <div className="space-y-5">
                {dashboardData.performanceGoals.map((goal, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{goal.title}</span>
                      <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${
                        idx === 0 ? 'bg-indigo-600' : 
                        idx === 1 ? 'bg-emerald-600' : 
                        idx === 2 ? 'bg-amber-600' : 'bg-red-600'
                      } h-2 rounded-full`} style={{ width: `${goal.progress}%` }}></div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>Current: {typeof goal.current === 'string' ? 
                        `₱${parseFloat(goal.current).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}` : 
                        goal.current}
                      </span>
                      <span>Target: {typeof goal.target === 'string' ? 
                        goal.target : 
                        `₱${goal.target.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          {/* </div> */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;