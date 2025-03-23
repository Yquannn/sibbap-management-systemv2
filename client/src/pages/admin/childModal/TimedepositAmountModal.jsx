import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SuccessModal from "../loanPages/components/SuccessModal";

const BASE_URL = "http://localhost:3001/api";

// Helper function to format numbers with commas and two decimals.
const formatNumber = (num) => {
  if (isNaN(num)) return "";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const TimedepositAmountModal = ({ member, modalType, onClose, formData }) => {
  // Get memberId from URL params if not provided via member prop.
  const { memberId: paramMemberId } = useParams();
  const navigate = useNavigate();

  const [rawAmount, setRawAmount] = useState("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const displayedAmount =
    !isAmountFocused && rawAmount !== "" && !isNaN(rawAmount)
      ? formatNumber(parseFloat(rawAmount))
      : rawAmount;
  const [fixedTerm, setFixedTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [computation, setComputation] = useState({
    maturityDate: "",
    interest: 0,
    payout: 0,
    interestRate: 0,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Calculate the interest rate based on the deposit amount and term.
  const calculateInterestRate = (amount, termMonths) => {
    if (termMonths === 6) {
      if (amount >= 10000 && amount <= 100000) return 0.0075;
      if (amount > 100000 && amount <= 200000) return 0.01;
      if (amount > 200000 && amount <= 300000) return 0.0175;
      if (amount > 300000 && amount <= 400000) return 0.0225;
      if (amount > 400000 && amount <= 500000) return 0.025;
      if (amount > 500000 && amount <= 1000000) return 0.025;
      if (amount > 1000000) return 0.06;
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

  useEffect(() => {
    if (rawAmount && fixedTerm) {
      const principal = parseFloat(rawAmount);
      const termMonths = parseInt(fixedTerm, 10);
      const interestRate = calculateInterestRate(principal, termMonths);
      // Assuming 6-month term uses 181 days, otherwise 365 days.
      const days = termMonths === 6 ? 181 : 365;
      const interest = principal * interestRate * (days / 365);
      const payout = principal + interest;
      const currentDate = new Date();
      const maturityDate = new Date(currentDate.setMonth(currentDate.getMonth() + termMonths));

      setComputation({
        // Store maturity date as ISO string (YYYY-MM-DD)
        maturityDate: maturityDate.toISOString().slice(0, 10),
        interest: formatNumber(interest),
        payout: formatNumber(payout),
        interestRate: formatNumber(interestRate * 100),
      });
    }
  }, [rawAmount, fixedTerm]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    setRawAmount(value);
  };

  const handleAmountFocus = () => setIsAmountFocused(true);
  const handleAmountBlur = () => {
    setIsAmountFocused(false);
    const num = parseFloat(rawAmount);
    if (!isNaN(num)) {
      setRawAmount(num.toString());
    }
  };

  // Build payload mapping the formData keys (camelCase) to the expected API keys.
  const buildPayload = () => {
    return {
      memberId: member?.memberId || paramMemberId,
      amount: parseFloat(rawAmount),
      fixedTerm: parseInt(fixedTerm, 10),
      interest: computation.interest
        ? parseFloat(computation.interest.replace(/,/g, ""))
        : 0,
      payout: computation.payout
        ? parseFloat(computation.payout.replace(/,/g, ""))
        : 0,
      maturityDate: computation.maturityDate || new Date().toISOString().slice(0, 10),
      account_type: formData.accountType || null,
      last_name: formData.coLastName || null,
      middle_name: formData.coMiddleName || null,
      first_name: formData.coFirstName || null,
      extension_name: formData.coExtension || null,
      date_of_birth: formData.coDOB || null,
      place_of_birth: formData.coPlaceOfBirth || null,
      age: formData.coAge || null,
      gender: formData.coGender || null,
      civil_status: formData.coCivilStatus || null,
      contact_number: formData.coContactNumber || null,
      relationship_primary: formData.coRelationship || null,
      complete_address: formData.coCompleteAddress || null,
    };
  };

  const handleTransaction = async () => {
    if (!rawAmount || !fixedTerm) {
      setError("Amount and Fixed Term are required.");
      return;
    }
    const id = member?.memberId || paramMemberId;
    if (!id) {
      setError("Member ID is required to proceed.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = buildPayload();
      console.log("Payload:", payload);
      await axios.post(`${BASE_URL}/timedeposit`, payload);
      // Instead of alerting, show the success modal.
      setShowSuccessModal(true);
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // This function handles closing the success modal and redirects the page.
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Redirect to the time deposit page
    navigate("/time-deposit");
  };

  return (
    <>
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
          <div className="mb-4">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <input
              id="amount"
              type="text"
              value={displayedAmount}
              onChange={handleAmountChange}
              onFocus={handleAmountFocus}
              onBlur={handleAmountBlur}
              className="mt-1 px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter amount"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="fixedTerm"
              className="block text-sm font-medium text-gray-700"
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
              Maturity Date:{" "}
              <strong>{computation.maturityDate || "-"}</strong>
            </p>
            <p>
              Interest: <strong>{computation.interest}</strong>
            </p>
            <p>
              Interest Rate (%):{" "}
              <strong>{computation.interestRate || "-"}</strong>
            </p>
            <p>
              Payout: <strong>{computation.payout}</strong>
            </p>
          </div>
          <div className="flex justify-between space-x-3">
            <button
              onClick={handleTransaction}
              disabled={loading}
              className={`w-1/2 py-2 px-4 text-white font-semibold rounded-lg shadow hover:opacity-80 focus:outline-none ${
                modalType === "withdraw"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading
                ? "Processing..."
                : modalType === "withdraw"
                ? "Withdraw"
                : "Deposit"}
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
      {showSuccessModal && (
        <SuccessModal
          message="Deposit Successful!"
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
};

export default TimedepositAmountModal;
