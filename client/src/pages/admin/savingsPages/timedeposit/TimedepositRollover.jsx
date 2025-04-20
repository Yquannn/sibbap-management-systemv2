import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, AlertCircle, CheckCircle, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { 
  formatNumber, 
  fetchTimeDepositModuleId, 
  fetchInterestRates,
  calculateInterestRate,
  calculateTimeDepositValues
} from "../../utils/calculateTimedeposit";

export default function TimeDepositRollover() {
  const navigate = useNavigate();
  const { timeDepositId } = useParams();

  const [timeDeposit, setTimeDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rolloverId, setRolloverId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [interestRates, setInterestRates] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);

  const [rolloverOptions, setRolloverOptions] = useState({
    selectedTerm: 12,
    includeInterest: true,
  });

  const termOptions = [6, 12];

  // Fetch interest rates
  useEffect(() => {
    const loadInterestRates = async () => {
      try {
        setLoadingRates(true);
        const moduleId = await fetchTimeDepositModuleId();
        const rates = await fetchInterestRates(moduleId);
        setInterestRates(rates);
        console.log("Fetched interest rates:", rates);
      } catch (err) {
        console.error("Error fetching interest rates:", err);
        setError("Failed to load interest rates. Please try again later.");
      } finally {
        setLoadingRates(false);
      }
    };
    
    loadInterestRates();
  }, []);

  useEffect(() => {
    async function fetchTD() {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:3001/api/timedepositor/${timeDepositId}`
        );
        if (data.success) {
          setTimeDeposit(data.data.timeDeposit);
          setRolloverOptions((p) => ({
            ...p,
            selectedTerm: data.data.timeDeposit.fixedTerm,
          }));
        } else {
          setError("Failed to load time deposit");
        }
      } catch (e) {
        console.error(e);
        setError("Error fetching time deposit: " + (e.response?.data?.message || e.message));
      } finally {
        setLoading(false);
      }
    }
    if (timeDepositId) fetchTD();
  }, [timeDepositId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!timeDeposit) return <div className="p-4 text-gray-600">No data found.</div>;

  const totalRolloverAmount = rolloverOptions.includeInterest
    ? parseFloat(timeDeposit.amount) + parseFloat(timeDeposit.interest || 0)
    : parseFloat(timeDeposit.amount);

  // Use the imported calculateInterestRate function
  const newInterestRate = calculateInterestRate(
    interestRates,
    totalRolloverAmount,
    rolloverOptions.selectedTerm
  );

  const calculateNewMaturityDate = () => {
    const today = new Date();
    const dt = new Date(today);
    dt.setMonth(dt.getMonth() + rolloverOptions.selectedTerm);
    return dt.toISOString().split("T")[0];
  };

  const handleRollover = async () => {
    setSubmitLoading(true);
    setError(null);

    try {
      const maturityDate = timeDeposit.maturityDate ? 
        (typeof timeDeposit.maturityDate === 'string' ? 
          timeDeposit.maturityDate.split("T")[0] : 
          new Date(timeDeposit.maturityDate).toISOString().split("T")[0]) : 
        '';

      const payload = {
        timeDepositId: parseInt(timeDepositId, 10),
        rollover_date: new Date().toISOString().split("T")[0],
        previous_maturity_date: maturityDate,
        new_maturity_date: calculateNewMaturityDate(),
        interest_earned: rolloverOptions.includeInterest
          ? parseFloat(timeDeposit.interest || 0)
          : 0,
        rollover_amount: totalRolloverAmount,
        created_by: sessionStorage.getItem("username") || "Unknown User",
      };

      const response = await axios.post(
        "http://localhost:3001/api/timedeposit/rollover",
        payload
      );
      
      if (response.status === 201 && response.data) {
        const result = response.data;
        setRolloverId(result.id || result.rollover_transaction_number);
        setShowSuccess(true);
      } else {
        setError("Failed to rollover. Unexpected response format.");
      }
    } catch (e) {
      console.error("Rollover error:", e);
      if (e.response?.data?.error) {
        setError(e.response.data.error);
      } else {
        setError("Error submitting rollover: " + e.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    navigate(-1);
  };

  // Use the formatNumber function from the imports
  const fmt = (num) => formatNumber(num);

  return (
    <div className="p-6 relative">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Time Deposit Rollover</h2>
          <button onClick={() => navigate(-1)} className="text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {loadingRates && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Loading interest rates...
          </div>
        )}

        <div className="border-b pb-4 mb-6">
          <h3 className="font-medium mb-4">Current Deposit Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Account #</label>
              <div className="font-medium">{timeDeposit.account_number}</div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Principal</label>
              <div className="font-medium">{fmt(timeDeposit.amount)}</div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Interest Earned</label>
              <div className="font-medium">{fmt(timeDeposit.interest || 0)}</div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Maturity Date</label>
              <div className="font-medium">
                {timeDeposit.maturityDate ? 
                  new Date(timeDeposit.maturityDate).toLocaleDateString() :
                  "Not set"
                }
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-4">Rollover Options</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Term</label>
              <select
                className="w-full border rounded p-2"
                value={rolloverOptions.selectedTerm}
                onChange={(e) =>
                  setRolloverOptions((p) => ({
                    ...p,
                    selectedTerm: parseInt(e.target.value, 10),
                  }))
                }
              >
                {termOptions.map((m) => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rolloverOptions.includeInterest}
                  onChange={(e) =>
                    setRolloverOptions((p) => ({
                      ...p,
                      includeInterest: e.target.checked,
                    }))
                  }
                />
                Include earned interest
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded mb-6">
          <h3 className="font-medium mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Total Amount</span>
              <div className="font-medium">{fmt(totalRolloverAmount)}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">New Rate</span>
              <div className="font-medium">{(newInterestRate * 100).toFixed(2)}%</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Term</span>
              <div className="font-medium">{rolloverOptions.selectedTerm} months</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">New Maturity</span>
              <div className="font-medium">{calculateNewMaturityDate()}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            disabled={submitLoading || loadingRates}
            onClick={handleRollover}
            className={`px-6 py-2 rounded-lg text-white ${
              submitLoading || loadingRates
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitLoading ? "Processing..." : "Confirm Rollover"}
          </button>
          <p className="text-sm text-gray-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Penalties may apply
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-green-800">Success!</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-center text-gray-600">
                Time deposit rollover successfully submitted.
              </p>
              <p className="text-center font-medium mt-2">
                Rollover ID: #{rolloverId}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <div className="font-medium">{fmt(totalRolloverAmount)}</div>
                </div>
                <div>
                  <span className="text-gray-600">New Term:</span>
                  <div className="font-medium">{rolloverOptions.selectedTerm} months</div>
                </div>
                <div>
                  <span className="text-gray-600">Interest Rate:</span>
                  <div className="font-medium">{(newInterestRate * 100).toFixed(2)}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Maturity Date:</span>
                  <div className="font-medium">{calculateNewMaturityDate()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={closeSuccessModal}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}