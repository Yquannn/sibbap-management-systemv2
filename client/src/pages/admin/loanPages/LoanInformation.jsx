import React from "react";
import { useNavigate } from "react-router-dom";
import LoanTypeSelector from "./components/LoanTypeSelector";
import FeedsRiceSection from "./components/FeedsRiceSection";
import MarketingSection from "./components/MarketingSection";
import RegularSection from "./components/RegularSection";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import useLoanFormState from "./hooks/useLoanForm";

const LoanInformation = ({
  handleNext,
  handlePrevious,
  formData,
  setFormData,
  fetchedData,
}) => {
  const navigate = useNavigate();
  
  // Use the custom hook to manage form state and logic
  const {
    formState,
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
    commodityDetails,
    maxSacks,
    setMaxSacks,
    calculateLoanableAmount,
    calculateRequestedAmount,
    isReadOnly
  } = useLoanFormState({
    handleNext,
    handlePrevious,
    formData,
    setFormData,
    fetchedData,
  });

  const { loanInfo, memberInfo } = formState;

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
            // Use the RegularSection component for non-marketing loans
            <RegularSection
              loanInfo={loanInfo || {}}
              handleLoanChange={handleLoanChange}
              isReadOnly={isReadOnly}
              commodityDetails={commodityDetails || {}}
              calculateLoanableAmount={calculateLoanableAmount}
              calculateRequestedAmount={calculateRequestedAmount}
              memberInfo={memberInfo || {}}
              maxSacks={maxSacks}
            />
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
      <SuccessModal visible={modalVisible} onClose={closeModal} />
      <ErrorModal visible={errorModalVisible} errorMessage={errorMessage} onClose={closeErrorModal} />
    </div>
  );
};

export default LoanInformation;