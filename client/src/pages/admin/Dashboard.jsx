import React from 'react';
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
} from 'react-icons/fa';

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

// A generic Financial Overview Card
const FinancialOverviewCard = () => {
  return (
    <div className="max-w-sm w-full bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex justify-between">
        <div>
          <h5 className="leading-none text-3xl font-bold text-gray-900 pb-2">
            <CountUp start={0} end={750000} duration={2.5} separator="," prefix="₱" />
          </h5>
          <p className="text-base font-normal text-gray-700">
            Total Revenue This Month
          </p>
        </div>
        <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 text-center">
          23%
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
      <div className="mt-4">
        <Line
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                label: 'Revenue',
                data: [150000, 200000, 180000, 220000],
                borderColor: 'rgba(99,102,241,1)',
                backgroundColor: 'rgba(99,102,241,0.2)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
          }}
          height={80}
        />
      </div>
      <div className="grid grid-cols-1 items-center border-t border-gray-200 justify-between mt-5">
        <div className="flex justify-between items-center pt-5">
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="lastDaysdropdown"
            data-dropdown-placement="bottom"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 inline-flex items-center"
            type="button"
          >
            Last 7 days
            <svg
              className="w-2.5 m-2.5 ms-1.5"
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
          <div
            id="lastDaysdropdown"
            className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44"
          >
            <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
              {["Yesterday", "Today", "Last 7 days", "Last 30 days", "Last 90 days"].map((text) => (
                <li key={text}>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <a
            href="#"
            className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 hover:bg-gray-100 px-3 py-2"
          >
            Report
            <svg
              className="w-2.5 h-2.5 ms-1.5 rtl:rotate-180"
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
    </div>
  );
};

const Dashboard = () => {
  // Top stats for overall system analytics
  const stats = [
    {
      label: 'Total Revenue',
      value: 750000,
      growth: '+5%',
      icon: <FaMoneyCheckAlt size={24} className="text-blue-500" />,
    },
    {
      label: 'Total Savings',
      value: 1200000,
      growth: '+12%',
      icon: <FaPiggyBank size={24} className="text-green-500" />,
    },
    {
      label: 'Members',
      value: 350,
      growth: '+8%',
      icon: <FaUsers size={24} className="text-purple-500" />,
    },
    {
      label: 'Transactions',
      value: 150,
      growth: '+10%',
      icon: <FaHandHoldingUsd size={24} className="text-yellow-500" />,
    },
  ];

  // Dummy data for Monthly Savings Contributions
  const lineChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Monthly Savings Contributions',
        data: [200, 400, 600, 800, 1000, 1200],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        tension: 0.2,
      },
    ],
  };

  // Pie chart for member product distribution
  const pieChartData = {
    labels: ['Time Deposit', 'Loan', 'Regular Savings', 'Share Capital'],
    datasets: [
      {
        label: 'Member Count',
        data: [150, 80, 200, 100],
        backgroundColor: ['#6366F1', '#EF4444', '#F59E0B', '#10B981'],
      },
    ],
  };

  // New pie chart for money distribution
  const moneyPieChartData = {
    labels: ['Loan', 'Share Capital', 'Interest', 'Regular Savings'],
    datasets: [
      {
        label: 'Money Distribution',
        data: [500000, 300000, 100000, 200000],
        backgroundColor: ['#EF4444', '#10B981', '#F59E0B', '#6366F1'],
      },
    ],
  };

  // Dummy data for upcoming events
  const upcomingEvents = [
    { date: 'Sep 15, 2025', event: 'Monthly Members Meeting' },
    { date: 'Sep 25, 2025', event: 'System Maintenance' },
    { date: 'Oct 05, 2025', event: 'Financial Literacy Workshop' },
  ];

  return (
    <div className="w-full bg-gray-100">
      <main className="w-full">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          {stats.map((item, idx) => (
            <div key={idx} className="rounded-lg bg-white p-4 shadow flex items-center">
              <div className="p-2 bg-gray-100 rounded mr-4">{item.icon}</div>
              <div>
                <div className="text-sm font-medium text-gray-500">{item.label}</div>
                <div className="mt-1 text-xl font-bold text-gray-800">
                  <CountUp start={0} end={item.value} duration={2.5} separator="," />
                </div>
                <div className={`mt-1 text-sm ${item.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {item.growth} from last month
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid for Main Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-4">
            {/* Upcoming Events */}
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-2 text-lg font-semibold text-gray-700">Upcoming Events</h2>
              <ul className="space-y-2">
                {upcomingEvents.map((event, i) => (
                  <li key={i} className="flex items-center justify-between border-b py-2 last:border-b-0">
                    <span className="text-gray-600">{event.event}</span>
                    <span className="text-sm text-gray-400">{event.date}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Two-column grid for New Members and Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Members Card */}
              <div className="rounded-lg shadow bg-white p-4">
                <div className="text-4xl font-bold mb-2">
                  <CountUp start={0} end={69} duration={2.5} />
                </div>
                <div className="text-base mb-1">New Members This Month</div>
                <div className="text-sm">First-Time Registrations</div>
                <div className="flex items-center mt-3 space-x-2">
                  <img
                    className="w-8 h-8 rounded-full border-2 border-gray-900"
                    src="https://via.placeholder.com/32"
                    alt="Client A"
                  />
                  <img
                    className="w-8 h-8 rounded-full border-2 border-gray-900 -ml-3"
                    src="https://via.placeholder.com/32"
                    alt="Client B"
                  />
                  <img
                    className="w-8 h-8 rounded-full border-2 border-gray-900 -ml-3"
                    src="https://via.placeholder.com/32"
                    alt="Client C"
                  />
                  <div className="w-8 h-8 rounded-full border-2 border-gray-900 -ml-3 bg-gray-700 text-white flex items-center justify-center text-xs">
                    +10
                  </div>
                </div>
              </div>
              {/* Financial Overview Card */}
              <FinancialOverviewCard />
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-2 text-lg font-semibold text-gray-700">Monthly Savings Contributions</h2>
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-2 text-lg font-semibold text-gray-700">Member Distribution</h2>
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                    datalabels: {
                      formatter: (value, ctx) => {
                        const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / sum) * 100).toFixed(2) + '%';
                        return percentage;
                      },
                      color: '#fff',
                      font: { weight: 'bold', size: 14 },
                    },
                  },
                }}
              />
            </div>
            {/* New Money Distribution Pie Graph */}
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-2 text-lg font-semibold text-gray-700">Financial Breakdown</h2>
              <Pie
                data={moneyPieChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                    datalabels: {
                      formatter: (value, ctx) => {
                        const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / sum) * 100).toFixed(2) + '%';
                        return percentage;
                      },
                      color: '#fff',
                      font: { weight: 'bold', size: 14 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
