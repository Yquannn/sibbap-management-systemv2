import React from "react";

const FeedsRiceSection = ({
  statementOfPurpose,
  setStatementOfPurpose,
  proofOfBusiness,
  setProofOfBusiness,
  sacks,
  handleSacksChange,
  maxSacks,
}) => {
  return (
    <>
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Statement of Purpose:</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={statementOfPurpose}
          onChange={(e) => setStatementOfPurpose(e.target.value)}
        >
          <option value="personal">Personal (Livestock & Poultry or Consumption)</option>
          <option value="business">Business (Livestock & Poultry or Consumption)</option>
        </select>
      </div>
      {statementOfPurpose === "business" && (
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Proof of Business Registration:</label>
          <input
            type="file"
            className="w-full p-2 border rounded-lg"
            onChange={(event) => setProofOfBusiness(event.target.files[0])}
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Number of Sacks (50kg/Sack):</label>
        <input
          type="number"
          className="w-full p-2 border rounded-lg"
          value={sacks}
          onChange={(e) => handleSacksChange(e.target.value)}
        />
        <p className="text-gray-600 text-sm">
          You can loan up to <strong>{maxSacks}</strong> sacks based on your Share Capital.
        </p>
      </div>
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Terms:</label>
        <p className="p-2 border rounded-lg bg-gray-100">30 Days</p>
      </div>
    </>
  );
};

export default FeedsRiceSection;
