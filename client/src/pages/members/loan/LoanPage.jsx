import React, { useState, useEffect } from "react";
import { Activity, Clock, Receipt, Megaphone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const LoanPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 'id' represents the memberId from the URL
  // Fallback: If id is null, try to get it from sessionStorage.
  const memberId = id || sessionStorage.getItem("memberId");

  // State variables for loan data, loading, and error.
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch loan data from backend API on component mount.
  useEffect(() => {
    const fetchLoanData = async () => {
      // Ensure member id exists before making the request.
      if (!memberId) {
        setError("Member ID not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://192.168.254.103:3001/api/member-loan-application/${memberId}`
        );

        // If the API returns an array, pick the first element.
        if (Array.isArray(response.data) && response.data.length > 0) {
          setLoanData(response.data[0]);
        } else if (response.data) {
          setLoanData(response.data);
        } else {
          setError("No loan data found.");
        }
      } catch (err) {
        console.error("Error fetching loan data:", err);
        // setError("Failed to load loan data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, [memberId]);

  // Log loanData for debugging.
  useEffect(() => {
  }, [loanData]);

  // Show a loading indicator while data is being fetched.
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show an error message if there was an error.
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // If no loan data is available, show a "No loan found" message.
  if (!loanData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">No loan found.</p>
      </div>
    );
  }

  // Destructure the fetched data with default values.
  const {
    loan_amount = "0.00",
    balance = "0.00",
    loan_type = "N/A",
    interest = "0.00",
    terms = 1,
    created_at = new Date().toISOString(),
    status = "Pending",
    client_voucher_number = "",
    first_name = "",
    last_name = "",
    middle_name = "",
    transactions = [],
  } = loanData || {};

  // Compute upcoming repayment amount.
  const principal = parseFloat(loan_amount);
  const interestValue = parseFloat(interest);
  const upcomingRepaymentAmount =
    terms > 0 ? principal + (principal * interestValue) / 100 : principal;

  // Compute a due date (30 days after loan creation).
  const createdDate = new Date(created_at);
  const dueDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Loan</h2>
      </div>

      <div className="max-w-md mx-auto">
        {/* Top Card: Loan Amount / Balance */}
        <motion.div className="snap-center shrink-0 w-[300px] mx-auto mb-6">
          <div className="bg-green-600 text-white p-6 rounded-lg w-full shadow">
            <p className="text-sm text-gray-100">Total Loan Amount</p>
            <p className="text-4xl font-bold">
              ₱{principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <hr className="my-3 border-t border-white/30" />
            <div className="flex items-center justify-between">
              <button
                className="text-white text-sm font-semibold"
                onClick={() => navigate("/member-regular-savings-transaction")}
              >
                View Details
              </button>
            </div>
          </div>
        </motion.div>

        {/* Row of Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <button
            className="flex flex-col items-center justify-center bg-white p-2 rounded-lg shadow"
            onClick={() => navigate("/member-loan-tracker")}
          >
            <Activity className="w-6 h-6 text-green-600 mb-1" />
            <span className="text-sm font-medium">Tracker</span>
          </button>

          <button
            className="flex flex-col items-center justify-center bg-white p-2 rounded-lg shadow"
            onClick={() => navigate("/loan-history")}
          >
            <Clock className="w-6 h-6 text-green-600 mb-1" />
            <span className="text-sm font-medium">History</span>
          </button>

          <button
            className="flex flex-col items-center justify-center bg-white p-2 rounded-lg shadow"
            onClick={() => navigate("/member-bills")}
          >
            <Receipt className="w-6 h-6 text-green-600 mb-1" />
            <span className="text-sm font-medium">Bills</span>
          </button>
        </div>

        {/* Upcoming Repayment */}
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-2 mb-4 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Megaphone className="text-red-600 text-2xl mr-3" />
              <div>
                <div className="text-sm">Upcoming Repayment</div>
                <div className="font-semibold text-lg">
                  ₱{upcomingRepaymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-red-700 font-medium">
                  Due by: {dueDate.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                </div>
              </div>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-md"
              onClick={() => navigate('/loan-information')}
            >
              View loan
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-700">Recent transactions</div>
        </div>
        {transactions.length > 0 ? (
          transactions.map((txn) => (
            <div key={txn.id} className="bg-white rounded-lg p-4 mb-4 shadow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {txn.description}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(txn.date).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}
                  </div>
                </div>
                <div className={`font-semibold ${txn.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                  {txn.amount < 0 ? "-" : ""}₱{Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                {txn.masked}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-gray-500">No transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default LoanPage;
