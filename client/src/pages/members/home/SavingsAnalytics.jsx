import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import {
  Calendar,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  Filter,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavingsAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    transactions: [],
    monthlyTotals: [],
    summary: {
      totalDeposits: 0,
      totalWithdrawals: 0,
      netSavings: 0,
      growthRate: 0,
      currentBalance: 0
    }
  });
  const [timeframe, setTimeframe] = useState("6months");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Process transaction data for visualization
  const processTransactionData = (transactions, currentBalance) => {
    // Check if transactions exist and are in an array
    if (!Array.isArray(transactions) || transactions.length === 0) {
      setError("No transaction data available");
      setLoading(false);
      return;
    }

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) =>
      new Date(a.transactionDate) - new Date(b.transactionDate)
    );

    // Group transactions by month for monthly totals
    const monthlyData = sortedTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          deposits: 0,
          withdrawals: 0,
          balance: 0
        };
      }

      if (transaction.transactionType === "deposit") {
        acc[monthYear].deposits += transaction.amount;
      } else if (transaction.transactionType === "withdrawal") {
        acc[monthYear].withdrawals += transaction.amount;
      }

      return acc;
    }, {});

    // Convert monthly data object into an array while calculating a running balance
    let runningBalance = 0;
    const monthlyTotals = Object.values(monthlyData).map(month => {
      runningBalance += (month.deposits - month.withdrawals);
      return {
        ...month,
        balance: runningBalance
      };
    });

    // Calculate summary statistics based on all transactions
    const totalDeposits = sortedTransactions.reduce(
      (sum, t) => t.transactionType === "deposit" ? sum + t.amount : sum,
      0
    );
    const totalWithdrawals = sortedTransactions.reduce(
      (sum, t) => t.transactionType === "withdrawal" ? sum + t.amount : sum,
      0
    );
    const netSavings = totalDeposits - totalWithdrawals;

    // Calculate growth rate (if there are at least 2 months)
    let growthRate = 0;
    if (monthlyTotals.length >= 2) {
      const firstMonth = monthlyTotals[0].balance;
      const lastMonth = monthlyTotals[monthlyTotals.length - 1].balance;
      if (firstMonth > 0) {
        growthRate = ((lastMonth - firstMonth) / firstMonth) * 100;
      }
    }

    setAnalyticsData({
      transactions: sortedTransactions,
      monthlyTotals,
      summary: {
        totalDeposits,
        totalWithdrawals,
        netSavings,
        growthRate,
        currentBalance
      }
    });
    setLoading(false);
  };

  // Fetch transaction data from API
  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true);
      try {
        // Get the user's email from localStorage
        const email = localStorage.getItem("userEmail");
        if (!email) {
          throw new Error("User email not found. Please log in again.");
        }

        console.log("Fetching data for email:", email);

        // Make API call which returns transactions and (optionally) currentBalance
        const response = await axios.get(
          `http://192.168.254.100:3001/api/member/email/${email}`
        );

        console.log("API Response:", response.data);

        if (response.data && response.data.transactions) {
          const transactions = response.data.transactions;
          const currentBalance = response.data.currentBalance || 0;
          processTransactionData(transactions, currentBalance);
        } else if (response.data && response.data.member && response.data.member.transactions) {
          // Handle different response structure - nested member object
          const transactions = response.data.member.transactions;
          const currentBalance = response.data.member.currentBalance || 0;
          processTransactionData(transactions, currentBalance);
        } else {
          throw new Error("No transactions found in the response.");
        }
      } catch (err) {
        console.error("Error fetching transaction data:", err);
        setError(err.message || "Error fetching transaction data.");
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [timeframe]);

  // Filter transactions based on selected timeframe
  useEffect(() => {
    if (analyticsData.transactions.length > 0) {
      const now = new Date();
      let startDate = new Date();
      
      // Set start date based on selected timeframe
      if (timeframe === "3months") {
        startDate.setMonth(now.getMonth() - 3);
      } else if (timeframe === "6months") {
        startDate.setMonth(now.getMonth() - 6);
      } else if (timeframe === "1year") {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Filter transactions within the selected timeframe
      const filteredTransactions = analyticsData.transactions.filter(
        transaction => new Date(transaction.transactionDate) >= startDate
      );
      
      // Process the filtered transactions
      processTransactionData(
        filteredTransactions, 
        analyticsData.summary.currentBalance
      );
    }
  }, [timeframe, analyticsData.transactions]);

  if (loading) {
    return (
      <div className="">
        <div className="flex items-center justify-center p-4 relative">
          <button
            className="absolute left-4 flex items-center text-gray-700 hover:text-black"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold">Savings Analytics</h1>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error && analyticsData.monthlyTotals.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow min-h-screen">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="w-5 h-5 text-green-600" />
          </button>
          <h2 className="text-lg font-semibold">Savings Analytics</h2>
        </div>
        <div className="text-center text-red-500 p-4">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header with Back Button */}
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="w-5 h-5 text-green-600" />
        </button>
        <h2 className="text-lg font-semibold">Savings Analytics</h2>
      </div>
      
      {/* Time Frame Selector */}
      <div className="flex items-center justify-end mb-4">
        <Calendar className="text-gray-500 w-4 h-4 mr-1" />
        <select
          className="text-sm border rounded-md px-2 py-1"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Current Balance Card */}
      <div className="bg-green-600 text-white rounded-lg p-4 mb-4 shadow">
        <p className="text-sm">Current Savings Balance</p>
        <p className="text-2xl font-bold">
          ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(analyticsData.summary.currentBalance)}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-green-50 rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Total Deposits</p>
              <p className="text-lg font-bold">
                ₱{new Intl.NumberFormat("en-PH").format(analyticsData.summary.totalDeposits)}
              </p>
            </div>
            <ArrowUp className="text-green-500 w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Total Withdrawals</p>
              <p className="text-lg font-bold">
                ₱{new Intl.NumberFormat("en-PH").format(analyticsData.summary.totalWithdrawals)}
              </p>
            </div>
            <ArrowDown className="text-red-500 w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Net Savings</p>
              <p className="text-lg font-bold">
                ₱{new Intl.NumberFormat("en-PH").format(analyticsData.summary.netSavings)}
              </p>
            </div>
            <Filter className="text-blue-500 w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Growth Rate</p>
              <p className="text-lg font-bold">
                {analyticsData.summary.growthRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="text-purple-500 w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts */}
      {analyticsData.monthlyTotals.length > 0 ? (
        <>
          <div className="mb-6 bg-gray-50 p-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium mb-2">Savings Balance Over Time</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyTotals} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value) => [`₱${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }} 
                    name="Balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-6 bg-gray-50 p-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium mb-2">Monthly Deposits vs Withdrawals</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.monthlyTotals} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value) => [`₱${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="deposits" fill="#10b981" name="Deposits" />
                  <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No transaction data available for the selected timeframe.</p>
        </div>
      )}

      {/* View All Transactions */}
      <div className="mt-4 text-center">
        <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
          View All Transactions History
        </button>
      </div>
    </div>
  );
};

export default SavingsAnalytics;