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

  // Helper function to format numbers with comma separators and two decimals
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

  // Function to print a single repayment transaction
  const printTransaction = (transaction) => {
    const printWindow = window.open("", "_blank", "width=600,height=600");
    printWindow.document.write("<html><head><title>Transaction Receipt</title>");
    printWindow.document.write(
      `<style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
        .receipt { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #eee; }
        .title { font-size: 22px; font-weight: 700; margin-bottom: 5px; color: #0f766e; }
        .subtitle { font-size: 14px; color: #666; }
        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .label { font-weight: 500; color: #444; }
        .value { text-align: right; }
        .amount { font-size: 20px; font-weight: 700; color: #0f766e; margin: 15px 0; }
        .footer { margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
      </style>`
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write('<div class="receipt">');
    printWindow.document.write('<div class="header">');
    printWindow.document.write('<div class="title">Payment Receipt</div>');
    printWindow.document.write(`<div class="subtitle">Transaction #${transaction.transaction_number}</div>`);
    printWindow.document.write('</div>');
    
    printWindow.document.write(`<div class="detail-row"><span class="label">Transaction Type:</span> <span class="value">${transaction.transaction_type || "Loan Repayment"}</span></div>`);
    printWindow.document.write(`<div class="detail-row"><span class="label">Date:</span> <span class="value">${formatDate(transaction.payment_date)}</span></div>`);
    printWindow.document.write(`<div class="detail-row"><span class="label">Payment Method:</span> <span class="value">${transaction.method}</span></div>`);
    printWindow.document.write(`<div class="detail-row"><span class="label">Authorized By:</span> <span class="value">${transaction.authorized || "System"}</span></div>`);
    
    printWindow.document.write(`<div class="amount">Amount Paid: ₱${formatCurrency(transaction.amount_paid)}</div>`);
    
    printWindow.document.write('<div class="footer">Thank you for your payment. This receipt is your proof of payment.</div>');
    printWindow.document.write('</div>');
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Function to print all repayment transactions
  const printAllTransactions = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    let htmlContent = `<html><head><title>Payment Transactions Record</title>`;
    htmlContent += `<style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
      .container { max-width: 800px; margin: 0 auto; }
      h1 { font-size: 24px; color: #0f766e; margin-bottom: 10px; }
      .subtitle { color: #666; margin-bottom: 20px; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background-color: #f0fdfa; padding: 12px 8px; text-align: left; font-weight: 600; color: #0f766e; border-bottom: 2px solid #0f766e; }
      td { padding: 10px 8px; border-bottom: 1px solid #eee; }
      .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      .timestamp { font-size: 12px; color: #666; text-align: right; margin-top: 10px; }
    </style>`;
    htmlContent += `</head><body><div class="container">`;
    htmlContent += `<h1>Repayment Transactions</h1>`;
    htmlContent += `<div class="subtitle">Borrower: ${personalInfo ? `${personalInfo.first_name} ${personalInfo.last_name} (${personalInfo.memberCode})` : "N/A"}</div>`;
    htmlContent += `<table>
      <thead>
        <tr>
          <th>Transaction #</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Authorized By</th>
        </tr>
      </thead>
      <tbody>`;
    
    searchedRepayments.forEach((rep) => {
      htmlContent += `<tr>
        <td>${rep.transaction_number || "N/A"}</td>
        <td>${formatDate(rep.payment_date)}</td>
        <td>₱${formatCurrency(rep.amount_paid)}</td>
        <td>${rep.method}</td>
        <td>${rep.authorized || "System"}</td>
      </tr>`;
    });
    
    htmlContent += `</tbody></table>`;
    htmlContent += `<div class="timestamp">Generated: ${new Date().toLocaleString()}</div>`;
    htmlContent += `<div class="footer">This is an official record of loan repayments.</div>`;
    htmlContent += `</div></body></html>`;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Data states
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [repaymentSearchTerm, setRepaymentSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("amortization"); // For tab switching

  // Borrower summary data
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

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/member-loan/${memberId}`
        );
        if (!response.data || response.data.length === 0) {
          setError("No loan data found.");
        } else {
          // Use the first record if an array is returned
          const data = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setLoanData(data);

          // Calculate borrower summary from data
          const loanApps = data.loanApplications || [];
          const installments = data.installments || [];
          
          const totalLoans = loanApps.length;
          const paidLoans = loanApps.filter(app => app.loan_status?.toLowerCase() === "paid off").length;
          const activeLoans = loanApps.filter(app => app.loan_status?.toLowerCase() === "active").length;
          
          // Calculate payment history
          const paidInstallments = installments.filter(inst => inst.status?.toLowerCase() === "paid");
          const onTimePayments = paidInstallments.filter(inst => new Date(inst.payment_date) <= new Date(inst.due_date)).length;
          const latePayments = paidInstallments.length - onTimePayments;
          
          // Generate a mock credit score based on payment behavior
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

  // Extract personal information from the loanPersonalInformation array.
  const personalInfo =
    loanData.loanPersonalInformation && loanData.loanPersonalInformation.length > 0
      ? loanData.loanPersonalInformation[0]
      : null;

  // Extract loan applications array
  const loanApps = loanData.loanApplications || [];

  // Calculate total interest based on amortization
  const totalInterest = (loanData.installments || [])
    .reduce((acc, inst) => acc + parseFloat(inst.interest || 0), 0)
    .toFixed(2);

  // Filter loans based on selection
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

  // Statistical calculations
  const statTotalLoan = filteredLoanApps
    .reduce((acc, app) => acc + parseFloat(app.loan_amount), 0)
    .toFixed(2);
    
  const statTotalBalance = filteredLoanApps
    .reduce((acc, app) => acc + parseFloat(app.balance), 0)
    .toFixed(2);

  // Filter installments and repayments based on selected loans
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

  // Payment behavior data
  const paymentBehaviorData = {
    labels: ['On-Time Payments', 'Late Payments'],
    datasets: [
      {
        data: [borrowerSummary.paymentHistory.onTime, borrowerSummary.paymentHistory.late],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  // Loan status data
  const loanStatusData = {
    labels: ['Paid Off Loans', 'Active Loans'],
    datasets: [
      {
        data: [borrowerSummary.paidLoans, borrowerSummary.activeLoans],
        backgroundColor: ['#3b82f6', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  // Credit score color determination
  const getCreditScoreColor = (score) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-blue-600';
    if (score >= 550) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCreditScoreLabel = (score) => {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    if (score >= 550) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-gray-50 p-6 space-y-6">
      {/* Borrower Profile Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-wrap items-center justify-between">
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
          
          <div className="flex items-center mt-4 sm:mt-0">
            <div className="text-center px-6 border-r border-white/20 mr-6">
              <div className="text-3xl font-bold">{borrowerSummary.totalLoans}</div>
              <div className="text-teal-100 text-sm">Total Loans</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getCreditScoreColor(borrowerSummary.creditScore)}`}>
                {borrowerSummary.creditScore}
              </div>
              <div className="text-teal-100 text-sm">Credit Score • {getCreditScoreLabel(borrowerSummary.creditScore)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Calendar size={28} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Ratio</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {borrowerSummary.paymentHistory.total > 0 
                ? `${Math.round((borrowerSummary.paymentHistory.onTime / borrowerSummary.paymentHistory.total) * 100)}%` 
                : "N/A"}
            </h3>
            <p className="text-xs text-gray-400">On-time payments</p>
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
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "analytics"
                  ? "border-b-2 border-teal-600 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Analytics
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
                    {loanApps.map(app => (
                      <option key={app.loan_application_id} value={app.loan_application_id}>
                        {app.client_voucher_number} - {app.loan_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beg. Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amortization</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInstallments.map((inst, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm text-gray-900">{inst.installment_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inst.due_date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.beginning_balance)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.amortization)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(inst.principal)}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
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


                        <td className="px-4 py-3 text-sm text-gray-900">₱{formatCurrency(app.balance)}</td>
                        <td className="px-4 py-3 text-sm">
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
                        <td className="px-4 py-3 text-sm text-right space-x-2">
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
                    {searchedRepayments.map((rep, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm text-gray-900">{rep.transaction_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(rep.payment_date)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">₱{formatCurrency(rep.amount_paid)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{rep.method}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{rep.authorized || "System"}</td>
                        <td className="px-4 py-3 text-sm text-right space-x-2">
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 inline-flex items-center"
                            onClick={() => navigate("/")}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Borrower Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Behavior */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-md font-medium text-gray-700 mb-4">Payment Behavior</h3>
                  <div className="h-64">
                    <Pie 
                      data={paymentBehaviorData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }} 
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">On-Time Payments</p>
                      <p className="text-xl font-bold text-green-700">{borrowerSummary.paymentHistory.onTime}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-600 font-medium">Late Payments</p>
                      <p className="text-xl font-bold text-amber-700">{borrowerSummary.paymentHistory.late}</p>
                    </div>
                  </div>
                </div>
                
                {/* Loan Status Distribution */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-md font-medium text-gray-700 mb-4">Loan Status Distribution</h3>
                  <div className="h-64">
                    <Pie 
                      data={loanStatusData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }} 
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Paid Off Loans</p>
                      <p className="text-xl font-bold text-blue-700">{borrowerSummary.paidLoans}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600 font-medium">Active Loans</p>
                      <p className="text-xl font-bold text-purple-700">{borrowerSummary.activeLoans}</p>
                    </div>
                  </div>
                </div>
                
                {/* Credit Assessment */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 md:col-span-2">
                  <h3 className="text-md font-medium text-gray-700 mb-4">Credit Assessment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="mb-2 text-sm text-gray-500">Credit Score</div>
                      <div className={`text-4xl font-bold ${getCreditScoreColor(borrowerSummary.creditScore)}`}>
                        {borrowerSummary.creditScore}
                      </div>
                      <div className="mt-1 text-sm font-medium">{getCreditScoreLabel(borrowerSummary.creditScore)}</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment History</span>
                        <span className={`text-sm font-medium ${borrowerSummary.paymentHistory.onTime > borrowerSummary.paymentHistory.late ? 'text-green-600' : 'text-amber-600'}`}>
                          {borrowerSummary.paymentHistory.total > 0 
                            ? `${Math.round((borrowerSummary.paymentHistory.onTime / borrowerSummary.paymentHistory.total) * 100)}%` 
                            : "N/A"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: borrowerSummary.paymentHistory.total > 0 
                              ? `${(borrowerSummary.paymentHistory.onTime / borrowerSummary.paymentHistory.total) * 100}%` 
                              : "0%" 
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Loan Completion Rate</span>
                        <span className={`text-sm font-medium ${borrowerSummary.paidLoans > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {borrowerSummary.totalLoans > 0 
                            ? `${Math.round((borrowerSummary.paidLoans / borrowerSummary.totalLoans) * 100)}%` 
                            : "N/A"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: borrowerSummary.totalLoans > 0 
                              ? `${(borrowerSummary.paidLoans / borrowerSummary.totalLoans) * 100}%` 
                              : "0%" 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Recommendation</h4>
                      <p className="text-sm text-gray-600">
                        {borrowerSummary.creditScore >= 700 
                          ? "Excellent candidate for premium loan products with favorable terms."
                          : borrowerSummary.creditScore >= 600
                            ? "Good standing borrower eligible for standard loan products."
                            : borrowerSummary.creditScore >= 500
                              ? "Fair standing borrower. Consider shorter terms or additional guarantees."
                              : "Borrower needs improvement. Recommend credit counseling before new loans."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}