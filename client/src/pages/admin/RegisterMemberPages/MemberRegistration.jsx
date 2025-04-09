import React, { useState, useEffect } from "react";
import axios from "axios";
import PersonalInformationReg from "./PersonalInformationReg";
import LegalAndDocuments from "./LegalBeneficiaries";
import InitialContribution from "./InitialContribution";
import MobilePortal from "./MemberPortal";
import Success from "./Success";
import { useParams } from "react-router-dom";

// Use numeric defaults for financial values.
const defaultInitialContribution = {
  share_capital: 0,
  membership_fee: 300,
  identification_card_fee: 150,
  kalinga_fund_fee: 100,
  initial_savings: 100,
};

const MemberRegistration = () => {
  // Track the active step index.
  const [activeTab, setActiveTab] = useState(0);

  // Shared state for multi-step form data.
  const [formData, setFormData] = useState({
    personalInfo: {},
    contactInfo: {},
    legalBeneficiaries: {
      primary: { fullName: "", relationship: "", contactNumber: "" },
      secondary: { fullName: "", relationship: "", contactNumber: "" },
      additional: [],
      characterReferences: [
        { fullName: "", position: "", contactNumber: "" },
        { fullName: "", position: "", contactNumber: "" },
      ],
    },
    initialContribution: { ...defaultInitialContribution },
    documents: {},
    mobilePortal: {},
  });

  // State for controlling the success modal.
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Read memberId and mode from URL parameters.
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
              fullName: fetchedData.primary_beneficiary_name || "",
              relationship: fetchedData.primary_beneficiary_relationship || "",
              contactNumber: fetchedData.primary_beneficiary_contact || "",
            },
            secondary: {
              fullName: fetchedData.secondary_beneficiary_name || "",
              relationship: fetchedData.secondary_beneficiary_relationship || "",
              contactNumber: fetchedData.secondary_beneficiary_contact || "",
            },
            additional: [],
            characterReferences: [
              { fullName: "", position: "", contactNumber: "" },
              { fullName: "", position: "", contactNumber: "" },
            ],
          },
          initialContribution: {
            share_capital: fetchedData.share_capital || defaultInitialContribution.share_capital,
            membership_fee: fetchedData.membership_fee || defaultInitialContribution.membership_fee,
            identification_card_fee: fetchedData.identification_card_fee || defaultInitialContribution.identification_card_fee,
            kalinga_fund_fee: fetchedData.kalinga_fund_fee || defaultInitialContribution.kalinga_fund_fee,
            initial_savings: fetchedData.initial_savings || defaultInitialContribution.initial_savings,
          },
          documents: {
            membership_agreement: fetchedData.membership_agreement || null,
            id_picture: fetchedData.id_picture || null,
            barangay_clearance: fetchedData.barangay_clearance || null,
            tax_identification: fetchedData.tax_identification_id || null,
            valid_id: fetchedData.valid_id || null,
          },
          mobilePortal: {
            portalUsername: fetchedData.portalUsername || "",
            portalPassword: fetchedData.portalPassword || "",
          },
        });
      } catch (error) {
        console.error("Error fetching member data:", error);
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

  // Modified handleSave now accepts local contribution data.
  const handleSave = async (localContributionData) => {
    // Use the passed contribution data; if not provided, fallback to parent's state.
    const financials = localContributionData || formData.initialContribution;
    const combinedData = {
      share_capital: financials.share_capital,
      membership_fee: financials.membership_fee,
      identification_card_fee: financials.identification_card_fee,
      kalinga_fund_fee: financials.kalinga_fund_fee,
      initial_savings: financials.initial_savings,
    };

    console.log("Combined financial data:", combinedData);

    try {
      const response = await axios.patch(
        `http://localhost:3001/api/members/${memberId}/financials`,
        combinedData,
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccessMessage("Membership successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating member data:", error);
      alert("Error updating member data: " + error.message);
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
              handleNext={handleSave}  // Pass handleSave as the callback.
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
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default MemberRegistration;
