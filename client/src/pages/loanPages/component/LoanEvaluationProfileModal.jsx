import React, { useState, useEffect } from 'react';
import pic from "../component/blankPicture.png"; // Fallback placeholder image

const LoanEvaluationProfileModal = ({ member, onClose }) => {
  const [memberState, setMemberState] = useState(member);
  // Top-level tabs: "memberInfo", "existingLoan", "loanApplication"
  const [activeTab, setActiveTab] = useState("memberInfo");
  const [showMessage, setShowMessage] = useState(false); // For future success/error messages
  const [messageType, setMessageType] = useState(""); // e.g. "success" or "error"
  const [message, setMessage] = useState(""); // Message to display

  useEffect(() => {
    setMemberState(member);
  }, [member]);

  if (!memberState) return null;

  // Format dates
  const memberSinceDate = new Date(memberState.registrationDate);
  const formattedDate = memberSinceDate.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  const dateOfBirth = new Date(memberState.dateOfBirth);
  const formDate = dateOfBirth.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Profile picture URL fallback to pic if not available.
  const idPictureUrl = memberState.idPicture 
    ? `http://localhost:3001/uploads/${memberState.idPicture}` 
    : pic;

  // Optional: Function to hide success/error messages later.
  const handleCloseMessage = () => {
    setShowMessage(false);
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-5xl w-full relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold">Loan Evaluation</h2>
          <button onClick={onClose} className="text-red-500 text-3xl">&times;</button>
        </div>

        {/* Top-Level Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("memberInfo")}
              className={`px-5 py-2 font-semibold ${
                activeTab === "memberInfo"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500"
              }`}
            >
              Member Info
            </button>
            <button
              onClick={() => setActiveTab("existingLoan")}
              className={`px-5 py-2 font-semibold ${
                activeTab === "existingLoan"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500"
              }`}
            >
              Existing Loan
            </button>
            <button
              onClick={() => setActiveTab("loanApplication")}
              className={`px-5 py-2 font-semibold ${
                activeTab === "loanApplication"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Loan Application
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "memberInfo" && (
          <>
            {/* Member Information Section */}
            <div className="flex flex-col md:flex-row mb-6 ">
              <div className="md:w-1/3 text-center mb-4 md:mb-0 ">
                <img
                  src={idPictureUrl}
                  alt="ID Picture"
                  className="w-32 h-32 rounded-full object-cover mx-auto border"
                />
                <h5 className="text-sm mt-2">{memberState.memberType || "Member Type"}</h5>
                <h3 className="text-xl font-bold mt-1">
                  {memberState.LastName}, {memberState.FirstName} {memberState.MiddleName}
                </h3>
              </div>
              <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4 ">
                <div>
                  <p className="text-gray-700">
                    <span className="font-bold">Code Number:</span> {memberState.memberCode || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold">Member Since:</span> {formattedDate}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-bold">Age:</span> {memberState.age || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold">Sex:</span> {memberState.sex || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-bold">Contact No:</span> {memberState.contactNumber || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold">Date of Birth:</span> {formDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Eligibility Card */}
              <div className="p-4 bg-gray-100 rounded-lg shadow">
                <h3 className="text-xl font-bold text-center mb-4">Eligibility</h3>
                <p className="text-gray-700 mb-2">
                  <span className="font-bold">Note:</span> Company’s loan eligibility will prevail.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Maximum Loan Amount: {memberState.maxLoanAmount || "N/A"}</li>
                  <li>Maturity: {memberState.loanTerm || "N/A"}</li>
                  <li>Loan Entitlement: {memberState.loanEntitlement || "N/A"}</li>
                  <li>Minimum Share Capital: {memberState.minimumShareCapital || "N/A"}</li>
                  <li>Interest Rate: {memberState.interestRate || "N/A"}</li>
                  <li>Service Fee: {memberState.serviceFee || "N/A"}</li>
                  <li>Capital Build Up: {memberState.capitalBuildUp || "N/A"}</li>
                  <li>Renewal Period: {memberState.renewalPeriod || "N/A"}</li>
                </ul>
              </div>

              {/* Accounts Card */}
              <div className="p-4 bg-gray-100 rounded-lg shadow">
                <h3 className="text-xl font-bold text-center mb-4">Accounts</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div>
                    <p className="text-gray-700 mb-2">
                      <span className="font-bold">Account Number:</span> {memberState.accountNumber || "N/A"}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-bold">Code Number:</span> {memberState.memberCode || "N/A"}
                    </p>
                  </div>
                  {/* Right Column */}
                  <div>
                    <p className="text-gray-700 mb-2">
                      <span className="font-bold">Regular Savings:</span> <span className='px-2 py-1 bg-orange-500 rounded-full  text-white'>{memberState.savingsAmount || "N/A"}</span> 
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-bold ">Share Capital:</span> { <span className='px-2 py-1 bg-green-500 rounded-full  text-white'>{memberState.shareCapital || "N/A"}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "existingLoan" && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
            <h3 className="text-xl font-bold text-center mb-4">Existing Loan</h3>
            {memberState.existingLoan ? (
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-bold">Loan Amount:</span> {memberState.existingLoan.loanAmount || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Loan Term:</span> {memberState.existingLoan.loanTerm || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Interest Rate:</span> {memberState.existingLoan.interestRate || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Balance:</span> {memberState.existingLoan.balance || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Status:</span> {memberState.existingLoan.status || "N/A"}
                </p>
              </div>
            ) : (
              <p className="text-center text-gray-700">No existing loan.</p>
            )}
          </div>
        )}

        {activeTab === "loanApplication" && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
            <h3 className="text-xl font-bold text-center mb-4">Loan Application</h3>
            {memberState.loanApplication ? (
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-bold">Requested Amount:</span> {memberState.loanApplication.requestedAmount || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Loan Purpose:</span> {memberState.loanApplication.loanPurpose || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Application Date:</span> {memberState.loanApplication.applicationDate || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Status:</span> {memberState.loanApplication.status || "N/A"}
                </p>
              </div>
            ) : (
              <p className="text-center text-gray-700">No loan application.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default LoanEvaluationProfileModal;
