import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaHistory,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import defaultProfileImage from "./blankPicture.png";
import TransactionForm from "./utils/TransactionForm";

// Import from react-chartjs-2 and chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

// Register chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
);

const RegularSavingsInfo = () => {
  const { memberId } = useParams();
  const [memberData, setMemberData] = useState();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [modalType, setModalType] = useState(""); // "deposit" or "withdrawal"

  // For filtering transactions in the table
  const [transactionNumberFilter, setTransactionNumberFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // State for selecting chart type (bar or line)
  const [selectedChartType, setSelectedChartType] = useState("bar");
  // State for filtering graph data ("all", "deposit", "withdrawal", or "savings interest")
  const [selectedGraphFilter, setSelectedGraphFilter] = useState("all");
  // State for time grouping filter ("daily", "weekly", "monthly", "quarterly", "annually")
  const [selectedTimeGroup, setSelectedTimeGroup] = useState("daily");

  // Fetch member data
  useEffect(() => {
    if (!memberId) {
      setError("No memberId provided in the route.");
      setLoading(false);
      return;
    }
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3001/api/members/savings/${memberId}`
        );
        setMemberData(response.data.data);
      } catch (err) {
        setError("Failed to fetch member data.");
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, [memberId]);

  // Fetch transactions using the email from memberData
  useEffect(() => {
    if (!memberData) return;
    const email = memberData.email;
    if (!email) {
      setError("Email not found. Please log in.");
      return;
    }
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3001/api/member/email/${email}`
        );
        if (response.data && response.data.transactions) {
          setTransactions(response.data.transactions);
        } else {
          throw new Error("No transactions found.");
        }
      } catch (err) {
        setError(err.message || "Error fetching transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [memberData]);

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }
  if (error) {
    return <div className="text-center p-6 text-red-600">{error}</div>;
  }
  if (!memberData) {
    return <div className="text-center p-6">No member data found.</div>;
  }

  const memberAddress =
    " " +
    memberData.city +
    " " +
    memberData.house_no_street +
    " " +
    memberData.barangay;
  // Destructure personal info from memberData
  const {
    id_picture,
    first_name,
    last_name,
    email,
    date_of_birth,
    age,
    amount,
    civil_status,
    contact_number,
    address = memberAddress,
    membership_status,
    account_status,
    tax_id,
    occupation,
    annual_income,
    highest_education_attainment,
    tin_number
  } = memberData;

  const availableBalance = amount || 0;
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Apply filters to transactions
  const filteredTransactions = [...transactions]
    .sort((a, b) => new Date(b.transaction_date_time) - new Date(a.transaction_date_time))
    .filter((tx) => {
      if (
        transactionNumberFilter.trim() &&
        !tx.transaction_number?.toLowerCase().includes(transactionNumberFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        transactionTypeFilter !== "all" &&
        tx.transaction_type?.toLowerCase() !== transactionTypeFilter
      ) {
        return false;
      }
      const txDate = new Date(tx.transaction_date_time);
      if (startDateFilter && txDate < new Date(startDateFilter)) return false;
      if (endDateFilter && txDate > new Date(endDateFilter)) return false;
      return true;
    });

  // Compute totals from filtered transactions
  const totalDeposited = filteredTransactions.reduce((acc, tx) => {
    return tx.transaction_type?.toLowerCase() === "deposit"
      ? acc + (parseFloat(tx.amount) || 0)
      : acc;
  }, 0);

  const totalWithdrawal = filteredTransactions.reduce((acc, tx) => {
    return tx.transaction_type?.toLowerCase() === "withdrawal"
      ? acc + (parseFloat(tx.amount) || 0)
      : acc;
  }, 0);

  const totalInterest = filteredTransactions.reduce((acc, tx) => {
    return tx.transaction_type?.toLowerCase() === "savings interest"
      ? acc + (parseFloat(tx.amount) || 0)
      : acc;
  }, 0);

  // Helper: Group transactions by given time range
  function groupTransactionsByTime(data, timeGroup) {
    const map = {};
    data.forEach((tx) => {
      const date = new Date(tx.transaction_date_time);
      let key;
      switch (timeGroup) {
        case "daily":
          date.setHours(0, 0, 0, 0);
          key = date.getTime();
          break;
        case "weekly": {
          const firstDayOfWeek = new Date(date);
          const diff = firstDayOfWeek.getDay() === 0 ? -6 : 1 - firstDayOfWeek.getDay();
          firstDayOfWeek.setDate(firstDayOfWeek.getDate() + diff);
          firstDayOfWeek.setHours(0, 0, 0, 0);
          key = firstDayOfWeek.getTime();
          break;
        }
        case "monthly":
          key = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
          break;
        case "quarterly": {
          const quarter = Math.floor(date.getMonth() / 3);
          key = new Date(date.getFullYear(), quarter * 3, 1).getTime();
          break;
        }
        case "annually":
          key = new Date(date.getFullYear(), 0, 1).getTime();
          break;
        default:
          date.setHours(0, 0, 0, 0);
          key = date.getTime();
      }
      if (!map[key]) {
        map[key] = { deposit: 0, withdraw: 0, interest: 0, timestamp: key };
      }
      const amt = parseFloat(tx.amount) || 0;
      const type = tx.transaction_type?.toLowerCase();
      if (type === "deposit") {
        map[key].deposit += amt;
      } else if (type === "withdrawal") {
        map[key].withdraw += amt;
      } else if (type === "savings interest") {
        map[key].interest += amt;
      }
    });
    return map;
  }

  // Use monthly grouping (for percentage change) on filtered transactions
  const monthlyGrouped = groupTransactionsByTime(filteredTransactions, "monthly");
  const monthlyKeys = Object.keys(monthlyGrouped).map(Number).sort((a, b) => a - b);

  // Helper to compute percentage change for a given metric from monthly data
  const computeMonthlyChange = (metric, data) => {
    if (monthlyKeys.length < 2) return null;
    const prev = data[monthlyKeys[monthlyKeys.length - 2]][metric];
    const curr = data[monthlyKeys[monthlyKeys.length - 1]][metric];
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  // Compute net change for "Current Balance" (deposit - withdrawal + interest)
  const computeNet = (data) => data.deposit - data.withdraw + data.interest;
  const currentBalanceChange =
    monthlyKeys.length < 2
      ? null
      : (() => {
          const prevNet = computeNet(monthlyGrouped[monthlyKeys[monthlyKeys.length - 2]]);
          const currNet = computeNet(monthlyGrouped[monthlyKeys[monthlyKeys.length - 1]]);
          if (prevNet === 0) return null;
          return ((currNet - prevNet) / prevNet) * 100;
        })();

  const depositChange = computeMonthlyChange("deposit", monthlyGrouped);
  const withdrawChange = computeMonthlyChange("withdraw", monthlyGrouped);
  const interestChange = computeMonthlyChange("interest", monthlyGrouped);

  // Prepare grouping and chart data based on selectedTimeGroup (using filteredTransactions)
  function formatLabel(timestamp, timeGroup) {
    const date = new Date(Number(timestamp));
    switch (timeGroup) {
      case "daily":
        return date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
      case "weekly":
        return "Week of " + date.toLocaleDateString("en-US");
      case "monthly":
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      case "quarterly": {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return "Q" + quarter + " " + date.getFullYear();
      }
      case "annually":
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString("en-US");
    }
  }

  const grouped = groupTransactionsByTime(filteredTransactions, selectedTimeGroup);
  const sortedTimestamps = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);
  const labels = sortedTimestamps.map((ts) =>
    formatLabel(ts, selectedTimeGroup)
  );
  const depositDataArr = sortedTimestamps.map((ts) => grouped[ts].deposit);
  const withdrawDataArr = sortedTimestamps.map((ts) => grouped[ts].withdraw);
  const interestDataArr = sortedTimestamps.map((ts) => grouped[ts].interest);

  const chartDatasetsBar = [];
  const chartDatasetsLine = [];
  if (selectedGraphFilter === "all" || selectedGraphFilter === "deposit") {
    chartDatasetsBar.push({
      label: "Deposits",
      data: depositDataArr,
      backgroundColor: "#4ade80"
    });
    chartDatasetsLine.push({
      label: "Deposits",
      data: depositDataArr,
      borderColor: "#4ade80",
      backgroundColor: "#4ade80",
      fill: false,
      tension: 0.1,
      pointRadius: 3
    });
  }
  if (selectedGraphFilter === "all" || selectedGraphFilter === "withdrawal") {
    chartDatasetsBar.push({
      label: "Withdrawals",
      data: withdrawDataArr,
      backgroundColor: "#f87171"
    });
    chartDatasetsLine.push({
      label: "Withdrawals",
      data: withdrawDataArr,
      borderColor: "#f87171",
      backgroundColor: "#f87171",
      fill: false,
      tension: 0.1,
      pointRadius: 3
    });
  }
  if (selectedGraphFilter === "all" || selectedGraphFilter === "savings interest") {
    chartDatasetsBar.push({
      label: "Savings Interest",
      data: interestDataArr,
      backgroundColor: "#60a5fa"
    });
    chartDatasetsLine.push({
      label: "Savings Interest",
      data: interestDataArr,
      borderColor: "#60a5fa",
      backgroundColor: "#60a5fa",
      fill: false,
      tension: 0.1,
      pointRadius: 3
    });
  }

  const barData = {
    labels,
    datasets: chartDatasetsBar
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Transactions (${selectedTimeGroup.charAt(0).toUpperCase() + selectedTimeGroup.slice(1)})`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP"
            });
          }
        }
      }
    }
  };

  const lineData = {
    labels,
    datasets: chartDatasetsLine
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Transactions (${selectedTimeGroup.charAt(0).toUpperCase() + selectedTimeGroup.slice(1)})`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP"
            });
          }
        }
      }
    }
  };

  return (
    <div className="bg-gray-100">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Section */}
        <div className="flex-1 space-y-4">
          {/* Total Balance Section */}
          {/* <div className="flex items-center">
                <label htmlFor="startDateFilter" className="mr-2 font-semibold text-gray-700">
                  Start Date:
                </label>
                <input
                  id="startDateFilter"
                  type="date"
                  className="border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="endDateFilter" className="mr-2 font-semibold text-gray-700">
                  End Date:
                </label>
                <input
                  id="endDateFilter"
                  type="date"
                  className="border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div> */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-wrap items-center justify-around">
          
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="font-semibold text-2xl">
                {parseFloat(availableBalance).toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP"
                })}
              </p>
              {currentBalanceChange !== null && (
                <div className="flex items-center">
                  {currentBalanceChange >= 0 ? (
                    <FaArrowUp className="text-green-500" size={14} />
                  ) : (
                    <FaArrowDown className="text-red-500" size={14} />
                  )}
                  <span className={currentBalanceChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(currentBalanceChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Total Deposited</p>
              <p className="font-semibold text-2xl">
                {totalDeposited.toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP"
                })}
              </p>
              {depositChange !== null && (
                <div className="flex items-center">
                  {depositChange >= 0 ? (
                    <FaArrowUp className="text-green-500" size={14} />
                  ) : (
                    <FaArrowDown className="text-red-500" size={14} />
                  )}
                  <span className={depositChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(depositChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Total Withdrawn</p>
              <p className="font-semibold text-2xl">
                {totalWithdrawal.toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP"
                })}
              </p>
              {withdrawChange !== null && (
                <div className="flex items-center">
                  {withdrawChange >= 0 ? (
                    <FaArrowUp className="text-green-500" size={14} />
                  ) : (
                    <FaArrowDown className="text-red-500" size={14} />
                  )}
                  <span className={withdrawChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(withdrawChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Total Interest</p>
              <p className="font-semibold text-2xl">
                {totalInterest.toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP"
                })}
              </p>
              {interestChange !== null && (
                <div className="flex items-center">
                  {interestChange >= 0 ? (
                    <FaArrowUp className="text-green-500" size={14} />
                  ) : (
                    <FaArrowDown className="text-red-500" size={14} />
                  )}
                  <span className={interestChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(interestChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Analytics Over Time</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <label htmlFor="chartTypeFilter" className="mr-2 font-semibold">
                    Chart Type:
                  </label>
                  <select
                    id="chartTypeFilter"
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={selectedChartType}
                    onChange={(e) => setSelectedChartType(e.target.value)}
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label htmlFor="graphDataFilter" className="mr-2 font-semibold">
                    Graph Data:
                  </label>
                  <select
                    id="graphDataFilter"
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={selectedGraphFilter}
                    onChange={(e) => setSelectedGraphFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="deposit">Deposit Only</option>
                    <option value="withdrawal">Withdrawal Only</option>
                    <option value="savings interest">Savings Interest Only</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label htmlFor="timeGroupFilter" className="mr-2 font-semibold">
                    Time Group:
                  </label>
                  <select
                    id="timeGroupFilter"
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={selectedTimeGroup}
                    onChange={(e) => setSelectedTimeGroup(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="relative w-full h-72">
              {selectedChartType === "bar" ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <Line data={lineData} options={lineOptions} />
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Additional Filters: Date Range */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center">
                <label htmlFor="txNumberFilter" className="mr-2 font-semibold text-gray-700">
                  Filter by Txn No:
                </label>
                <input
                  id="txNumberFilter"
                  type="text"
                  className="border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g., TXN12345"
                  value={transactionNumberFilter}
                  onChange={(e) => setTransactionNumberFilter(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="txTypeFilter" className="mr-2 font-semibold text-gray-700">
                  Transaction Type:
                </label>
                <select
                  id="txTypeFilter"
                  className="border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="savings interest">Savings Interest</option>
                </select>
              </div>
              
            </div>
            <div className="overflow-y-auto max-h-64">
              <table className="w-full text-sm text-left">
                <thead className="bg-green-100">
                  <tr>
                    <th className="py-3 px-4">Txn No</th>
                    <th className="py-3 px-4">Date Created</th>
                    <th className="py-3 px-4">Authorized By</th>
                    <th className="py-3 px-4">User Type</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount (PHP)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions && filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx, index) => (
                      <tr key={index} className="border-b hover:bg-green-50">
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.transaction_number || "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.transaction_date_time
                            ? new Date(tx.transaction_date_time).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true
                              })
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.authorized || "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.user_type || "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.transaction_type?.toLowerCase() === "deposit" ? (
                            <span className="flex items-center">
                              <FaMoneyBillWave className="mr-1 text-green-500" size={16} />
                              <span className="text-green-500 font-semibold">Deposit</span>
                            </span>
                          ) : tx.transaction_type?.toLowerCase() === "withdrawal" ? (
                            <span className="flex items-center">
                              <FaHandHoldingUsd className="mr-1 text-red-500" size={16} />
                              <span className="text-red-500 font-semibold">Withdrawal</span>
                            </span>
                          ) : tx.transaction_type?.toLowerCase() === "savings interest" ? (
                            <span className="flex items-center">
                              <FaMoneyBillWave className="mr-1 text-blue-500" size={16} />
                              <span className="text-blue-500 font-semibold">Savings Interest</span>
                            </span>
                          ) : (
                            tx.transaction_type || "N/A"
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.amount
                            ? parseFloat(tx.amount).toLocaleString("en-PH", {
                                style: "currency",
                                currency: "PHP"
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Section - Profile & Actions */}
        <div className="w-full md:w-96 bg-white p-6 border-l border-gray-200 space-y-6 rounded-lg shadow-lg">
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <img
              src={id_picture ? imageUrl(id_picture) : defaultProfileImage}
              alt="Profile"
              className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
            />
            <div>
              <h2 className="text-lg font-semibold">
                {last_name} {first_name}
              </h2>
              <p className="text-gray-500 text-sm">{email || "No Email"}</p>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Personal Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {[
                {
                  label: "Date of Birth",
                  value: date_of_birth
                    ? new Date(date_of_birth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "N/A"
                },
                { label: "Age", value: memberData.age },
                { label: "Civil Status", value: civil_status },
                { label: "Contact Number", value: contact_number },
                { label: "Address", value: address },
                { label: "Membership Status", value: membership_status },
                { label: "Account Status", value: account_status },
                { label: "Tax ID", value: tax_id },
                { label: "Occupation", value: occupation },
                {
                  label: "Annual Income",
                  value: annual_income
                    ? parseFloat(annual_income).toLocaleString("en-PH", {
                        style: "currency",
                        currency: "PHP"
                      })
                    : "N/A"
                },
                { label: "Highest Education", value: highest_education_attainment },
                { label: "TIN Number", value: tin_number }
              ].map((item, index) => (
                <div key={index} className="flex justify-between border-b py-2 last:border-b-0">
                  <span className="font-medium text-gray-700">{item.label}:</span>
                  <span className="text-gray-900">{item.value || "N/A"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit / Withdraw Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded flex items-center justify-center"
              onClick={() => {
                setModalType("deposit");
                setShowTransactionForm(true);
              }}
            >
              <FaMoneyBillWave className="mr-2" />
              Deposit
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded flex items-center justify-center"
              onClick={() => {
                setModalType("withdrawal");
                setShowTransactionForm(true);
              }}
            >
              <FaHandHoldingUsd className="mr-2" />
              Withdraw
            </button>
          </div>

          {/* Transaction Modal */}
          {showTransactionForm && (
            <TransactionForm
              modalType={modalType}
              member={memberData}
              onClose={() => setShowTransactionForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularSavingsInfo;
