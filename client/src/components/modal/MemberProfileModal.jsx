import React, { useState } from "react";
import axios from "axios";

const MemberProfileModal = ({ isOpen, onClose, member }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [activationLoading, setActivationLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [message, setMessage] = useState("");


  if (!isOpen || !member) return null;

  // Helper to build an image URL (adjust base URL as needed)
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Format date helper
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ------------------ Tab Panels ------------------

  const PersonalInfo = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-10">
        {/* Member Picture */}
        <div className="flex-shrink-0">
          <img
            src={imageUrl(member.id_picture)}
            alt="Member ID"
            className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-md"
          />
        </div>
        {/* Member Details */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            {member.last_name}, {member.first_name} {member.middle_name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-base">
            <div>
              <p>
                <span className="font-semibold">Member Code:</span> {member.memberCode}
              </p>
              <p>
                <span className="font-semibold">Member Type:</span> {member.member_type}
              </p>
              <p>
                <span className="font-semibold">Registration Type:</span> {member.registration_type}
              </p>
              <p>
                <span className="font-semibold">Birthplace:</span> {member.birth_place_province || member.birthplace_province}
              </p>
              <p>
                <span className="font-semibold">Religion:</span> {member.religion}
              </p>
              <p>
                <span className="font-semibold">Annual Income:</span> {member.annual_income}
              </p>
              <p>
                <span className="font-semibold">Dependents:</span> {member.number_of_dependents}
              </p>
              <p>
                <span className="font-semibold">Spouse Name:</span> {member.name_of_spouse || member.spouse_name}
              </p>
              <p>
                <span className="font-semibold">Occupation:</span> {member.occupation_source_of_income}
              </p>
              <p>
                <span className="font-semibold">Spouse Occupation:</span> {member.spouse_occupation_source_of_income}
              </p>
              <p>
                <span className="font-semibold">TIN:</span> {member.tin_number}
              </p>
              <p>
                <span className="font-semibold">DOB:</span> {formatDate(member.date_of_birth)}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Civil Status:</span> {member.civil_status}
              </p>
              <p>
                <span className="font-semibold">Sex:</span> {member.sex}
              </p>
              <p>
                <span className="font-semibold">Age:</span> {member.age}
              </p>
              <p>
                <span className="font-semibold">Contact:</span> {member.contact_number}
              </p>
              <div>
                <span className="font-semibold">Address:</span>
                <p className="mt-1">
                  {`${member.house_no_street}, ${member.barangay}, ${member.city}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  
  
  

  const DocumentsTab = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {member.id_picture && (
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-600 mb-1">ID Picture</p>
          <a 
            href={imageUrl(member.id_picture)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img
              src={imageUrl(member.id_picture)}
              alt="ID Picture"
              className="w-28 h-28 object-cover rounded shadow-md hover:opacity-75 transition"
            />
          </a>
        </div>
      )}
      {member.barangay_clearance && (
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-600 mb-1">Barangay Clearance</p>
          <a 
            href={imageUrl(member.barangay_clearance)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img
              src={imageUrl(member.barangay_clearance)}
              alt="Barangay Clearance"
              className="w-28 h-28 object-cover rounded shadow-md hover:opacity-75 transition"
            />
          </a>
        </div>
      )}
      {member.tax_identification_id && (
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-600 mb-1">TIN Document</p>
          <a 
            href={imageUrl(member.tax_identification_id)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img
              src={imageUrl(member.tax_identification_id)}
              alt="TIN Document"
              className="w-28 h-28 object-cover rounded shadow-md hover:opacity-75 transition"
            />
          </a>
        </div>
      )}
      {member.valid_id && (
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-600 mb-1">Valid ID</p>
          <a 
            href={imageUrl(member.valid_id)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img
              src={imageUrl(member.valid_id)}
              alt="Valid ID"
              className="w-28 h-28 object-cover rounded shadow-md hover:opacity-75 transition"
            />
          </a>
        </div>
      )}
      {member.membership_agreement && (
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-600 mb-1">
            Membership Agreement
          </p>
          <a 
            href={imageUrl(member.membership_agreement)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <img
              src={imageUrl(member.membership_agreement)}
              alt="Membership Agreement"
              className="w-28 h-28 object-cover rounded shadow-md hover:opacity-75 transition"
            />
          </a>
        </div>
      )}
    </div>
  );
  

  // BENEFICIARIES & REFERENCES PANEL
  const BeneficiariesReferences = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-sm">
      <div>
        <h3 className="text-xl font-bold mb-2">Beneficiaries</h3>
        <p>
          <span className="font-bold">Name:</span>{" "}
          {member.beneficiaryName || "N/A"}
        </p>
        <p>
          <span className="font-bold">Relationship:</span>{" "}
          {member.relationship || "N/A"}
        </p>
        <p>
          <span className="font-bold">Contact:</span>{" "}
          {member.beneficiary_contactNumber || "N/A"}
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Character Reference</h3>
        <p>
          <span className="font-bold">Name:</span>{" "}
          {member.referenceName || "N/A"}
        </p>
        <p>
          <span className="font-bold">Position:</span>{" "}
          {member.position || "N/A"}
        </p>
        <p>
          <span className="font-bold">Contact:</span>{" "}
          {member.reference_contactNumber || "N/A"}
        </p>
      </div>
    </div>
  );

 // ACCOUNT INFO PANEL (with Activate Account button)
const AccountInfo = () => (
  <div className="space-y-4 text-gray-700 text-sm">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <p className="font-bold">Email:</p>
        <p>{member.email}</p>
      </div>
      <div>
        <p className="font-bold">Password:</p>
        <p>{member.password}</p>
      </div>
      <div>
        <p className="font-bold">Status:</p>
        <p>{member.accountStatus}</p>
      </div>
    </div>
    {member.accountStatus &&
      member.accountStatus.toUpperCase() !== "ACTIVATED" && (
        <button
          onClick={async () => {
            setActivationLoading(true);
            try {
              const response = await axios.put(
                `http://localhost:3001/api/activate/${member.memberId}`
              );
              // Update member's account status locally
              member.accountStatus = "ACTIVATED";
              member.email = member.memberCode;
              member.password =  member.memberCode;
              // Show success modal/message
              setMessageType("success");
              setMessage("Account activated successfully!");
              setShowMessage(true);
            } catch (error) {
              console.error("Error activating account:", error);
              // Optionally show error modal/message
              setMessageType("error");
              setMessage("Error activating account.");
              setShowMessage(true);
            } finally {
              setActivationLoading(false);
            }
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          disabled={activationLoading}
        >
          {activationLoading ? "Activating..." : "Activate Account"}
        </button>
      )}
  </div>
);


  // LOAN HISTORY PANEL
  const LoanHistory = () => {
    if (!member.loan_history || member.loan_history.length === 0)
      return <p className="text-gray-600">No loan history available.</p>;

    return (
      <div className="space-y-4">
        {member.loan_history.map((loan, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg shadow-sm bg-gray-50"
          >
            <p className="text-sm">
              <span className="font-bold">Loan Type:</span> {loan.loan_type}
            </p>
            <p className="text-sm">
              <span className="font-bold">Amount:</span> ₱{loan.loan_amount}
            </p>
            <p className="text-sm">
              <span className="font-bold">Term:</span> {loan.terms} months
            </p>
            <p className="text-sm">
              <span className="font-bold">Status:</span> {loan.status}
            </p>
            <p className="text-xs text-gray-500">
              Applied on: {formatDate(loan.application_date)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // INITIAL CONTRIBUTION PANEL
  const InitialContribution = () => {
    if (!member.initial_contribution)
      return <p className="text-gray-600">No initial contribution data.</p>;

    const contrib = member.initial_contribution;
    return (
      <div className="space-y-2 text-gray-700 text-sm">
        <p>
          <span className="font-bold">Share Capital Contribution Amount:</span> ₱{contrib.share_capital}
        </p>
        <p>
          <span className="font-bold">Identification Card fee:</span> ₱{contrib.tax_identification_id}
        </p>
        <p>
          <span className="font-bold">Membership fee:</span> ₱{contrib.membership_fee}
        </p>
        <p>
          <span className="font-bold">Kalinga fund fee:</span> ₱{contrib.kalinga_fund_fee}
        </p>
        <p>
          <span className="font-bold">Initial Savings:</span> ₱{contrib.initial_savings}
        </p>
      </div>
    );
  };

  // ----------------- Tab Headers -----------------
  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "documents", label: "Documents" },
    { id: "beneficiaries", label: "Beneficiaries" },
    { id: "account", label: "Account Info" },
    { id: "loan", label: "Loan History" },
    { id: "contribution", label: "Initial Contribution" },
  ];

  const renderTabHeaders = () => (
    <div className="flex border-b border-gray-300 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 -mb-px text-lg font-semibold transition-colors ${
            activeTab === tab.id
              ? "border-b-4 border-green-600 text-green-600"
              : "text-gray-600 hover:text-green-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // ----------------- Render Modal -----------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-3xl font-bold text-gray-800">Member Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 text-3xl"
          >
            &times;
          </button>
        </div>
        {/* Tab Headers */}
        <div className="px-6 py-4">{renderTabHeaders()}</div>
        {/* Tab Content */}
        <div className="px-6 py-4">
          {activeTab === "personal" && <PersonalInfo />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "beneficiaries" && <BeneficiariesReferences />}
          {activeTab === "account" && <AccountInfo />}
          {activeTab === "loan" && <LoanHistory />}
          {activeTab === "contribution" && <InitialContribution />}
        </div>
        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileModal;
