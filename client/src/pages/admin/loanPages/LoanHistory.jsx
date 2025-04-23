import React, { useState } from 'react';

// Sample loan data
const sampleLoans = [
  {
    id: 1,
    name: 'Home Mortgage',
    status: 'Outstanding',
    amount: 320000,
    interestRate: 3.5,
    startDate: '2023-01-15',
    endDate: '2053-01-15',
    paymentsMade: 28,
    totalPayments: 360,
    remainingBalance: 305623
  },
  {
    id: 2,
    name: 'Auto Loan',
    status: 'Outstanding',
    amount: 28000,
    interestRate: 4.2,
    startDate: '2022-08-01',
    endDate: '2027-08-01',
    paymentsMade: 33,
    totalPayments: 60,
    remainingBalance: 16420
  },
  {
    id: 3,
    name: 'Personal Loan',
    status: 'Paid',
    amount: 10000,
    interestRate: 8.5,
    startDate: '2021-05-10',
    endDate: '2023-05-10',
    paymentsMade: 24,
    totalPayments: 24,
    remainingBalance: 0
  },
  {
    id: 4,
    name: 'Student Loan',
    status: 'Late',
    amount: 45000,
    interestRate: 5.8,
    startDate: '2020-12-01',
    endDate: '2030-12-01',
    paymentsMade: 49,
    totalPayments: 120,
    remainingBalance: 31280
  }
];

const LoanHistory = () => {
  const [filter, setFilter] = useState('All');
  
  const filteredLoans = filter === 'All' 
    ? sampleLoans 
    : sampleLoans.filter(loan => loan.status === filter);
    
  // Format amount as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date in readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to determine status color classes
  const getStatusColors = (status) => {
    switch(status) {
      case 'Paid':
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700'
        };
      case 'Outstanding':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-50',
          text: 'text-amber-700'
        };
      case 'Late':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          text: 'text-red-700'
        };
      default:
        return {
          border: 'border-l-indigo-500',
          bg: 'bg-indigo-50',
          text: 'text-indigo-700'
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 bg-gray-50 rounded-2xl shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Loan History</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === 'All' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('Outstanding')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === 'Outstanding' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
          >
            Outstanding
          </button>
          <button 
            onClick={() => setFilter('Paid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === 'Paid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
          >
            Paid
          </button>
          <button 
            onClick={() => setFilter('Late')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === 'Late' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
          >
            Late
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredLoans.length > 0 ? (
          filteredLoans.map((loan) => {
            const statusColors = getStatusColors(loan.status);
            return (
              <div 
                key={loan.id} 
                className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${statusColors.border} 
                  transition-transform hover:-translate-y-1 hover:shadow-md`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{loan.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                    {loan.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Original Amount</span>
                  <p className="text-base font-medium text-gray-700">{formatCurrency(loan.amount)}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Interest Rate</span>
                    <p className="text-sm font-medium text-gray-700">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Start Date</span>
                    <p className="text-sm font-medium text-gray-700">{formatDate(loan.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">End Date</span>
                    <p className="text-sm font-medium text-gray-700">{formatDate(loan.endDate)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Payments Made</span>
                    <p className="text-sm font-medium text-gray-700">{loan.paymentsMade} of {loan.totalPayments}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Progress</span>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((loan.paymentsMade / loan.totalPayments) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {Math.round((loan.paymentsMade / loan.totalPayments) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Remaining Balance</span>
                    <p className="text-sm font-medium text-gray-700">{formatCurrency(loan.remainingBalance)}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-9-6a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No loans found matching your filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanHistory;