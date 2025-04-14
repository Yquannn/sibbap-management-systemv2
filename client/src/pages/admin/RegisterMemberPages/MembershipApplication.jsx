import React, { useState } from "react";
import axios from "axios";
import PersonalInformation from "./PersonalInformation";
import LegalAndDocuments from "./LegalBeneficiariesAndDocuments";

// Pre-initialize the state with every key your backend expects.
const initialFormData = {
  personalInfo: {
    registration_type: "",
    member_type: "Regular member",
    last_name: "",
    middle_name: "",
    first_name: "",
    maiden_name: "",
    extension_name: "",
    date_of_birth: "",
    birthplace_province: "",
    age: "",
    religion: "",
    sex: "",
    civil_status: "",
    highest_educational_attainment: "",
    occupation_source_of_income: "",
    annual_income: "",
    tin_number: "",
    number_of_dependents: "",
    spouse_name: "",
    spouse_occupation_source_of_income: ""
  },
  contactInfo: {
    house_no_street: "",
    barangay: "",
    city: "",
    province: "",
    contact_number: ""
  },
  legalBeneficiaries: {
    primary: { fullName: "", relationship: "", contactNumber: "" },
    secondary: { fullName: "", relationship: "", contactNumber: "" },
    // For simplicity, we start with empty arrays.
    additional: [],
    characterReferences: []
  },
  documents: {
    id_picture: null,
    barangay_clearance: null,
    tax_identification: null,
    valid_id: null,
    membership_agreement: null
  }
};

const Membership = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const tabs = ["PERSONAL INFORMATION", "LEGAL BENEFICIARIES & DOCUMENTS"];

  const handlePrevious = () => {
    if (activeTab > 0) setActiveTab(activeTab - 1);
  };

  const handleNext = () => {
    if (activeTab < tabs.length - 1) setActiveTab(activeTab + 1);
  };

  // Flatten the state by merging all sections into one object.
  const flattenFormData = (data) => {
    return {
      ...data.personalInfo,
      ...data.contactInfo,
      // Map primary beneficiary fields to backend keys.
      primary_beneficiary_name: data.legalBeneficiaries.primary.fullName,
      primary_beneficiary_relationship: data.legalBeneficiaries.primary.relationship,
      primary_beneficiary_contact: data.legalBeneficiaries.primary.contactNumber,
      secondary_beneficiary_name: data.legalBeneficiaries.secondary.fullName,
      secondary_beneficiary_relationship: data.legalBeneficiaries.secondary.relationship,
      secondary_beneficiary_contact: data.legalBeneficiaries.secondary.contactNumber,
      // For simplicity, we'll ignore additional beneficiaries and character references
      // or you can join them into comma‑separated strings if needed.
      // Files will remain under their keys.
      ...data.documents
    };
  };

  // Convert the flattened object to FormData.
  const objectToFormData = (obj) => {
    const formDataObj = new FormData();
    Object.entries(obj).forEach(([key, value]) => {
      // If the value is a File, append it directly.
      if (value instanceof File) {
        formDataObj.append(key, value);
      } else {
        // Otherwise, convert to string.
        formDataObj.append(key, value !== undefined && value !== null ? value : "");
      }
    });
    return formDataObj;
  };

  const handleSave = async () => {
    try {
      const flatData = flattenFormData(formData);
      const formDataObj = objectToFormData(flatData);
      
      // Debug: log the FormData keys/values.
      for (let pair of formDataObj.entries()) {
        // Console log was empty here
      }
      
      const response = await axios.post(
        "http://localhost:3001/api/register-member",
        formDataObj,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setSuccessMessage(response.data.message || "Member Registration successful!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error during registration:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration error! Please try again later.";
      alert(`Error adding member: ${errorMessage}`);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Reset form data after successful submission
    setFormData(initialFormData);
    // Reset to first tab
    setActiveTab(0);
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full h-full max-w-none rounded-lg p-2">
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
              handleNext={handleNext}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {activeTab === 1 && (
            <LegalAndDocuments
              handlePrevious={handlePrevious}
              handleSave={handleSave}
              formData={formData}
              setFormData={setFormData}
            />
          )}
        </div>
      </div>

      {/* Success Modal - Fixed positioning */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                onClick={handleCloseModal}
                className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;