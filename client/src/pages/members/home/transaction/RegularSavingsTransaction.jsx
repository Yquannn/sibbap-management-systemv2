import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, CreditCard, Banknote, PiggyBank, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment-timezone";

const RegularSavingsTransactionHistory = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const email = useMemo(() => localStorage.getItem("userEmail"), []);

  const filterMapping = {
    All: "All",
    Deposit: "Deposit",
    Withdrawal: "Withdrawal",
    "Savings Interest": "Savings Interest",
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!email) {
        setError("Email not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          ` http://192.168.254.114:3001/api/member/email/${email}`
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
  }, [email]);

  const filteredTransactions =
    filter === "All"
      ? transactions
      : transactions.filter(
          (txn) => txn.transaction_type === filterMapping[filter]
        );

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) =>
      new Date(b.transaction_date_time) - new Date(a.transaction_date_time)
  );

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "Deposit":
        return <CreditCard className="text-green-600" size={20} />;
      case "Withdrawal":
        return <Banknote className="text-red-600" size={20} />;
      default:
        return <PiggyBank className="text-blue-600" size={20} />;
    }
  };

  return (
    <div className="">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center p-4">
            <button
              className="text-gray-700 hover:text-black focus:outline-none"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold mx-auto">Transaction History</h1>
            <button 
              className="text-gray-700 hover:text-black focus:outline-none" 
              onClick={toggleFilter}
            >
              <Filter size={20} />
            </button>
          </div>
          
          {/* Filter Section - Conditionally rendered */}
          {isFilterOpen && (
            <div className="flex overflow-x-auto py-2 px-4 gap-2 border-t border-gray-100 bg-gray-50">
              {Object.keys(filterMapping).map((category) => (
                <button
                  key={category}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                    filter === category
                      ? "bg-green-600 text-white font-medium shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                  onClick={() => {
                    setFilter(category);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`pt-16 ${isFilterOpen ? 'pt-28' : 'pt-16'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50rounded-lg mt-4">
            <p className="text-center text-red-600">{error}</p>
          </div>
        ) : sortedTransactions.length > 0 ? (
          <div className="space-y-3 mt-2">
            {sortedTransactions.map((txn) => (
              <div
                key={txn.regular_savings_transaction_id}
                className="bg-white rounded-lg mb-4 shadow p-2"
                onClick={() =>
                  navigate(
                    `/regular-savings-transaction-info/${txn.regular_savings_transaction_id}`
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100  rounded-full">
                      {getTransactionIcon(txn.transaction_type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{txn.transaction_type}</p>
                      <p className="text-xs text-gray-500">
                        {moment
                          .utc(txn.transaction_date_time)
                          .tz("Asia/Manila")
                          .format("MMM D, YYYY • h:mm A")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        txn.transaction_type === "Withdrawal"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {txn.transaction_type === "Withdrawal" ? "−" : "+"}₱
                      {Math.abs(txn.amount)
                        .toFixed(2)
                        .replace(/\d(?=(\d{3})+\.)/g, "$&,")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    #{txn.transaction_number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <PiggyBank size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">No transactions found for this filter.</p>
            {filter !== "All" && (
              <button 
                className="mt-2 text-green-600 text-sm font-medium"
                onClick={() => setFilter("All")}
              >
                Show all transactions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegularSavingsTransactionHistory;