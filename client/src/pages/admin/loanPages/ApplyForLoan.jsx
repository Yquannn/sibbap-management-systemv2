// import React, { useState, useEffect, createContext } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import PersonalInformation from "./components/PersonalInformation";
// import ContactInformation from "../RegisterMemberPages/ContactInformation";
// import LoanInformationForm from "./LoanInformation";
// import AccountInformation from "./AccountInformation";
// import useLoanFormState from "./hooks/useLoanForm"; // Fixed import path
// import SuccessModal from "./SuccessModal";

// export const FormDataContext = createContext();

// const ApplyForLoan = () => {
//   const location = useLocation();
//   const { selectedMember, members } = location.state || {};

//   // Derive memberId from selectedMember (if available)
//   const memberId = selectedMember ? selectedMember.memberId : null;

//   // Track the active tab (step)
//   const [activeTab, setActiveTab] = useState(0);

//   // Shared state for the multi-step form data
// // In ApplyForLoan.js - when initializing formData, make sure all expected props exist
// const [formData, setFormData] = useState({
//   personalInfo: {},
//   contactInfo: {}, // Make sure this is an empty object, not undefined
//   memberInfo: {},
//   loanInfo: {},
//   legalBeneficiaries: {},
//   initialContribution: {},
//   accountInformation: {},
//   documents: {}
// });
//   // State for storing fetched data from the API
//   const [fetchedData, setFetchedData] = useState(null);

//   // Get loan form state using the custom hook
//   const loanFormState = useLoanFormState({
//     handleNext: () => {
//       if (activeTab < tabs.length - 1) {
//         setActiveTab(activeTab + 1);
//       }
//     },
//     handlePrevious: () => {
//       if (activeTab > 0) {
//         setActiveTab(activeTab - 1);
//       }
//     },
//     formData,
//     setFormData,
//     fetchedData,
//   });

//   // Titles for each step
//   const tabs = [
//     "PERSONAL INFORMATION",
//     "CONTACT INFORMATION",
//     "LOAN INFORMATION",
//     "ACCOUNT INFORMATION",
//     "CO‑MAKER/CO‑BORROWER"
//   ];

//   // Fetch data from the API when memberId is available
//   useEffect(() => {
//     if (memberId) {
//       axios
//         .get(`http://localhost:3001/api/member/${memberId}`)
//         .then((response) => {
//           console.log("Fetched data:", response.data);
//           setFetchedData(response.data);
//         })
//         .catch((error) => {
//           console.error("Error fetching data:", error);
//         });
//     }
//   }, [memberId]);

//   // Navigation functions
//   const handlePrevious = () => {
//     if (activeTab > 0) {
//       setActiveTab(activeTab - 1);
//     }
//   };

//   const handleNext = () => {
//     if (activeTab < tabs.length - 1) {
//       setActiveTab(activeTab + 1);
//     }
//   };

//   // Function to save form data - using transformFormData from utils
//   const handleSave = async () => {
//     try {
//       // For the final tab submission, use the form data and loan form state
//       const { memberInfo, loanInfo } = formData;
      
//       if (!memberInfo.memberId) {
//         alert("Member ID is required. Please complete the personal information step.");
//         return;
//       }

//       if (!loanInfo.loanType) {
//         alert("Loan type is required. Please complete the loan information step.");
//         return;
//       }
      
//       // Import the utilities needed for data transformation
//       const { transformFormData } = await import('./utils/FormTransformer');
      
//       // Use the loan form state for calculations
//       const requestedAmount = loanFormState.calculateRequestedAmount();
//       const maxAmount = loanFormState.calculateLoanableAmount();
      
//       // Transform the data for the backend
//       const payload = transformFormData(
//         memberInfo,
//         loanInfo,
//         loanFormState.commodityDetails,
//         loanFormState.maxSacks,
//         requestedAmount,
//         maxAmount
//       );
//       console.log(payload)

//       const response = await axios.post(
//         "http://localhost:3001/api/loan-application",
//         payload
//       );

//       console.log("Loan application submitted successfully:", response.data);
      
//       // Send notification
//       const notificationPayload = {
//         userType: ["System Admin", "Loan Manager", "General Manager"],
//         message: `New Loan application submitted successfully from: ${memberInfo.last_name} ${memberInfo.first_name}`,
//       };

//       await axios.post(
//         "http://localhost:3001/api/notifications",
//         notificationPayload
//       );

//       alert(response.data.message || "Loan application submitted successfully!");
      
//       // Reset form data and navigate if needed
//       setFormData({
//         personalInfo: {},
//         contactInfo: {},
//         memberInfo: {},
//         loanInfo: {},
//         legalBeneficiaries: {},
//         initialContribution: {},
//         accountInformation: {},
//         documents: {},
//         mobilePortal: {},
//       });
      
//       // Navigate back to first tab or redirect
//       setActiveTab(0);
      
