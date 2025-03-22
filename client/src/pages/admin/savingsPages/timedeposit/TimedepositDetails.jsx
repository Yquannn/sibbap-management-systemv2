import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaMoneyBillWave, FaHandHoldingUsd, FaHistory } from "react-icons/fa";
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
import { Doughnut, Bar, Line } from "react-chartjs-2";

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

const TimedepositInfo = () => {
  const { memberId } = useParams();
  const [depositData, setDepositData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [modalType, setModalType] = useState(""); // "deposit" or "withdraw"

  const [transactionNumberFilter, setTransactionNumberFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");

  const [selectedChartType, setSelectedChartType] = useState("bar");
  const [selectedGraphFilter, setSelectedGraphFilter] = useState("all");
  const [selectedTimeGroup, setSelectedTimeGroup] = useState("daily");

  // Fetch time deposit data
  useEffect(() => {
    if (!memberId) {
      setError("No memberId provided in the route.");
      setLoading(false);
      return;
    }
    const fetchDepositData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3001/api/timedepositor/${memberId}`
        );
        // Assuming the API returns the time deposit record directly in response.data
        setDepositData(response.data);
      } catch (err) {
        setError("Failed to fetch time deposit data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepositData();
  }, [memberId]);

  // (Optional) Fetch transactions if available. Currently commented out.
  useEffect(() => {
    if (!depositData) return;
    // Implement transaction fetching here if your API provides it.
  }, [depositData]);

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }
  if (error) {
    return <div className="text-center p-6 text-red-600">{error}</div>;
  }
  if (!depositData) {
    return <div className="text-center p-6">No time deposit data found.</div>;
  }

  // Destructure the time deposit record fields.
  const {
    timeDepositId,
    memberId: mId,
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
  } = depositData;

  const availableBalance = amount || 0;

  // (Optional) If you have transactions data, you can use the same grouping/graph logic.
  const filteredTransactions = [...transactions]
    .sort((a, b) => new Date(b.transaction_date_time) - new Date(a.transaction_date_time))
    .filter((tx) => {
      const search = transactionNumberFilter.toLowerCase();
      if (
        transactionNumberFilter.trim() &&
        !tx.transaction_number?.toLowerCase().includes(search)
      ) {
        return false;
      }
      if (
        transactionTypeFilter !== "all" &&
        tx.transaction_type?.toLowerCase() !== transactionTypeFilter
      ) {
        return false;
      }
      return true;
    });

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

  function formatLabel(timestamp, timeGroup) {
    const date = new Date(Number(timestamp));
    switch (timeGroup) {
      case "daily":
        return date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
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

  const grouped = groupTransactionsByTime(transactions, selectedTimeGroup);
  const sortedTimestamps = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);
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
        text: `Time Deposit Transactions (${selectedTimeGroup.charAt(0).toUpperCase() + selectedTimeGroup.slice(1)})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
            });
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
        text: `Time Deposit Transactions (${selectedTimeGroup.charAt(0).toUpperCase() + selectedTimeGroup.slice(1)})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
            });
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
          {/* Deposit Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xl">
              Deposit Amount:{" "}
              <span className="font-bold text-2xl">
                {parseFloat(availableBalance).toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP",
                })}
              </span>
            </p>
            <p className="mt-2">
              Fixed Term: <strong>{fixedTerm} Months</strong>
            </p>
            <p className="mt-2">
              Interest: <strong>{interest}</strong>
            </p>
            <p className="mt-2">
              Payout: <strong>{payout}</strong>
            </p>
            <p className="mt-2">
              Maturity Date:{" "}
              <strong>
                {new Date(maturityDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </p>
            <p className="mt-2">
              Remarks: <strong>{remarks}</strong>
            </p>
          </div>
          {/* Analytics Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                Time Deposit Analytics Over Time
              </h3>
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
                    <option value="savings interest">
                      Savings Interest Only
                    </option>
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
          {/* Transactions Table (if transactions exist) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaHistory className="text-green-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800">
                  Transaction History
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <label
                    htmlFor="txNumberFilter"
                    className="mr-2 font-semibold text-gray-700"
                  >
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
                  <label
                    htmlFor="txTypeFilter"
                    className="mr-2 font-semibold text-gray-700"
                  >
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

        {/* Right Section - Member & Actions */}
        <div className="w-full md:w-96 bg-white p-6 border-l border-gray-200 space-y-6 rounded-lg shadow-lg">
          {/* Simple Member Summary */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-lg font-bold">
              Member ID: {mId}
            </p>
            <p>
              Account Type: {account_type || "N/A"}
            </p>
            <p>
              Remarks: {remarks || "N/A"}
            </p>
          </div>
          {/* Invest / Redeem Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded flex items-center justify-center"
              onClick={() => {
                setModalType("deposit");
                setShowTransactionForm(true);
              }}
            >
              <FaMoneyBillWave className="mr-2" />
              Invest
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded flex items-center justify-center"
              onClick={() => {
                setModalType("withdraw");
                setShowTransactionForm(true);
              }}
            >
              <FaHandHoldingUsd className="mr-2" />
              Redeem
            </button>
          </div>
          {/* Transaction Modal */}
          {showTransactionForm && (
            <TransactionForm
              modalType={modalType}
              member={depositData}
              onClose={() => setShowTransactionForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TimedepositInfo;
