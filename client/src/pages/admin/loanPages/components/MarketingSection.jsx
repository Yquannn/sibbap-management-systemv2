import React from "react";

const MarketingSection = ({
  statementOfPurpose,
  setStatementOfPurpose,
  loanAmount,
  setLoanAmount,
  coMakerDetails,
  setCoMakerDetails,
  terms,
  setTerms,
}) => {
  // Handler that limits the loan amount to a maximum of 75,000 pesos.
  const handleLoanAmountChange = (e) => {
    let value = Number(e.target.value);
    if (value > 75000) {
      value = 75000;
    }
    setLoanAmount(value);
  };

  return (
    <>
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          Statement of Purpose:
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          placeholder="Enter Purpose"
          value={statementOfPurpose}
          onChange={(e) => setStatementOfPurpose(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium text-gray-700">
          Loan Amount:
        </label>
        <input
          type="number"
          className="w-full p-2 border rounded-lg"
          value={loanAmount}
          onChange={handleLoanAmountChange}
          max="75000"
        />
        <p className="text-gray-600">Max: 75,000 pesos</p>
      </div>
      {Number(loanAmount) >= 40000 && (
        <div className="mb-4">
          <label className="block font-medium text-gray-700">
            Co‑Maker Details (Required for loans above ₱40,000):
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Co‑Maker Name"
              value={coMakerDetails.name}
              onChange={(e) =>
                setCoMakerDetails({ ...coMakerDetails, name: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Co‑Maker Member ID"
              value={coMakerDetails.memberId}
              onChange={(e) =>
                setCoMakerDetails({ ...coMakerDetails, memberId: e.target.value })
              }
            />
          </div>
        </div>
      )}
      <div className="mb-4">
        <label className="block font-medium text-gray-700">Terms:</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
        >
          {[...Array(10).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>{`${i + 1} Month`}</option>
          ))}
        </select>
        {/* <p className="text-gray-600">
          Interest Rate: 3.5% (Auto Generated)
        </p>
        <p className="text-gray-600">
          Service Fee: 5% (Auto Generated)
        </p> */}
      </div>
    </>
  );
};

export default MarketingSection;
