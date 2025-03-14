import React, { useState, useEffect } from "react";
import { Activity, Clock, Receipt, Megaphone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const LoanPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 'id' represents the memberId from the URL
  const memberId = id || sessionStorage.getItem("memberId");

  // State variables for loan data, loading, and error.
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoanData = async () => {
      if (!memberId) {
        setError("Member ID not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://192.168.254.103:3001/api/member-loan/${memberId}`
        );

        // Log the entire response data
        console.log("Raw response data:", response.data);

        let data;
        if (Array.isArray(response.data) && response.data.length > 0) {
          data = response.data[0];
        } else if (response.data) {
          data = response.data;
        } else {
          setError("No loan data found.");
          return;
        }

        // Log the loan application amount from the fetched data.
        if (data.loanApplications && data.loanApplications.length > 0) {
          console.log("Loan Amount:", data.loanApplications[0].loan_amount);
        }
        
        setLoanData(data);
      } catch (err) {
        console.error("Error fetching loan data:", err);
        setError("Failed to load loan data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, [memberId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!loanData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">No loan found.</p>
      </div>
    );
  }

  // Extract fields from loanData.
  // Assume loanApplications, transactions, and installments might be at the top level.
  const {
    loanApplications,
    transactions = [],
    installments: dataInstallments = []
  } = loanData;

  // Get the first loan application.
  const loanApp = loanApplications && loanApplications.length > 0 ? loanApplications[0] : {};

  // Destructure properties from the loan application.
  // For installments, fallback to dataInstallments in case they aren't part of the loan application.
  const {
    loan_amount = loanApp.loan_amount || "0.00",
    balance = loanApp.balance,
    loan_type = "N/A",
    interest = "0.00",
    terms = 1,
    created_at = new Date().toISOString(),
    status = "Pending",
    client_voucher_number = "",
    first_name = "",
    last_name = "",
    middle_name = "",
    application = [],
    installments = loanApp.installments || dataInstallments
  } = loanApp;

  // Helper to format dates.
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Compute upcoming repayment based solely on the installments.
  let upcomingRepaymentAmount = null;
  let upcomingDueDate = null;
  if (installments && installments.length > 0) {
    // Sort installments by installment_number (ascending).
    const sortedInstallments = [...installments].sort(
      (a, b) => a.installment_number - b.installment_number
    );
    // Find the first installment with a status of "Unpaid"
    const nextUnpaid = sortedInstallments.find(
      (inst) => inst.status.toLowerCase() === "unpaid"
    );
    if (nextUnpaid) {
      upcomingRepaymentAmount = parseFloat(nextUnpaid.amount);
      const dueDateRaw = nextUnpaid.due_date || nextUnpaid.dueDate;
      upcomingDueDate = new Date(dueDateRaw);
    }
  }

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
              ₱{parseFloat(balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
            <span className="text-sm font-medium">Transaction</span>
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
                {upcomingDueDate ? (
                  <>
                    <div className="font-semibold text-lg">
                      ₱
                      {upcomingRepaymentAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-sm text-red-700 font-medium">
                      Due by:{" "}
                      {upcomingDueDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    All payments settled
                  </div>
                )}
              </div>
            </div>
            <button
              className="bg-black text-white px-4 py-2 rounded-md"
              onClick={() => navigate("/loan-information")}
            >
              View loan
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-700">
            Recent transactions
          </div>
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
                    {new Date(txn.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div
                  className={`font-semibold ${
                    txn.amount < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {txn.amount < 0 ? "-" : ""}₱
                  {Math.abs(txn.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                {txn.masked}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-gray-500">
            No transactions found.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoanPage;
