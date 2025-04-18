import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const InitialContribution = ({ handlePrevious, isReadOnly }) => {
  const { memberId } = useParams();

  const [localData, setLocalData] = useState({
    share_capital: null,
    identification_card_fee: null,
    membership_fee: null,
    kalinga_fund_fee: null,
    initial_savings: null,
  });
  const [errors, setErrors] = useState({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fields = {
    share_capital: { label: "Share Capital", min: 1000 },
    identification_card_fee: { label: "ID Card Fee", min: 0 },
    membership_fee: { label: "Membership Fee", min: 100 },
    kalinga_fund_fee: { label: "Kalinga Fund Fee", min: 0 },
    initial_savings: { label: "Initial Savings", min: 0 },
  };

  // Fetch existing values on mount
  // useEffect(() => {
  //   axios
  //     .get(`http://localhost:3001/api/members/${memberId}/financials`)
  //     .then(({ data }) => {
  //       setLocalData({
  //         share_capital: data.share_capital,
  //         identification_card_fee: data.identification_card_fee,
  //         membership_fee: data.membership_fee,
  //         kalinga_fund_fee: data.kalinga_fund_fee,
  //         initial_savings: data.initial_savings,
  //       });
  //     })
  //     .catch((err) => console.error("Fetch error:", err));
  // }, [memberId]);

  // Recalculate total & validate
  useEffect(() => {
    const sum = Object.values(localData).reduce(
      (acc, v) => acc + (parseFloat(v) || 0),
      0
    );
    setTotal(sum);

    const newErr = {};
    Object.entries(localData).forEach(([k, v]) => {
      if (v === null) newErr[k] = "This field is required";
      else if (isNaN(v)) newErr[k] = "Please enter a valid number";
      else if (v < fields[k].min)
        newErr[k] = `${fields[k].label} must be at least ₱${fields[k]
          .min.toLocaleString()}`;
    });
    setErrors(newErr);
  }, [localData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalData((p) => ({
      ...p,
      [name]: value === "" ? null : parseFloat(value),
    }));
  };

  const formatCurrency = (amt) =>
    amt == null
      ? ""
      : new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;

    setIsLoading(true);
    try {
      await axios.patch(
        `http://localhost:3001/api/members/${memberId}/financials`,
        localData
      );
      setSuccessMsg("Initial contribution saved successfully.");
      // <— you can navigate or call a parent callback here
    } catch (err) {
      setErrors({ api: err.response?.data?.message || err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-8"
    >
      <h2 className="text-2xl font-bold text-green-600 mb-6">
        Initial Contribution
      </h2>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div>
          <h3 className="text-lg font-medium mb-4">Financial Details</h3>
          {Object.entries(fields).map(([key, { label, min }]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {label}
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₱
                </span>
                <input
                  name={key}
                  type="number"
                  step="0.01"
                  min={min}
                  value={localData[key] ?? ""}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className={`w-full pl-8 pr-3 py-2 border rounded ${
                    errors[key]
                      ? "border-red-500"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                />
              </div>
              {errors[key] && (
                <p className="text-red-600 text-sm mt-1">
                  {errors[key]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl border p-6">
          <h3 className="font-medium mb-4">Summary</h3>
          {Object.entries(fields).map(([key, { label }]) => (
            <div
              key={key}
              className="flex justify-between py-1 border-b last:border-none"
            >
              <span>{label}</span>
              <span>
                {localData[key] == null
                  ? "—"
                  : formatCurrency(localData[key])}
              </span>
            </div>
          ))}
          <div className="mt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {errors.api && (
        <div className="mt-4 text-red-600">{errors.api}</div>
      )}

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
  );
};

export default InitialContribution;
