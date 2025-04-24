import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { transformFormData, getSackLimit } from "../utils/FormTransformer";

const useLoanFormState = ({
  handleNext,
  handlePrevious,
  formData = {}, // Add default empty object
  setFormData,
  fetchedData,
}) => {
  const navigate = useNavigate();

  // State for commodity details
  const [commodityDetails, setCommodityDetails] = useState({
    price_per_unit: 0,
    max_units: 0,
    loan_percentage: 0,
  });
  
  // State for maximum sacks
  const [maxSacks, setMaxSacks] = useState(0);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Default objects
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
    coMakerDetails: { name: "", memberId: "" },
  };

  // Extract fields from formData with additional safety checks
  const contactInfo = formData?.contactInfo || defaultContact;
  const loanInfo = formData?.loanInfo || defaultLoanDetails;
  const memberInfo = formData?.memberInfo || {};

  // Auto-load memberId from localStorage if not present in state
  useEffect(() => {
    if (!memberInfo.memberId) {
      const storedMemberId = localStorage.getItem("memberId");
      if (storedMemberId && setFormData) {
        setFormData((prevData = {}) => ({
          ...prevData,
          memberInfo: {
            ...(prevData.memberInfo || {}),
            memberId: storedMemberId,
          },
        }));
      }
    }
  }, [memberInfo, setFormData]);

  // Update memberInfo with fetchedData
  useEffect(() => {
    if (fetchedData && setFormData) {
      setFormData((prevData = {}) => ({
        ...prevData,
        memberInfo: {
          ...(prevData.memberInfo || {}),
          memberId: fetchedData.memberId || (prevData.memberInfo?.memberId || ""),
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

  // Update maxSacks when loan type or share capital changes
  useEffect(() => {
    const shareCapital = memberInfo.share_capital;
    if (
      (loanInfo.loanType === "rice" || loanInfo.loanType === "feeds") &&
      shareCapital
    ) {
      setMaxSacks(getSackLimit(shareCapital, loanInfo.loanType));
    }
  }, [loanInfo.loanType, memberInfo.share_capital]);

  // Fetch loan details when loan type changes
  useEffect(() => {
    const fetchLoanTypeDetails = async () => {
      if ((loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") && setFormData) {
        try {
          const apiLoanType = loanInfo.loanType === "feeds" ? "Feeds Loan" : "Rice Loan";
          
          const response = await axios.get(`http://localhost:3001/api/by-name/${apiLoanType}?exact=true`);
          
          if (response.data.success && response.data.data.length > 0) {
            const loanTypeData = response.data.data[0];
            
            setCommodityDetails({
              price_per_unit: parseFloat(loanTypeData.price_per_unit) || 0,
              max_units: parseInt(loanTypeData.max_units) || 0,
              loan_percentage: parseFloat(loanTypeData.loan_percentage) || 0
            });
            
            setFormData(prevData => ({
              ...prevData,
              loanInfo: {
                ...(prevData.loanInfo || {}),
                interest: loanTypeData.interest_rate || (prevData.loanInfo?.interest || ""),
                serviceFee: loanTypeData.service_fee || (prevData.loanInfo?.serviceFee || ""),
                loanAmount: loanTypeData.price_per_unit || (prevData.loanInfo?.loanAmount || ""),
                loanTerms: "30", 
                additionalSavingsDeposit: "1"
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

  // Calculate maximum loanable amount - defined as a function
  const calculateLoanableAmount = useCallback(() => {
    if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
      const pricePerUnit = commodityDetails.price_per_unit || Number(loanInfo.loanAmount) || 0;
      
      if (memberInfo.share_capital) {
        return maxSacks * pricePerUnit;
      }
      return 0;
    } else if (loanInfo.loanType === "marketing") {
      return 75000; 
    } else if (loanInfo.loanType === "backToBack") {
      return Number(memberInfo.share_capital) || 0;
    }
    
    return 0;
  }, [loanInfo.loanType, loanInfo.loanAmount, memberInfo.share_capital, commodityDetails.price_per_unit, maxSacks]);

  // Calculate requested loan amount - defined as a function
  const calculateRequestedAmount = useCallback(() => {
    if (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice") {
      const pricePerUnit = commodityDetails.price_per_unit || Number(loanInfo.loanAmount) || 0;
      const sacks = Number(loanInfo.sacks) || 0;
      
      const requestedTotal = pricePerUnit * sacks;
      
      if (commodityDetails.loan_percentage > 0) {
        return requestedTotal;
      }
      
      return requestedTotal;
    } else if (loanInfo.loanType === "marketing" || loanInfo.loanType === "backToBack") {
      return Number(loanInfo.loanAmount) || 0;
    }
    
    return Number(loanInfo.loanAmount) || 0;
  }, [loanInfo.loanType, loanInfo.loanAmount, loanInfo.sacks, commodityDetails.price_per_unit, commodityDetails.loan_percentage]);

  // Handler functions
  const handleLoanChange = (e) => {
    if (!setFormData) return;
    
    const { name, value } = e.target;
    setFormData((prevData = {}) => ({
      ...prevData,
      loanInfo: {
        ...(prevData.loanInfo || {}),
        [name]: value,
      },
    }));
  };

  const handleMemberIdChange = (e) => {
    if (!setFormData) return;
    
    const { value } = e.target;
    setFormData((prevData = {}) => ({
      ...prevData,
      memberInfo: {
        ...(prevData.memberInfo || {}),
        memberId: value,
      },
    }));
  };

  const setLoanType = (val) => {
    if (!setFormData) return;
    
    setFormData((prevData = {}) => ({
      ...prevData,
      loanInfo: {
        ...(prevData.loanInfo || {}),
        loanType: val,
      },
    }));
  };

  const setStatementOfPurpose = (val) => {
    if (!setFormData) return;
    
    setFormData((prevData = {}) => ({
      ...prevData,
      loanInfo: {
        ...(prevData.loanInfo || {}),
        statementOfPurpose: val,
      },
    }));
  };

  const setProofOfBusiness = (val) => {
    if (!setFormData) return;
    
    setFormData((prevData = {}) => ({
      ...prevData,
      loanInfo: {
        ...(prevData.loanInfo || {}),
        proofOfBusiness: val,
      },
    }));
  };

  const handleSacksChange = (val) => {
    if (!setFormData) return;
    
    setFormData((prevData = {}) => ({
      ...prevData,
      loanInfo: {
        ...(prevData.loanInfo || {}),
        sacks: val,
      },
    }));
  };

  const closeErrorModal = () => {
    setErrorModalVisible(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    
    if (setFormData) {
      setFormData({
        personalInfo: {},
        contactInfo: {},
        memberInfo: {},
        loanInfo: {},
        legalBeneficiaries: {},
        initialContribution: {},
        documents: {},
        mobilePortal: {},
      });
    }
    
    navigate("/loan-application");
  };

  // Handle save and submission
  const handleSave = async () => {
    // Validate required fields
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

    try {
      // Ensure the transformFormData function exists
      if (typeof transformFormData !== 'function') {
        console.error("transformFormData function is not defined");
        alert("Error submitting application: Form transformation failed.");
        return;
      }
      
      const payload = transformFormData(
        memberInfo, 
        loanInfo, 
        commodityDetails, 
        maxSacks, 
        requestedAmount, 
        maxAmount
      );

      const response = await axios.post(
        "http://localhost:3001/api/loan-application",
        payload
      );
      
      console.log("Loan application submitted successfully:", payload);

      // Send a backend notification
      const notificationPayload = {
        userType: ["System Admin", "Loan Manager", "General Manager"],
        message: `New Loan application submitted successfully from: ${memberInfo.last_name} ${memberInfo.first_name}`,
      };

      const notifResponse = await axios.post(
        "http://localhost:3001/api/notifications",
        notificationPayload
      );
      console.log("Notification sent successfully:", notifResponse.data);

      // Add push notification
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

      // Show modal on successful submission
      setModalVisible(true);
    } catch (error) {
      console.error("Error submitting loan application:", error);
      alert("Error submitting application. Please try again later.");
    }
  };

  // Helper function to determine if fields should be readonly
  const isReadOnly = (loanInfo.loanType === "feeds" || loanInfo.loanType === "rice");

  return {
    formState: { contactInfo, loanInfo, memberInfo },
    handleLoanChange,
    handleMemberIdChange,
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
  };
};

export default useLoanFormState;