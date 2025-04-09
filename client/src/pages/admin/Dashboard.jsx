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
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line, Pie } from 'react-chartjs-2';
import {
  FaMoneyCheckAlt,
  FaPiggyBank,
  FaUsers,
  FaHandHoldingUsd,
  FaCalendarAlt,
} from 'react-icons/fa';

// Register ChartJS components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

// A reusable card component for displaying statistics
const StatsCard = ({ icon, label, value, growth }) => {
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
          <CountUp start={0} end={value} duration={2.5} separator="," />
        </div>
        <div className="text-sm font-medium text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
};

// FinancialOverviewCard with an interactive line chart
const FinancialOverviewCard = ({ revenueData }) => {
  const chartData = useMemo(() => ({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        borderColor: 'rgba(99,102,241,1)',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  }), [revenueData]);

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">
            <CountUp start={0} end={750000} duration={2.5} separator="," prefix="₱" />
          </h5>
          <p className="text-sm font-medium text-gray-500 mt-1">Total Revenue This Month</p>
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
      <div className="mt-4">
        <Line
          data={chartData}
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
              }
            },
            scales: { 
              x: { display: false }, 
              y: { display: false },
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
    </div>
  );
};

// A dropdown component to control the time range for analytics
const TimeRangeDropdown = ({ selectedRange, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ranges = ["Yesterday", "Today", "Last 7 days", "Last 30 days", "Last 90 days"];
  
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center w-full rounded-lg border border-gray-200 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
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
  const [timeRange, setTimeRange] = useState("Last 7 days");

  // Simulate dynamic revenue data based on the selected time range.
  const revenueData = useMemo(() => {
    switch(timeRange) {
      case "Yesterday":
        return [200000, 0, 0, 0];
      case "Today":
        return [0, 250000, 0, 0];
      case "Last 30 days":
        return [150000, 180000, 170000, 210000];
      case "Last 90 days":
        return [140000, 190000, 180000, 230000];
      default:
        // Default is "Last 7 days"
        return [150000, 200000, 180000, 220000];
    }
  }, [timeRange]);

  // Top stats for overall analytics
  const stats = [
    {
      label: 'Total Revenue',
      value: 750000,
      growth: '+5%',
      icon: <FaMoneyCheckAlt size={24} className="text-indigo-600" />,
    },
    {
      label: 'Total Savings',
      value: 1200000,
      growth: '+12%',
      icon: <FaPiggyBank size={24} className="text-emerald-600" />,
    },
    {
      label: 'Members',
      value: 350,
      growth: '+8%',
      icon: <FaUsers size={24} className="text-violet-600" />,
    },
    {
      label: 'Transactions',
      value: 150,
      growth: '+10%',
      icon: <FaHandHoldingUsd size={24} className="text-amber-600" />,
    },
  ];

  // Dummy data for monthly savings contributions
  const lineChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Monthly Savings Contributions',
        data: [200, 400, 600, 800, 1000, 1200],
        borderColor: 'rgba(99,102,241,1)',
        backgroundColor: 'rgba(99,102,241,0.1)',
        tension: 0.3,
        borderWidth: 3,
      },
    ],
  };

// Data for member distribution pie chart - This remains largely the same
const pieChartData = {
  labels: ['Time Deposit', 'Loan', 'Regular Savings', 'Share Capital'],
  datasets: [
    {
      label: 'Member Count',
      data: [150, 80, 200, 100],
      backgroundColor: ['#6366F1', '#F43F5E', '#F59E0B', '#10B981'],
      borderWidth: 0,
    },
  ],
};

