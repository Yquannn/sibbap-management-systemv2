import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BanknotesIcon, CalendarIcon, ArrowPathIcon, 
  ArrowTrendingUpIcon, ClockIcon, ArrowDownTrayIcon,
  UserGroupIcon, UserIcon, DocumentTextIcon, 
  ShieldCheckIcon, CheckCircleIcon, ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
  LineElement, PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, Title, LineElement, PointElement
);

const API_BASE_URL = "http://localhost:3001";

// Utility Functions
const formatCurrency = (value) => {
  if (typeof value !== "number") value = parseFloat(value) || 0;
  return value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });
};

const formatDate = (date, options) => {
  const defaultOptions = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options || defaultOptions);
};

const formatAddress = (street, barangay, city) => 
  [street, barangay, city].filter(Boolean).join(", ");

const formatFullName = (first, middle, last) => 
  [first, middle, last].filter(Boolean).join(" ");

const formatInitials = (first, last) => 
  (first ? first.charAt(0).toUpperCase() : "") + 
  (last ? last.charAt(0).toUpperCase() : "");

const formatCoMakerName = (coMaker) => {
  if (!coMaker) return "N/A";
  return [coMaker.co_first_name, coMaker.co_middle_name, coMaker.co_last_name]
    .filter(Boolean).join(" ");
};

const formatCoMakerInitials = (coMaker) => {
  if (!coMaker) return "";
  return (coMaker.co_first_name ? coMaker.co_first_name.charAt(0).toUpperCase() : "") +
         (coMaker.co_last_name ? coMaker.co_last_name.charAt(0).toUpperCase() : "");
};

const calculateMaturityProgress = (maturityDate, fixedTerm, daysRemaining) => {
  if (!maturityDate || !fixedTerm) return 0;
  const totalDays = fixedTerm * 30;
  const completedDays = totalDays - daysRemaining;
  return Math.min(Math.max((completedDays / totalDays) * 100, 0), 100);
};

const getStartDate = (transactions) => {
  if (!transactions.length) return new Date();
  const sorted = [...transactions].sort((a, b) => 
    new Date(a.transaction_date_time) - new Date(b.transaction_date_time)
  );
  return sorted[0].transaction_date_time;
};

// Helper Components
const LoadingSpinner = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-sm">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="bg-white border border-red-100 rounded-xl p-8 max-w-lg shadow-sm">
      <div className="flex items-center text-red-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-semibold ml-2">Error Loading Data</h3>
      </div>
      <p className="text-gray-700">{message}</p>
      <button className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
  </div>
);

const NoDataMessage = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-lg shadow-sm">
      <div className="flex items-center text-gray-700 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold ml-2">No Time Deposit Found</h3>
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

