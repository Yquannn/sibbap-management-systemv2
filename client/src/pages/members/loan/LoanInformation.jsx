import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, CreditCard, DollarSign, Package, Clock, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const LoanInformation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);

  const memberId = id || sessionStorage.getItem("memberId");

  useEffect(() => {
    axios
      .get(`http://192.168.254.100:3001/api/member-loan/${memberId}`)
      .then((response) => {
        setLoanData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching loan data:", error);
        setLoading(false);
      });
  }, [id, memberId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loanData) {
    return (
      <div className="max-w-md mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-700 font-semibold mb-2">No loan data found</p>
          <p className="text-gray-500 text-sm mb-4">There are no active loans for this account.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Extract the first record from each array if available
  const loanApp =
    loanData.loanApplications && loanData.loanApplications.length > 0
      ? loanData.loanApplications[0]
      : null;
  const feedsDetail =
    loanData.feedsRiceDetails && loanData.feedsRiceDetails.length > 0
      ? loanData.feedsRiceDetails[0]
      : null;
  const personalInfo =
    loanData.loanPersonalInformation && loanData.loanPersonalInformation.length > 0
      ? loanData.loanPersonalInformation[0]
      : null;

  // Calculate totals based on loan application fields
  const numPeriods = loanApp ? Number(loanApp.terms) : 0;
  const principalAmount = loanApp ? Number(loanApp.loan_amount) : 0;
  const processingFee = loanApp ? Number(loanApp.service_fee) : 0;
  const installmentFee = 0; 
  const totalAmountToPay = principalAmount + processingFee + installmentFee;
  const installmentAmount = numPeriods > 0 ? totalAmountToPay / numPeriods : 0;

  // Use installments from the API if available, otherwise compute them
  const computedInstallments =
    loanData.installments && loanData.installments.length > 0
      ? loanData.installments.map((item) => ({
          id: item.installment_id,
          label: `${item.installment_number}/${numPeriods}`,
          amount: Number(item.amortization),
          dueDate: new Date(item.due_date).toLocaleDateString(),
          status: item.status,
        }))
      : Array.from({ length: numPeriods }, (_, i) => {
          const dueDate = new Date(loanApp.created_at);
          dueDate.setMonth(dueDate.getMonth() + (i + 1));
          return {
            id: i + 1,
            label: `${i + 1}/${numPeriods}`,
            amount: installmentAmount,
            dueDate: dueDate.toLocaleDateString(),
            status: loanApp.status,
          };
        });

  // Installment data structure
  const installmentData = {
    orderAmount: principalAmount,
    processingFee: processingFee,
    installmentFee: installmentFee,
    paidBy: personalInfo
      ? `${personalInfo.first_name} ${personalInfo.last_name}`
      : "",
    periods: numPeriods,
    createdTime: loanApp ? new Date(loanApp.created_at).toLocaleString() : "",
    product: loanApp ? loanApp.loan_type : "",
    loanId: loanApp ? loanApp.client_voucher_number : "",
    orderId: personalInfo ? personalInfo.memberCode : "",
    installments: computedInstallments,
  };

  // Determine if loan type is "Feeds Loan" or "Rice Loan" to show sacks info
  const isFeedsOrRiceLoan =
    installmentData.product && (
      installmentData.product.toLowerCase().includes("feeds") ||
      installmentData.product.toLowerCase().includes("rice")
    );

  // Helper function for formatting dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper function for status badge color
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    
    status = status.toLowerCase();
    if (status === "paid" || status === "completed") return "bg-green-100 text-green-800";
    if (status === "due" || status === "upcoming") return "bg-yellow-100 text-yellow-800";
    if (status === "overdue") return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 shadow-md">
        <div className="flex items-center p-4 relative max-w-md mx-auto">
          <button
            className="absolute left-4 flex items-center text-gray-700 hover:text-black"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="mr-1" />
          </button>
          <h1 className="text-xl font-semibold text-center w-full">Loan Details</h1>
        </div>
      </div>

      {/* Content with padding to avoid header overlap */}
      <div className="pt-16">
        {/* Loan Amount Card */}
        {loanApp && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Loan Amount</div>
              <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {loanApp.loan_type}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-4">
              ₱{formatCurrency(principalAmount)}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Total to Pay</span>
                <span className="text-sm font-medium">
                  ₱{formatCurrency(totalAmountToPay)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Payment</span>
                <span className="text-sm font-medium">
                  ₱{formatCurrency(installmentAmount)}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-1">Loan ID: {loanApp.client_voucher_number}</div>
            <div className="text-xs text-gray-500">Created: {formatDate(loanApp.created_at)}</div>
          </div>
        )}

        {/* Loan Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="font-semibold mb-4 text-gray-800 flex items-center">
            <FileText size={18} className="mr-2 text-blue-600" /> Loan Details
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="flex items-center text-gray-600 text-sm">
                <DollarSign size={16} className="mr-2 text-gray-400" />
                <span>Service Fee</span>
              </div>
              <div className="text-sm font-medium">₱{formatCurrency(processingFee)}</div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <span>Terms</span>
              </div>
              <div className="text-sm font-medium">{numPeriods} months</div>
            </div>
            
            {personalInfo && (
              <div className="flex justify-between">
                <div className="flex items-center text-gray-600 text-sm">
                  <CreditCard size={16} className="mr-2 text-gray-400" />
                  <span>Member</span>
                </div>
                <div className="text-sm font-medium">{installmentData.paidBy}</div>
              </div>
            )}
            
            {personalInfo && (
              <div className="flex justify-between">
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>Member ID</span>
                </div>
                <div className="text-sm font-medium">{personalInfo.memberCode}</div>
              </div>
            )}
            
            {/* Sacks Info (if applicable) */}
            {isFeedsOrRiceLoan && feedsDetail && (
              <div className="flex justify-between">
                <div className="flex items-center text-gray-600 text-sm">
                  <Package size={16} className="mr-2 text-gray-400" />
                  <span>Sacks Availed</span>
                </div>
                <div className="text-sm font-medium">
                  {feedsDetail.sacks} / {feedsDetail.max_sacks}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Installment Breakdown Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold mb-4 text-gray-800 flex items-center">
            <Calendar size={18} className="mr-2 text-blue-600" /> Installment Schedule
          </h2>
          
          {installmentData.installments.length > 0 ? (
            <div className="space-y-4">
              {installmentData.installments.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Progress Line */}
                  {index < installmentData.installments.length - 1 && (
                    <div className="absolute top-6 left-3 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                  )}
                  
                  <div className="flex relative z-10">
                    {/* Status Circle */}
                    <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      item.status && item.status.toLowerCase() === "paid" 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-200"
                    }`}>
                      <span className="text-xs">{index + 1}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm">Installment {item.label}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                          {item.status || "Pending"}
                        </div>
                      </div>
                      
                      <div className="flex justify-between mb-1">
                        <div className="text-xs text-gray-500">Due Date</div>
                        <div className="text-xs text-gray-900 font-medium">{item.dueDate}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-xs text-gray-500">Amount</div>
                        <div className="text-xs text-gray-900 font-medium">₱{formatCurrency(item.amount)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No installments available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanInformation;