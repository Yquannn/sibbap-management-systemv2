import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  PhilippinePeso,
  CreditCard,
  Clock,
  SquareUserRound,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  Printer,
  Eye
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import SuccessModal from "./components/SuccessModal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminLoanMonitorUI() {
  const { id } = useParams();
  const memberId = id || sessionStorage.getItem("memberId");
  const navigate = useNavigate();

  // State for controlling the success modal visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Helper function to format currency
  const formatCurrency = (value) => {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Function to print a transaction receipt
  const printTransaction = (transaction) => {
    const content = `
      <html>
        <head>
          <title>Transaction Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { border: 1px solid #ddd; padding: 20px; max-width: 600px; margin: auto; }
            .title { font-size: 24px; font-weight: bold; text-align: center; }
            .details { margin-top: 20px; }
            .details div { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="title">Transaction Receipt</div>
            <div class="details">
              <div><strong>Transaction Number:</strong> ${transaction.transaction_number}</div>
              <div><strong>Amount Paid:</strong> ₱${formatCurrency(transaction.amount_paid)}</div>
              <div><strong>Payment Method:</strong> ${transaction.method}</div>
              <div><strong>Authorized By:</strong> ${transaction.authorized || "System"}</div>
              <div><strong>Date:</strong> ${formatDate(transaction.payment_date)}</div>
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  // Function to print all repayment transactions
  const printAllTransactions = () => {
    const content = `
      <html>
        <head>
          <title>All Repayment Transactions</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 12px; text-align: left; }
            th { background-color: #f4f4f4; }
            .title { font-size: 24px; font-weight: bold; text-align: center; }
          </style>
        </head>
        <body>
          <div class="title">All Repayment Transactions</div>
          <table>
            <thead>
              <tr>
                <th>Transaction #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Authorized By</th>
              </tr>
            </thead>
            <tbody>
              ${searchedRepayments.map(rep => `
                <tr>
                  <td>${rep.transaction_number}</td>
                  <td>${formatDate(rep.payment_date)}</td>
                  <td>₱${formatCurrency(rep.amount_paid)}</td>
                  <td>${rep.method}</td>
                  <td>${rep.authorized || "System"}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  // Data states
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [repaymentSearchTerm, setRepaymentSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("amortization"); // For tab switching
  const [borrowerSummary, setBorrowerSummary] = useState({
    totalLoans: 0,
    paidLoans: 0,
    activeLoans: 0,
    paymentHistory: {
      onTime: 0,
      late: 0,
      total: 0
    },
    creditScore: 0
  });

  // Check if installment data (monthly amortization) has been fetched.
  const hasAmortizationData = loanData?.installments && loanData.installments.length > 0;

  // Helper to check if a loan application is disbursed
  const isLoanDisbursed = (loanApp) => {
    return loanApp && loanApp.remarks && loanApp.remarks.toLowerCase() === "disbursed";
  };

  // Disbursement function: extracts loanApplicationId and sends a PUT request.
  async function handleDisbursement() {
    // Use selectedLoanId if not "all"; otherwise, default to the first loan's ID.
    const loanApplicationId = selectedLoanId !== "all"
      ? selectedLoanId
      : loanData?.loanApplications?.[0]?.loan_application_id;
      
    if (!loanApplicationId) {
      alert("Loan application ID not found.");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Processing disbursement for loanApplicationId:", loanApplicationId);
      
      const response = await axios.put(
        `http://localhost:3001/api/loans/disburse/${loanApplicationId}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );
      
      if (response.data && response.data.success) {
        // Update the local state with the new status and remarks.
        const updatedLoanApps = loanData.loanApplications.map(app =>
          app.loan_application_id.toString() === loanApplicationId.toString()
            ? { ...app, status: "Disbursed", remarks: "Disbursed" }
            : app
        );
        setLoanData({
          ...loanData,
          loanApplications: updatedLoanApps
        });
        // Show the success modal instead of alert.
        setShowSuccessModal(true);
      } else {
        alert("Failed to process loan disbursement: " + (response.data?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error processing disbursement:", error);
      if (error.response) {
        alert(`Server error: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        alert("No response from server. Please check your connection and try again.");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/member-loan/${memberId}`
        );
        if (!response.data || response.data.length === 0) {
          setError("No loan data found.");
        } else {
          const data = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setLoanData(data);

          // Calculate borrower summary
          const loanApps = data.loanApplications || [];
          const installments = data.installments || [];
          const totalLoans = loanApps.length;
          const paidLoans = loanApps.filter(app => app.loan_status?.toLowerCase() === "paid off").length;
          const activeLoans = loanApps.filter(app => app.loan_status?.toLowerCase() === "active").length;
          const paidInstallments = installments.filter(inst => inst.status?.toLowerCase() === "paid");
          const onTimePayments = paidInstallments.filter(inst => new Date(inst.payment_date) <= new Date(inst.due_date)).length;
          const latePayments = paidInstallments.length - onTimePayments;
          const paymentRatio = paidInstallments.length > 0 
            ? onTimePayments / paidInstallments.length 
            : 0;
          const loanRatio = totalLoans > 0 
            ? paidLoans / totalLoans 
            : 0;
          const creditScore = Math.round(300 + (paymentRatio * 350) + (loanRatio * 350));
          
          setBorrowerSummary({
            totalLoans,
            paidLoans,
            activeLoans,
            paymentHistory: {
              onTime: onTimePayments,
              late: latePayments,
              total: paidInstallments.length
            },
            creditScore: Math.min(850, creditScore)
          });
        }
      } catch (err) {
        console.error("Error fetching loan data:", err);
        setError("Failed to load loan data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanData();
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg font-medium text-gray-700">Loading loan data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg">
        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-700">{error}</h2>
        <p className="text-gray-600 mt-2">Please try again or contact support.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-200"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!loanData) {
    return <div className="p-6 text-center">No data available.</div>;
  }

  // Extract personal information from loanPersonalInformation.
  const personalInfo =
    loanData.loanPersonalInformation && loanData.loanPersonalInformation.length > 0
      ? loanData.loanPersonalInformation[0]
      : null;

  // Extract loan applications array.
  const loanApps = loanData.loanApplications || [];

  // Calculate total interest from installments.
  const totalInterest = (loanData.installments || [])
    .reduce((acc, inst) => acc + parseFloat(inst.interest || 0), 0)
    .toFixed(2);

  // Filter loan applications based on selection.
  let filteredLoanApps = loanApps;
  if (selectedLoanId !== "all") {
    filteredLoanApps = filteredLoanApps.filter(
      (app) => app.loan_application_id.toString() === selectedLoanId
    );
  }
  if (selectedStatus !== "all") {
    filteredLoanApps = filteredLoanApps.filter(
      (app) =>
        app.loan_status &&
        app.loan_status.toLowerCase() === selectedStatus.toLowerCase()
    );
  }

  const statTotalLoan = filteredLoanApps
    .reduce((acc, app) => acc + parseFloat(app.loan_amount), 0)
    .toFixed(2);
  const statTotalBalance = filteredLoanApps
    .reduce((acc, app) => acc + parseFloat(app.balance), 0)
    .toFixed(2);

  // Filter installments and repayments based on selected loans.
  const filteredLoanIds = filteredLoanApps.map(app => app.loan_application_id);
  const filteredInstallments = (loanData.installments || [])
    .filter(inst => filteredLoanIds.includes(inst.loan_application_id));
  const installmentIds = filteredInstallments.map(inst => inst.installment_id);
  const filteredRepayments = (loanData.repayments || [])
    .filter(rep => installmentIds.includes(rep.installment_id));
  const searchedRepayments = filteredRepayments.filter(rep => {
    const search = repaymentSearchTerm.toLowerCase();
    return (
      rep.transaction_number?.toLowerCase().includes(search) ||
      rep.method?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="bg-gray-50 p-6 space-y-6">
      {/* Render the success modal if disbursement succeeded */}
      {showSuccessModal && (
        <SuccessModal
          message="Loan disbursement processed successfully."
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Simplified Borrower Profile Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-4 rounded-full">
            <SquareUserRound size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {personalInfo ? `${personalInfo.first_name} ${personalInfo.last_name}` : "Unknown Borrower"}
            </h1>
            <p className="text-teal-100">
              Member Code: {personalInfo?.memberCode || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <CreditCard size={28} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Balance</p>
            <h3 className="text-2xl font-bold text-gray-800">₱{formatCurrency(statTotalBalance)}</h3>
            <p className="text-xs text-gray-400">Outstanding amount</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <PhilippinePeso size={28} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Loans</p>
            <h3 className="text-2xl font-bold text-gray-800">₱{formatCurrency(statTotalLoan)}</h3>
            <p className="text-xs text-gray-400">Cumulative amount</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Clock size={28} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Interest</p>
            <h3 className="text-2xl font-bold text-gray-800">₱{formatCurrency(totalInterest)}</h3>
            <p className="text-xs text-gray-400">From all loans</p>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("amortization")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "amortization"
                  ? "border-b-2 border-teal-600 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Amortization Schedule
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "loans"
                  ? "border-b-2 border-teal-600 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Loan Applications
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "payments"
                  ? "border-b-2 border-teal-600 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Payment History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Amortization Schedule Tab */}
          {activeTab === "amortization" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Amortization Schedule</h2>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                  >
                    <option value="all">All Loans</option>
                    {loanApps.map((app) => (
                      <option key={app.loan_application_id} value={app.loan_application_id}>
                        {app.client_voucher_number} - {app.loan_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Render disbursement button if no installment data exists; else, render amortization schedule */}
              {!hasAmortizationData ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50">
                  <p className="mb-4 text-gray-700">
                    Please process disbursement to generate the monthly amortization schedule.
                  </p>
                  <button
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    onClick={handleDisbursement}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Process Disbursement"}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beg. Balance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amortization</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings Deposit</th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Balance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInstallments.length > 0 ? (
                        filteredInstallments.map((inst, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-3 text-sm text-gray-900">{inst.installment_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inst.due_date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.beginning_balance)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.amortization)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.principal)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.savings_deposit)}</td>

                            <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.interest)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.ending_balance)}</td>
                            <td className="px-4 py-3 text-sm">
                              {inst.status.toLowerCase() === "unpaid" ? (
                                <button
                                  className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-200"
                                  onClick={() => navigate(`/loan-repayment/${inst.installment_id}`)}
                                >
                                  Repay Now
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle size={12} className="mr-1" /> Paid
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                            No installments available for this loan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Loan Applications Tab */}
          {activeTab === "loans" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Loan Applications</h2>
                <div className="flex space-x-2">
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paid off">Paid Off</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terms</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disbursed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disbursed Date</th>

                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLoanApps.map((app, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm text-gray-900">{app.client_voucher_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{app.loan_type}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(app.loan_amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{app.terms} months</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(app.balance)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {app.loan_status?.toLowerCase() === "active" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
                          {app.loan_status?.toLowerCase() === "paid off" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid Off
                            </span>
                          )}
                          {app.loan_status?.toLowerCase() === "rejected" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {isLoanDisbursed(app) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <XCircle size={12} className="mr-1" /> No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(app.disbursed_date)}</td>

                        <td className="px-4 py-3 text-sm text-gray-900 text-right space-x-2">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 inline-flex items-center"
                            onClick={() => navigate(`/loan-repayment/${app.loan_application_id}?action=view`)}
                          >
                            <Eye size={14} className="mr-1" /> View
                          </button>
                          {app.loan_status?.toLowerCase() === "paid off" && (
                            <button
                              className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-200 inline-flex items-center"
                              onClick={() => navigate(`/apply-loan`)}
                            >
                              Renew
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === "payments" && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 md:mb-0">Payment History</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      className="px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={repaymentSearchTerm}
                      onChange={(e) => setRepaymentSearchTerm(e.target.value)}
                    />
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  <button
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition duration-200 inline-flex items-center justify-center"
                    onClick={printAllTransactions}
                  >
                    <Printer size={16} className="mr-2" /> Print All
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Authorized By</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchedRepayments.length > 0 ? (
                      searchedRepayments.map((rep, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-3 text-sm text-gray-900">{rep.transaction_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(rep.payment_date)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">₱{formatCurrency(rep.amount_paid)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{rep.method}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{rep.authorized || "System"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right space-x-2">
                            <button
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 inline-flex items-center"
                              onClick={() => navigate("/") }
                            >
                              <Eye size={14} className="mr-1" /> View
                            </button>
                            <button
                              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200 inline-flex items-center"
                              onClick={() => printTransaction(rep)}
                            >
                              <Printer size={14} className="mr-1" /> Print
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                          No payment records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
