import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const LoanApplicationView = () => {
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loanId } = useParams();

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/loan-application/${loanId}`);
        setLoanData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch loan application data');
        setLoading(false);
        console.error('Error fetching loan data:', err);
      }
    };

    fetchLoanData();
  }, [loanId]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 p-4 my-4 rounded-md">
      <p className="text-red-600">{error}</p>
    </div>
  );

  if (!loanData) return (
    <div className="bg-yellow-50 p-4 my-4 rounded-md">
      <p className="text-yellow-600">No loan data found</p>
    </div>
  );

  return (
    <div className="bg-white rounded-md p-6 mx-auto shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-xl font-medium text-gray-900">Loan Application Details</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md">
            {loanData.loan_type}
          </span>
          <span className={`px-2.5 py-1 rounded-md text-xs ${
            loanData.status === "Waiting for Approval" 
              ? "bg-yellow-50 text-yellow-600" 
              : loanData.status === "Approved" 
                ? "bg-green-50 text-green-600" 
                : "bg-gray-50 text-gray-600"
          }`}>
            {loanData.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Information */}
        <div className="bg-gray-50 rounded-md p-4">
          <h2 className="text-base font-medium text-gray-900 mb-3">Loan Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Application ID</span>
              <span>{loanData.loan_application_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Voucher Number</span>
              <span>{loanData.client_voucher_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Application Type</span>
              <span>{loanData.application}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Loan Amount</span>
              <span>₱{parseFloat(loanData.loan_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Loanable Amount</span>
              <span>₱{parseFloat(loanData.loanable_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Interest</span>
              <span>{parseFloat(loanData.interest)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Terms</span>
              <span>{loanData.terms} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current Balance</span>
              <span>₱{parseFloat(loanData.balance).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service Fee</span>
              <span>₱{parseFloat(loanData.service_fee).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span>{loanData.loan_status}</span>
            </div>
          </div>
        </div>

        {/* Member Information */}
        <div className="bg-gray-50 rounded-md p-4">
          <h2 className="text-base font-medium text-gray-900 mb-3">Member Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Member ID</span>
              <span>{loanData.memberCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span>{loanData.first_name} {loanData.middle_name} {loanData.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date of Birth</span>
              <span>{formatDate(loanData.date_of_birth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Age</span>
              <span>{loanData.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Civil Status</span>
              <span>{loanData.civil_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gender</span>
              <span>{loanData.sex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dependents</span>
              <span>{loanData.number_of_dependents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Occupation</span>
              <span>{loanData.occupation_source_of_income}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Income</span>
              <span>₱{parseFloat(loanData.monthly_income).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feeds Loan Specific Details */}
      {loanData.details && loanData.loan_type === "Feeds Loan" && (
        <div className="mt-6 bg-gray-50 rounded-md p-4">
          <h2 className="text-base font-medium text-gray-900 mb-3">Feeds Loan Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Number of Sacks</span>
              <span>{loanData.details.sacks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Maximum Allowed Sacks</span>
              <span>{loanData.details.max_sacks}</span>
            </div>
            {loanData.details.statement_of_purpose && (
              <div className="flex justify-between">
                <span className="text-gray-500">Purpose</span>
                <span>{loanData.details.statement_of_purpose}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Information */}
      <div className="mt-6 bg-gray-50 rounded-md p-4">
        <h2 className="text-base font-medium text-gray-900 mb-3">Financial Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Share Capital</span>
            <span>₱{parseFloat(loanData.share_capital).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span>₱{parseFloat(loanData.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <div className="mt-6 bg-gray-50 rounded-md p-4">
        <h2 className="text-base font-medium text-gray-900 mb-3">Important Dates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="border border-gray-200 p-2 rounded-md">
            <p className="text-gray-500">Application Date</p>
            <p>{formatDate(loanData.created_at)}</p>
          </div>
          <div className="border border-gray-200 p-2 rounded-md">
            <p className="text-gray-500">Approval Date</p>
            <p>{formatDate(loanData.approval_date)}</p>
          </div>
          <div className="border border-gray-200 p-2 rounded-md">
            <p className="text-gray-500">Disbursement Date</p>
            <p>{formatDate(loanData.disbursed_date)}</p>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="mt-6 bg-gray-50 rounded-md p-4">
        <h2 className="text-base font-medium text-gray-900 mb-2">Remarks</h2>
        <p className="text-sm text-gray-700">{loanData.remarks || "No remarks available."}</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <button 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
          onClick={() => window.history.back()}
        >
          Back
        </button>
        {loanData.status === "Waiting for Approval" && (
          <>
            <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm">
              Reject
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm">
              Approve
            </button>
          </>
        )}
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default LoanApplicationView;