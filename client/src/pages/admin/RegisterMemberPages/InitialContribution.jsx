import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const InitialContribution = ({
  handleNext, // This will be our handleSave function from the parent.
  formData = {}, // Ensure formData is always defined.
  setFormData,
  isReadOnly = false, // default to false if not provided.
}) => {
  // Default initial values.
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

  // Initialize with default values.
  const [localContribution, setLocalContribution] = useState(defaultInitialContribution);

  // Handle user input updates.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalContribution((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value),
    }));
  };

  const handleSubmit = () => {
    console.log("Local contribution data:", localContribution);

    // Update parent's formData.
    setFormData((prev) => ({
      ...prev,
      initialContribution: localContribution,
    }));

    // Call parent's handleSave (passed as handleNext) with the updated local data.
    handleNext(localContribution);
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="bg-white w-full h-full max-w-none rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          INITIAL CONTRIBUTION
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {[
              { label: "Share capital contribution amount", name: "share_capital" },
              { label: "Membership fee", name: "membership_fee" },
              { label: "Identification Card fee", name: "identification_card_fee" },
              { label: "Kalinga fund fee", name: "kalinga_fund_fee" },
              { label: "Initial savings", name: "initial_savings" },
            ].map(({ label, name }) => (
              <React.Fragment key={name}>
                <label>{label}:</label>
                <input
                  type="number"
                  name={name}
                  className="border p-2 rounded-lg w-full"
                  value={localContribution[name]}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="bg-green-700 text-white text-lg px-8 py-3 rounded-lg shadow-md hover:bg-green-800 transition-all"
            onClick={handleSubmit}
            type="button"
            disabled={isReadOnly}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialContribution;
