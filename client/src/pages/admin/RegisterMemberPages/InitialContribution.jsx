import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function InitialContribution({ handlePrevious, isReadOnly }) {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [shareCapital, setShareCapital] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [newTypes, setNewTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [memberCode, setMemberCode] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const FEE_NAME_TO_FIELD = {
    "Identification Card Fee": "identification_card_fee",
    "Membership Fee": "membership_fee",
    "Kalinga Fund Fee": "kalinga_fund_fee",
    "Initial Savings": "initial_savings"
  };
  const ALLOWED = Object.keys(FEE_NAME_TO_FIELD);

  // Fetch any existing memberCode
  const fetchMemberCode = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:3001/api/members/${memberId}`
      );
      return data.memberCode ?? data.member_code ?? null;
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, api: "Could not load member code." }));
      return null;
    }
  };

  // Load contribution types
  const fetchContributionTypes = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:3001/api/contribution-type/"
      );
      const extras = data.filter(c => !ALLOWED.includes(c.name));
      const allowedOnes = data.filter(c => ALLOWED.includes(c.name));
      setNewTypes(extras);
      setContributions(
        allowedOnes.map(c => ({
          ...c,
          amount: parseFloat(c.amount) || 0,
          field_name: FEE_NAME_TO_FIELD[c.name]
        }))
      );
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, api: "Could not load fees." }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributionTypes();
  }, [memberId]);

  // Validate inputs and compute total
  useEffect(() => {
    const newErr = {};
    let sum = 0;

    if (shareCapital == null) {
      newErr.share_capital = "Required";
    } else if (isNaN(shareCapital)) {
      newErr.share_capital = "Must be a number";
    } else if (shareCapital < 1000) {
      newErr.share_capital = "Min ₱1,000";
    } else {
      sum += shareCapital;
    }

    contributions.forEach(c => {
      const val = c.amount;
      if (val == null) {
        newErr[c.contribution_type_id] = "Required";
      } else if (isNaN(val)) {
        newErr[c.contribution_type_id] = "Must be a number";
      } else if (val < 0) {
        newErr[c.contribution_type_id] = "Cannot be negative";
      } else {
        sum += val;
      }
    });

    setErrors(newErr);
    setTotal(sum);
  }, [shareCapital, contributions]);

  const handleContributionChange = (id, raw) => {
    const val = raw === "" ? null : parseFloat(raw);
    setContributions(prev =>
      prev.map(c =>
        c.contribution_type_id === id ? { ...c, amount: val } : c
      )
    );
  };

  const formatCurrency = n =>
    isNaN(n)
      ? ""
      : new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP"
        }).format(n);

  // Stub to notify if new types appear
  const handleNotifyDeveloper = () => {
    console.warn("Notify dev about these new types:", newTypes);
    alert("Developer has been notified of new contribution types.");
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/members");
  };

  // Submit the data, then retrieve/generate memberCode
  const handleSubmit = async e => {
    e.preventDefault();
    if (Object.keys(errors).length) return;

    setIsLoading(true);
    try {
      const financialData = { share_capital: shareCapital };
      contributions.forEach(contribution => {
        if (contribution.field_name) {
          financialData[contribution.field_name] = contribution.amount;
        }
      });

      // PATCH—if your API returns memberCode directly, grab it here
      const patchRes = await axios.patch(
        `http://localhost:3001/api/members/${memberId}/financials`,
        financialData
      );

      let fetchedCode =
        patchRes.data.memberCode ?? patchRes.data.member_code ?? null;

      if (!fetchedCode) {
        // fallback to GET if not in PATCH response
        await new Promise(res => setTimeout(res, 500));
        fetchedCode = await fetchMemberCode();
      }

      setMemberCode(fetchedCode);
      setSuccessMsg(
        `Membership Successfully Added.`
      );
      setShowModal(true);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-green-600 mb-6">
          Initial Contribution
        </h2>

        {successMsg && !showModal && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded">
            {successMsg}
          </div>
        )}

        {newTypes.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded">
            <strong>⚠️ New fee types detected:</strong>{" "}
            {newTypes.map(c => c.name).join(", ")}.{" "}
            <button
              type="button"
              onClick={handleNotifyDeveloper}
              className="ml-2 underline text-blue-600"
            >
              Notify Developer
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Inputs */}
          <div>
            <h3 className="text-lg font-medium mb-4">Financial Details</h3>

            {/* Share Capital */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Share Capital
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1000"
                  value={shareCapital ?? ""}
                  onChange={e => setShareCapital(parseFloat(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full pl-8 pr-3 py-2 border rounded ${
                    errors.share_capital
                      ? "border-red-500"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                />
              </div>
              {errors.share_capital && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.share_capital}
                </p>
              )}
            </div>

            {/* The four allowed fees */}
            {contributions.map(c => (
              <div key={c.contribution_type_id} className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {c.name}
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={c.amount ?? ""}
                    onChange={e =>
                      handleContributionChange(
                        c.contribution_type_id,
                        e.target.value
                      )
                    }
                    disabled={true}
                    className={`w-full pl-8 pr-3 py-2 border rounded ${
                      errors[c.contribution_type_id]
                        ? "border-red-500"
                        : "border-gray-300 focus:border-green-500"
                    }`}
                  />
                </div>
                {errors[c.contribution_type_id] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[c.contribution_type_id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Right: Summary */}
          <div className="bg-gray-50 rounded-xl border p-6">
            <h3 className="font-medium mb-4">Summary</h3>

            <div className="flex justify-between py-1 border-b">
              <span>Share Capital</span>
              <span>{formatCurrency(shareCapital)}</span>
            </div>
            {contributions.map(c => (
              <div
                key={c.contribution_type_id}
                className="flex justify-between py-1 border-b last:border-none"
              >
                <span>{c.name}</span>
                <span>{formatCurrency(c.amount)}</span>
              </div>
            ))}
            <div className="mt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {errors.api && <div className="mt-4 text-red-600">{errors.api}</div>}

        <div className="flex justify-between mt-8 pt-4 border-t">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isLoading}
            className="px-6 py-2 border rounded"
          >
            Previous
          </button>
          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
            className={`px-6 py-2 text-white rounded ${
              isLoading || Object.keys(errors).length
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Success Modal */}
{/* Success Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-green-800">Success!</h3>
      </div>
      
      <div className="mb-6">
        <p className="text-center text-gray-600">
          {successMsg}
        </p>
        <p className="text-center font-medium mt-2">
          Member Code: {memberCode}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Share Capital:</span>
            <div className="font-medium">{formatCurrency(shareCapital)}</div>
          </div>
          {contributions.map(c => (
            <div key={c.contribution_type_id}>
              <span className="text-gray-600">{c.name}:</span>
              <div className="font-medium">{formatCurrency(c.amount)}</div>
            </div>
          ))}
          <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
            <span className="text-gray-600">Total:</span>
            <div className="font-medium">{formatCurrency(total)}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleModalClose}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}
