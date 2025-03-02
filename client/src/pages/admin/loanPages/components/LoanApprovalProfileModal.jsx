import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pic from "./blankPicture.png"; // Fallback placeholder image
import { CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";

const LoanEvaluationProfileModal = ({ member, onClose }) => {
  // Store the member data from props (and update only when a new member is passed)
  const [memberState, setMemberState] = useState(member);
  // Default active tab for the content below member info
  const [activeTab, setActiveTab] = useState("loanApplication");
  const [showMessage, setShowMessage] = useState(false); // For success/error messages
  const [messageType, setMessageType] = useState(""); // e.g. "success" or "error"
  const [message, setMessage] = useState(""); // Message to display

  // New state for feedback input and to conditionally show the feedback textarea
  const [feedback, setFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  // --- Separate State for Loan Application ---
  const [loanApplication, setLoanApplication] = useState(null);
  const [loanApplicationLoading, setLoanApplicationLoading] = useState(false);
  const [loanApplicationError, setLoanApplicationError] = useState(null);

  // Update local member state when prop changes
  useEffect(() => {
    if (!memberState || memberState.id !== member.id) {
      setMemberState(member);
      setLoanApplication(null);
      setLoanApplicationError(null);
    }
  }, [member]);

  // --- Fetch Loan Application Only Once for the "loanApplication" tab ---
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
  }, [activeTab, memberState.loan_application_id, loanApplication, loanApplicationLoading]);

  if (!memberState) return null;

  // --- Date Formatting ---
  const memberSinceDate = new Date(memberState.registrationDate);
  const formattedDate = memberSinceDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedDOB = new Date(memberState.date_of_birth).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use the provided profile picture or a fallback image
  const idPictureUrl = memberState.id_picture
    ? `http://localhost:3001/uploads/${memberState.id_picture}`
    : pic;

  // Function to hide messages
  const handleCloseMessage = () => {
    setShowMessage(false);
    setMessage("");
    setMessageType("");
  };

// --- Button Action Handlers using Axios PUT ---
const handleRejected = async () => {
  try {
    await axios.put(
      `http://localhost:3001/api/loan-applicant/${memberState.loan_application_id}/approve`,
      { status: "Rejected" }
    );
    setShowMessage(true);
    setMessage("Loan application marked as rejected.");
    setMessageType("success");
    setShowFeedbackInput(false); // Hide feedback input if any
  } catch (error) {
    console.error("Error updating loan application:", error);
    setShowMessage(true);
    setMessage("Failed to update loan application status.");
    setMessageType("error");
  }
};



const handleApproved = async () => {
  try {
    await axios.put(
      `http://localhost:3001/api/loan-applicant/${memberState.loan_application_id}/approve`,
      {status: "Approved" }
    );
    setShowMessage(true);
    setMessage("Loan application marked as approved.");
    setMessageType("success");
    setShowFeedbackInput(true); // Reveal the feedback textarea for remarks
  } catch (error) {
    console.error("Error updating loan application:", error);
    setShowMessage(true);
    setMessage("Failed to update loan application status.");
    setMessageType("error");
  }
};


  // --- Feedback Submission Handler ---
  const handleFeedbackSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/loan-applicant/${memberState.loan_application_id}/feedback`,
        { feedback }
      );
      setShowMessage(true);
      setMessage("Feedback submitted successfully.");
      setMessageType("success");
      setFeedback(""); // Clear textarea after submission
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setShowMessage(true);
      setMessage("Failed to submit feedback.");
      setMessageType("error");
    }
  };

  // --- Helper: Map status for display ---
  // "Waiting for evaluation" or "Passed" become "Pending", and "Failed" becomes "Rejected"
  const mapStatus = (status) => {
    if (status === "Waiting for evaluation" || status === "Passed") {
      return "Pending";
    }
    if (status === "Failed") {
      return "Rejected";
    }
    return status;
  };

  // --- Helper: Status Color & Icon ---
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

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-7xl w-full relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold">Loan Evaluation</h2>
          <button onClick={onClose} className="text-red-500 text-3xl">&times;</button>
        </div>

        {/* Display success/error message */}
        {showMessage && (
          <div className={`mb-4 p-4 rounded-lg ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
            <button onClick={handleCloseMessage} className="ml-4 text-sm underline">Dismiss</button>
          </div>
        )}

        {/* Member Info fixed at top */}
        <div className="mb-6">
        <div className="flex flex-col md:flex-row mb-6">
                {/* Left Column: Profile Image & Basic Info */}
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
                      <strong className="text-gray-600">Monthly salary:</strong> {memberState.monthly_income}
                    </p>
                    <p className="break-inside-avoid mb-2">
                      <strong className="text-gray-600">Date of Birth:</strong>
                      <span className="ml-1">
                        {new Date(memberState.date_of_birth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                    <p className="break-inside-avoid mb-2">
                      <strong className="text-gray-600">Place of birth:</strong> {memberState.birthplace_province}
                    </p>
                    <p className="break-inside-avoid mb-2">
                      <strong className="text-gray-600">Spouse name:</strong> {memberState.spouse_name}
                    </p>
                    <p className="break-inside-avoid mb-2">
                      <strong className="text-gray-600">Occupation:</strong> {memberState.spouse_occupation_source_of_income}
                    </p>
                    <p className="break-inside-avoid mb-2">
                      <strong className="text-gray-600">Monthly salary:</strong> {memberState.spouse_monthly_income}
                    </p>
                    <p className="break-inside-avoid mb-2">
                      <strong className="text-gray-600">Other income/business:</strong> N/A
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
                      <strong className="text-gray-600">No. of dependents:</strong> {memberState.number_of_dependents}
                    </p>
                    <p className="break-inside-avoid">
                      <strong className="text-gray-600">Employer Address:</strong> {memberState.employer_address2}
                    </p>
                    <p className="break-inside-avoid mb-2">
                      <strong className="text-gray-600">Monthly salary:</strong> {memberState.monthly_income}
                    </p>
                  </div>
                </div>
              </div>
        </div>

        {/* Tabbed Content Section */}
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

          {/* Tab Content */}
          {activeTab === "accountDetails" && (
            <>
              {/* Accounts Card */}
              <div className="p-4 bg-white shadow-lg rounded-lg">
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
                {/* Action Buttons */}

                {/* Feedback Section - only shown if member is marked as Failed */}
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

          </>
        )}
         
          {activeTab === "loanDetails" && (
            <div className="p-4 bg-gray-100 rounded-lg shadow">
              <h3 className="text-xl font-bold text-center mb-4">Loan Details</h3>
              {memberState.loanDetails ? (
                <div className="grid grid-cols-2 gap-6 mt-4 text-sm p-6 bg-white shadow-lg rounded-lg">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Interest:</span>
                      <span className="font-semibold">₱{memberState.loanDetails.interest || 100}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loan Amount:</span>
                      <span className="font-semibold">₱{memberState.loanDetails.loanAmount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Amortization:</span>
                      <span className="font-semibold">₱450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terms:</span>
                      <span className="font-semibold">{memberState.loanDetails.terms || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Release:</span>
                      <span className="font-semibold">N/A</span>
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee (3%):</span>
                      <span className="font-semibold">₱150</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Savings Deposit (1%):</span>
                      <span className="font-semibold">₱50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capital Buildup (1%):</span>
                      <span className="font-semibold">₱50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gift Check:</span>
                      <span className="font-semibold">₱30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance:</span>
                      <span className="font-semibold">₱70</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Others/Receivables:</span>
                      <span className="font-semibold">₱40</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 font-bold text-lg">
                      <span className="text-gray-800">Total Disbursed:</span>
                      <span className="text-green-600">₱4,460</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-700">No existing loan details.</p>
              )}
            </div>
          )}

          {activeTab === "loanApplication" && (
  <div className="p-4 bg-gray-100 rounded-lg shadow">
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
          <dt className="font-semibold">Application type:</dt>
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
          <dd>{loanApplication.details.statement_of_purpose || "N/A"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Sacks:</dt>
          <dd>{loanApplication.details.sacks || "N/A"}</dd>
        </div>
        <div>
          <dt className="font-semibold">Service fee:</dt>
          <dd>{loanApplication.details.service_fee || "N/A"}</dd>
        </div>
      </dl>
    ) : (
      <p className="text-center text-gray-700 py-4">No loan application.</p>
    )}
  </div>
)}



        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={handleApproved}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approved
                  </button>
                  <button
                    onClick={handleRejected}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Rejected
                  </button>
                </div>
      </div>
      
    </div>
  );
};

export default LoanEvaluationProfileModal;
