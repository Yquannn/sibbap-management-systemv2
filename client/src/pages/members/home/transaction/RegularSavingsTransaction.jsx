import React, { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Banknote, Hash, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment-timezone";

const RegularSavingsTransactionHistory = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = localStorage.getItem("userEmail");

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
          `http://192.168.254.103:3001/api/member/email/${email}`
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
      : transactions.filter((txn) => txn.transaction_type === filterMapping[filter]);

  // Sort by transaction_date_time (newest first) without mutating state
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.transaction_date_time) - new Date(a.transaction_date_time)
  );

  // const totalBalance = Array.isArray(transactions)
  //   ? transactions.reduce((acc, txn) => {
  //       const amount = Number(txn.amount) || 0; 
  //       return txn.transaction_type === "Withdrawal" ? acc - amount : acc + amount;
  //     }, 0)
  //   : 0;
    
  return (
    <div className="max-w-lg mx-auto">
      <div className="header">
        <button className="flex items-center text-gray-700 hover:text-black mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Regular Savings Transaction History</h2>
        </div>

        <div className="flex space-x-2 mb-4">
          {Object.keys(filterMapping).map((category) => (
            <button
              key={category}
              className={`px-3 py-0.5 rounded-lg text-sm ${
                filter === category ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading transactions...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {txn.transaction_type === "Deposit" ? (
                    <CreditCard className="text-green-500" size={24} />
                  ) : txn.transaction_type === "Withdrawal" ? (
                    <Banknote className="text-red-500" size={24} />
                  ) : (
                    <PiggyBank className="text-green-500" size={24} />
                  )}
                  <div>
                    <p className="font-medium">{txn.transaction_type}</p>
                    <p className="text-sm text-gray-500">
                      {moment.utc(txn.transaction_date_time)
                        .tz("Asia/Manila")
                        .format("MMMM D, YYYY • hh:mm")}
                    </p>

                    <div className="flex items-center text-xs text-gray-400">
                      <Hash size={14} className="mr-1" />
                      {txn.transaction_number}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${txn.transaction_type === "Withdrawal" ? "text-red-500" : "text-green-500"}`}>
                    {txn.transaction_type === "Withdrawal" ? "−" : "+"}₱{Math.abs(txn.amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions found.</p>
          )}
        </div>
      )}

      {/* <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-500 text-sm">Total Balance</p>
        <p className="text-lg font-bold">₱{totalBalance.toLocaleString()}</p>
      </div> */}
    </div>
  );
};

export default RegularSavingsTransactionHistory;
