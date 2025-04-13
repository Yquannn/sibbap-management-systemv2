import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const InitialContribution = ({
  handleNext,
  formData = {},
  setFormData,
  isReadOnly = false,
}) => {
  // Default initial values
  const defaultInitialContribution = {
    share_capital: null,
    membership_fee: 300,
    identification_card_fee: 150,
    kalinga_fund_fee: 100,
    initial_savings: 100,
  };

  const { memberId } = useParams();

  useEffect(() => {
    if (!memberId) {
      console.error("Member ID is missing");
    }
  }, [memberId]);

  // Initialize with default values
  const [localContribution, setLocalContribution] = useState(defaultInitialContribution);

  // Handle user input updates
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalContribution((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value),
    }));
  };

  const handleSubmit = () => {
    console.log("Local contribution data:", localContribution);

    // Update parent's formData
    setFormData((prev) => ({
      ...prev,
      initialContribution: localContribution,
    }));

    // Call parent's handleSave (passed as handleNext) with the updated local data
    handleNext(localContribution);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Initial Contribution</h2>
        <div className="h-1 w-20 bg-blue-500 rounded"></div>
      </div> */}
      
      <div className="space-y-4">
        {[
          { label: "Share capital contribution amount", name: "share_capital" },
          { label: "Membership fee", name: "membership_fee" },
          { label: "Identification Card fee", name: "identification_card_fee" },
          { label: "Kalinga fund fee", name: "kalinga_fund_fee" },
          { label: "Initial savings", name: "initial_savings" },
        ].map(({ label, name }) => (
          <div key={name} className="flex flex-col sm:flex-row sm:items-center">
            <label htmlFor={name} className="text-gray-700 font-medium w-full sm:w-1/2 mb-1 sm:mb-0">
              {label}:
            </label>
            <div className="w-full sm:w-1/2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">₱</span>
                <input
                  type="number"
                  id={name}
                  name={name}
                  value={localContribution[name] || ""}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="pl-8 w-full py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isReadOnly}
          className="flex items-center px-8 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default InitialContribution;