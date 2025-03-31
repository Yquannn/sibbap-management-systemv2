import React, { useState } from "react";
import axios from "axios";
import MemberApplication from "./MembershipApplication"; // Import the MemberApplication component
import LegalBeneficiaries from "./LegalBeneficiaries"; // Rename for clarity
import Success from "./Success"; // Import the Success component
// import InitialContribution from "./InitialContribution";
// import Documents from "./Documents";
// import MemberPortal from "./MemberPortal";

const Membership = () => {
  // Track the active step index (step)
  const [activeStep, setActiveStep] = useState(0);

  // Shared state for all multi-step form data
  const [formData, setFormData] = useState({
    personalInfo: {},
    contactInfo: {},
    legalBeneficiaries: {},
    initialContribution: {},
    documents: {},
    mobilePortal: {},
  });

  // State for controlling the success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Navigate back one step
  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Navigate forward one step
  const handleNext = () => {
    if (activeStep < 4) {  // Assuming there are 5 steps in total
      setActiveStep(activeStep + 1);
    }
  };

  const handleSave = async () => {
    try {
      // Create a FormData object and flatten the nested formData
      const formDataObj = new FormData();

      // Loop over each section (personalInfo, contactInfo, etc.)
      Object.entries(formData).forEach(([section, sectionData]) => {
        Object.entries(sectionData).forEach(([key, value]) => {
          // If value is a File, append it; otherwise, append a string value.
          if (value instanceof File) {
            formDataObj.append(key, value);
          } else {
            formDataObj.append(key, value !== undefined && value !== null ? value : "");
          }
        });
      });

      const response = await axios.post(
        "http://localhost:3001/api/register-member",
        formDataObj,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Registration successful", response.data);
      setSuccessMessage(response.data.message || "Member Registration successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error during registration:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration error! Please try again later.";
      alert(`Error adding member: ${errorMessage}`);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full h-full max-w-none rounded-lg p-2">
        <h1 className="text-4xl font-extrabold text-center mb-4 text-green-700">
          MEMBERSHIP APPLICATION
        </h1>

        {/* Step Content */}
        <div className="mt-4">
          {/* Display step content based on activeStep */}
          {activeStep === 0 && (
            <MemberApplication
              handleNext={handleNext}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {activeStep === 1 && (
            <LegalBeneficiaries
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {/* Add more steps here as necessary */}
          {/* Example steps below: */}
          {/* {activeStep === 2 && <InitialContribution ... />} */}
          {/* {activeStep === 3 && <Documents ... />} */}
          {/* {activeStep === 4 && <MemberPortal ... />} */}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <Success
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Membership;
