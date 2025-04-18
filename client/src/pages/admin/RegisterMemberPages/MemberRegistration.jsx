import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import PersonalInformationReg from "./PersonalInformationReg";
import LegalAndDocuments from "./LegalBeneficiaries";
import InitialContribution from "./InitialContribution";

// Allow null values in financial defaults
const defaultInitialContribution = {
  share_capital: null,
  membership_fee: null,
  identification_card_fee: null,
  kalinga_fund_fee: null,
  initial_savings: null,
};

// Default values for legal beneficiaries and documents
const initialLegalBeneficiaries = {
  primary: { fullName: "", relationship: "", contactNumber: "" },
  secondary: { fullName: "", relationship: "", contactNumber: "" },
  additional: [],
  characterReferences: [
    { fullName: "", position: "", contactNumber: "" },
    { fullName: "", position: "", contactNumber: "" },
  ],
};

const initialDocuments = {
  id_picture: null,
  barangay_clearance: null,
  tax_identification_id: null,
  valid_id: null,
  membership_agreement: null,
};

const MemberRegistration = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {},
    contactInfo: {},
    legalBeneficiaries: { ...initialLegalBeneficiaries },
    initialContribution: { ...defaultInitialContribution },
    documents: { ...initialDocuments }  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { mode, memberId } = useParams();
  const removeInitialContribution = mode === "add" || mode === "edit";

  const tabs = [
    "PERSONAL INFORMATION",
    "LEGAL BENEFICIARIES & DOCUMENTS",
    ...(!removeInitialContribution ? ["INITIAL CONTRIBUTION"] : []),
  ];

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/member/${memberId}`
        );
        const fetchedData = response.data;
        
        // Extract primary and secondary beneficiaries from the nested structure
        const primaryBeneficiary = fetchedData.legalBeneficiaries?.primary || {};
        const secondaryBeneficiary = fetchedData.legalBeneficiaries?.secondary || {};
        const additionalBeneficiaries = fetchedData.legalBeneficiaries?.additional || [];
        
        // Extract character references from the array
        const characterReferences = fetchedData.characterReferences || [];
        
        setFormData({
          personalInfo: {
            first_name: fetchedData.first_name || "",
            middle_name: fetchedData.middle_name || "",
            last_name: fetchedData.last_name || "",
            extension_name: fetchedData.extension_name || "",
            maiden_name: fetchedData.maiden_name || "",
            date_of_birth: fetchedData.date_of_birth || "",
            age: fetchedData.age || "",
            birthplace_province: fetchedData.birthplace_province || "",
            religion: fetchedData.religion || "",
            member_type: fetchedData.member_type || "",
            registration_type: fetchedData.registration_type || "",
            civil_status: fetchedData.civil_status || "",
            sex: fetchedData.sex || "",
            highest_educational_attainment:
              fetchedData.highest_educational_attainment || "",
            occupation_source_of_income:
              fetchedData.occupation_source_of_income || "",
            spouse_name: fetchedData.spouse_name || "",
            spouse_occupation_source_of_income:
              fetchedData.spouse_occupation_source_of_income || "",
            tin_number: fetchedData.tin_number || "",
            number_of_dependents: fetchedData.number_of_dependents || "",
            annual_income: fetchedData.annual_income || "",
          },
          contactInfo: {
            house_no_street: fetchedData.house_no_street || "",
            barangay: fetchedData.barangay || "",
            city: fetchedData.city || "",
            province: fetchedData.province || "",
            contact_number: fetchedData.contact_number || "",
            email: fetchedData.email || "",
          },
          legalBeneficiaries: {
            primary: {
              fullName: primaryBeneficiary.beneficiaryName || "",
              relationship: primaryBeneficiary.relationship || "",
              contactNumber: primaryBeneficiary.beneficiaryContactNumber || "",
            },
            secondary: {
              fullName: secondaryBeneficiary.beneficiaryName || "",
              relationship: secondaryBeneficiary.relationship || "",
              contactNumber: secondaryBeneficiary.beneficiaryContactNumber || "",
            },
            additional: additionalBeneficiaries.map(beneficiary => ({
              fullName: beneficiary.beneficiaryName || "",
              relationship: beneficiary.relationship || "",
              contactNumber: beneficiary.beneficiaryContactNumber || "",
            })),
            characterReferences: characterReferences.length > 0 
              ? characterReferences.map(ref => ({
                  fullName: ref.fullName || "",
                  position: ref.position || "",
                  contactNumber: ref.contactNumber || "",
                }))
              : [
                  { fullName: "", position: "", contactNumber: "" },
                  { fullName: "", position: "", contactNumber: "" },
                ],
          },
          initialContribution: {
            share_capital: fetchedData.share_capital ?? null,
            membership_fee: fetchedData.membership_fee ?? null,
            identification_card_fee: fetchedData.identification_card_fee ?? null,
            kalinga_fund_fee: fetchedData.kalinga_fund_fee ?? null,
            initial_savings: fetchedData.initial_savings ?? null,
          },
          documents: {
            membership_agreement: fetchedData.membership_agreement || null,
            id_picture: fetchedData.id_picture || null,
            barangay_clearance: fetchedData.barangay_clearance || null,
            tax_identification_id: fetchedData.tax_identification_id || null,
            valid_id: fetchedData.valid_id || null,
          }
        });
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
    };

    if (memberId) {
      fetchMemberData();
    }
  }, [memberId]);

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

  const handleSave = async (formDataToSave) => {
    // Use the provided form data or the current form state
    const currentFormData = formDataToSave || formData;
    const { personalInfo, contactInfo, legalBeneficiaries, documents } = currentFormData;
    
    // Prepare data according to the backend's expected structure
    const updateData = {
      // Personal information fields
      registration_type: personalInfo.registration_type || "",
      last_name: personalInfo.last_name || "",
      first_name: personalInfo.first_name || "",
      middle_name: personalInfo.middle_name || "",
      extension_name: personalInfo.extension_name || "",
      tin_number: personalInfo.tin_number || "",
      date_of_birth: personalInfo.date_of_birth || "",
      birthplace_province: personalInfo.birthplace_province || "",
      number_of_dependents: personalInfo.number_of_dependents || "",
      age: personalInfo.age || "",
      sex: personalInfo.sex || "",
      civil_status: personalInfo.civil_status || "",
      religion: personalInfo.religion || "",
      highest_educational_attainment: personalInfo.highest_educational_attainment || "",
      annual_income: personalInfo.annual_income || "",
      occupation_source_of_income: personalInfo.occupation_source_of_income || "",
      spouse_name: personalInfo.spouse_name || "",
      spouse_occupation_source_of_income: personalInfo.spouse_occupation_source_of_income || "",
      
      // Contact information fields
      contact_number: contactInfo.contact_number || "",
      house_no_street: contactInfo.house_no_street || "",
      barangay: contactInfo.barangay || "",
      city: contactInfo.city || "",
      
      // Format legal beneficiaries to match the backend structure
      legalBeneficiaries: {
        primary: {
          beneficiaryName: legalBeneficiaries.primary.fullName || "",
          relationship: legalBeneficiaries.primary.relationship || "",
          beneficiaryContactNumber: legalBeneficiaries.primary.contactNumber || "",
        },
        secondary: {
          beneficiaryName: legalBeneficiaries.secondary.fullName || "",
          relationship: legalBeneficiaries.secondary.relationship || "",
          beneficiaryContactNumber: legalBeneficiaries.secondary.contactNumber || "",
        },
        additional: legalBeneficiaries.additional.map(beneficiary => ({
          beneficiaryName: beneficiary.fullName || "",
          relationship: beneficiary.relationship || "",
          beneficiaryContactNumber: beneficiary.contactNumber || "",
        })),
      },
      
      // Format character references to match the backend structure
      characterReferences: legalBeneficiaries.characterReferences.filter(ref => ref.fullName).map(ref => ({
        fullName: ref.fullName || "",
        position: ref.position || "",
        contactNumber: ref.contactNumber || "",
      })),
    };

    try {
      // Create FormData object
      const formDataObj = new FormData();
      
      // Add all text fields to FormData
      // Convert nested objects to JSON strings
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formDataObj.append(key, JSON.stringify(value));
          } else {
            formDataObj.append(key, value);
          }
        }
      }
      
      // Add file fields with EXACT names matching the Multer configuration
      if (documents.id_picture instanceof File) {
        formDataObj.append('id_picture', documents.id_picture);
      }
      
      if (documents.barangay_clearance instanceof File) {
        formDataObj.append('barangay_clearance', documents.barangay_clearance);
      }
      
      if (documents.tax_identification_id instanceof File) {
        formDataObj.append('tax_identification_id', documents.tax_identification_id);
      }
      
      if (documents.valid_id instanceof File) {
        formDataObj.append('valid_id', documents.valid_id);
      }
      
      if (documents.membership_agreement instanceof File) {
        formDataObj.append('membership_agreement', documents.membership_agreement);
      }

      // Send the request without setting Content-Type header
      // Let the browser set it automatically with the correct boundary
      const response = await axios.put(
        `http://localhost:3001/api/member/update-info/${memberId}`,
        formDataObj,
        { headers: {} }
      );
      
      setSuccessMessage("Member information updated successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating member data:", error);
      alert("Error updating member data: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full h-full max-w-none rounded-lg p-2">
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

        <div className="mt-4">
          {activeTab === 0 && (
            <PersonalInformationReg
              handleNext={handleNext}
              formData={formData}
              setFormData={setFormData}
              isReadOnly={false}
            />
          )}

          {activeTab === 1 && (
            <LegalAndDocuments
              handlePrevious={handlePrevious}
              handleNext={activeTab === tabs.length - 1 ? handleSave : handleNext}
              formData={formData}
              setFormData={setFormData}
              isReadOnly={false}
            />
          )}

          {!removeInitialContribution && activeTab === 2 && (
            <InitialContribution
              handlePrevious={handlePrevious}
              isReadOnly={false}
            />
          )}
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">{successMessage}</h3>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberRegistration;