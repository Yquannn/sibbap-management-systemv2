import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaHistory,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import TransactionForm from "../utils/TransactionForm";
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
  PointElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

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

const TimedepositDetails = () => {
  const { timeDepositId } = useParams();
  const [depositData, setDepositData] = useState(null);
  const [transactions, setTransactions] = useState([]); // Assume transactions are fetched if available.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [modalType, setModalType] = useState(""); // "deposit" or "withdrawal"

  // Filter states
  const [transactionNumberFilter, setTransactionNumberFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");

  // Chart options states
  const [selectedChartType, setSelectedChartType] = useState("bar");
  const [selectedGraphFilter, setSelectedGraphFilter] = useState("all");
  const [selectedTimeGroup, setSelectedTimeGroup] = useState("daily");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch time deposit data using timeDepositId from URL.
  useEffect(() => {
    const fetchDepositData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3001/api/timedepositor/${timeDepositId}`
        );
        console.log("API response:", response.data);
        // Check if the API response is an array or an object
        if (Array.isArray(response.data)) {
          if (response.data.length > 0) {
            setDepositData(response.data[0]);
          } else {
            setDepositData(null);
          }
        } else if (response.data) {
          setDepositData(response.data);
        } else {
          setDepositData(null);
        }
      } catch (err) {
        console.error("Error fetching time deposit data:", err);
        setError("Failed to fetch time deposit data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepositData();
  }, [timeDepositId]);

  // (Optional) Fetch transactions if available.
  useEffect(() => {
    if (!depositData) return;
    // If your API provides transactions as part of depositData, you can set them here:
    // setTransactions(depositData.transactions || []);
  }, [depositData]);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-600">{error}</div>;
  if (!depositData)
    return <div className="text-center p-6">No time deposit data found.</div>;

  // Destructure fields from depositData (joined time_deposit and member fields)
  const {
    memberId: mId,
    memberCode,
    amount,
    fixedTerm,
    interest,
    payout,
    maturityDate,
    remarks,
    account_type,
    co_last_name,
    co_middle_name,
    co_first_name,
    co_extension_name,
    co_date_of_birth,
    co_place_of_birth,
    co_age,
    co_gender,
    co_civil_status,
    co_contact_number,
    co_relationship_primary,
    co_complete_address,
    id_picture,
    email,
    last_name,
    first_name,
    middle_name,
    extension_name,
    date_of_birth,
    civil_status,
    contact_number,
    age,
    house_no_street,
    barangay,
    city,
    membership_status,
    account_status,
    tax_id,
    occupation,
    annual_income,
    highest_education_attainment,
    tin_number,
    place_of_birth,
  } = depositData;

  const availableBalance = amount || 0;
  const address = `${house_no_street ? house_no_street + ", " : ""}${
    barangay ? barangay + ", " : ""
  }${city ? city : ""}`.trim();

  const defaultProfileImageURL = "https://via.placeholder.com/64";
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : defaultProfileImageURL;

  // Calculate initials for profile placeholder if no image exists.
  const initials = `${first_name ? first_name.charAt(0) : ""}${
    last_name ? last_name.charAt(0) : ""
  }`.toUpperCase();

  // Filter transactions based on filter inputs
  const filteredTransactions = [...transactions]
    .sort((a, b) => new Date(b.transaction_date_time) - new Date(a.transaction_date_time))
    .filter((tx) => {
      const search = transactionNumberFilter.toLowerCase();
      if (transactionNumberFilter.trim() && !tx.transaction_number?.toLowerCase().includes(search))
        return false;
      if (transactionTypeFilter !== "all" && tx.transaction_type?.toLowerCase() !== transactionTypeFilter)
        return false;
      return true;
    });

  // Helper: group transactions by time (for charts and monthly percentage change)
  function groupTransactionsByTime(transactions, timeGroup) {
    const map = {};
    transactions.forEach((tx) => {
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

  // For monthly percentage change calculations we group filtered transactions by month.
  const monthlyGrouped = groupTransactionsByTime(filteredTransactions, "monthly");
  const monthlyKeys = Object.keys(monthlyGrouped).map(Number).sort((a, b) => a - b);

  // Helper to compute percentage change for a metric from monthly data.
  const computeMonthlyChange = (metric, data) => {
    if (monthlyKeys.length < 2) return null;
    const prev = data[monthlyKeys[monthlyKeys.length - 2]][metric];
    const curr = data[monthlyKeys[monthlyKeys.length - 1]][metric];
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  // For current balance, net flow = deposit – withdrawal + interest.
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

  // Prepare chart data using grouping based on selectedTimeGroup.
  function formatLabel(timestamp, timeGroup) {
    const date = new Date(Number(timestamp));
    switch (timeGroup) {
      case "daily":
        return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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

  const grouped = groupTransactionsByTime(transactions, selectedTimeGroup);
  const sortedTimestamps = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const labels = sortedTimestamps.map((ts) => formatLabel(ts, selectedTimeGroup));
  const depositDataChart = sortedTimestamps.map((ts) => grouped[ts].deposit);
  const withdrawData = sortedTimestamps.map((ts) => grouped[ts].withdraw);
  const interestData = sortedTimestamps.map((ts) => grouped[ts].interest);

  const chartDatasetsBar = [];
  const chartDatasetsLine = [];
  if (selectedGraphFilter === "all" || selectedGraphFilter === "deposit") {
    chartDatasetsBar.push({
      label: "Deposits",
      data: depositDataChart,
      backgroundColor: "#4ade80",
    });
    chartDatasetsLine.push({
      label: "Deposits",
      data: depositDataChart,
      borderColor: "#4ade80",
      backgroundColor: "#4ade80",
      fill: false,
      tension: 0.1,
      pointRadius: 3,
    });
  }
  if (selectedGraphFilter === "all" || selectedGraphFilter === "withdrawal") {
    chartDatasetsBar.push({
      label: "Withdrawals",
      data: withdrawData,
      backgroundColor: "#f87171",
    });
    chartDatasetsLine.push({
      label: "Withdrawals",
      data: withdrawData,
      borderColor: "#f87171",
      backgroundColor: "#f87171",
      fill: false,
      tension: 0.1,
      pointRadius: 3,
    });
  }
  if (selectedGraphFilter === "all" || selectedGraphFilter === "savings interest") {
    chartDatasetsBar.push({
      label: "Savings Interest",
      data: interestData,
      backgroundColor: "#60a5fa",
    });
    chartDatasetsLine.push({
      label: "Savings Interest",
      data: interestData,
      borderColor: "#60a5fa",
      backgroundColor: "#60a5fa",
      fill: false,
      tension: 0.1,
      pointRadius: 3,
    });
  }

  const barData = {
    labels,
    datasets: chartDatasetsBar,
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Time Deposit Transactions (${
          selectedTimeGroup.charAt(0).toUpperCase() + selectedTimeGroup.slice(1)
        })`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
          },
        },
      },
    },
  };

  const lineData = {
    labels,
    datasets: chartDatasetsLine,
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Time Deposit Transactions (${
          selectedTimeGroup.charAt(0).toUpperCase() + selectedTimeGroup.slice(1)
        })`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
          },
        },
      },
    },
  };

  return (
    <div className="bg-gray-100">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Section - Deposit Info & Analytics */}
        <div className="flex-1 space-y-4">
          {/* Balance Summary Section */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-wrap items-center justify-around">
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Principal Amount</p>
              <p className="font-semibold text-2xl">
                {parseFloat(availableBalance).toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP",
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
              <p className="text-sm text-gray-500">Time Deposit Term</p>
              <p className="font-semibold text-2xl">{fixedTerm || "N/A"}</p>
            </div>
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Maturity Date</p>
              <p className="font-semibold text-2xl">
                {maturityDate
                  ? new Date(maturityDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Interest</p>
              <p className="font-semibold text-2xl">
                {interest
                  ? parseFloat(interest).toLocaleString("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    })
                  : "0.00"}
              </p>
            </div>
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Payout</p>
              <p className="font-semibold text-2xl">
                {payout
                  ? parseFloat(payout).toLocaleString("en-PH", {
                      style: "currency",
                      currency: "PHP",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="flex flex-col items-center m-2">
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="font-semibold text-2xl">Pre-mature</p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaHistory className="text-green-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800">Transaction History</h3>
              </div>
              <div className="flex flex-wrap items-center gap-4">
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
                                hour12: true,
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
                          {tx.transaction_type || "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.amount
                            ? parseFloat(tx.amount).toLocaleString("en-PH", {
                                style: "currency",
                                currency: "PHP",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center">
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
            {id_picture ? (
              <img
                src={imageUrl(id_picture)}
                alt="Profile"
                className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold border-2 border-gray-300">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {last_name} {first_name}
              </h2>
              <p className="text-gray-500 text-sm">{memberCode || "No Email"}</p>
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
                        day: "numeric",
                      })
                    : "N/A",
                },
                { label: "Age", value: age || "N/A" },
                { label: "Civil Status", value: civil_status || "N/A" },
                { label: "Contact Number", value: contact_number || "N/A" },
                { label: "Address", value: address || "N/A" },
                { label: "Place of Birth", value: place_of_birth || "N/A" },
              ].map((item, index) => (
                <div key={index} className="flex justify-between border-b py-2 last:border-b-0">
                  <span className="font-medium text-gray-700">{item.label}:</span>
                  <span className="text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Deposit / Withdraw Buttons */}
          <div className="flex flex-col space-y-2">
            {/* Early Withdrawal: Withdrawal action (red, withdrawal icon) */}
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded flex items-center justify-center"
              onClick={() => {
                setModalType("withdrawal");
                setShowTransactionForm(true);
              }}
            >
              <FaHandHoldingUsd className="mr-2" />
              Early Withdrawal
            </button>
            {/* Roll Over: Deposit action (green, deposit icon) */}
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded flex items-center justify-center"
              onClick={() => {
                setModalType("deposit");
                setShowTransactionForm(true);
              }}
            >
              <FaMoneyBillWave className="mr-2" />
              Roll Over
            </button>
            {/* Maturity Withdrawal: Withdrawal action (red, withdrawal icon) */}
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded flex items-center justify-center"
              onClick={() => {
                setModalType("withdrawal");
                setShowTransactionForm(true);
              }}
            >
              <FaHandHoldingUsd className="mr-2" />
              Maturity Withdrawal
            </button>
          </div>

          {/* Transaction Modal */}
          {showTransactionForm && (
            <TransactionForm
              modalType={modalType}
              member={depositData}
              onClose={() => setShowTransactionForm(false)}
              onSuccess={(msg) => {
                setShowTransactionForm(false);
                setSuccessMessage(msg || "Transaction successful!");
                setShowSuccessModal(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TimedepositDetails;
