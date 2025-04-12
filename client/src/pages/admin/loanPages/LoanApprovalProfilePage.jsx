import React, { useState, useEffect } from 'react';
import axios from 'axios';
import placeholder from "./blankPicture.png";
import { CheckCircle, XCircle } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const LoanApprovalProfile = () => {
  const { loan_application_id } = useParams();
  const navigate = useNavigate();

  // State management
  const [loanApplication, setLoanApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("loanApplication");
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Helper functions
  const formatCurrency = (value) => {
    if (!value) return "₱0.00";
    return "₱" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Fetch loan application data
  useEffect(() => {
    if (loan_application_id) {
      setLoading(true);
      axios
        .get(`http://localhost:3001/api/loan-application/${loan_application_id}`)
        .then((res) => {
          setLoanApplication(res.data);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching loan application:", err);
          setError("Failed to fetch loan application.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [loan_application_id]);

  // Extract member info from loanApplication
  const memberData = loanApplication
    ? {
        id: loanApplication.memberId,
        first_name: loanApplication.first_name,
        last_name: loanApplication.last_name,
        middle_name: loanApplication.middle_name,
        memberCode: loanApplication.memberCode,
        occupation_source_of_income: loanApplication.occupation_source_of_income,
        monthly_income: loanApplication.monthly_income,
        date_of_birth: loanApplication.date_of_birth,
        birthplace_province: loanApplication.birthplace_province,
        spouse_name: loanApplication.spouse_name,
        spouse_occupation_source_of_income: loanApplication.spouse_occupation_source_of_income,
        spouse_monthly_income: loanApplication.spouse_monthly_income,
        house_no_street: loanApplication.house_no_street,
        barangay: loanApplication.barangay,
        city: loanApplication.city,
        employer_address: loanApplication.employer_address,
        age: loanApplication.age,
        sex: loanApplication.sex,
        civil_status: loanApplication.civil_status,
        number_of_dependents: loanApplication.number_of_dependents,
        id_picture: loanApplication.id_picture,
        share_capital: loanApplication.share_capital,
        amount: loanApplication.amount,
      }
    : null;

  const formattedDOB = memberData
    ? new Date(memberData.date_of_birth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const idPictureUrl = memberData && memberData.id_picture
    ? `http://localhost:3001/uploads/${memberData.id_picture}`
    : placeholder;

  // Prepare chart data
  const goodPayerPieData = {
    labels: ["Paid Off", "Remaining"],
    datasets: [
      {
        data: [80, 20],
        backgroundColor: ["#10B981", "#D1D5DB"],
        borderWidth: 0,
      },
    ],
  };

  // const userType = sessionStorage.getItem("userType");

  // Check if actions should be disabled based on loan status or if a submission is in progress
  const disableActions = loanApplication &&
    ["approved", "rejected"].includes(loanApplication.status?.toLowerCase());

  // Notification helper function
  const sendNotification = async (action) => {
    if (!memberData) return; // Ensure we have member data before proceeding

    const notificationPayload = {
      userType: ["System Admin", "Loan Manager", "General Manager"],
      message: `Loan application ${action} for: ${memberData.last_name} ${memberData.first_name}`,
    };

    try {
      const notifResponse = await axios.post(
        "http://localhost:3001/api/notifications",
        notificationPayload
      );
      console.log("Notification sent successfully:", notifResponse.data);
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
    }

    // Trigger push notification using the Notification API
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Loan Application", {
          body: notificationPayload.message,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Loan Application", {
              body: notificationPayload.message,
            });
          }
        });
      }
    }
  };

  // Event handlers
  const handleCloseMessage = () => {
    setShowMessage(false);
    setMessage("");
    setMessageType("");
  };

  const handleApproved = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setActionInProgress(true);
    try {
      await axios.put(
        `http://localhost:3001/api/loan-applicant/${loan_application_id}/approve`,
        { status: "Approved" }
      );
      setShowMessage(true);
      setMessage("Loan application approved successfully.");
      setMessageType("success");
      setShowFeedbackInput(true);
      
      // Send notification on approval
      sendNotification("Approved");
    } catch (error) {
      console.error("Error updating loan application:", error);
      setShowMessage(true);
      setMessage("Failed to update loan application status.");
      setMessageType("error");
      setActionInProgress(false);
    }
  };

  const handleRejected = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setActionInProgress(true);
    try {
      await axios.put(
        `http://localhost:3001/api/loan-applicant/${loan_application_id}/approve`,
        { status: "Rejected" }
      );
      setShowMessage(true);
      setMessage("Loan application rejected.");
      setMessageType("success");
      setShowFeedbackInput(false);
      
      // Send notification on rejection
      sendNotification("Rejected");
    } catch (error) {
      console.error("Error updating loan application:", error);
      setShowMessage(true);
      setMessage("Failed to update loan application status.");
      setMessageType("error");
      setActionInProgress(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/loan-applicant/${loan_application_id}/feedback`,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
        <p className="font-medium">{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Loan Approval</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Notification */}
      {showMessage && (
        <div className={`mb-6 rounded-lg p-4 flex justify-between items-center ${
          messageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          <div className="flex items-center">
            {messageType === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            <p className="font-medium">{message}</p>
          </div>
          <button 
            onClick={handleCloseMessage}
            className="text-sm hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Member Profile */}
      {memberData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Member Info Card */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-start">
              {/* Profile Image */}
              <div className="md:w-1/4 flex flex-col items-center md:border-r md:border-gray-100 md:pr-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                  <img 
                    src={idPictureUrl} 
                    alt="Member" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-800 text-center">
                  {memberData.first_name} {memberData.middle_name} {memberData.last_name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Member Code: {memberData.memberCode}
                </p>
              </div>

              {/* Member Details */}
              <div className="md:w-3/4 md:pl-6 mt-6 md:mt-0 w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1 */}
                  <div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Occupation</label>
                      <p className="text-gray-800">{memberData.occupation_source_of_income || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Monthly Income</label>
                      <p className="text-gray-800">{formatCurrency(memberData.monthly_income) || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Date of Birth</label>
                      <p className="text-gray-800">{formattedDOB || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Birthplace</label>
                      <p className="text-gray-800">{memberData.birthplace_province || "N/A"}</p>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Age</label>
                      <p className="text-gray-800">{memberData.age || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Gender</label>
                      <p className="text-gray-800">{memberData.sex || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Civil Status</label>
                      <p className="text-gray-800">{memberData.civil_status || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Dependents</label>
                      <p className="text-gray-800">{memberData.number_of_dependents || "N/A"}</p>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Address</label>
                      <p className="text-gray-800 break-words">
                        {memberData.house_no_street} {memberData.barangay} {memberData.city || "N/A"}
                      </p>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Spouse Name</label>
                      <p className="text-gray-800">{memberData.spouse_name || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500">Spouse Income</label>
                      <p className="text-gray-800">{formatCurrency(memberData.spouse_monthly_income) || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Payment Status</h3>
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32">
                <Pie
                  data={goodPayerPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    cutout: '60%',
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">80%</div>
              <p className="text-sm text-gray-600">Paid Off</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="text-sm font-medium bg-green-100 text-green-800 py-1 px-2 rounded">
                  Excellent
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex overflow-x-auto pb-2">
          {[
            { id: "loanApplication", label: "Loan Details" },
            { id: "accountDetails", label: "Account Details" },
            { id: "existingLoan", label: "Existing Loans" },
            { id: "loanDocuments", label: "Documents" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        {/* Loan Application Tab */}
        {activeTab === "loanApplication" && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Loan Application Details</h3>
            {loanApplication ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loanable Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terms</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loanApplication.client_voucher_number || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loanApplication.loan_type || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(loanApplication.loan_amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(loanApplication.loanable_amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loanApplication.interest || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loanApplication.terms || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          loanApplication.status === "Approved" 
                            ? "bg-green-100 text-green-800" 
                            : loanApplication.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {loanApplication.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No application details available</p>
            )}
          </div>
        )}

        {/* Account Details Tab */}
        {activeTab === "accountDetails" && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Member Information</h4>
                <p className="mb-2">
                  <span className="text-gray-500">Code Number:</span>{" "}
                  <span className="font-medium text-gray-800">{loanApplication?.memberCode || "N/A"}</span>
                </p>
                <p className="mb-2">
                  <span className="text-gray-500">Share Capital:</span>{" "}
                  <span className="font-medium text-green-600">{formatCurrency(loanApplication?.share_capital)}</span>
                </p>
                <p className="mb-2">
                  <span className="text-gray-500">Regular Savings:</span>{" "}
                  <span className="font-medium text-blue-600">{formatCurrency(loanApplication?.amount)}</span>
                </p>
              </div>
              
              {showFeedbackInput && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Feedback</h4>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter remarks or feedback..."
                  />
                  <button
                    onClick={handleFeedbackSubmit}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Existing Loans Tab */}
        {activeTab === "existingLoan" && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Loans</h3>
            {loanApplication?.existingLoans?.length > 0 ? (
              <div className="space-y-4">
                {loanApplication.existingLoans.map((loan, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="mb-2">
                          <span className="text-gray-500">Date:</span>{" "}
                          <span className="font-medium text-gray-800">
                            {loan?.created_at ? formatDate(loan.created_at) : "N/A"}
                          </span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-500">Voucher:</span>{" "}
                          <span className="font-medium text-gray-800">{loan.client_voucher_number || "N/A"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-500">Loan Amount:</span>{" "}
                          <span className="font-medium text-green-600">{formatCurrency(loan.loan_amount)}</span>
                        </p>
                      </div>
                      <div>
                        <p className="mb-2">
                          <span className="text-gray-500">Interest:</span>{" "}
                          <span className="font-medium text-gray-800">{loan.interest || "N/A"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-500">Terms:</span>{" "}
                          <span className="font-medium text-gray-800">{loan.terms || "N/A"}</span>
                        </p>
                        <p className="mb-2">
                          <span className="text-gray-500">Balance:</span>{" "}
                          <span className="font-medium text-red-600">{formatCurrency(loan.balance)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No existing loans found</p>
            )}
          </div>
        )}

        {/* Loan Documents Tab */}
        {activeTab === "loanDocuments" && (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              No documents are available for this loan application.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          disabled={disableActions || actionInProgress}
          onClick={handleApproved}
          className={`px-6 py-3 rounded-lg font-medium text-white ${
            disableActions || actionInProgress
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700 transition-colors"
          }`}
        >
          <CheckCircle className="inline-block mr-2 h-5 w-5" />
          Approve Application
        </button>
        <button
          disabled={disableActions || actionInProgress}
          onClick={handleRejected}
          className={`px-6 py-3 rounded-lg font-medium text-white ${
            disableActions || actionInProgress
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-red-600 hover:bg-red-700 transition-colors"
          }`}
        >
          <XCircle className="inline-block mr-2 h-5 w-5" />
          Reject Application
        </button>
      </div>
    </div>
  );
};

export default LoanApprovalProfile;
