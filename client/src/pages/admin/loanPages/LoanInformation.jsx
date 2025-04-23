import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoanTypeSelector from "./components/LoanTypeSelector";
import FeedsRiceSection from "./components/FeedsRiceSection";
import MarketingSection from "./components/MarketingSection";
import axios from "axios";

const LoanInformation = ({
  handleNext,
  handlePrevious,
  formData,
  setFormData,
  fetchedData,
}) => {
  const navigate = useNavigate();

  // Add state for commodity details fetched from backend
  const [commodityDetails, setCommodityDetails] = useState({
    price_per_unit: 0,
    max_units: 0,
    loan_percentage: 0,
  });
  
  // Default objects for fields that are not fetched.
  const defaultContact = {
    house_no_street: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    contact_number: "",
  };

  const defaultLoanDetails = {
    applicationType: "",
    loanType: "",
    statementOfPurpose: "",
    loanTerms: "",
    interest: "",
    serviceFee: "",
    additionalSavingsDeposit: "",
    shareCapitalBuildUp: "",
    insurance: "",
    giftCertificate: "",
    proofOfBusiness: "",
    sacks: 0,
    loanAmount: "",
    // Added for marketing loans:
    coMakerDetails: { name: "", memberId: "" },
  };

  // The memberInfo will hold the personal information fetched from the API.
  const contactInfo = formData.contactInfo || defaultContact;
  const loanInfo = formData.loanInfo || defaultLoanDetails;
  const memberInfo = formData.memberInfo || {};

  // State for maximum sacks.
  const [maxSacks, setMaxSacks] = useState(0);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-load memberId from localStorage if not present in state.
  useEffect(() => {
    if (!memberInfo.memberId) {
      const storedMemberId = localStorage.getItem("memberId");
      if (storedMemberId) {
        setFormData((prevData) => ({
          ...prevData,
          memberInfo: {
            ...prevData.memberInfo,
            memberId: storedMemberId,
          },
        }));
      }
    }
  }, [memberInfo, setFormData]);

  // Only update memberInfo with fetchedData, including memberId.
  useEffect(() => {
    if (fetchedData) {
      setFormData((prevData) => ({
        ...prevData,
        memberInfo: {
          ...prevData.memberInfo,
          memberId: fetchedData.memberId || prevData.memberInfo.memberId || "",
          memberCode: fetchedData.memberCode || "",
          last_name: fetchedData.last_name || "",
          first_name: fetchedData.first_name || "",
          middle_name: fetchedData.middle_name || "",
          date_of_birth: fetchedData.date_of_birth || "",
          birthplace_province: fetchedData.birthplace_province || "",
          age: fetchedData.age || "",
          civil_status: fetchedData.civil_status || "",
          sex: fetchedData.sex || "",
          number_of_dependents: fetchedData.number_of_dependents || "",
          spouse_name: fetchedData.spouse_name || "",
          spouse_occupation_source_of_income:
            fetchedData.spouse_occupation_source_of_income || "",
          occupation_source_of_income: fetchedData.occupation_source_of_income || "",
          monthly_income: fetchedData.monthly_income || "",
          employer_address: fetchedData.employer_address || "",
          employer_address2: fetchedData.employer_address2 || "",
          share_capital: fetchedData.share_capital || "",
        },
      }));
    }
  }, [fetchedData, setFormData]);

  // Revised getSackLimit function.
  const getSackLimit = (share_capital, loanType) => {
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
  };

  // Update maxSacks when loan type or share capital changes.
  useEffect(() => {
    const shareCapital = memberInfo.share_capital;
    if (
      (loanInfo.loanType === "rice" || loanInfo.loanType === "feeds") &&
      shareCapital
    ) {
      // Always calculate based on share capital
      setMaxSacks(getSackLimit(shareCapital, loanInfo.loanType));
    }
  }, [loanInfo.loanType, memberInfo.share_capital]);

  // Fetch loan details when loan type changes
  useEffect(() => {
    const fetchLoanTypeDetails = async () => {
      if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
        try {
          // Convert loanType to the format expected by the API
          const apiLoanType = loanInfo.loanType === "feeds" ? "Feeds Loan" : "Rice Loan";
          
          const response = await axios.get(`http://localhost:3001/api/by-name/${apiLoanType}?exact=true`);
          
          if (response.data.success && response.data.data.length > 0) {
            const loanTypeData = response.data.data[0];
            
            // Update commodity details from API
            setCommodityDetails({
              price_per_unit: parseFloat(loanTypeData.price_per_unit) || 0,
              max_units: parseInt(loanTypeData.max_units) || 0,
              loan_percentage: parseFloat(loanTypeData.loan_percentage) || 0
            });
            
            // Also update the loan fields with values from API and set fixed values
            setFormData(prevData => ({
              ...prevData,
              loanInfo: {
                ...prevData.loanInfo,
                interest: loanTypeData.interest_rate || prevData.loanInfo.interest,
                serviceFee: loanTypeData.service_fee || prevData.loanInfo.serviceFee,
                loanAmount: loanTypeData.price_per_unit || prevData.loanInfo.loanAmount,
                // Add fixed values for rice/feeds loans:
                loanTerms: "30", // Set loan terms to 30 days
                additionalSavingsDeposit: "1" // Set savings deposit to 1%
              }
            }));
          }
        } catch (error) {
          console.error("Error fetching loan type details:", error);
        }
      }
    };
    
    fetchLoanTypeDetails();
  }, [loanInfo.loanType, setFormData]);

  // Calculate maximum loanable amount based on share capital and loan type
  const calculateLoanableAmount = () => {
    if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
      // Use price_per_unit from API if available, otherwise use loanAmount field
      const pricePerUnit = commodityDetails.price_per_unit || Number(loanInfo.loanAmount) || 0;
      
      // Calculate max loanable amount based on share capital and loan type
      if (memberInfo.share_capital) {
        // Return the maximum amount they can borrow based on their share capital
        if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
          return maxSacks * pricePerUnit 
        }
      }
      return 0;
    } else if (loanInfo.loanType === "marketing") {
      return 75000; // Maximum marketing loan amount
    } else if (loanInfo.loanType === "backToBack") {
      return Number(memberInfo.share_capital) || 0;
    }
    
    return 0;
  };

  // Calculate requested loan amount based on user input
  const calculateRequestedAmount = () => {
    if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
      // Use price_per_unit from API if available, otherwise use loanAmount field
      const pricePerUnit = commodityDetails.price_per_unit || Number(loanInfo.loanAmount) || 0;
      // Use the actual number of sacks entered by the user
      const sacks = Number(loanInfo.sacks) || 0;
      
      // Calculate full requested amount first
      const requestedTotal = pricePerUnit * sacks;
      
      // If loan_percentage is available, apply it to calculate the actual loan amount
      if (commodityDetails.loan_percentage > 0) {
        return requestedTotal 
      }
      
      return requestedTotal;
    } else if (loanInfo.loanType === "marketing" || loanInfo.loanType === "backToBack") {
      return Number(loanInfo.loanAmount) || 0;
    }
    
    return Number(loanInfo.loanAmount) || 0;
  };

  // Transform formData to match the expected payload.
  const transformFormData = () => {
    const requestedLoanAmount = calculateRequestedAmount();
    
    return {
      memberId: String(memberInfo.memberId),
      loan_type:
        loanInfo.loanType === "feeds"
          ? "Feeds Loan"
          : loanInfo.loanType === "rice"
          ? "Rice Loan"
          : loanInfo.loanType,
      application: loanInfo.applicationType,
      loan_amount: requestedLoanAmount,
      loanable_amount: calculateLoanableAmount(),
            interest: Number(loanInfo.interest),
      terms: Number(loanInfo.loanTerms),
      balance: requestedLoanAmount,
      service_fee: Number(loanInfo.serviceFee),
      details: {
        statement_of_purpose: loanInfo.statementOfPurpose,
        sacks: Number(loanInfo.sacks),
        max_sacks: Number(maxSacks),
        proof_of_business: loanInfo.proofOfBusiness,
        price_per_unit: commodityDetails.price_per_unit,
        loan_percentage: commodityDetails.loan_percentage
      },
      personalInfo: {
        memberCode: memberInfo.memberCode || "",
        last_name: memberInfo.last_name || "",
        first_name: memberInfo.first_name || "",
        middle_name: memberInfo.middle_name || "",
        date_of_birth: memberInfo.date_of_birth,
        birthplace_province: memberInfo.birthplace_province || "",
        age: memberInfo.age ? Number(memberInfo.age) : 0,
        civil_status: memberInfo.civil_status || "",
        sex: memberInfo.sex || "",
        number_of_dependents: memberInfo.number_of_dependents
          ? Number(memberInfo.number_of_dependents)
          : 0,
        spouse_name: memberInfo.spouse_name || "",
        spouse_occupation_source_of_income:
          memberInfo.spouse_occupation_source_of_income || "",
        occupation_source_of_income:
          memberInfo.occupation_source_of_income || "",
        monthly_income: memberInfo.monthly_income
          ? Number(memberInfo.monthly_income)
          : 0,
        employer_address: memberInfo.employer_address || "",
        employer_address2: memberInfo.employer_address2 || "",
        share_capital: memberInfo.share_capital || "",
      },
    };
  };

  // Handler functions
  const handleLoanChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      loanInfo: {
        ...prevData.loanInfo,
        [name]: value,
      },
    }));
  };

  const handleMemberIdChange = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      memberInfo: {
        ...prevData.memberInfo,
        memberId: value,
      },
    }));
  };

  const setLoanType = (val) => {
    setFormData((prevData) => ({
      ...prevData,
      loanInfo: {
        ...prevData.loanInfo,
        loanType: val,
      },
    }));
  };

  const setStatementOfPurpose = (val) => {
    setFormData((prevData) => ({
      ...prevData,
      loanInfo: {
        ...prevData.loanInfo,
        statementOfPurpose: val,
      },
    }));
  };

  const setProofOfBusiness = (val) => {
    setFormData((prevData) => ({
      ...prevData,
      loanInfo: {
        ...prevData.loanInfo,
        proofOfBusiness: val,
      },
    }));
  };

  const handleSacksChange = (val) => {
    setFormData((prevData) => ({
      ...prevData,
      loanInfo: {
        ...prevData.loanInfo,
        sacks: val,
      },
    }));
  };

  const closeErrorModal = () => {
    setErrorModalVisible(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    // Clear form data if needed; adjust structure as needed.
    setFormData({
      personalInfo: {},
      contactInfo: {},
      loanInfo: {},
      legalBeneficiaries: {},
      initialContribution: {},
      documents: {},
      mobilePortal: {},
    });
    // Navigate to the Loan Applicant page
    navigate("/loan-application");
  };

  // Handle save and submission
  const handleSave = async () => {
    // Validate required fields.
    if (!memberInfo.memberId) {
      alert("Member ID is required. Please enter your Member ID.");
      return;
    }
    if (!loanInfo.interest || !loanInfo.loanTerms) {
      alert("Please fill in the required interest and terms.");
      return;
    }
    if (!memberInfo.first_name || !memberInfo.last_name || !memberInfo.date_of_birth) {
      alert("Please fill in your personal information (first name, last name, date of birth).");
      return;
    }

    // For rice/feeds loan, validate sacks
    if ((loanInfo.loanType === "rice" || loanInfo.loanType === "feeds") && 
        (!loanInfo.sacks || loanInfo.sacks <= 0)) {
      alert("Please specify the number of sacks for your loan.");
      return;
    }
    
    // Check if requested amount is 0 or exceeds maximum
    const requestedAmount = calculateRequestedAmount();
    const maxAmount = calculateLoanableAmount();

    if (requestedAmount <= 0) {
      setErrorMessage("Cannot proceed with the loan application. The requested loan amount is 0. Please check your sacks input.");
      setErrorModalVisible(true);
      return;
    }

    if ((loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") && 
        requestedAmount > maxAmount) {
      setErrorMessage(`The requested loan amount exceeds your maximum loanable amount of ₱${maxAmount.toLocaleString()}. Please reduce the number of sacks.`);
      setErrorModalVisible(true);
      return;
    }

    const payload = transformFormData();

    try {
      const response = await axios.post(
        "http://localhost:3001/api/loan-application",
        payload
      );
      
      console.log("Loan application submitted successfully:", payload);

      // After successful submission, send a backend notification.
      const notificationPayload = {
        userType: ["System Admin", "Loan Manager", "General Manager"],
        message: `New Loan application submitted successfully from: ${memberInfo.last_name} ${memberInfo.first_name}`,
      };

      const notifResponse = await axios.post(
        "http://localhost:3001/api/notifications",
        notificationPayload
      );
      console.log("Notification sent successfully:", notifResponse.data);

      // Add push notification using the browser's Notification API.
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Loan Application", {
            body: `New Loan application submitted successfully from: ${memberInfo.last_name} ${memberInfo.first_name}`,
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("Loan Application", {
                body: `New Loan application submitted successfully from: ${memberInfo.last_name} ${memberInfo.first_name}`
              });
            }
          });
        }
      }

      // Show modal on successful submission.
      setModalVisible(true);
    } catch (error) {
      console.error("Error submitting loan application:", error);
      alert("Error submitting application. Please try again later.");
    }
  };

  // Helper function to determine if fields should be readonly
  const isReadOnly = (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice");

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
              value={loanInfo.applicationType}
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
              loanType={loanInfo.loanType}
              setLoanType={setLoanType}
              memberInfo={memberInfo}
              statementOfPurpose={loanInfo.statementOfPurpose}
              setMaxSacks={setMaxSacks}
              getSackLimit={getSackLimit}
            />
          </div>

          {/* Conditionally render additional section based on loan type */}
          {loanInfo.loanType === "marketing" ? (
            // Render marketing-specific fields
            <div className="md:col-span-3">
              <MarketingSection
                statementOfPurpose={loanInfo.statementOfPurpose}
                setStatementOfPurpose={setStatementOfPurpose}
                loanAmount={loanInfo.loanAmount}
                setLoanAmount={(val) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    loanInfo: { ...prevData.loanInfo, loanAmount: val },
                  }))
                }
                coMakerDetails={loanInfo.coMakerDetails}
                setCoMakerDetails={(val) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    loanInfo: { ...prevData.loanInfo, coMakerDetails: val },
                  }))
                }
                terms={loanInfo.loanTerms}
                setTerms={(val) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    loanInfo: { ...prevData.loanInfo, loanTerms: val },
                  }))
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
          )}
        </div>

        {/* Render Feeds/Rice section if the loan type is feeds or rice */}
        {isReadOnly && (
          <div className="mt-4">
            <FeedsRiceSection
              statementOfPurpose={loanInfo.statementOfPurpose}
              setStatementOfPurpose={setStatementOfPurpose}
              proofOfBusiness={loanInfo.proofOfBusiness}
              setProofOfBusiness={setProofOfBusiness}
              sacks={loanInfo.sacks}
              handleSacksChange={handleSacksChange}
              maxSacks={maxSacks}
              pricePerUnit={commodityDetails.price_per_unit || loanInfo.loanAmount}
              loanPercentage={commodityDetails.loan_percentage}
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
      
      {/* Modal to inform user of successful application */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Success</h3>
            <p>Member has been successfully applied!</p>
            <button
              className="mt-4 bg-green-700 text-white px-4 py-2 rounded"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Error Modal for invalid loan amounts */}
      {errorModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-md">
          <h3 className="text-xl font-bold mb-4 text-red-600">Loan Application Error</h3>
            <p>{errorMessage}</p>
            <button
              className="mt-4 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
              onClick={closeErrorModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanInformation;            