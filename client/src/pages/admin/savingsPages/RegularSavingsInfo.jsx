import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import defaultProfileImage from "./blankPicture.png";

const RegularSavingsInfo = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [memberData, setMemberData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters for the transactions table
  const [transactionNumberFilter, setTransactionNumberFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Fetch member data based on memberId
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
          `http://localhost:3001/api/member/savings/${memberId}`
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

  // Once member data is fetched, get transactions using the member's email
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

  // Prepare address and member info
  const memberAddress =
    " " +
    memberData.city +
    " " +
    memberData.house_no_street +
    " " +
    memberData.barangay;
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
    tin_number,
    account_number
  } = memberData;

  const availableBalance = amount || 0;
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Apply filters to transactions
  const filteredTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.transaction_date_time) - new Date(a.transaction_date_time)
    )
    .filter((tx) => {
      if (
        transactionNumberFilter.trim() &&
        !tx.transaction_number
          ?.toLowerCase()
          .includes(transactionNumberFilter.toLowerCase())
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

  // Compute summary totals
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

  // Helper to group transactions by "monthly" time period for analytics
  function groupTransactionsByTime(data, timeGroup = "monthly") {
    const map = {};
    data.forEach((tx) => {
      const date = new Date(tx.transaction_date_time);
      let key;
      if (timeGroup === "monthly") {
        key = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      } else {
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

  // Compute monthly changes for analytics
  const monthlyGrouped = groupTransactionsByTime(filteredTransactions, "monthly");
  const monthlyKeys = Object.keys(monthlyGrouped)
    .map(Number)
    .sort((a, b) => a - b);

  const computeMonthlyChange = (metric, data) => {
    if (monthlyKeys.length < 2) return null;
    const prev = data[monthlyKeys[monthlyKeys.length - 2]][metric];
    const curr = data[monthlyKeys[monthlyKeys.length - 1]][metric];
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

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

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Section: Combined Card & Transactions */}
        <div className="flex-1 space-y-6">
          {/* Combined Card: Current Balance & Summary Totals */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Current Balance Section */}
            <div className="text-center">
              <p className="text-lg uppercase tracking-wide text-gray-500">
                Current Balance
              </p>
              <p className="mt-2 text-4xl font-bold text-gray-900">
                {parseFloat(availableBalance).toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP"
                })}
              </p>
              {currentBalanceChange !== null && (
                <div className="flex items-center justify-center mt-3">
                  {currentBalanceChange >= 0 ? (
                    <FaArrowUp className="text-green-500" size={16} />
                  ) : (
                    <FaArrowDown className="text-red-500" size={16} />
                  )}
                  <span className={currentBalanceChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(currentBalanceChange).toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  className="bg-white text-green-500 border border-green-500 hover:scale-105 transition px-4 py-2 rounded font-semibold flex items-center shadow"
                  onClick={() =>
                    navigate(`/regular-savings-deposit/${memberId}`, {
                      state: { modalType: "deposit", member: memberData }
                    })
                  }
                >
                  <FaMoneyBillWave className="mr-2" />
                  Deposit
                </button>
                <button
                  className="bg-white text-red-500 border border-red-500 hover:scale-105 transition px-4 py-2 rounded font-semibold flex items-center shadow"
                  onClick={() =>
                    navigate(`/regular-savings-withdrawal/${memberId}`, {
                      state: { modalType: "withdrawal", member: memberData }
                    })
                  }
                >
                  <FaHandHoldingUsd className="mr-2" />
                  Withdraw
                </button>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-8 border-gray-200" />

            {/* Summary Totals Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-500">Total Deposited</p>
                <p className="font-bold text-2xl text-green-500">
                  {totalDeposited.toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP"
                  })}
                </p>
                {depositChange !== null && (
                  <div className="flex items-center justify-center">
                    {depositChange >= 0 ? (
                      <FaArrowUp className="text-green-500" size={16} />
                    ) : (
                      <FaArrowDown className="text-red-500" size={16} />
                    )}
                    <span className={depositChange >= 0 ? "text-green-500" : "text-red-500"}>
                      {Math.abs(depositChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Withdrawn</p>
                <p className="font-bold text-2xl text-red-500">
                  {totalWithdrawal.toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP"
                  })}
                </p>
                {withdrawChange !== null && (
                  <div className="flex items-center justify-center">
                    {withdrawChange >= 0 ? (
                      <FaArrowUp className="text-green-500" size={16} />
                    ) : (
                      <FaArrowDown className="text-red-500" size={16} />
                    )}
                    <span className={withdrawChange >= 0 ? "text-green-500" : "text-red-500"}>
                      {Math.abs(withdrawChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Interest</p>
                <p className="font-bold text-2xl text-blue-500">
                  {totalInterest.toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP"
                  })}
                </p>
                {interestChange !== null && (
                  <div className="flex items-center justify-center">
                    {interestChange >= 0 ? (
                      <FaArrowUp className="text-green-500" size={16} />
                    ) : (
                      <FaArrowDown className="text-red-500" size={16} />
                    )}
                    <span className={interestChange >= 0 ? "text-green-500" : "text-red-500"}>
                      {Math.abs(interestChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center">
                <label htmlFor="txNumberFilter" className="mr-2 font-semibold text-gray-700">
                  Filter by Txn No:
                </label>
                <input
                  id="txNumberFilter"
                  type="text"
                  className="border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="savings interest">Savings Interest</option>
                </select>
              </div>
              <div className="flex items-center">
                <label htmlFor="startDateFilter" className="mr-2 font-semibold text-gray-700">
                  Start Date:
                </label>
                <input
                  id="startDateFilter"
                  type="date"
                  className="border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
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
                          {tx.authorized || "Sibbap System"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.user_type || "Automated System"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.transaction_type?.toLowerCase() === "deposit" ? (
                            <span className="flex items-center gap-1">
                              <FaMoneyBillWave className="text-green-500" size={16} />
                              <span className="font-semibold text-green-500">Deposit</span>
                            </span>
                          ) : tx.transaction_type?.toLowerCase() === "withdrawal" ? (
                            <span className="flex items-center gap-1">
                              <FaHandHoldingUsd className="text-red-500" size={16} />
                              <span className="font-semibold text-red-500">Withdrawal</span>
                            </span>
                          ) : tx.transaction_type?.toLowerCase() === "savings interest" ? (
                            <span className="flex items-center gap-1">
                              <FaMoneyBillWave className="text-blue-500" size={16} />
                              <span className="font-semibold text-blue-500">Savings Interest</span>
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

        {/* Right Section: Profile */}
        <div className="w-full md:w-96 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={id_picture ? imageUrl(id_picture) : defaultProfileImage}
              alt="Profile"
              className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {last_name} {first_name}
              </h2>
              <p className="text-gray-500 text-sm">{email || "No Email"}</p>
              <p className="text-gray-500 text-sm">
                {account_number || "No Account Number"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="space-y-3 text-gray-700 text-sm">
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
                { label: "Age", value: age },
                { label: "Civil Status", value: civil_status },
                { label: "Contact Number", value: contact_number },
                { label: "Address", value: address },
                { label: "Membership Status", value: membership_status },
                { label: "Account Status", value: account_status },
                { label: "Account Number", value: account_number },
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
                <div key={index} className="flex justify-between border-b border-gray-200 py-1">
                  <span className="font-medium">{item.label}:</span>
                  <span>{item.value || "N/A"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularSavingsInfo;
