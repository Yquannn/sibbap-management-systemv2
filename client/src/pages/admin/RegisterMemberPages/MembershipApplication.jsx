import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PersonalInformation from "./PersonalInformation";

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
  const [formData, setFormData] = useState(initialFormData);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

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

  const handleSubmit = async (validatedData) => {
    try {
      // Update the form data with the validated data from PersonalInformation
      setFormData(prevData => ({
        ...prevData,
        personalInfo: validatedData.personalInfo,
        contactInfo: validatedData.contactInfo
      }));

      const flatData = flattenFormData({
        ...formData,
        personalInfo: validatedData.personalInfo,
        contactInfo: validatedData.contactInfo
      });
      
      const formDataObj = objectToFormData(flatData);
      
      // Debug: log the FormData keys/values
      for (let pair of formDataObj.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const response = await axios.post(
        "http://localhost:3001/api/register-member",
        formDataObj,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setSuccessMessage(response.data.message || "Member Registration successful!");
      setShowSuccessModal(true);
      navigate("/members-registration");
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
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full h-full max-w-none rounded-lg p-2">
        {/* Step Content */}
        <div className="mt-4">
          <PersonalInformation
            handleNext={handleSubmit}
            formData={formData}
            setFormData={setFormData}
          />
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