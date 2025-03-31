import React, { useState } from "react";
import { useParams } from "react-router-dom";

const InitialContribution = ({
  handleNext,
  handlePrevious,
  formData,
  setFormData,
}) => {
  const defaultInitialContribution = {
    share_capital: "",
    membership_fee: "",
    identification_card_fee: "",
    kalinga_fund_fee: "",
    initial_savings: "",
  };

  const { memberId } = useParams();
  if (!memberId) {
    console.error("Member ID is missing");
    return <div>Error: Member ID is missing.</div>;
  }

  // Use local state to ensure input fields start empty (ignoring any fetched values)
  const [localContribution, setLocalContribution] = useState(defaultInitialContribution);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalContribution((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Update the parent's formData with the local state before submitting
    setFormData((prev) => ({ ...prev, initialContribution: localContribution }));
    // Call the parent's submission function (which could perform an API call)
    handleNext();
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="bg-white w-full h-full max-w-none rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          INITIAL CONTRIBUTION
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label>Share capital contribution amount:</label>
            <input
              type="number"
              name="share_capital"
              className="border p-2 rounded-lg w-full"
              value={localContribution.share_capital}
              onChange={handleChange}
            />

            <label>Membership fee:</label>
            <input
              type="number"
              name="membership_fee"
              className="border p-2 rounded-lg w-full"
              value={localContribution.membership_fee}
              onChange={handleChange}
            />

            <label>Identification Card fee:</label>
            <input
              type="number"
              name="identification_card_fee"
              className="border p-2 rounded-lg w-full"
              value={localContribution.identification_card_fee}
              onChange={handleChange}
            />

            <label>Kalinga fund fee:</label>
            <input
              type="number"
              name="kalinga_fund_fee"
              className="border p-2 rounded-lg w-full"
              value={localContribution.kalinga_fund_fee}
              onChange={handleChange}
            />

            <label>Initial savings:</label>
            <input
              type="number"
              name="initial_savings"
              className="border p-2 rounded-lg w-full"
              value={localContribution.initial_savings}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="bg-red-700 text-white text-lg px-8 py-3 rounded-lg shadow-md hover:bg-red-800 transition-all mr-4"
            onClick={handlePrevious}
            type="button"
          >
            Previous
          </button>
          <button
            className="bg-green-700 text-white text-lg px-8 py-3 rounded-lg shadow-md hover:bg-green-800 transition-all"
            onClick={handleSubmit}
            type="button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialContribution;
