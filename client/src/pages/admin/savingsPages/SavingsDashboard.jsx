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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaMoneyCheckAlt } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// LoanDisbursementCard using count animation for disbursement amount
const LoanDisbursementCard = () => {
  return (
    <div className="max-w-sm w-full bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex justify-between">
        <div>
          <h5 className="leading-none text-3xl font-bold text-gray-900 pb-2">
            <CountUp start={0} end={750000} duration={2.5} separator="," prefix="₱" />
          </h5>
          <p className="text-base font-normal text-gray-700">
            Total disbursed this month
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

      {/* Chart */}
      <div className="mt-4">
        <Line
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                label: 'Disbursement',
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

      {/* Footer */}
      <div className="grid grid-cols-1 items-center border-t border-gray-200 justify-between mt-5">
        <div className="flex justify-between items-center pt-5">
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="lastDaysdropdown"
            data-dropdown-placement="bottom"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 text-center inline-flex items-center"
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

          {/* Dropdown */}
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

          {/* Report Link */}
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


const SavingsDashboard = () => {
  const stats = [
    { label: 'Total Applications', value: 100, growth: '+10%', icon: <FaMoneyCheckAlt size={24} className="text-blue-500" /> },
    { label: 'Approved Applications', value: 70, growth: '+8%', icon: <FaMoneyCheckAlt size={24} className="text-green-500" /> },
    { label: 'Pending Applications', value: 30, growth: '-2%', icon: <FaMoneyCheckAlt size={24} className="text-yellow-500" /> },
    { label: 'Total Borrowers', value: 90, growth: '+5%', icon: <FaMoneyCheckAlt size={24} className="text-purple-500" /> },
  ];

  return (
    <div className="w-full bg-gray-100 p-6">
      <main className="w-full">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          {stats.map((item, idx) => (
            <div key={idx} className="rounded-lg bg-white p-4 shadow flex items-center">
              <div className="p-2 bg-gray-100 rounded mr-4">{item.icon}</div>
              <div>
                <div className="text-sm font-medium text-gray-500">{item.label}</div>
                <div className="mt-1 text-xl font-bold text-gray-800">
                  <CountUp start={0} end={item.value} duration={2.5} separator="," />
                </div>
                <div className="mt-1 text-sm text-green-500">{item.growth} from last month</div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoanDisbursementCard />
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold text-gray-800">Loan Overview</h3>
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Total Applications',
                    data: [80, 90, 100, 95, 110, 120],
                    borderColor: 'rgba(255,99,132,1)',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                  },
                  {
                    label: 'Approved Applications',
                    data: [50, 60, 70, 65, 80, 90],
                    borderColor: 'rgba(54,162,235,1)',
                    backgroundColor: 'rgba(54,162,235,0.2)',
                  },
                  {
                    label: 'Pending Applications',
                    data: [30, 25, 30, 30, 30, 30],
                    borderColor: 'rgba(255,206,86,1)',
                    backgroundColor: 'rgba(255,206,86,0.2)',
                  },
                  {
                    label: 'Total Borrowers',
                    data: [70, 75, 85, 80, 90, 95],
                    borderColor: 'rgba(153,102,255,1)',
                    backgroundColor: 'rgba(153,102,255,0.2)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } },
                scales: { x: { display: true }, y: { display: true } },
              }}
              height={80}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavingsDashboard;