// Data for financial breakdown pie chart - Updated to match the same categories as the member distribution
const moneyPieChartData = {
  labels: ['Time Deposit', 'Loan', 'Regular Savings', 'Share Capital'],
  datasets: [
    {
      label: 'Financial Distribution',
      data: [450000, 500000, 350000, 250000],
      backgroundColor: ['#6366F1', '#F43F5E', '#F59E0B', '#10B981'],
      borderWidth: 0,
    },
  ],
};

  // Upcoming events data
  const upcomingEvents = [
    { date: 'Sep 15, 2025', event: 'Monthly Members Meeting' },
    { date: 'Sep 25, 2025', event: 'System Maintenance' },
    { date: 'Oct 05, 2025', event: 'Financial Literacy Workshop' },
  ];

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Cooperative Dashboard</h1>
          <p className="text-gray-500 mt-1">View your cooperative's performance at a glance</p>
        </header>

        <main className="w-full space-y-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((item, idx) => (
              <StatsCard key={idx} {...item} />
            ))}
          </div>

          {/* Main Grid Sections */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Financial Overview Card */}
              <FinancialOverviewCard revenueData={revenueData} />

              {/* New Members Card */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">New Members</h2>
                  <div className="bg-violet-100 text-violet-600 px-3 py-1 rounded-full text-sm font-medium">
                    This Month
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  <CountUp start={0} end={69} duration={2.5} />
                </div>
                <div className="text-sm text-gray-500 mb-4">First-Time Registrations</div>
                <div className="flex items-center mt-3 space-x-1">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-indigo-100"
                    src="https://via.placeholder.com/40"
                    alt="Client A"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-indigo-100 -ml-3"
                    src="https://via.placeholder.com/40"
                    alt="Client B"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-indigo-100 -ml-3"
                    src="https://via.placeholder.com/40"
                    alt="Client C"
                  />
                  <div className="w-10 h-10 rounded-full flex items-center justify-center -ml-3 bg-indigo-600 text-white text-xs font-medium ring-2 ring-indigo-100">
                    +10
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <FaCalendarAlt className="text-amber-600" />
                  </div>
                </div>
                <ul className="space-y-4">
                  {upcomingEvents.map((event, i) => (
                    <li key={i} className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded-lg transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                        <span className="text-gray-700 font-medium">{event.event}</span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{event.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-96">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Monthly Savings Contributions</h2>
                  <TimeRangeDropdown selectedRange={timeRange} onChange={setTimeRange} />
                </div>
                <div className="h-64">
                  <Line
                    data={lineChartData}
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
                          mode: 'index',
                          intersect: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(243, 244, 246, 1)',
                            drawBorder: false,
                          },
                          ticks: {
                            font: {
                              size: 12,
                            },
                            color: '#9CA3AF',
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            font: {
                              size: 12,
                            },
                            color: '#9CA3AF',
                          },
                        },
                      },
                      elements: {
                        point: {
                          radius: 4,
                          hoverRadius: 6,
                          backgroundColor: '#6366F1',
                          borderWidth: 2,
                          borderColor: '#fff'
                        },
                        line: {
                          borderWidth: 3,
                        }
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Member Distribution</h2>
                <div className="h-64 flex items-center justify-center">
                  <Pie
                    data={pieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                              size: 12,
                            },
                          }
                        },
                        datalabels: {
                          formatter: (value, ctx) => {
                            const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / sum) * 100).toFixed(0) + '%';
                            return percentage;
                          },
                          color: '#fff',
                          font: { weight: 'bold', size: 12 },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          titleColor: '#4B5563',
                          bodyColor: '#4B5563',
                          borderColor: '#E5E7EB',
                          borderWidth: 1,
                          padding: 10,
                          cornerRadius: 8,
                          bodyFont: { weight: 'bold' },
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              return `${label}: ${value}`;
                            }
                          }
                        }
                      },
                      cutout: '60%',
                    }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Distribution</h2>
  <div className="h-64 flex items-center justify-center">
    <Pie
      data={moneyPieChartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
              },
            }
          },
          datalabels: {
            formatter: (value, ctx) => {
              const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / sum) * 100).toFixed(0) + '%';
              return percentage;
            },
            color: '#fff',
            font: { weight: 'bold', size: 12 },
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#4B5563',
            bodyColor: '#4B5563',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            bodyFont: { weight: 'bold' },
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ₱${value.toLocaleString()}`;
              }
            }
          }
        },
        cutout: '60%',
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