const PageHeader = ({ title, status }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-xl shadow-sm">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500 mt-1">View and manage your time deposit investment</p>
    </div>
    <div className="mt-4 md:mt-0 flex items-center gap-2">
      <span className="text-sm font-medium text-gray-500">Status:</span>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
      }`}>
        {status}
      </span>
    </div>
  </div>
);

const MemberProfile = ({
  fullName, memberCode, memberType, account_number,
  accountType, accountStatus, idPicture, initials,
  dob, civilStatus, contact, address,
}) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white">
      <div className="flex items-center">
        {idPicture ? (
          <img src={`${API_BASE_URL}/uploads/${idPicture}`} alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold text-xl shadow-md">
            {initials}
          </div>
        )}
        <div className="ml-4">
          <h2 className="text-xl font-bold">{fullName}</h2>
          <p className="text-indigo-100">
            <span className="font-medium">Account:</span> {account_number || "N/A"}
          </p>
          <p className="text-indigo-100">
            <span className="font-medium">Member:</span> {memberCode || "N/A"}
          </p>
          <div className="mt-1 flex items-center">
            <UserIcon className="w-4 h-4 text-indigo-200 mr-1" />
            <span className="text-sm text-indigo-100 capitalize">{accountType}</span>
            <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded text-xs">
              {accountStatus || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
      <div className="space-y-4">
        {[
          {
            icon: <CalendarIcon className="w-5 h-5 text-indigo-500" />,
            label: "Date of Birth",
            value: dob ? new Date(dob).toLocaleDateString() : "N/A",
          },
          {
            icon: <UserIcon className="w-5 h-5 text-indigo-500" />,
            label: "Civil Status",
            value: civilStatus || "N/A",
          },
          {
            icon: <DocumentTextIcon className="w-5 h-5 text-indigo-500" />,
            label: "Contact",
            value: contact || "N/A",
          },
          {
            icon: <DocumentTextIcon className="w-5 h-5 text-indigo-500" />,
            label: "Address",
            value: address || "N/A",
          },
        ].map((item, index) => (
          <div key={index} className="flex items-start">
            <div className="mt-0.5 bg-indigo-50 p-2 rounded-lg">{item.icon}</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CoMakerProfile = ({
  coMakerInfo, coMakerFullName, coMakerInitials, coMakerAddress,
}) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 text-white">
      <div className="flex items-center">
        {coMakerInfo && coMakerInfo.id_picture ? (
          <img src={`${API_BASE_URL}/uploads/${coMakerInfo.id_picture}`} alt="Co-maker Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-xl shadow-md">
            {coMakerInitials}
          </div>
        )}
        <div className="ml-4">
          <h2 className="text-xl font-bold">{coMakerFullName}</h2>
          <div className="mt-1 flex items-center">
            <UserGroupIcon className="w-4 h-4 text-emerald-200 mr-1" />
            <span className="text-sm text-emerald-100">Co-maker</span>
          </div>
        </div>
      </div>
    </div>
    {coMakerInfo ? (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Co-Maker Information</h3>
        <div className="space-y-4">
          {[
            {
              icon: <UserGroupIcon className="w-5 h-5 text-emerald-500" />,
              label: "Relationship",
              value: coMakerInfo.co_relationship_primary || "N/A",
            },
            {
              icon: <CalendarIcon className="w-5 h-5 text-emerald-500" />,
              label: "Date of Birth",
              value: coMakerInfo.co_date_of_birth
                ? new Date(coMakerInfo.co_date_of_birth).toLocaleDateString()
                : "N/A",
            },
            {
              icon: <UserIcon className="w-5 h-5 text-emerald-500" />,
              label: "Contact",
              value: coMakerInfo.co_contact_number || "N/A",
            },
            {
              icon: <DocumentTextIcon className="w-5 h-5 text-emerald-500" />,
              label: "Address",
              value: coMakerAddress,
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="mt-0.5 bg-emerald-50 p-2 rounded-lg">{item.icon}</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="text-gray-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="p-6 text-center">
        <p className="text-gray-500">No co-maker information available for this time deposit.</p>
        <button className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">
          Add Co-Maker
        </button>
      </div>
    )}
  </div>
);

const ActionsPanel = ({ daysRemaining, timeDepositId, accountStatus }) => {
  const navigate = useNavigate();
  const isRolloverDisabled = accountStatus === "PRE-MATURE";

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Account Actions</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <button onClick={() => navigate(`/timedeposit-rollover/${timeDepositId}`)}
            // disabled={isRolloverDisabled}
            className={`w-full py-2.5 px-4 rounded-lg transition flex items-center justify-center ${
              isRolloverDisabled 
                ? '' //bg-gray-200 text-gray-500 cursor-not-allowed
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Roll Over Deposit
          </button>
          
          <button onClick={() => navigate(`/timedeposit-early-withdrawal/${timeDepositId}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg transition flex items-center justify-center">
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            {daysRemaining <= 0 ? "Withdraw at Maturity" : "Early Withdrawal"}
          </button>
          
          {daysRemaining > 0 && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h4 className="font-medium text-amber-800">Early Withdrawal Notice</h4>
              <p className="text-sm text-gray-600 mt-1">
                Early withdrawals may be subject to penalties as per your agreement terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KeyMetrics = ({ availableBalance, interest_rate, payoutAmount, daysRemaining }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Principal Amount</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {formatCurrency(availableBalance)}
          </h3>
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <BanknotesIcon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Interest Rate</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">{interest_rate}%</h3>
        </div>
        <div className="p-2 bg-emerald-50 rounded-lg">
          <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
    </div>
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Expected Payout</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {formatCurrency(payoutAmount)}
          </h3>
          {daysRemaining > 0 && (
            <p className="text-sm text-emerald-600 mt-1 font-medium">In {daysRemaining} days</p>
          )}
        </div>
        <div className="p-2 bg-amber-50 rounded-lg">
          <BanknotesIcon className="w-6 h-6 text-amber-600" />
        </div>
      </div>
    </div>
  </div>
);

const TimeDepositInfo = ({
  fixedTerm, transactions, maturityDate, payoutAmount,
  availableBalance, remarks, maturityProgress, daysRemaining,
}) => (
  <div className="bg-white rounded-xl shadow-sm">
    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-800">Time Deposit Details</h3>
      <div className="flex items-center">
        <ClockIcon className="w-5 h-5 text-indigo-600 mr-1" />
        <span className="text-sm font-medium">
          {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Matured"}
        </span>
      </div>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-500">Term Length</p>
              <p className="text-gray-800 font-medium">
                {fixedTerm || "N/A"} {parseInt(fixedTerm) === 1 ? "month" : "months"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="text-gray-800 font-medium">
                {transactions.length > 0 ? formatDate(getStartDate(transactions)) : "N/A"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-500">Maturity Date</p>
              <p className="text-gray-800 font-medium">
                {maturityDate ? formatDate(new Date(maturityDate)) : "N/A"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-500">Interest Earned (Est.)</p>
              <p className="text-gray-800 font-medium">
                {formatCurrency(payoutAmount - availableBalance)}
              </p>
            </div>
            {remarks && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Remarks</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">{remarks}</p>
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Maturity Progress</p>
          <div className="mb-6">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${maturityProgress}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Start</span>
              <span className="text-indigo-700 font-medium">{maturityProgress.toFixed(0)}% Complete</span>
              <span>Maturity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TransactionHistory = ({ transactions }) => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const pageSize = 5;
  
  const filterTransactions = (txns, filterType) => {
    if (filterType === "all") return txns;
    return txns.filter(tx => tx.transaction_type === filterType);
  };
  
  const filteredTransactions = filterTransactions(transactions, filter);
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);
  
  const TransactionBadge = ({ type }) => {
    const badgeStyles = {
      deposit: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      interest: "bg-indigo-100 text-indigo-800 border border-indigo-200",
      withdrawal: "bg-amber-100 text-amber-800 border border-amber-200",
      default: "bg-gray-100 text-gray-800 border border-gray-200"
    };
    
    const style = badgeStyles[type] || badgeStyles.default;
    const label = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Unknown";
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
        {label}
      </span>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="all">All Transactions</option>
            <option value="deposit">Deposits</option>
            <option value="interest">Interest</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
        </div>
      </div>
      
      {paginatedTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTransactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.transaction_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {formatDate(transaction.transaction_date_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TransactionBadge type={transaction.transaction_type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.transaction_type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'}>
                      {transaction.transaction_type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          No transactions found.
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded-md text-sm ${
              page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-md text-sm ${
              page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Rollover History Component
const RolloverHistory = ({ rollovers }) => {
  if (!rollovers || rollovers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Rollover History</h3>
        </div>
        <div className="p-6 text-center text-gray-500">
          No rollover history available.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Rollover History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Maturity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Maturity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Earned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rollover Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rollovers.map((rollover, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {formatDate(rollover.rollover_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {formatDate(rollover.previous_maturity_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {formatDate(rollover.new_maturity_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                  {formatCurrency(rollover.interest_earned)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                  {formatCurrency(rollover.rollover_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {rollover.created_by}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Component
const TimeDepositDetails = () => {
  const { timeDepositId } = useParams();
  const [depositData, setDepositData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coMakerInfo, setCoMakerInfo] = useState(null);
  const [rollovers, setRollovers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch deposit data
        const depositResponse = await axios.get(
          `${API_BASE_URL}/api/timedepositor/${timeDepositId}`
        );

        if (depositResponse.data && depositResponse.data.success) {
          const { timeDeposit, member, coMaker, rollovers: rolloverData } = depositResponse.data.data;
          setDepositData({ ...timeDeposit, ...member });
          
          if (coMaker) {
            setCoMakerInfo(coMaker);
          }

          if (rolloverData) {
            setRollovers(rolloverData);
          }
        } else {
          setDepositData(null);
          setError("Failed to fetch time deposit data.");
          return;
        }

        // Fetch transactions
        const txnResponse = await axios.get(
          `${API_BASE_URL}/api/timedeposit/transactions/${timeDepositId}`
        );
        
        if (txnResponse.data) {
          setTransactions(txnResponse.data);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeDepositId]);

  if (loading) return <LoadingSpinner message="Loading time deposit details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!depositData) return <NoDataMessage message="The requested time deposit could not be found." />;

  // Destructure deposit data
  const {
    amount,
    fixedTerm,
    interest,
    account_number,
    account_type,
    account_status,
    payout,
    maturityDate,
    remarks,
    last_name,
    first_name,
    middle_name,
    date_of_birth,
    civil_status,
    contact_number,
    house_no_street,
    barangay,
    city,
    memberCode,
    member_type,
    id_picture,
    interest_rate
  } = depositData;

  // Calculated values
  const availableBalance = parseFloat(amount) || 0;
  const interestAmount = parseFloat(interest) || 0;
  const payoutAmount = parseFloat(payout) || 0;

  // Format member data
  const address = formatAddress(house_no_street, barangay, city);
  const fullName = formatFullName(first_name, middle_name, last_name);
  const initials = formatInitials(first_name, last_name);

  // Co-maker information
  const coMakerFullName = formatCoMakerName(coMakerInfo);
  const coMakerInitials = formatCoMakerInitials(coMakerInfo);
  const coMakerAddress = coMakerInfo
    ? coMakerInfo.co_complete_address?.trim() || "N/A"
    : "N/A";

  // Calculate days remaining until maturity
  const today = new Date();
  const maturityDateObj = maturityDate ? new Date(maturityDate) : null;
  const daysRemaining = maturityDateObj
    ? Math.ceil((maturityDateObj - today) / (1000 * 60 * 60 * 24))
    : 0;
  const depositStatus = daysRemaining > 0 ? "Active" : "Matured";

  // Calculate maturity progress percentage
  const maturityProgress = calculateMaturityProgress(
    maturityDateObj,
    fixedTerm,
    daysRemaining
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <PageHeader title="Time Deposit Details" status={depositStatus} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left Column - Member Info */}
          <div className="lg:col-span-1 space-y-6">
            <MemberProfile
              fullName={fullName}
              memberCode={memberCode}
              account_number={account_number}
              accountStatus={account_status}
              accountType={account_type}
              memberType={member_type}
              idPicture={id_picture}
              initials={initials}
              dob={date_of_birth}
              civilStatus={civil_status}
              contact={contact_number}
              address={address}
            />
            <CoMakerProfile
              coMakerInfo={coMakerInfo}
              coMakerFullName={coMakerFullName}
              coMakerInitials={coMakerInitials}
              coMakerAddress={coMakerAddress}
            />
            <ActionsPanel
              daysRemaining={daysRemaining}
              timeDepositId={timeDepositId}
              accountStatus={account_status}
            />
          </div>

          {/* Right Column - Deposit Details & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <KeyMetrics
              availableBalance={availableBalance}
              interest_rate={interest_rate}
              payoutAmount={payoutAmount}
              daysRemaining={daysRemaining}
            />
            <TimeDepositInfo
              fixedTerm={fixedTerm}
              transactions={transactions}
              maturityDate={maturityDate}
              payoutAmount={payoutAmount}
              availableBalance={availableBalance}
              remarks={remarks}
              maturityProgress={maturityProgress}
              daysRemaining={daysRemaining}
            />
            <TransactionHistory transactions={transactions} />
            <RolloverHistory rollovers={rollovers} />
            
            {/* Info Panel - Simplified */}
            {/* <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Time Deposit Information
              </h3>
              <div className="text-gray-700">
                <p>
                  Time Deposits offer higher interest rates in exchange for keeping funds deposited for a fixed period.
                  Early withdrawals may incur penalties.
                </p>
                <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-800 mb-2">Need assistance?</h4>
                  <p className="text-gray-600 text-sm">
                    Contact our customer service Monday to Friday, 9am-5pm at 
                    <span className="text-indigo-600 font-medium"> support@bankname.com</span> or 
                    <span className="text-indigo-600 font-medium"> (02) 8123-4567</span>.
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeDepositDetails;