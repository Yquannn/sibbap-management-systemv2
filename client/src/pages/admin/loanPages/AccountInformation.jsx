import React from "react";

const AccountInformation = ({ handleNext, handlePrevious, fetchedData }) => {
  // Extract savings and share capital from fetchedData (if available)
  const savings = fetchedData && fetchedData.savings ? fetchedData.savings : "";
  const shareCapital = fetchedData && fetchedData.share_capital ? fetchedData.share_capital : "";

  return (
    <div className="p-4">
        <h2 className="text-2xl font-bold text-green-600 my-4">
          LOAN APPLICATION DETAILS
        </h2>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Share Capital</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={shareCapital}
          readOnly
        />
      </div>
      <div className="flex justify-between mt-6">
        <button
          className="bg-red-700 text-white px-6 py-2 rounded"
          onClick={handlePrevious}
          type="button"
        >
          Previous
        </button>
        <button
          className="bg-green-700 text-white px-6 py-2 rounded"
          onClick={handleNext}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AccountInformation;
