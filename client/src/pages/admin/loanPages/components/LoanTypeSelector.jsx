import React from "react";

const LoanTypeSelector = ({
  loanType,
  setLoanType,
  memberInfo,
  statementOfPurpose,
  setMaxSacks,
  getSackLimit,
}) => {
  return (
    <div className="mb-4">
      <label className="block font-medium text-gray-700">Loan Type:</label>
      <select
        className="w-full p-2 border rounded-lg"
        value={loanType}
        onChange={(e) => {
          setLoanType(e.target.value);
          // If feeds or rice, update the max sacks.
          if (e.target.value === "rice" || e.target.value === "feeds") {
            setMaxSacks(getSackLimit(memberInfo?.shareCapital, e.target.value));
          } else {
            setMaxSacks(0);
          }
        }}
      >
        <option value="">Select Loan Type</option>
        <option value="feeds">Feeds Loan</option>
        <option value="rice">Rice Loan</option>
        <option value="marketing">Marketing/Merchandising Loan</option>
        <option value="backToBack">Back to Back Loan</option>
        <option value="regular">Regular Loan</option>
        <option value="livelihood">Livelihood Assistance Loan</option>
        <option value="educational">Educational Loan</option>
        <option value="emergency">Emergency/Calamity Loan</option>
        <option value="quickCash">Quick Cash Loan</option>
        <option value="car">Car Loan</option>
        <option value="housing">House and Lot/Housing/ Lot Loan</option>
        <option value="motorcycle">Motorcycle Loan</option>
        <option value="memorialLot">Memorial Lot</option>
        <option value="intermentLot">Interment Plan Lot</option>
        <option value="travel">Travel Loan</option>
        <option value="ofw">OFW Assistance Loan</option>
        <option value="savings">Savings Loan</option>
        <option value="health">Health Insurance Loan</option>
        <option value="special">Special Loan</option>
        <option value="reconstruction">Reconstruction</option>
      </select>
    </div>
  );
};

export default LoanTypeSelector;
