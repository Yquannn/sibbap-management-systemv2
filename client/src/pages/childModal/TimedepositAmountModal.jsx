import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3001/api";

const AmountModal = ({ member, modalType, onClose }) => {
  const [amount, setAmount] = useState("");
  const [fixedTerm, setFixedTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [computation, setComputation] = useState({
    maturityDate: "",
    interest: 0,
    payout: 0,
    interestRate: 0,
  });

  // Calculate Interest Rate
  const calculateInterestRate = (amount, termMonths) => {
    if (termMonths === 6) {
      if (amount >= 10000 && amount <= 100000) return 0.0075;
      if (amount > 100000 && amount <= 200000) return 0.01;
      if (amount > 200000 && amount <= 300000) return 0.0175;
      if (amount > 300000 && amount <= 400000) return 0.0225;
      if (amount > 400000 && amount <= 500000) return 0.025;
      if (amount > 500000 && amount <= 1000000) return 0.025;
      if (amount > 1000000) return 0.025;
    } else if (termMonths === 12) {
      if (amount >= 10000 && amount <= 100000) return 0.01;
      if (amount > 100000 && amount <= 200000) return 0.015;
      if (amount > 200000 && amount <= 300000) return 0.02;
      if (amount > 300000 && amount <= 400000) return 0.0275;
      if (amount > 400000 && amount <= 500000) return 0.03;
      if (amount > 500000 && amount <= 1000000) return 0.0325;
      if (amount > 1000000) return 0.06;
    }
    return 0;
  };

  // Update Computation when Amount or FixedTerm Changes
  useEffect(() => {
    if (amount && fixedTerm) {
      const principal = parseFloat(amount);
      const termMonths = parseInt(fixedTerm, 10);
      const interestRate = calculateInterestRate(principal, termMonths);

      const days = termMonths === 6 ? 181 : 365;
      const interest = principal * interestRate * (days / 365);
      const payout = principal + interest;

      const currentDate = new Date();
      const maturityDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + termMonths)
      );

      setComputation({
        maturityDate: maturityDate.toLocaleDateString(),
        interest: interest.toFixed(2),
        payout: payout.toFixed(2),
        interestRate: interestRate * 100,
      });
    }
  }, [amount, fixedTerm]);

  // Handle Transaction
  const handleTransaction = async () => {
    if (!amount || !fixedTerm) {
      setError("Amount and Fixed Term are required.");
      return;
    }

    if (!member?.memberId) {
      setError("Member ID is required to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Send POST request to create a new time deposit
      await axios.post(`${BASE_URL}/timedeposit`, {
        memberId: member.memberId,
        amount: parseFloat(amount),
        fixedTerm: parseInt(fixedTerm, 10),
      });

      // 2. Send PUT request to update the depositor's status
      await axios.put(`${BASE_URL}/time-deposits/update-depositors`, {
        memberId: member.memberId,
        amount: parseFloat(amount),
        fixedTerm: parseInt(fixedTerm, 10),
      });

      alert("Deposit Successful!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {modalType === "withdraw" ? "Withdraw Funds" : "Deposit Funds"}
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Display Member Code */}
        <div className="mb-4">
          <p className="text-center text-gray-700 font-medium">
            <strong>Code Number:</strong> {member?.memberCode || "N/A"}
          </p>
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="amount"
          >
            Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter amount"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="fixedTerm"
          >
            Fixed Term (Months)
          </label>
          <select
            id="fixedTerm"
            value={fixedTerm}
            onChange={(e) => setFixedTerm(e.target.value)}
            className="mt-1 px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a term</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
          </select>
        </div>

        <div className="mb-4 bg-gray-100 p-4 rounded-md">
          <p className="text-sm">Computation:</p>
          <p>
            Maturity Date: <strong>{computation.maturityDate || "-"}</strong>
          </p>
          <p>
            Interest: <strong>{computation.interest}</strong>
          </p>
          <p>
            Interest Rate (%): <strong>{computation.interestRate || "-"}</strong>
          </p>
          <p>
            Payout: <strong>{computation.payout}</strong>
          </p>
        </div>

        <div className="flex justify-between space-x-3">
          <button
            onClick={handleTransaction}
            disabled={loading}
            className={`w-1/2 py-2 px-4 text-white font-semibold rounded-lg shadow hover:opacity-80 focus:outline-none 
              ${modalType === "withdraw" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processing..." : modalType === "withdraw" ? "Withdraw" : "Deposit"}
          </button>
          <button
            onClick={onClose}
            className="w-1/2 py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-400 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmountModal;
