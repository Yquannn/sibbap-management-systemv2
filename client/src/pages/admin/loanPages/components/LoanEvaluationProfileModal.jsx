import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pic from "./blankPicture.png"; // Fallback placeholder image
import { CheckCircle, Clock, XCircle } from "lucide-react";

const LoanEvaluationProfileModal = ({ member, onClose }) => {
  const [memberState, setMemberState] = useState(member);
  const [activeTab, setActiveTab] = useState("loanApplication");

  // Message and feedback state
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  // Loan Application state
  const [loanApplication, setLoanApplication] = useState(null);
  const [loanApplicationLoading, setLoanApplicationLoading] = useState(false);
  const [loanApplicationError, setLoanApplicationError] = useState(null);

  // Existing Loan state – expected as an array
  const [existingLoan, setExistingLoan] = useState(null);
  const [existingLoanLoading, setExistingLoanLoading] = useState(false);
  const [existingLoanError, setExistingLoanError] = useState(null);

  // Update local member state when prop changes
  useEffect(() => {
    if (!memberState || memberState.id !== member.id) {
      setMemberState(member);
      setLoanApplication(null);
      setLoanApplicationError(null);
      setExistingLoan(null);
      setExistingLoanError(null);
    }
  }, [member]);

  // Fetch Loan Application details when "loanApplication" tab is active
  useEffect(() => {
    if (
      activeTab === "loanApplication" &&
      memberState &&
      memberState.loan_application_id &&
      !loanApplication &&
      !loanApplicationLoading
    ) {
      setLoanApplicationLoading(true);
      axios
        .get(`http://localhost:3001/api/loan-application/${memberState.loan_application_id}`)
        .then((res) => {
          setLoanApplication(res.data);
        })
        .catch((error) => {
          console.error("Error fetching loan application:", error);
          setLoanApplicationError("Failed to fetch loan application.");
        })
        .finally(() => {
          setLoanApplicationLoading(false);
        });
    }
  }, [activeTab, memberState?.loan_application_id, loanApplication, loanApplicationLoading]);

  // Fetch Existing Loan details when "existingLoan" tab is active
  useEffect(() => {
    if (
      activeTab === "existingLoan" &&
      memberState &&
      memberState.memberId &&
      !existingLoan &&
      !existingLoanLoading
    ) {
      setExistingLoanLoading(true);
      axios
        .get(`http://192.168.254.103:3001/api/member-existing-loan-application/${memberState.memberId}`)
        .then((res) => {
          // Expecting an array response
          setExistingLoan(res.data);
          console.log("Existing loans fetched:", res.data);
        })
        .catch((error) => {
          console.error("Error fetching existing loan:", error);
          setExistingLoanError("Failed to fetch existing loan.");
        })
        .finally(() => {
          setExistingLoanLoading(false);
        });
    }
  }, [activeTab, memberState?.memberId, existingLoan, existingLoanLoading]);

  if (!memberState) return null;

  // Date formatting
  const formattedDOB = new Date(memberState.date_of_birth).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Profile picture or fallback
  const idPictureUrl = memberState.id_picture
    ? `http://localhost:3001/uploads/${memberState.id_picture}`
    : pic;

  // Dismiss message
  const handleCloseMessage = () => {
    setShowMessage(false);
    setMessage("");
    setMessageType("");
  };

  // Button action handlers (using axios PUT)
  const handlePassDue = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/loan-applicant/${memberState.loan_application_id}/remarks`,
        { remarks: "PassDue" }
      );
      setShowMessage(true);
      setMessage("Loan application marked as PassDue.");
      setMessageType("success");
      setShowFeedbackInput(false);
    } catch (error) {
      console.error("Error updating loan application:", error);
      setShowMessage(true);
      setMessage("Failed to update loan application status.");
      setMessageType("error");
    }
  };

  const handleMispayment = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/loan-applicant/${memberState.loan_application_id}/remarks`,
        { remarks: "Mispayment" }
      );
      setShowMessage(true);
      setMessage("Loan application marked as Mispayment.");
      setMessageType("success");
      setShowFeedbackInput(true);
    } catch (error) {
      console.error("Error updating loan application:", error);
      setShowMessage(true);
      setMessage("Failed to update loan application status.");
      setMessageType("error");
    }
  };

  const handleUpdated = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/loan-applicant/${memberState.loan_application_id}/remarks`,
        { remarks: "Updated" }
      );
      setShowMessage(true);
      setMessage("Loan application marked as Updated.");
      setMessageType("success");
      setShowFeedbackInput(true);
    } catch (error) {
      console.error("Error updating loan application:", error);
      setShowMessage(true);
      setMessage("Failed to update loan application status.");
      setMessageType("error");
    }
  };

  // Feedback submission handler
  const handleFeedbackSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/loan-applicant/${memberState.loan_application_id}/feedback`,
        { feedback }
      );
      setShowMessage(true);
      setMessage("Feedback submitted successfully.");
      setMessageType("success");
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setShowMessage(true);
      setMessage("Failed to submit feedback.");
      setMessageType("error");
    }
  };

  // Helpers for status mapping, colors, and icons
  const mapStatus = (status) => {
    if (status === "Waiting for evaluation" || status === "Passed") {
      return "Pending";
    }
    if (status === "Failed") {
      return "Rejected";
    }
    return status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="text-green-600" size={20} />;
      case "Pending":
        return <Clock className="text-yellow-600" size={20} />;
      case "Rejected":
        return <XCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  // Disable actions if loanApplication.status is "Approved" or "Rejected"
  const disableActions =
    loanApplication &&
    ["approved", "rejected"].includes(loanApplication.status.toLowerCase());

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-7xl w-full relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold">Loan Evaluation</h2>
          <button onClick={onClose} className="text-red-500 text-3xl">&times;</button>
        </div>

        {/* Success/Error Message */}
        {showMessage && (
          <div className={`mb-4 p-4 rounded-lg ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
            <button onClick={handleCloseMessage} className="ml-4 text-sm underline">Dismiss</button>
          </div>
        )}

        {/* Member Info */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row mb-6">
            {/* Profile Image & Basic Info */}
            <div className="md:w-1/3 text-center mb-4 md:mb-0 p-6 bg-white shadow-lg rounded-lg mr-6">
              <img
                src={idPictureUrl}
                alt="ID Picture"
                className="w-40 h-40 rounded-full object-cover mx-auto border mt-8"
              />
              <h3 className="text-3xl font-bold mt-1">
                {memberState.last_name}, {memberState.first_name} {memberState.middle_name}
              </h3>
            </div>
            <div className="md:w-2/3">
              <div className="columns-1 md:columns-2 gap-4 p-4 bg-white shadow-lg rounded-lg">
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Code Number:</strong> {memberState.memberCode}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Occupation Source of Income:</strong> {memberState.occupation_source_of_income}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Monthly Salary:</strong> {memberState.monthly_income}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Date of Birth:</strong>
                  <span className="ml-1">{formattedDOB}</span>
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Place of Birth:</strong> {memberState.birthplace_province}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Spouse Name:</strong> {memberState.spouse_name}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Spouse Occupation:</strong> {memberState.spouse_occupation_source_of_income}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Spouse Monthly Income:</strong> {memberState.spouse_monthly_income}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Other Income/Business:</strong> N/A
                </p>
                <p className="break-inside-avoid">
                  <strong className="text-gray-600">Address:</strong> {memberState.house_no_street} {memberState.barangay} {memberState.city}
                </p>
                <p className="break-inside-avoid">
                  <strong className="text-gray-600">Employer Address:</strong> {memberState.employer_address}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Age:</strong> {memberState.age}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Gender:</strong> {memberState.sex}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">Civil Status:</strong> {memberState.civil_status}
                </p>
                <p className="break-inside-avoid mb-2">
                  <strong className="text-gray-600">No. of Dependents:</strong> {memberState.number_of_dependents}
                </p>
                <p className="break-inside-avoid">
                  <strong className="text-gray-600">Employer Address 2:</strong> {memberState.employer_address2}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div>
          {/* Tab Buttons */}
          <div className="mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("loanApplication")}
                className={`px-5 py-2 font-semibold transition-colors ${
                  activeTab === "loanApplication"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Loan Application Details
              </button>
              <button
                onClick={() => setActiveTab("accountDetails")}
                className={`px-5 py-2 font-semibold transition-colors ${
                  activeTab === "accountDetails"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Account Details
              </button>
              <button
                onClick={() => setActiveTab("existingLoan")}
                className={`px-5 py-2 font-semibold transition-colors ${
                  activeTab === "existingLoan"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Existing Loan
              </button>
              <button
                onClick={() => setActiveTab("loanDocuments")}
                className={`px-5 py-2 font-semibold transition-colors ${
                  activeTab === "loanDocuments"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Loan Documents
              </button>
            </div>
          </div>

          {/* Tab Content for Account Details, Existing Loan, and Loan Application */}
          {activeTab === "accountDetails" && (
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-center mb-4">ACCOUNTS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-700 mb-2">
                    <strong className="font-bold">Account Number:</strong> {memberState.accountNumber || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong className="font-bold">Code Number:</strong> {memberState.memberCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2">
                    <strong className="font-bold">Regular Savings:</strong>{" "}
                    <span className="px-2 py-1 bg-orange-500 rounded-full text-white">
                      {memberState.amount || "N/A"}
                    </span>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong className="font-bold">Share Capital:</strong>{" "}
                    <span className="px-2 py-1 bg-green-500 rounded-full text-white">
                      {memberState.share_capital || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
              {showFeedbackInput && (
                <div className="mt-4">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter remarks feedback..."
                  />
                  <button
                    onClick={handleFeedbackSubmit}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "existingLoan" && (
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-center mb-4">Existing Loans</h3>
              {existingLoanLoading ? (
                <p className="text-center text-gray-500">Loading existing loans...</p>
              ) : existingLoanError ? (
                <p className="text-center text-red-500">{existingLoanError}</p>
              ) : existingLoan && existingLoan.length > 0 ? (
                <div className="space-y-4 overflow-y-auto" style={{ maxHeight: existingLoan.length > 2 ? "350px" : "auto" }}>
                  {existingLoan.map((loan) => (
                    <div key={loan.loan_application_id} className="grid grid-cols-2 gap-6 p-6 bg-gray-50 shadow-md rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Date of Loan:</span>
                          <span className="font-semibold text-gray-900">
                            {loan?.created_at 
                              ? new Date(loan.created_at).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Voucher Number:</span>
                          <span className="font-semibold text-gray-900">
                            {loan.client_voucher_number || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Loan Amount:</span>
                          <span className="font-semibold text-green-600">
                            ₱{loan.loan_amount || 0}
                          </span>
                        </div>
                      </div>
                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Interest:</span>
                          <span className="font-semibold text-gray-900">{loan.interest}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Terms:</span>
                          <span className="font-semibold text-gray-900">{loan.terms || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Balance:</span>
                          <span className="font-semibold text-red-600">
                            ₱{loan.balance || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No existing loan details.</p>
              )}
            </div>
          )}

          {activeTab === "loanApplication" && (
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-center mb-4">Loan Application</h3>
              {loanApplication && (
                <div className="flex justify-center mb-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {loanApplication.status || "N/A"}
                  </span>
                </div>
              )}
              {loanApplicationLoading ? (
                <div className="flex justify-center items-center py-4">
                  <p className="text-gray-700 text-lg">Loading loan application...</p>
                </div>
              ) : loanApplicationError ? (
                <div className="text-center text-red-500 py-4">
                  <p className="mb-3">{loanApplicationError}</p>
                  <button
                    onClick={() => {
                      setLoanApplication(null);
                      setLoanApplicationError(null);
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : loanApplication ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <dt className="font-semibold">Application Type:</dt>
                    <dd>{loanApplication.application || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Requested Amount:</dt>
                    <dd>{loanApplication.loan_amount || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Loan Type:</dt>
                    <dd>{loanApplication.loan_type || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Application Date:</dt>
                    <dd>
                      {loanApplication.created_at
                        ? new Date(loanApplication.created_at).toLocaleDateString()
                        : "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Interest:</dt>
                    <dd>{loanApplication.interest || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Term:</dt>
                    <dd>{loanApplication.terms ? `${loanApplication.terms} months` : "N/A"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-semibold">Statement of Purpose:</dt>
                    <dd>{loanApplication.details?.statement_of_purpose || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Sacks:</dt>
                    <dd>{loanApplication.details?.sacks || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Service Fee:</dt>
                    <dd>{loanApplication.details?.service_fee || "N/A"}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-center text-gray-700 py-4">No loan application.</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <button
            disabled={disableActions}
            onClick={handleUpdated}
            className={`px-4 py-2 rounded ${
              disableActions ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            Updated
          </button>
          <button
            disabled={disableActions}
            onClick={handleMispayment}
            className={`px-4 py-2 rounded ${
              disableActions ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Mispayment
          </button>
          <button
            disabled={disableActions}
            onClick={handlePassDue}
            className={`px-4 py-2 rounded ${
              disableActions ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            Pass due
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanEvaluationProfileModal;
