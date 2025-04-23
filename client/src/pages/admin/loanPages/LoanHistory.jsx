import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoanHistory = () => {
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [voucherFilter, setVoucherFilter] = useState('');
  const [borrowerData, setBorrowerData] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/loans');
      setLoans(response.data.data || []);
      
      // If there are loans, fetch borrower data for the first one
      if (response.data.data && response.data.data.length > 0) {
        await fetchBorrowerInfo(response.data.data[0].borrower_id);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch loans');
      setLoading(false);
    }
  };

  const fetchLoanHistory = async (loanId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/loans/${loanId}/history`);
      if (response.data.data && response.data.data.installments) {
        setInstallments(response.data.data.installments);
      } else {
        setInstallments([]);
      }
    } catch (err) {
      console.error('Failed to fetch loan history:', err);
      setInstallments([]);
    }
  };

  const fetchBorrowerInfo = async (borrowerId) => {
    if (!borrowerId) return;
    
    try {
      const response = await axios.get(`http://localhost:3001/api/borrowers/${borrowerId}`);
      if (response.data.data) {
        setBorrowerData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch borrower info:', err);
    }
  };

  const handleLoanClick = async (loan) => {
    if (selectedLoan && selectedLoan.loan_application_id === loan.loan_application_id) {
      setSelectedLoan(null);
      setInstallments([]);
    } else {
      setSelectedLoan(loan);
      await fetchLoanHistory(loan.loan_application_id);
      await fetchBorrowerInfo(loan.borrower_id);
    }
  };

  // Format amount as currency - changed to Philippine Peso
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date in readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to determine status color classes
  const getStatusColors = (status) => {
    if (!status) return {
      border: 'border-l-gray-500',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      accent: 'bg-gray-500'
    };
    
    switch(status) {
      case 'Approved':
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          accent: 'bg-emerald-500'
        };
      case 'Waiting for Approval':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          accent: 'bg-amber-500'
        };
      case 'Rejected':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          text: 'text-red-700',
          accent: 'bg-red-500'
        };
      case 'Active':
        return {
          border: 'border-l-blue-500',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          accent: 'bg-blue-500'
        };
      case 'Paid Off':
        return {
          border: 'border-l-violet-500',
          bg: 'bg-violet-50',
          text: 'text-violet-700',
          accent: 'bg-violet-500'
        };
      default:
        return {
          border: 'border-l-gray-500',
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          accent: 'bg-gray-500'
        };
    }
  };
  
  // Calculate percentage of loan term completed
  const calculateProgress = (loan) => {
    if (!loan || !loan.terms || !loan.loan_amount || !loan.balance) return 0;
    const progress = ((loan.loan_amount - loan.balance) / loan.loan_amount) * 100;
    return Math.min(Math.max(progress, 0), 100); // Ensure between 0-100%
  };
  
  // Filter loans based on status and voucher number
  const filteredLoans = loans
    .filter(loan => filter === 'All' || loan.status === filter || loan.loan_status === filter)
    .filter(loan => !voucherFilter || (loan.client_voucher_number && loan.client_voucher_number.toLowerCase().includes(voucherFilter.toLowerCase())));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 backdrop-blur-sm bg-opacity-90">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Loading loan data</h3>
            <p className="text-gray-500">Please wait while we retrieve your loan information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 rounded-xl shadow-lg p-8 border border-red-100">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load loans</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                className="px-5 py-2.5 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={fetchLoans}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Borrower Information Card */}
      {borrowerData && (
        <div className="bg-white shadow-lg rounded-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
            <h2 className="text-white text-xl font-bold">Borrower Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Full Name</p>
                <p className="text-base font-medium">{borrowerData.full_name || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Email Address</p>
                <p className="text-base font-medium">{borrowerData.email || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Phone Number</p>
                <p className="text-base font-medium">{borrowerData.phone || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Address</p>
                <p className="text-base font-medium">{borrowerData.address || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Member ID</p>
                <p className="text-base font-medium">{borrowerData.member_id || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Member Since</p>
                <p className="text-base font-medium">{formatDate(borrowerData.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="800" height="800" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Loan History</h1>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 py-6 lg:px-10 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
              {['All', 'Waiting for Approval', 'Approved', 'Active', 'Completed'].map((status) => (
                <button 
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all
                    ${filter === status 
                      ? `bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200 shadow-sm` 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                >
                  {status === 'Waiting for Approval' ? 'Pending' : status}
                </button>
              ))}
            </div>
            
            {/* Voucher Number Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by voucher number"
                value={voucherFilter}
                onChange={(e) => setVoucherFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-64"
              />
            </div>
          </div>
        </div>
        
        {/* Loan list */}
        <div className="p-6 lg:p-10 bg-gray-50">
          <div className="space-y-6">
            {filteredLoans.length > 0 ? (
              filteredLoans.map((loan) => {
                const statusColors = getStatusColors(loan.status);
                const progressPercent = calculateProgress(loan);
                
                return (
                  <div key={loan.loan_application_id} className="space-y-5">
                    <div 
                      className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer
                        ${selectedLoan && selectedLoan.loan_application_id === loan.loan_application_id ? 'ring-2 ring-indigo-300' : ''}`}
                      onClick={() => handleLoanClick(loan)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left column - Loan info */}
                        <div className="md:col-span-2 space-y-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">
                              {loan.loan_type || 'Loan'} {loan.application ? `(${loan.application})` : ''}
                            </h3>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                              {loan.status || 'Unknown'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-8 gap-y-4">
                            <div className="flex flex-col">
                              <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Voucher #</span>
                              <span className="font-medium text-gray-900">{loan.client_voucher_number || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Interest Rate</span>
                              <span className="font-medium text-gray-900">{loan.interest ? `${loan.interest}%` : 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Term</span>
                              <span className="font-medium text-gray-900">{loan.terms ? `${loan.terms} months` : 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Disbursed Date</span>
                              <span className="font-medium text-gray-900">{formatDate(loan.disbursed_date)}</span>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div>
                            <div className="flex justify-between text-xs font-medium mb-2">
                              <span className="text-gray-500">Progress</span>
                              <span className="text-indigo-600">{Math.round(progressPercent)}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" 
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right column - Amount info */}
                        <div className="flex flex-col justify-between rounded-xl bg-gray-50 p-5">
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Loan Amount</span>
                            <span className="text-2xl font-bold text-gray-900">{formatCurrency(loan.loan_amount)}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4 border-t border-gray-200 pt-4">
                            <div>
                              <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Current Balance</span>
                              <div className="font-semibold text-gray-900">{formatCurrency(loan.balance)}</div>
                            </div>
                            <div>
                              <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Service Fee</span>
                              <div className="font-semibold text-gray-900">{loan.service_fee ? `${loan.service_fee}%` : 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Chevron indicator */}
                      <div className="flex justify-center mt-5">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 transition-all duration-200 ${selectedLoan && selectedLoan.loan_application_id === loan.loan_application_id ? 'bg-indigo-100' : ''}`}>
                          <svg 
                            className={`w-5 h-5 ${selectedLoan && selectedLoan.loan_application_id === loan.loan_application_id ? 'text-indigo-600 rotate-180' : 'text-gray-400'} transition-transform duration-200`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Installments section (expanded) */}
                    {selectedLoan && selectedLoan.loan_application_id === loan.loan_application_id && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                          <span className="w-7 h-7 flex items-center justify-center bg-indigo-100 rounded-lg mr-3">
                            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </span>
                          Installment Schedule
                        </h4>
                        
                        {/* Loan Summary Cards - Display above the table */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Total Loan</p>
                                <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.loan_amount)}</p>
                              </div>
                              <div className="bg-indigo-100 p-2 rounded-full">
                                <svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Total Interest</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatCurrency(installments.reduce((sum, inst) => sum + parseFloat(inst.interest || 0), 0))}
                                </p>
                              </div>
                              <div className="bg-amber-100 p-2 rounded-full">
                                <svg className="w-5 h-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z" clipRule="evenodd" />
                               </svg>
                             </div>
                           </div>
                         </div>
                         
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                           <div className="flex items-center justify-between">
                             <div>
                               <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Current Balance</p>
                               <p className="text-lg font-bold text-gray-900">{formatCurrency(loan.balance)}</p>
                             </div>
                             <div className="bg-blue-100 p-2 rounded-full">
                               <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                               </svg>
                             </div>
                           </div>
                         </div>
                         
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                           <div className="flex items-center justify-between">
                             <div>
                               <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Remaining Time</p>
                               <p className="text-lg font-bold text-gray-900">
                                 {installments.filter(i => i.status !== 'Paid').length} Payments
                               </p>
                             </div>
                             <div className="bg-emerald-100 p-2 rounded-full">
                               <svg className="w-5 h-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                               </svg>
                             </div>
                           </div>
                         </div>
                       </div>
                        
                        <div className="overflow-x-auto -mx-4 sm:-mx-6">
                          <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                              <thead className="bg-gray-50">
                                <tr>
                                  {['#', 'Due Date', 'Amount', 'Principal', 'Interest', 'Balance', 'Status'].map((header) => (
                                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {installments.length > 0 ? (
                                  installments.map((installment) => {
                                    const isPaid = installment.status === 'Paid';
                                    const isPastDue = !isPaid && new Date(installment.due_date) < new Date();
                                    
                                    return (
                                      <tr key={installment.installment_id} 
                                        className={`hover:bg-gray-50 ${isPaid ? 'bg-green-50' : isPastDue ? 'bg-red-50' : ''}`}
                                      >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {installment.installment_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                          {formatDate(installment.due_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                          {formatCurrency(installment.amortization)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                          {formatCurrency(installment.principal)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                          {formatCurrency(installment.interest)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                          {formatCurrency(installment.ending_balance)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                            ${isPaid 
                                              ? 'bg-emerald-100 text-emerald-800' 
                                              : isPastDue 
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {isPaid && (
                                              <svg className="mr-1.5 h-2 w-2 text-emerald-400" fill="currentColor" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                              </svg>
                                            )}
                                            {isPastDue && (
                                              <svg className="mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                              </svg>
                                            )}
                                            {!isPaid && !isPastDue && (
                                              <svg className="mr-1.5 h-2 w-2 text-amber-400" fill="currentColor" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                              </svg>
                                            )}
                                            {isPaid ? 'Paid' : isPastDue ? 'Overdue' : 'Upcoming'}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                                      <div className="flex flex-col items-center">
                                        <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        <p className="font-medium">No installment information available</p>
                                        <p className="text-gray-400 mt-1">Details will appear here once the loan is active</p>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* Additional details */}
                        {loan.remarks && (
                          <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                            <h5 className="text-sm font-semibold uppercase tracking-wider text-gray-700 mb-3">Remarks</h5>
                            <p className="text-gray-600">{loan.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl p-8 shadow-md">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No loans found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  {voucherFilter 
                    ? `No loans found with voucher number containing "${voucherFilter}". Try another search or clear the filter.`
                    : 'There are no loans matching your current filter criteria. Try changing your filter or apply for a new loan.'
                  }
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {voucherFilter && (
                    <button 
                      onClick={() => setVoucherFilter('')}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Clear Search
                    </button>
                  )}
                  <button 
                    onClick={() => setFilter('All')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    View All Loans
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanHistory;