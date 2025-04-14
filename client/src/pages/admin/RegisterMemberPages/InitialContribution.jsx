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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

    // Show success modal
    setSuccessMessage("Initial contribution has been successfully recorded!");
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Call parent's handleSave (passed as handleNext) with the updated local data
    // after the modal is closed
    handleNext(localContribution);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              
              {/* Calculate total contribution */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="font-medium text-gray-700 mb-2">Total Contribution:</p>
                <p className="text-xl font-bold text-green-600">
                  ₱{Object.values(localContribution).reduce((sum, value) => sum + (value || 0), 0).toLocaleString()}
                </p>
              </div>
              
              <button
                onClick={handleCloseModal}
                className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialContribution;