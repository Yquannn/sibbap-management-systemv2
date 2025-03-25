import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle } from "lucide-react";
import TransactionAuthenticate from "./TranscationAuthenticate";
import SuccessComponent from "./Success";

const BASE_URL = "http://localhost:3001/api";

const TransactionForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Retrieve transaction type and member from location state; default to "deposit" if not provided
  const modalType = state?.modalType || "deposit";
  const member = state?.member;

  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(parseFloat(member.amount) || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTransaction = async () => {
    const currentAuthorized = sessionStorage.getItem("username") || "";
    const currentUserType = sessionStorage.getItem("usertype");
    const amountValue = parseFloat(amount);

    try {
      setLoading(true);
      setError(null);

      const payload = {
        memberId: member.memberId,
        authorized: currentAuthorized,
        user_type: currentUserType,
        transaction_type: modalType === "withdrawal" ? "Withdrawal" : "Deposit",
        amount: modalType === "withdrawal" ? Math.abs(amountValue) : amountValue,
      };

      const endpoint = `${BASE_URL}/${modalType === "withdrawal" ? "withdraw" : "deposit"}`;
      const response = await axios.put(endpoint, payload);

      if (response.data.success) {
        const updatedBalance =
          modalType === "withdrawal" ? balance - amountValue : balance + amountValue;
        if (!isNaN(updatedBalance)) {
          setBalance(updatedBalance);
        }
        setShowSuccess(true);
        setAmount("");
      } else {
        alert("Transaction failed. Please try again.");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(
        error.response?.data?.error ||
          "An error occurred while processing the transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionClick = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    if (modalType === "withdrawal" && (balance === 100 || balance - amountValue < 100)) {
      alert("Withdrawal denied: balance must remain at least 100.");
      return;
    }
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    handleTransaction();
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-2xl">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <CreditCard size={20} />
          {modalType === "withdrawal" ? "Withdraw Funds" : "Deposit Funds"}
        </h2>

        {/* Current Balance Display */}
        <div className="mt-4">
          <label className="block text-sm text-gray-600">Current Balance</label>
          <div className="w-full mt-1 p-2 border rounded-2xl bg-gray-100 text-gray-700">
            {balance.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
            })}
          </div>
        </div>

        {/* Transaction Amount Input */}
        <div className="mt-4">
          <label className="block text-sm text-gray-600">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 p-2 border rounded-2xl"
            placeholder="Enter amount"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        <button
          onClick={handleTransactionClick}
          disabled={loading}
          className={`w-full mt-4 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition ${
            modalType === "withdrawal"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <CheckCircle size={18} />
              {modalType === "withdrawal" ? "Withdraw" : "Deposit"}
            </>
          )}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-2 bg-gray-300 text-gray-700 py-2 rounded-lg text-center hover:bg-gray-400 transition"
        >
          Back
        </button>

        {showSuccess && (
          <SuccessComponent
            message={
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={24} className="text-green-500" />
                <span>Transaction successful!</span>
              </div>
            }
            onClose={() => {
              setShowSuccess(false);
              navigate(-1);
            }}
          />
        )}
      </div>

      {showAuthModal && (
        <TransactionAuthenticate
          onAuthenticate={() => {
            setIsAuthenticated(true);
            setShowAuthModal(false);
            handleTransaction();
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default TransactionForm;
