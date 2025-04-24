import React from "react";
import LoanTypeSelector from "./components/LoanTypeSelector";
import FeedsRiceSection from "./components/FeedsRiceSection";
import MarketingSection from "./components/MarketingSection";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";

const LoanInformationForm = ({
  handleNext,
  handlePrevious,
  formState = {}, // Add default value
  handleLoanChange,
  setLoanType,
  setStatementOfPurpose,
  setProofOfBusiness,
  handleSacksChange,
  handleSave,
  modalVisible,
  errorModalVisible,
  errorMessage,
  closeModal,
  closeErrorModal,
  commodityDetails = {}, // Add default value
  maxSacks = 0, // Add default value
  setMaxSacks,
  calculateLoanableAmount = () => 0, // Add default function
  calculateRequestedAmount = () => 0, // Add default function
  isReadOnly = false // Add default value
}) => {
  // Add safety check for formState
  const loanInfo = formState?.loanInfo || {};
  const memberInfo = formState?.memberInfo || {};

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="bg-white w-full p-4">
        <h2 className="text-2xl font-bold text-green-600 my-4">
          LOAN APPLICATION DETAILS
        </h2>
        {/* Three-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Application Type
            </label>
            <select
              name="applicationType"
              className="border p-3 rounded-lg w-full"
              value={loanInfo.applicationType || ""}
              onChange={handleLoanChange}
            >
              <option value="">Select type</option>
              <option value="New">New</option>
              {/* You can add more options here in the future */}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Loan Type
            </label>
            <LoanTypeSelector
              loanType={loanInfo.loanType || ""}
              setLoanType={setLoanType}
              memberInfo={memberInfo}
              statementOfPurpose={loanInfo.statementOfPurpose || ""}
              setMaxSacks={setMaxSacks}
              getSackLimit={(share_capital, loanType) => {
                const capital = parseFloat(share_capital);
                if (isNaN(capital)) return 0;
              
                if (loanType === "feeds") {
                  if (capital < 6000) return 0;
                  if (capital >= 20000) return 15;
                  return Math.floor(((capital - 6000) / (20000 - 6000)) * 15);
                } else if (loanType === "rice") {
                  if (capital >= 20000) return 30;
                  else if (capital >= 6000) return 4;
                  else return 2;
                }
                return 0;
              }}
            />
          </div>

          {/* Conditionally render additional section based on loan type */}
          {loanInfo.loanType === "marketing" ? (
            // Render marketing-specific fields
            <div className="md:col-span-3">
              <MarketingSection
                statementOfPurpose={loanInfo.statementOfPurpose || ""}
                setStatementOfPurpose={setStatementOfPurpose}
                loanAmount={loanInfo.loanAmount || ""}
                setLoanAmount={(val) =>
                  handleLoanChange({
                    target: { name: "loanAmount", value: val }
                  })
                }
                coMakerDetails={loanInfo.coMakerDetails || { name: "", memberId: "" }}
                setCoMakerDetails={(val) =>
                  handleLoanChange({
                    target: { name: "coMakerDetails", value: val }
                  })
                }
                terms={loanInfo.loanTerms || ""}
                setTerms={(val) =>
                  handleLoanChange({
                    target: { name: "loanTerms", value: val }
                  })
                }
              />
            </div>
          ) : (
            <>
              {/* For non-marketing loans, render the standard fields */}
              <div className="md:col-span-3">
                <label className="block font-medium text-gray-700 mb-1">
                  Statement of Purpose
                </label>
                <textarea
                  name="statementOfPurpose"
                  className="border p-3 rounded-lg w-full"
                  placeholder="Enter statement of purpose"
                  value={loanInfo.statementOfPurpose || ""}
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
                  value={isReadOnly ? "30 days" : (loanInfo.loanTerms || "")}
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
                  value={loanInfo.interest || ""}
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
                  value={loanInfo.serviceFee || ""}
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
                  value={isReadOnly ? "1" : (loanInfo.additionalSavingsDeposit || "")}
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
                      : (loanInfo.loanAmount || "")
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
                    Based on your share capital of ₱{Number(memberInfo.share_capital || 0).toLocaleString()}, 
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
          )}
        </div>

        {/* Render Feeds/Rice section if the loan type is feeds or rice */}
        {isReadOnly && (
          <div className="mt-4">
            <FeedsRiceSection
              statementOfPurpose={loanInfo.statementOfPurpose || ""}
              setStatementOfPurpose={setStatementOfPurpose}
              proofOfBusiness={loanInfo.proofOfBusiness || ""}
              setProofOfBusiness={setProofOfBusiness}
              sacks={loanInfo.sacks || 0}
              handleSacksChange={handleSacksChange}
              maxSacks={maxSacks}
              pricePerUnit={commodityDetails.price_per_unit || loanInfo.loanAmount || 0}
              loanPercentage={commodityDetails.loan_percentage || 0}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            className="bg-red-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-red-800 transition-all"
            onClick={handlePrevious}
            type="button"
          >
            <span className="text-2xl">&#187;&#187;</span> Previous
          </button>
          {(loanInfo.loanType === "rice" ||
            loanInfo.loanType === "feeds" ||
            loanInfo.loanType === "marketing" ||
            loanInfo.loanType === "backToBack") ? (
            <button
              className="bg-green-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-green-800 transition-all"
              onClick={handleSave}
              type="button"
            >
              <span className="text-2xl">&#187;&#187;</span> Submit Application
            </button>
          ) : (
            <button
              className="bg-green-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-green-800 transition-all"
              onClick={handleNext}
              type="button"
            >
              <span className="text-2xl">&#187;&#187;</span> Next
            </button>
          )}
        </div>
      </div>
      
      {/* Success and Error Modals */}
      {typeof SuccessModal === 'function' && <SuccessModal visible={modalVisible} onClose={closeModal} />}
      {typeof ErrorModal === 'function' && <ErrorModal visible={errorModalVisible} errorMessage={errorMessage} onClose={closeErrorModal} />}
    </div>
  );
};

export default LoanInformationForm;