import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { transformFormData } from '../utils/FormTransformers';

const useLoanSubmission = (
  memberInfo, 
  loanInfo, 
  commodityDetails, 
  maxSacks, 
  calculateRequestedAmount, 
  calculateLoanableAmount,
  setFormData
) => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const closeErrorModal = () => {
    setErrorModalVisible(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    // Clear form data if needed
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

    const payload = transformFormData(
      memberInfo, 
      loanInfo, 
      commodityDetails, 
      maxSacks, 
      calculateRequestedAmount, 
      calculateLoanableAmount
    );

    try {
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

  return {
    handleSave,
    modalVisible,
    errorModalVisible,
    errorMessage,
    closeModal,
    closeErrorModal
  };
};

export default useLoanSubmission;