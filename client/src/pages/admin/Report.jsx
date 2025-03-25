import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

// Sample static revenue data (one record per month for 2024)
const sampleRevenueData = [
  { date: "2024-01-15", serviceFee: 1000, interest: 2000, penalty: 500 },
  { date: "2024-02-15", serviceFee: 1500, interest: 2500, penalty: 700 },
  { date: "2024-03-15", serviceFee: 1200, interest: 2300, penalty: 600 },
  { date: "2024-04-15", serviceFee: 1800, interest: 2800, penalty: 800 },
  { date: "2024-05-15", serviceFee: 1700, interest: 2600, penalty: 750 },
  { date: "2024-06-15", serviceFee: 2000, interest: 3000, penalty: 900 },
  { date: "2024-07-15", serviceFee: 2100, interest: 3100, penalty: 950 },
  { date: "2024-08-15", serviceFee: 1900, interest: 2900, penalty: 850 },
  { date: "2024-09-15", serviceFee: 2200, interest: 3200, penalty: 1000 },
  { date: "2024-10-15", serviceFee: 2300, interest: 3300, penalty: 1050 },
  { date: "2024-11-15", serviceFee: 2400, interest: 3400, penalty: 1100 },
  { date: "2024-12-15", serviceFee: 2500, interest: 3500, penalty: 1150 },
];

// Helper function to aggregate data by time grouping
const aggregateData = (data, grouping) => {
  const groups = {};

  data.forEach((record) => {
    const date = new Date(record.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    let key = "";
    let label = "";

    switch (grouping) {
      case "Monthly":
        key = `${year}-${month + 1}`;
        label = new Date(year, month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        break;
      case "Quarterly": {
        const quarter = Math.floor(month / 3) + 1;
        key = `${year}-Q${quarter}`;
        label = `Q${quarter} ${year}`;
        break;
      }
      case "Semi Annually": {
        const half = month < 6 ? "H1" : "H2";
        key = `${year}-${half}`;
        label = `${half} ${year}`;
        break;
      }
      case "Annually":
        key = `${year}`;
        label = `${year}`;
        break;
      default:
        key = `${year}-${month + 1}`;
        label = new Date(year, month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
    }

    if (!groups[key]) {
      groups[key] = { label, serviceFee: 0, interest: 0, penalty: 0 };
    }
    groups[key].serviceFee += record.serviceFee;
    groups[key].interest += record.interest;
    groups[key].penalty += record.penalty;
  });

  // Sort groups by key (which should be sortable by time)
  const sortedKeys = Object.keys(groups).sort();
  const labels = sortedKeys.map((key) => groups[key].label);
  const serviceFees = sortedKeys.map((key) => groups[key].serviceFee);
  const interests = sortedKeys.map((key) => groups[key].interest);
  const penalties = sortedKeys.map((key) => groups[key].penalty);

  return { labels, serviceFees, interests, penalties };
};

// Helper to format currency values
const formatCurrency = (value) =>
  Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const LoanRevenueReport = () => {
  const [timeGroup, setTimeGroup] = useState("Monthly");

  // Aggregate data based on the selected grouping
  const aggregated = useMemo(
    () => aggregateData(sampleRevenueData, timeGroup),
    [timeGroup]
  );

  // Calculate overall totals
  const totalServiceFee = aggregated.serviceFees.reduce((sum, val) => sum + val, 0);
  const totalInterest = aggregated.interests.reduce((sum, val) => sum + val, 0);
  const totalPenalty = aggregated.penalties.reduce((sum, val) => sum + val, 0);

  const data = {
    labels: aggregated.labels,
    datasets: [
      {
        label: "Accumulated Service Fee",
        data: aggregated.serviceFees,
        borderColor: "#4ade80",
        backgroundColor: "#4ade80",
        fill: false,
        tension: 0.2,
        pointRadius: 3,
      },
      {
        label: "Accumulated Interest",
        data: aggregated.interests,
        borderColor: "#60a5fa",
        backgroundColor: "#60a5fa",
        fill: false,
        tension: 0.2,
        pointRadius: 3,
      },
      {
        label: "Accumulated Penalty Paid",
        data: aggregated.penalties,
        borderColor: "#f87171",
        backgroundColor: "#f87171",
        fill: false,
        tension: 0.2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Loan Revenue Report",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            value.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
            }),
        },
      },
    },
  };

  return (
    <div className="bg-gray-100 p-6">
      
      {/* Filter Dropdown */}
      <div className="flex justify-center mb-6">
        <select
          value={timeGroup}
          onChange={(e) => setTimeGroup(e.target.value)}
          className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Semi Annually">Semi Annually (6 months)</option>
          <option value="Annually">Annually (Yearly)</option>
        </select>
      </div>
      
      {/* Summary Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">Total Service Fee</h2>
          <p className="text-2xl font-bold text-green-600">
            ₱{formatCurrency(totalServiceFee)}
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">Total Interest</h2>
          <p className="text-2xl font-bold text-blue-600">
            ₱{formatCurrency(totalInterest)}
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">Total Penalty Paid</h2>
          <p className="text-2xl font-bold text-red-600">
            ₱{formatCurrency(totalPenalty)}
          </p>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative w-full h-96 bg-white rounded-lg shadow-md p-4">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LoanRevenueReport;
