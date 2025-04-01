import React, { useState, useEffect } from "react";
import axios from "axios";
import PersonalInformationReg from "./PersonalInformationReg";
import LegalAndDocuments from "./LegalBeneficiaries";
import InitialContribution from "./InitialContribution";
import MobilePortal from "./MemberPortal";
import Success from "./Success";
import { useParams } from "react-router-dom";

// Default values for initial contribution to ensure all keys exist.
const defaultInitialContribution = {
  share_capital: "",
  membership_fee: "",
  identification_card_fee: "",
  kalinga_fund_fee: "",
  initial_savings: "",
};

const MemberRegistration = () => {
  // Track the active step index.
  const [activeTab, setActiveTab] = useState(0);

  // Shared state for multi-step form data.
  const [formData, setFormData] = useState({
    personalInfo: {},
    contactInfo: {},
    legalBeneficiaries: {},
    initialContribution: { ...defaultInitialContribution },
    documents: {},
    mobilePortal: {},
  });

  // State for controlling the success modal.
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Read memberId and mode from URL parameters.
  // The mode will be "add" or "edit" if the user clicked the corresponding button.
  const { mode, memberId } = useParams();

  // Determine if the Initial Contribution step should be removed.
  const removeInitialContribution = mode === "add" || mode === "edit";

  // Build the tabs array conditionally.
  const tabs = [
    "PERSONAL INFORMATION",
    "LEGAL BENEFICIARIES & DOCUMENTS",
    ...(!removeInitialContribution ? ["INITIAL CONTRIBUTION"] : []),
    // "MOBILE PORTAL",
  ];

  // Fetch member data on mount or when memberId changes.
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/member/${memberId}`
        );
        const fetchedData = response.data;
        // Map fetched data into the formData structure.
        setFormData({
          personalInfo: {
            first_name: fetchedData.first_name || "",
            middle_name: fetchedData.middle_name || "",
            last_name: fetchedData.last_name || "",
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
            spouse_occupation_source_of_income:
              fetchedData.spouse_occupation_source_of_income || "",
            monthly_income: fetchedData.monthly_income || "",
            annual_income: fetchedData.annual_income || "",
            tin_number: fetchedData.tin_number || "",
            number_of_dependents: fetchedData.number_of_dependents || "",
            spouse_name: fetchedData.spouse_name || "",
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
            membership_agreement: fetchedData.membership_agreement || "",
            id_picture: fetchedData.id_picture || "",
            barangay_clearance: fetchedData.barangay_clearance || "",
            tax_identification_id: fetchedData.tax_identification_id || "",
            valid_id: fetchedData.valid_id || "",
            primary_beneficiary_name: fetchedData.primary_beneficiary_name || "",
            primary_beneficiary_relationship:
              fetchedData.primary_beneficiary_relationship || "",
            primary_beneficiary_contact:
              fetchedData.primary_beneficiary_contact || "",
            secondary_beneficiary_name:
              fetchedData.secondary_beneficiary_name || "",
            secondary_beneficiary_relationship:
              fetchedData.secondary_beneficiary_relationship || "",
            secondary_beneficiary_contact:
              fetchedData.secondary_beneficiary_contact || "",
          },
          initialContribution: {
            share_capital: fetchedData.share_capital || "",
            membership_fee: fetchedData.membership_fee || "",
            identification_card_fee: fetchedData.identification_card_fee || "",
            kalinga_fund_fee: fetchedData.kalinga_fund_fee || "",
            initial_savings: fetchedData.initial_savings || "",
          },
          mobilePortal: {
            portalUsername: fetchedData.portalUsername || "",
            portalPassword: fetchedData.portalPassword || "",
          },
        });
      } catch (error) {
        console.error("Error fetching member data:", error);
        alert("Failed to fetch data from API");
      }
    };

    if (memberId) {
      fetchMemberData();
    }
  }, [memberId]);

  // Navigation functions for step tabs.
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

  // Save function for final submission.
  const handleSave = async (memberData) => {
    if (removeInitialContribution) {
      // In add or edit mode, skip updating initial contribution.
      try {
        // For example, update personal/legal data.
        await axios.put(
          `http://localhost:3001/api/members/${memberId}`,
          memberData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setSuccessMessage("Member updated successfully!");
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Error updating member:", error);
        alert("Error updating member: " + error.message);
      }
    } else {
      // In register mode, process initial contribution.
      try {
        const dataToSend = memberData || formData.initialContribution;
        const jsonData = {
          share_capital: Number(dataToSend.share_capital),
          identification_card_fee: Number(dataToSend.identification_card_fee),
          membership_fee: Number(dataToSend.membership_fee),
          kalinga_fund_fee: Number(dataToSend.kalinga_fund_fee),
          initial_savings: Number(dataToSend.initial_savings),
        };
        const response = await axios.patch(
          `http://localhost:3001/api/members/${memberId}/financials`,
          jsonData,
          { headers: { "Content-Type": "application/json" } }
        );
        setSuccessMessage(
          response.data.message || "Member Registration successfully!"
        );
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Error during registration:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Registration error! Please try again later.";
        alert(`Error adding member: ${errorMessage}`);
      }
    }
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
            <PersonalInformationReg
              handleNext={handleNext}
              formData={formData}
              setFormData={setFormData}
              isReadOnly={false} // Personal information remains editable
            />
          )}

          {activeTab === 1 && (
            <LegalAndDocuments
              handlePrevious={handlePrevious}
              // If this is the last step (when initial contribution is removed), trigger save.
              handleNext={activeTab === tabs.length - 1 ? handleSave : handleNext}
              formData={formData}
              setFormData={setFormData}
              isReadOnly={false} // Legal & Documents remains editable
            />
          )}

          {!removeInitialContribution &&
            activeTab === 2 && (
              <InitialContribution
                handlePrevious={handlePrevious}
                handleNext={handleSave}
                formData={formData}
                setFormData={setFormData}
                isReadOnly={false}
              />
            )}
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

export default MemberRegistration;