//     } catch (error) {
//       console.error("Error submitting loan application:", error);
//       const errorMessage =
//         error.response?.data?.message || "Submission error! Please try again later.";
//       alert(`Error submitting loan application: ${errorMessage}`);
//     }
//   };

//   return (
//     <FormDataContext.Provider value={{ formData, setFormData, fetchedData, selectedMember, members }}>
//       <div className="flex items-center justify-center w-full h-full">
//         <div className="bg-white w-full h-full max-w-none rounded-lg p-2">
//           <h1 className="text-4xl font-extrabold text-center mb-4 text-green-700">
//             LOAN APPLICATION
//           </h1>

//           {/* Step Tabs */}
//           <div className="flex border-b-2 mb-4 overflow-x-auto">
//             {tabs.map((tab, index) => (
//               <div
//                 key={index}
//                 onClick={() => setActiveTab(index)}
//                 className={`py-4 px-6 text-lg font-bold cursor-pointer border-b-4 transition-all duration-300 ${
//                   index === activeTab
//                     ? "border-green-600 text-green-700"
//                     : "border-gray-300 text-gray-600 hover:text-green-700 hover:border-green-500"
//                 }`}
//               >
//                 {tab}
//               </div>
//             ))}
//           </div>

//           {/* Step Content */}
//           <div className="mt-4">
//             {activeTab === 0 && (
//               <PersonalInformation
//                 mode="loan"
//                 handleNext={handleNext}
//                 formData={formData}
//                 setFormData={setFormData}
//                 fetchedData={fetchedData}
//               />
//             )}

//             {activeTab === 1 && (
//               <ContactInformation 
//                 handleNext={handleNext} 
//                 handlePrevious={handlePrevious} 
//                 formData={formData} 
//                 setFormData={setFormData} 
//                 fetchedData={fetchedData} 
//               />
//             )}
//             {activeTab === 2 && (
//   <LoanInformationForm 
//     handleNext={handleNext} 
//     handlePrevious={handlePrevious} 
//     formData={formData}
//     setFormData={setFormData}
//     fetchedData={fetchedData}
//   />
// )}

//             {activeTab === 3 && (
//               <AccountInformation 
//                 handleNext={handleNext} 
//                 handlePrevious={handlePrevious} 
//                 formData={formData} 
//                 setFormData={setFormData} 
//                 fetchedData={fetchedData}
//               />
//             )}

//             {activeTab === 4 && (
//               <div>
//                 <h2 className="text-2xl font-bold mb-4">Co‑Maker / Co‑Borrower Information</h2>
//                 {/* Placeholder: add your Co‑Maker/Co‑Borrower component or form fields here */}
//                 <p>Co‑Maker/Co‑Borrower form goes here.</p>
//                 <div className="flex justify-end mt-6 space-x-4">
//                   <button
//                     className="bg-red-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-red-800 transition-all"
//                     onClick={handlePrevious}
//                     type="button"
//                   >
//                     <span className="text-2xl">&#187;&#187;</span> Previous
//                   </button>
//                   <button
//                     className="bg-green-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-green-800 transition-all"
//                     onClick={handleSave}
//                     type="button"
//                   >
//                     <span className="text-2xl">&#187;&#187;</span> Submit Application
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </FormDataContext.Provider>
//   );
// };

// export default ApplyForLoan;

import React, { useState, useEffect, createContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import PersonalInformation from "./components/PersonalInformation";
import ContactInformation from "../RegisterMemberPages/ContactInformation";
import LoanInformationForm from "./LoanInformation";
import AccountInformation from "./AccountInformation";
import CoMakerForm from "./CoMaker"; // Import the new component
import useLoanFormState from "./hooks/useLoanForm";
import SuccessModal from "./SuccessModal";

export const FormDataContext = createContext();

const ApplyForLoan = () => {
  const location = useLocation();
  const { selectedMember, members } = location.state || {};

  // Derive memberId from selectedMember (if available)
  const memberId = selectedMember ? selectedMember.memberId : null;

  // Track the active tab (step)
  const [activeTab, setActiveTab] = useState(0);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Shared state for the multi-step form data
  const [formData, setFormData] = useState({
    personalInfo: {},
    contactInfo: {},
    memberInfo: {},
    loanInfo: {},
    legalBeneficiaries: {},
    initialContribution: {},
    accountInformation: {},
    documents: {}
  });
  
  // State for storing fetched data from the API
  const [fetchedData, setFetchedData] = useState(null);

  // Get loan form state using the custom hook
  const loanFormState = useLoanFormState({
    handleNext: () => {
      if (activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
      }
    },
    handlePrevious: () => {
      if (activeTab > 0) {
        setActiveTab(activeTab - 1);
      }
    },
    formData,
    setFormData,
    fetchedData,
  });

  // Titles for each step
  const tabs = [
    "PERSONAL INFORMATION",
    "CONTACT INFORMATION",
    "LOAN INFORMATION",
    "ACCOUNT INFORMATION",
    "CO‑MAKER/CO‑BORROWER"
  ];

  // Fetch data from the API when memberId is available
  useEffect(() => {
    if (memberId) {
      axios
        .get(`http://localhost:3001/api/member/${memberId}`)
        .then((response) => {
          console.log("Fetched data:", response.data);
          setFetchedData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [memberId]);

  // Navigation functions
  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleNext = () => {
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  // Function to save form data - using transformFormData from utils
  const handleSave = async () => {
    try {
      // For the final tab submission, use the form data and loan form state
      const { memberInfo, loanInfo } = formData;
      
      if (!memberInfo.memberId) {
        alert("Member ID is required. Please complete the personal information step.");
        return;
      }

      if (!loanInfo.loanType) {
        alert("Loan type is required. Please complete the loan information step.");
        return;
      }
      
      // Import the utilities needed for data transformation
      const { transformFormData } = await import('./utils/FormTransformer');
      
      // Use the loan form state for calculations
      const requestedAmount = loanFormState.calculateRequestedAmount();
      const maxAmount = loanFormState.calculateLoanableAmount();
      
      // Add co-maker details to payload if applicable
      const payload = transformFormData(
        memberInfo,
        loanInfo,
        loanFormState.commodityDetails,
        loanFormState.maxSacks,
        requestedAmount,
        maxAmount
      );
      console.log(payload)

      const response = await axios.post(
        "http://localhost:3001/api/loan-application",
        payload
      );

      console.log("Loan application submitted successfully:", response.data);
      
      // Send notification
      const notificationPayload = {
        userType: ["System Admin", "Loan Manager", "General Manager"],
        message: `New Loan application submitted successfully from: ${memberInfo.last_name} ${memberInfo.first_name}`,
      };

      await axios.post(
        "http://localhost:3001/api/notifications",
        notificationPayload
      );

      // Show success modal instead of alert
      setShowSuccessModal(true);
      
      // Reset form data
      setFormData({
        personalInfo: {},
        contactInfo: {},
        memberInfo: {},
        loanInfo: {},
        legalBeneficiaries: {},
        initialContribution: {},
        accountInformation: {},
        documents: {},
        mobilePortal: {},
      });
      
      return true; // Return true to indicate success
    } catch (error) {
      console.error("Error submitting loan application:", error);
      const errorMessage =
        error.response?.data?.message || "Submission error! Please try again later.";
      alert(`Error submitting loan application: ${errorMessage}`);
      return false; // Return false to indicate failure
    }
  };

  // Handle success modal close
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setActiveTab(0); // Return to first tab
  };

  return (
    <FormDataContext.Provider value={{ formData, setFormData, fetchedData, selectedMember, members }}>
      <div className="flex items-center justify-center w-full h-full">
        <div className="bg-white w-full h-full max-w-none rounded-lg p-2">
          <h1 className="text-4xl font-extrabold text-center mb-4 text-green-700">
            LOAN APPLICATION
          </h1>

          {/* Step Tabs */}
          <div className="flex border-b-2 mb-4 overflow-x-auto">
            {tabs.map((tab, index) => (
              <div
                key={index}
                onClick={() => setActiveTab(index)}
                className={`py-4 px-6 text-lg font-bold cursor-pointer border-b-4 transition-all duration-300 ${
                  index === activeTab
                    ? "border-green-600 text-green-700"
                    : "border-gray-300 text-gray-600 hover:text-green-700 hover:border-green-500"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mt-4">
            {activeTab === 0 && (
              <PersonalInformation
                mode="loan"
                handleNext={handleNext}
                formData={formData}
                setFormData={setFormData}
                fetchedData={fetchedData}
              />
            )}

            {activeTab === 1 && (
              <ContactInformation 
                handleNext={handleNext} 
                handlePrevious={handlePrevious} 
                formData={formData} 
                setFormData={setFormData} 
                fetchedData={fetchedData} 
              />
            )}
            
            {activeTab === 2 && (
              <LoanInformationForm 
                handleNext={handleNext} 
                handlePrevious={handlePrevious} 
                formData={formData}
                setFormData={setFormData}
                fetchedData={fetchedData}
              />
            )}

            {activeTab === 3 && (
              <AccountInformation 
                handleNext={handleNext} 
                handlePrevious={handlePrevious} 
                formData={formData} 
                setFormData={setFormData} 
                fetchedData={fetchedData}
              />
            )}

            {activeTab === 4 && (
              <CoMakerForm
                handlePrevious={handlePrevious}
                handleSave={handleSave}
                formData={formData}
                setFormData={setFormData}
              />
            )}
          </div>
        </div>
      </div>

      {/* Global Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Application Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your loan application has been submitted and is now pending review by our loan officers. You will be notified once it has been processed.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleCloseSuccessModal}
                  className="inline-flex justify-center w-full py-3 rounded-md border border-transparent shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FormDataContext.Provider>
  );
};

export default ApplyForLoan;