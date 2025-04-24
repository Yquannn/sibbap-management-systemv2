// components/RegularSection.js
import React from "react";

const RegularSection = ({
  loanInfo,
  handleLoanChange,
  isReadOnly,
  commodityDetails,
  calculateLoanableAmount,
  calculateRequestedAmount,
  memberInfo,
  maxSacks
}) => {
  return (
    <>
      <div className="md:col-span-3">
        <label className="block font-medium text-gray-700 mb-1">
          Statement of Purpose
        </label>
        <textarea
          name="statementOfPurpose"
          className="border p-3 rounded-lg w-full"
          placeholder="Enter statement of purpose"
          value={loanInfo.statementOfPurpose}
          onChange={handleLoanChange}
          rows="2"
        ></textarea>
      </div>
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Loan Terms
        </label>
        <input
          type="text"
          name="loanTerms"
          className={`border p-3 rounded-lg w-full ${isReadOnly ? "bg-gray-100" : ""}`}
          placeholder="Enter loan terms"
          value={isReadOnly ? "30 days" : loanInfo.loanTerms}
          onChange={handleLoanChange}
          readOnly={isReadOnly}
        />
        {isReadOnly && (
          <p className="text-xs text-gray-500 mt-1">
            Loan term is preset to 30 days for {loanInfo.loanType} loans.
          </p>
        )}
      </div>
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Interest (%)
        </label>
        <input
          type="number"
          step="0.01"
          name="interest"
          className={`border p-3 rounded-lg w-full ${isReadOnly ? "bg-gray-100" : ""}`}
          placeholder="Enter interest rate"
          value={loanInfo.interest}
          onChange={handleLoanChange}
          readOnly={isReadOnly}
        />
        {isReadOnly && (
          <p className="text-xs text-gray-500 mt-1">
            Interest rate is preset based on the selected loan type.
          </p>
        )}
      </div>
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Service Fee
        </label>
        <input
          type="number"
          step="0.01"
          name="serviceFee"
          className={`border p-3 rounded-lg w-full ${isReadOnly ? "bg-gray-100" : ""}`}
          placeholder="Enter service fee"
          value={loanInfo.serviceFee}
          onChange={handleLoanChange}
          readOnly={isReadOnly}
        />
        {isReadOnly && (
          <p className="text-xs text-gray-500 mt-1">
            Service fee is preset based on the selected loan type.
          </p>
        )}
      </div>
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Additional Savings Deposit (1%)
        </label>
        <input
          type="number"
          step="0.01"
          name="additionalSavingsDeposit"
          className={`border p-3 rounded-lg w-full ${isReadOnly ? "bg-gray-100" : ""}`}
          placeholder="Enter additional savings deposit"
          value={isReadOnly ? "1" : loanInfo.additionalSavingsDeposit}
          onChange={handleLoanChange}
          readOnly={isReadOnly}
        />
        {isReadOnly && (
          <p className="text-xs text-gray-500 mt-1">
            Additional savings deposit is preset to 1% for {loanInfo.loanType} loans.
          </p>
        )}
      </div>
      
      {/* Change label based on loan type */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          {isReadOnly ? "Price Per Sack" : "Loan Amount"}
        </label>
        <input
          type="number"
          name="loanAmount"
          className={`border p-3 rounded-lg w-full ${
            isReadOnly && commodityDetails.price_per_unit > 0 ? "bg-gray-100" : ""
          }`}
          placeholder={isReadOnly ? "Price per sack" : "Enter loan amount"}
          value={
            isReadOnly && commodityDetails.price_per_unit
              ? commodityDetails.price_per_unit
              : loanInfo.loanAmount
          }
          onChange={handleLoanChange}
          readOnly={isReadOnly && commodityDetails.price_per_unit > 0}
        />
        {isReadOnly && commodityDetails.price_per_unit > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Price per sack is preset based on the selected loan type.
          </p>
        )}
      </div>
      
      {/* Maximum Loanable Amount field */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Maximum Loanable Amount
        </label>
        <div className="relative">
          <input
            type="text"
            className="border p-3 rounded-lg w-full bg-gray-100"
            value={`₱${calculateLoanableAmount().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            disabled
          />
        </div>
        {isReadOnly && (
          <p className="text-xs text-gray-500 mt-1">
            Based on your share capital of ₱{Number(memberInfo.share_capital).toLocaleString()}, 
            you can borrow up to {maxSacks} sack(s)
          </p>
        )}
      </div>

      {/* Requested Loan Amount field */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Requested Loan Amount
        </label>
        <div className="relative">
          <input
            type="text"
            className="border p-3 rounded-lg w-full bg-gray-100"
            value={`₱${calculateRequestedAmount().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            disabled
          />
          {isReadOnly && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {commodityDetails.loan_percentage > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {commodityDetails.loan_percentage}% of total value
                </span>
              )}
            </div>
          )}
        </div>
        {isReadOnly && (
          <p className="text-xs text-gray-500 mt-1">
            Based on {loanInfo.sacks || 0} sack(s) at ₱{(commodityDetails.price_per_unit || loanInfo.loanAmount || 0).toLocaleString()} each
            {commodityDetails.loan_percentage > 0 && ` with ${commodityDetails.loan_percentage}% loan ratio`}
          </p>
        )}
      </div>
    </>
  );
};

export default RegularSection;