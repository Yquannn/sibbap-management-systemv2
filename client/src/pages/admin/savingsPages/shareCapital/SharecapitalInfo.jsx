import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaUser,
  FaExchangeAlt
} from "react-icons/fa";

const ShareCapitalInfo = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [memberData, setMemberData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalShareCapital, setTotalShareCapital] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // Filters for the transactions table
  const [transactionNumberFilter, setTransactionNumberFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const fetchData = async () => {
    if (!memberId) {
      setError("No memberId provided in the route.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Get share capital data
      const shareCapitalResponse = await axios.get(
        `http://localhost:3001/api/member/share-capital/${memberId}`
      );
      console.log(shareCapitalResponse.data);
      if (shareCapitalResponse.data && shareCapitalResponse.data.success) {
        setTotalShareCapital(parseFloat(shareCapitalResponse.data.total_share_capital) || 0);
        setTransactions(shareCapitalResponse.data.transactions || []);
        
        // Get member details
        const memberDetailsResponse = await axios.get(
          `http://localhost:3001/api/member-info/${memberId}`
        );
        
        if (memberDetailsResponse.data) {
          const memberDetails = memberDetailsResponse.data;
          
          // Calculate share value (you might need to set a default or get this from elsewhere)
          const shareValue = 100; // Default share value if not available
          
          setMemberData({
            ...memberDetails,
            amount: shareCapitalResponse.data.total_share_capital,
            share_capital: shareCapitalResponse.data.total_share_capital, // Adding share_capital field for transaction form
            share_count: parseFloat(shareCapitalResponse.data.total_share_capital) / shareValue,
            share_value: shareValue,
            account_status: memberDetails.accountStatus || memberDetails.status, // Use appropriate status field
          });
        } else {
          setError("Failed to fetch member details.");
        }
      } else {
        setError("Failed to fetch share capital data.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [memberId]);

  // Reset current page when filters or transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactionNumberFilter, transactionTypeFilter, startDateFilter, endDateFilter, transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="text-lg font-medium text-gray-700">Loading data...</div>
          <div className="mt-2 text-sm text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-lg font-medium text-red-700">Error</div>
          <div className="mt-2 text-sm text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-lg font-medium text-yellow-700">No Data Found</div>
          <div className="mt-2 text-sm text-yellow-600">Member information could not be retrieved.</div>
        </div>
      </div>
    );
  }

  // Prepare member info
  const {
    id_picture,
    first_name,
    last_name,
    email,
    memberCode,
    member_type,
    account_status,
    status,
    share_count,
    share_value,
  } = memberData;

  const totalShareCapitalValue = parseFloat(memberData.amount || 0);
  const sharesOwned = share_count || 0;
  const shareValuePerUnit = share_value || 0;
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Use the appropriate status field
  const memberStatus = account_status || status || "Unknown";

  // Apply filters to transactions
  const filteredTransactions = [...transactions]
    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
    .filter((tx) => {
      if (
        transactionNumberFilter.trim() &&
        !tx.transaction_number?.toLowerCase().includes(transactionNumberFilter.toLowerCase())
      ) {
        return false;
      }
      
      if (
        transactionTypeFilter !== "all" &&
        tx.transaction_type?.toLowerCase() !== transactionTypeFilter.toLowerCase()
      ) {
        return false;
      }
      
      const txDate = new Date(tx.transaction_date);
      if (startDateFilter && txDate < new Date(startDateFilter)) return false;
      if (endDateFilter && txDate > new Date(endDateFilter)) return false;
      return true;
    });

  // Pagination calculations
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  // Compute summary totals
  const totalDeposited = filteredTransactions.reduce(
    (acc, tx) => tx.transaction_type?.toLowerCase() === "deposit" ? acc + (parseFloat(tx.amount) || 0) : acc,
    0
  );

  const totalWithdrawn = filteredTransactions.reduce(
    (acc, tx) => tx.transaction_type?.toLowerCase() === "withdraw" ? acc + (parseFloat(tx.amount) || 0) : acc,
    0
  );

  const totalDividends = filteredTransactions.reduce(
    (acc, tx) => tx.transaction_type?.toLowerCase() === "dividend" ? acc + (parseFloat(tx.amount) || 0) : acc,
    0
  );

  // Helper to group transactions by month for analytics
  function groupTransactionsByMonth(data) {
    const map = {};
    data.forEach((tx) => {
      const date = new Date(tx.transaction_date);
      const key = new Date(date.getFullYear(), date.getMonth(), 1).getTime();

      if (!map[key]) {
        map[key] = { deposit: 0, withdraw: 0, dividend: 0, timestamp: key };
      }

      const amt = parseFloat(tx.amount) || 0;
      const type = tx.transaction_type?.toLowerCase();

      if (type === "deposit") {
        map[key].deposit += amt;
      } else if (type === "withdraw") {
        map[key].withdraw += amt;
      } else if (type === "dividend") {
        map[key].dividend += amt;
      }
    });
    return map;
  }

  // Compute monthly changes for analytics
  const monthlyGrouped = groupTransactionsByMonth(filteredTransactions);
  const monthlyKeys = Object.keys(monthlyGrouped)
    .map(Number)
    .sort((a, b) => a - b);

  const computeMonthlyChange = (metric) => {
    if (monthlyKeys.length < 2) return null;
    const prev = monthlyGrouped[monthlyKeys[monthlyKeys.length - 2]][metric];
    const curr = monthlyGrouped[monthlyKeys[monthlyKeys.length - 1]][metric];
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  const depositChange = computeMonthlyChange("deposit");
  const withdrawalChange = computeMonthlyChange("withdraw");
  const dividendChange = computeMonthlyChange("dividend");

  // Calculate net balance change
  const currentBalanceChange = monthlyKeys.length < 2 ? null : (() => {
    const prevMonth = monthlyGrouped[monthlyKeys[monthlyKeys.length - 2]];
    const currMonth = monthlyGrouped[monthlyKeys[monthlyKeys.length - 1]];

    const prevNet = prevMonth.deposit - prevMonth.withdraw + prevMonth.dividend;
    const currNet = currMonth.deposit - currMonth.withdraw + currMonth.dividend;

    if (prevNet === 0) return null;
    return ((currNet - prevNet) / prevNet) * 100;
  })();

  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP"
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Handlers for pagination
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="bg-gray-50 p-4 md:p-6">
      <div className="">
        {/* Member Profile Banner */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {id_picture ? (
                <img
                  src={imageUrl(id_picture)}
                  alt="Profile"
                  className="w-16 h-16 object-cover rounded-full bg-gray-100"
                />
              ) : (
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-medium text-xl bg-gradient-to-br from-blue-500 to-indigo-600"
                >
                  {`${first_name?.charAt(0) || ''}${last_name?.charAt(0) || ''}`}
                </div>
              )}
              <div 
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                  memberStatus?.toLowerCase() === "active" ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {last_name} {first_name}
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                <span>{email || "No Email"}</span>
                <span>Member Code: {memberCode || "N/A"}</span>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                  {member_type || "Unknown Type"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => navigate(`/member-profile/${memberId}`)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <FaUser className="mr-1" size={14} />
              View Full Profile
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section: Balance & Actions */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Current Balance Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <p className="uppercase tracking-wide text-sm font-medium opacity-80">Share Capital</p>
                <p className="mt-1 text-3xl font-bold">{formatCurrency(totalShareCapitalValue)}</p>
                <p className="text-sm opacity-90 mt-1">
                  {sharesOwned.toFixed(2)} {sharesOwned === 1 ? 'share' : 'shares'} @ {formatCurrency(shareValuePerUnit)}/share
                </p>
                {currentBalanceChange !== null && (
                  <div className="flex items-center mt-2 text-xs font-medium">
                    <span className="bg-white bg-opacity-20 rounded-full px-2 py-0.5 flex items-center">
                      {currentBalanceChange >= 0 ? (
                        <FaArrowUp className="mr-1" size={10} />
                      ) : (
                        <FaArrowDown className="mr-1" size={10} />
                      )}
                      <span>{Math.abs(currentBalanceChange).toFixed(1)}% from last month</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total Deposited</p>
                    <p className="font-semibold text-green-600">{formatCurrency(totalDeposited)}</p>
                    {depositChange !== null && (
                      <div className="flex items-center justify-center text-xs mt-1">
                        {depositChange >= 0 ? (
                          <FaArrowUp className="text-green-500 mr-0.5" size={10} />
                        ) : (
                          <FaArrowDown className="text-red-500 mr-0.5" size={10} />
                        )}
                        <span className={depositChange >= 0 ? "text-green-500" : "text-red-500"}>
                          {Math.abs(depositChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total Withdrawn</p>
                    <p className="font-semibold text-red-600">{formatCurrency(totalWithdrawn)}</p>
                    {withdrawalChange !== null && (
                      <div className="flex items-center justify-center text-xs mt-1">
                        {withdrawalChange >= 0 ? (
                          <FaArrowUp className="text-red-500 mr-0.5" size={10} />
                        ) : (
                          <FaArrowDown className="text-green-500 mr-0.5" size={10} />
                        )}
                        <span className={withdrawalChange >= 0 ? "text-red-500" : "text-green-500"}>
                          {Math.abs(withdrawalChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total Dividends</p>
                    <p className="font-semibold text-blue-600">{formatCurrency(totalDividends)}</p>
                    {dividendChange !== null && (
                      <div className="flex items-center justify-center text-xs mt-1">
                        {dividendChange >= 0 ? (
                          <FaArrowUp className="text-green-500 mr-0.5" size={10} />
                        ) : (
                          <FaArrowDown className="text-red-500 mr-0.5" size={10} />
                        )}
                        <span className={dividendChange >= 0 ? "text-green-500" : "text-red-500"}>
                          {Math.abs(dividendChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Deposit button */}
                  <button
                    className="w-1/2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2.5 rounded-lg transition flex items-center justify-center"
                    onClick={() => navigate('/transaction-form', {
                      state: {
                        modalType: 'deposit',
                        member: memberData,
                        isShareCapital: true
                      }
                    })}
                  >
                    <FaMoneyBillWave className="mr-2" size={16} />
                    Deposit
                  </button>

                  {/* Withdraw button */}
                  <button
                    className="w-1/2 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2.5 rounded-lg transition flex items-center justify-center"
                    onClick={() => navigate('/transaction-form', {
                      state: {
                        modalType: 'withdrawal',
                        member: memberData,
                        isShareCapital: true
                      }
                    })}
                  >
                    <FaHandHoldingUsd className="mr-2" size={16} />
                    Withdraw
                  </button>
                </div>
                {/* Transfer button */}
                <div className="mt-2">
                  <button
                    className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2.5 rounded-lg transition flex items-center justify-center"
                    onClick={() => navigate('/transaction-form', {
                      state: {
                        modalType: 'transfer',
                        member: memberData,
                        isShareCapital: true
                      }
                    })}
                  >
                    <FaExchangeAlt className="mr-2" size={16} />
                    Transfer
                  </button>
                </div>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Ownership Level</span>
                    <span className="font-medium">{sharesOwned.toFixed(2)} shares</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, sharesOwned * 2)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Deposit/Withdrawal Ratio</span>
                    <span className="font-medium">
                      {totalWithdrawn > 0 
                        ? (totalDeposited / totalWithdrawn).toFixed(1) 
                        : '∞'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ 
                        width: `${Math.min(100, totalDeposited / (totalDeposited + totalWithdrawn) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Dividend Yield</span>
                    <span className="font-medium">
                      {totalDeposited > 0 
                        ? `${((totalDividends / totalDeposited) * 100).toFixed(2)}%` 
                        : '0%'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (totalDividends / (totalDeposited || 1)) * 1000)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Transactions */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Share Capital Transactions</h2>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <FaFilter className="mr-1" size={14} />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
              {/* Filters Section */}
              {showFilters && (
                <div className="bg-gray-50 p-4 border-b border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="txNumberFilter" className="block text-xs font-medium text-gray-700 mb-1">
                        Transaction Number
                      </label>
                      <input
                        id="txNumberFilter"
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., TXN-1745246778765"
                        value={transactionNumberFilter}
                        onChange={(e) => setTransactionNumberFilter(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="txTypeFilter" className="block text-xs font-medium text-gray-700 mb-1">
                        Transaction Type
                      </label>
                      <select
                        id="txTypeFilter"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={transactionTypeFilter}
                        onChange={(e) => setTransactionTypeFilter(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposit</option>
                        <option value="withdraw">Withdrawal</option>
                        <option value="transfer">Transfer</option>
                        <option value="dividend">Dividend</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="startDateFilter" className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        id="startDateFilter"
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="endDateFilter" className="block text-xs font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        id="endDateFilter"
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* Transactions Table with max height and scroll */}
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Transaction</th>
                      <th className="px-6 py-3 text-left">Date & Time</th>
                      <th className="px-6 py-3 text-left">Type</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-right">Authorized by</th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((tx, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tx.transaction_number || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tx.description || "No description"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(tx.transaction_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.transaction_type?.toLowerCase() === "deposit" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <FaMoneyBillWave className="mr-1" size={12} />
                                Deposit
                              </span>
                            ) : tx.transaction_type?.toLowerCase() === "withdraw" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <FaHandHoldingUsd className="mr-1" size={12} />
                                Withdrawal
                              </span>
                            ) : tx.transaction_type?.toLowerCase() === "dividend" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaMoneyBillWave className="mr-1" size={12} />
                                Dividend
                              </span>
                            ) : tx.transaction_type?.toLowerCase() === "transfer" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <FaExchangeAlt className="mr-1" size={12} />
                                Transfer
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {tx.transaction_type || "N/A"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`text-sm font-medium ${
                              tx.transaction_type?.toLowerCase() === "withdraw" || 
                              (tx.transaction_type?.toLowerCase() === "transfer" && 
                               tx.transferToMemberCode)
                                ? "text-red-600" 
                                : "text-green-600"
                            }`}>
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {tx.authorized_by || "N/A"}
                            </div>
                            </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="font-medium">No transactions found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or check back later</p>
                          </div>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {filteredTransactions.length > 0 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="font-medium">
                      {indexOfFirstTransaction + 1} - {Math.min(indexOfLastTransaction, filteredTransactions.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredTransactions.length}</span> transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                        currentPage === 1 ? "text-gray-400 bg-gray-50" : "text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                        currentPage === totalPages ? "text-gray-400 bg-gray-50" : "text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCapitalInfo;