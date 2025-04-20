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

const TimedepositAmountModal = ({ member, modalType = "deposit", onClose, formData }) => {
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
    // Ensure amount and termMonths are valid numbers
    const parsedAmount = parseFloat(amount);
    const parsedTermMonths = parseInt(termMonths, 10);

    if (isNaN(parsedAmount) || isNaN(parsedTermMonths)) return 0;

    if (parsedTermMonths === 6) {
      if (parsedAmount >= 10000 && parsedAmount <= 100000) return 0.0075;
      if (parsedAmount > 100000 && parsedAmount <= 200000) return 0.01;
      if (parsedAmount > 200000 && parsedAmount <= 300000) return 0.0175;
      if (parsedAmount > 300000 && parsedAmount <= 400000) return 0.0225;
      if (parsedAmount > 400000 && parsedAmount <= 500000) return 0.025;
      if (parsedAmount > 500000 && parsedAmount <= 1000000) return 0.0325;
      if (parsedAmount > 1000000) return 0.035;
    } else if (parsedTermMonths === 12) {
      if (parsedAmount >= 10000 && parsedAmount <= 100000) return 0.01;
      if (parsedAmount > 100000 && parsedAmount <= 200000) return 0.015;
      if (parsedAmount > 200000 && parsedAmount <= 300000) return 0.02;
      if (parsedAmount > 300000 && parsedAmount <= 400000) return 0.0275;
      if (parsedAmount > 400000 && parsedAmount <= 500000) return 0.03;
      if (parsedAmount > 500000 && parsedAmount <= 1000000) return 0.035;
      if (parsedAmount > 1000000) return 0.04;
    }
    return 0;
  };

  const principal = parseFloat(rawAmount) || 0;
  const termMonths = parseInt(fixedTerm, 10) || 0;
  const interestRate = calculateInterestRate(principal, termMonths);

  useEffect(() => {
    if (principal && termMonths) {
      // Assuming 6-month term uses 182 days, otherwise 365 days.
      const days = termMonths === 6 ? 182 : 365;
      const interest = principal * interestRate * (days / 365);
      const payout = principal + interest;
      // Create a new date instance to avoid mutating the current date
      const currentDate = new Date();
      const maturityDate = new Date(currentDate);
      maturityDate.setMonth(maturityDate.getMonth() + termMonths);

      setComputation({
        // Store maturity date as ISO string (YYYY-MM-DD)
        maturityDate: maturityDate.toISOString().slice(0, 10),
        interest: formatNumber(interest),
        payout: formatNumber(payout),
        // Ensure interestRate is converted to percentage and formatted
        interestRate: formatNumber(interestRate * 100),
      });
    }
  }, [principal, termMonths, interestRate]);

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

  const userName = sessionStorage.getItem("username");
  const userType = sessionStorage.getItem("usertype");

  // Build payload mapping the formData keys to the expected API keys
  const buildPayload = () => {
    // Check if there's co-maker information based on account type or has_co_maker flag
    const hasCoMaker =
      formData.account_type !== "INDIVIDUAL" &&
      (formData.has_co_maker || formData.co_last_name);

    return {
      memberId: member?.memberId || paramMemberId,
      amount: parseFloat(rawAmount) || 0,
      authorized_by: userName,
      user_type: userType,
      fixedTerm: parseInt(fixedTerm, 10) || 0,
      // Ensure interestRate is parsed as a number and defaults to 0
      interest_rate: parseFloat(computation.interestRate) || 0, 
      // Remove commas and parse as number, default to 0
      interest: computation.interest
        ? parseFloat(computation.interest.replace(/,/g, ""))
        : 0,
      // Remove commas and parse as number, default to 0
      payout: computation.payout
        ? parseFloat(computation.payout.replace(/,/g, ""))
        : 0,
      maturityDate: computation.maturityDate || new Date().toISOString().slice(0, 10),
      account_type: formData.account_type || null,
      // Handle co-maker information: send null if doesn't exist or individual account
      co_last_name: hasCoMaker ? formData.co_last_name : null,
      co_middle_name: hasCoMaker ? formData.co_middle_name : null,
      co_first_name: hasCoMaker ? formData.co_first_name : null,
      co_extension_name: hasCoMaker ? formData.co_extension_name : null,
      co_date_of_birth: hasCoMaker ? formData.co_date_of_birth : null,
      co_place_of_birth: hasCoMaker ? formData.co_place_of_birth : null,
      co_age: hasCoMaker ? formData.co_age : null,      
      co_gender: hasCoMaker ? formData.co_gender : null,
      co_civil_status: hasCoMaker ? formData.co_civil_status : null,
      co_contact_number: hasCoMaker ? formData.co_contact_number : null,
      co_relationship_primary: hasCoMaker ? formData.co_relationship_primary : null,
      co_complete_address: hasCoMaker ? formData.co_complete_address : null,
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

  // Modal background colors based on action type
  const actionColor = modalType === "withdraw" ? "red" : "blue";
  const actionBgGradient =
    modalType === "withdraw"
      ? "from-red-500 to-red-600"
      : "from-blue-600 to-blue-700";

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold text-gray-800">
              {modalType === "withdraw" ? "Withdraw Funds" : "Deposit Funds"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
              <svg
                className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  ₱
                </span>
                <input
                  id="amount"
                  type="text"
                  value={displayedAmount}
                  onChange={handleAmountChange}
                  onFocus={handleAmountFocus}
                  onBlur={handleAmountBlur}
                  className="pl-8 w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="fixedTerm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fixed Term
              </label>
              <select
                id="fixedTerm"
                value={fixedTerm}
                onChange={(e) => setFixedTerm(e.target.value)}
                className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMMTAgMTIuNUwxNSA3LjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-right-4 bg-center-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              >
                <option value="">Select a term</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>

            {rawAmount && fixedTerm && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-2">
                  Computation Summary
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Maturity Date</p>
                    <p className="font-medium">
                      {computation.maturityDate
                        ? new Date(computation.maturityDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Interest Rate</p>
                    <p className="font-medium">{computation.interestRate || '0'}%</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Interest Amount</p>
                    <p className="font-medium text-green-600">
                      ₱{computation.interest || '0.00'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Total Payout</p>
                    <p className="font-medium text-green-600">
                      ₱{computation.payout || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleTransaction}
                disabled={loading}
                className={`flex-1 py-3 px-4 text-white font-medium rounded-lg bg-gradient-to-r ${actionBgGradient} shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${actionColor}-500 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  modalType === "withdraw" ? "Withdraw" : "Deposit"
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal message="Deposit Successful!" onClose={handleSuccessClose} />
      )}
    </>
  );
};

export default TimedepositAmountModal;