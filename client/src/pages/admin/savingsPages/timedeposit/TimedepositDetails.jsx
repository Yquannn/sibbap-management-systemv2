import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  BanknotesIcon,
  CalendarIcon,
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  BanknotesIcon as CashIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const TimeDepositDetails = () => {
  const { timeDepositId } = useParams();
  const [depositData, setDepositData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [selectedTimeGroup, setSelectedTimeGroup] = useState("monthly");
  const [coMakerInfo, setCoMakerInfo] = useState(null);

  // Fetch time deposit data
  useEffect(() => {
    const fetchDepositData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/timedepositor/${timeDepositId}`);
        
        if (Array.isArray(response.data)) {
          if (response.data.length > 0) {
            setDepositData(response.data[0]);
            // Simulating some transaction data for demo purposes
            setTransactions(generateSampleTransactions(response.data[0]));
            // Fetch co-maker info from API if needed
            if (response.data[0].memberCode) {
              fetchCoMakerInfo(response.data[0].memberCode);
            }
          } else {
            setDepositData(null);
          }
        } else if (response.data) {
          setDepositData(response.data);
          // Simulating some transaction data for demo purposes
          setTransactions(generateSampleTransactions(response.data));
          // Fetch co-maker info from API if needed
          if (response.data.memberCode) {
            fetchCoMakerInfo(response.data.memberCode);
          }
        } else {
          setDepositData(null);
        }
      } catch (err) {
        console.error("Error fetching time deposit data:", err);
        setError("Failed to fetch time deposit data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepositData();
  }, [timeDepositId]);

  // Fetch co-maker info from API
  const fetchCoMakerInfo = async (memberCode) => {
    try {
      // Replace this with your actual API endpoint to fetch co-maker data
      const response = await axios.get(`http://localhost:3001/api/timedepositor/${timeDepositId}`);
      if (response.data) {
        setCoMakerInfo(response.data);
      }
    } catch (err) {
      console.error("Error fetching co-maker information:", err);
      // Don't set error state here, just log the error
      // This allows the main component to still render even if co-maker info isn't available
    }
  };

  // Sample transaction data generator (for demo purposes)
  const generateSampleTransactions = (data) => {
    const amount = parseFloat(data.amount) || 10000;
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    const transactions = [];
    // Initial deposit
    transactions.push({
      transaction_number: "TXN" + Math.floor(10000 + Math.random() * 90000),
      transaction_date_time: sixMonthsAgo,
      authorized: "John Admin",
      user_type: "Staff",
      transaction_type: "deposit",
      amount: amount
    });
    
    // Interest payments - monthly
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      if (i > 0) { // No interest for current month
        transactions.push({
          transaction_number: "TXN" + Math.floor(10000 + Math.random() * 90000),
          transaction_date_time: date,
          authorized: "System",
          user_type: "System",
          transaction_type: "interest",
          amount: amount * 0.005 // 0.5% monthly interest
        });
      }
    }
    
    return transactions;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading time deposit details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
        <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Data</h3>
        <p className="text-gray-700">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );
  
  if (!depositData) return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-lg">
        <h3 className="text-yellow-800 font-semibold text-lg mb-2">No Time Deposit Found</h3>
        <p className="text-gray-700">The requested time deposit could not be found.</p>
      </div>
    </div>
  );

  // Format and extract data
  const {
    amount,
    fixedTerm,
    interest,
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
    id_picture,
  } = depositData;

  const availableBalance = parseFloat(amount) || 0;
  const interestAmount = parseFloat(interest) || 0;
  const payoutAmount = parseFloat(payout) || 0;
  
  const address = `${house_no_street ? house_no_street + ", " : ""}${
    barangay ? barangay + ", " : ""
  }${city ? city : ""}`.trim();

  const fullName = `${first_name || ""} ${middle_name ? middle_name.charAt(0) + ". " : ""}${last_name || ""}`.trim();
  const initials = `${first_name ? first_name.charAt(0) : ""}${last_name ? last_name.charAt(0) : ""}`.toUpperCase();

  // Co-maker information formatting
  const coMakerFullName = coMakerInfo ? 
    `${coMakerInfo.co_first_name || ""} ${coMakerInfo.co_middle_name ? coMakerInfo.co_middle_name.charAt(0) + ". " : ""}${coMakerInfo.co_last_name || ""}`.trim() :
    "N/A";
    
  const coMakerInitials = coMakerInfo ? 
    `${coMakerInfo.co_first_name ? coMakerInfo.co_first_name.charAt(0) : ""}${coMakerInfo.co_last_name ? coMakerInfo.co_last_name.charAt(0) : ""}`.toUpperCase() :
    "NA";
    
  const coMakerAddress = coMakerInfo ? 
    `${coMakerInfo.co_complete_address
    }${coMakerInfo.city ? coMakerInfo.city : ""}`.trim() :
    "N/A";

  // Calculate days remaining until maturity
  const today = new Date();
  const maturityDateObj = maturityDate ? new Date(maturityDate) : null;
  const daysRemaining = maturityDateObj ? Math.ceil((maturityDateObj - today) / (1000 * 60 * 60 * 24)) : 0;
  const depositStatus = daysRemaining > 0 ? "Active" : "Matured";
  
  // Interest rate calculation (demonstrative - would ideally come from API)
  const interestRate = interestAmount > 0 && availableBalance > 0 
    ? ((interestAmount / availableBalance) * 100).toFixed(2)
    : 3.5; // Default to 3.5% if not calculable
    
  // Calculate maturity progress percentage
  let maturityProgress = 0;
  if (maturityDateObj && fixedTerm) {
    const termDays = parseInt(fixedTerm) * 30; // Assuming term is in months
    const elapsedDays = termDays - daysRemaining;
    maturityProgress = Math.min(100, Math.max(0, (elapsedDays / termDays) * 100));
  }

  // Filter transactions based on filter input
  const filteredTransactions = transactions
    .filter(tx => transactionFilter === "all" || tx.transaction_type === transactionFilter)
    .sort((a, b) => new Date(b.transaction_date_time) - new Date(a.transaction_date_time));

  // Prepare chart data
  const prepareChartData = () => {
    const grouped = {};
    transactions.forEach(tx => {
      const date = new Date(tx.transaction_date_time);
      let key;
      
      if (selectedTimeGroup === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else {
        key = date.toISOString().split('T')[0]; // daily
      }
      
      if (!grouped[key]) {
        grouped[key] = { interest: 0, deposit: 0, withdrawal: 0, date: date };
      }
      
      const type = tx.transaction_type;
      const amount = parseFloat(tx.amount) || 0;
      
      if (type === "interest") grouped[key].interest += amount;
      else if (type === "deposit") grouped[key].deposit += amount;
      else if (type === "withdrawal") grouped[key].withdrawal += amount;
    });
    
    // Sort by date
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      return grouped[a].date - grouped[b].date;
    });
    
    return {
      labels: sortedKeys.map(key => {
        const date = grouped[key].date;
        return selectedTimeGroup === "monthly" 
          ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Interest',
          data: sortedKeys.map(key => grouped[key].interest),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: 'Deposit',
          data: sortedKeys.map(key => grouped[key].deposit),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: 'Withdrawal',
          data: sortedKeys.map(key => grouped[key].withdrawal),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
        }
      ]
    };
  };

  const chartData = prepareChartData();

  return (
    <div className="bg-gray-50 p-4 md:p-6">
      <div className="">
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Time Deposit Details</h1>
            <p className="text-gray-500">Manage and view your time deposit account</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              depositStatus === "Active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
            }`}>
              {depositStatus}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Member Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Primary Member Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center mb-4">
                  {id_picture ? (
                    <img
                      src={`http://localhost:3001/uploads/${id_picture}`}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xl">
                      {initials}
                    </div>
                  )}
                  <div className="ml-4">
                    <h2 className="text-xl font-bold">{fullName}</h2>
                    <p className="text-blue-100">Member Code: {memberCode || "N/A"}</p>
                    <div className="mt-1 flex items-center">
                      <UserIcon className="w-4 h-4 text-blue-100 mr-1" />
                      <span className="text-sm text-blue-100">Primary Member</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Personal Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                <div className="space-y-3">
                  {[
                    { icon: <CalendarIcon className="w-5 h-5 text-gray-500" />, label: "Date of Birth", value: date_of_birth ? new Date(date_of_birth).toLocaleDateString() : "N/A" },
                    { icon: <ArrowTrendingUpIcon className="w-5 h-5 text-gray-500" />, label: "Civil Status", value: civil_status || "N/A" },
                    { icon: <BanknotesIcon className="w-5 h-5 text-gray-500" />, label: "Contact", value: contact_number || "N/A" },
                    { icon: <ArrowPathIcon className="w-5 h-5 text-gray-500" />, label: "Address", value: address || "N/A" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-0.5">{item.icon}</div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">{item.label}</p>
                        <p className="text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Co-Maker Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                <div className="flex items-center mb-4">
                  {coMakerInfo && coMakerInfo.id_picture ? (
                    <img
                      src={`http://localhost:3001/uploads/${coMakerInfo.id_picture}`}
                      alt="Co-maker Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white text-pink-600 flex items-center justify-center font-bold text-xl">
                      {coMakerInitials}
                    </div>
                  )}
                  <div className="ml-4">
                    <h2 className="text-xl font-bold">{coMakerFullName}</h2>
                    <div className="mt-1 flex items-center">
                      <UserGroupIcon className="w-4 h-4 text-pink-100 mr-1" />
                      <span className="text-sm text-pink-100">Co-Maker</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Co-maker Personal Info */}
              {coMakerInfo ? (
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Co-Maker Information</h3>
                  <div className="space-y-3">
                    {[
                      { icon: <UserGroupIcon className="w-5 h-5 text-gray-500" />, label: "Relationship", value: coMakerInfo.co_relationship_primary || coMakerInfo.co_relationship || "N/A" },
                      { icon: <CalendarIcon className="w-5 h-5 text-gray-500" />, label: "Date of Birth", value: coMakerInfo.co_date_of_birth || coMakerInfo.co_date_of_birth ? new Date(coMakerInfo.date_of_birth || coMakerInfo.co_date_of_birth).toLocaleDateString() : "N/A" },
                      { icon: <ArrowTrendingUpIcon className="w-5 h-5 text-gray-500" />, label: "Civil Status", value: coMakerInfo.co_civil_status || coMakerInfo.co_civil_status || "N/A" },
                      { icon: <BanknotesIcon className="w-5 h-5 text-gray-500" />, label: "Contact", value: coMakerInfo.co_contact_number || coMakerInfo.co_contact_number || "N/A" },
                      { icon: <ArrowPathIcon className="w-5 h-5 text-gray-500" />, label: "Address", value: coMakerAddress },
                      {/* { icon: <ChartBarIcon className="w-5 h-5 text-gray-500" />, label: "Occupation", value: coMakerInfo.co_occupation || "N/A" },
                      { icon: <CashIcon className="w-5 h-5 text-gray-500" />, label: "Monthly Income", value: coMakerInfo.co_monthly_income ? parseFloat(coMakerInfo.monthly_income).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }) : "N/A" }, */}
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-0.5">{item.icon}</div>
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
                  <button className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                    Add Co-Maker
                  </button>
                </div>
              )}
              
              {/* Co-maker Info Box */}
              {coMakerInfo && (
                <div className="p-4 border-t border-gray-100">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <h4 className="font-medium text-purple-800 mb-2">Co-Maker Responsibilities</h4>
                    <p className="text-sm text-gray-600">The co-maker serves as a guarantor for this time deposit. In the event of early withdrawal or other account changes, the co-maker may need to provide authorization.</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Time Deposit Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center">
                    <ArrowPathIcon className="w-5 h-5 mr-2" />
                    Roll Over Deposit
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center">
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    {daysRemaining <= 0 ? "Withdraw at Maturity" : "Early Withdrawal"}
                  </button>
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <h4 className="font-medium text-yellow-800">Early Withdrawal Notice</h4>
                    <p className="text-sm text-gray-600 mt-1">Early withdrawals may be subject to penalties as per your agreement terms. Please consult with an account manager before proceeding.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Deposit Details & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Principal Amount</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {availableBalance.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                    </h3>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BanknotesIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {interestRate}%
                    </h3>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expected Payout</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {(payoutAmount || availableBalance + interestAmount).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                    </h3>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CashIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Time Deposit Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Time Deposit Details</h3>
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-blue-600 mr-1" />
                  <span className="text-sm font-medium">
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Matured"}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Term Length</p>
                      <p className="text-gray-800">{fixedTerm || "N/A"} {parseInt(fixedTerm) === 1 ? "month" : "months"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p className="text-gray-800">
                        {transactions.length > 0 
                          ? new Date(transactions.sort((a, b) => new Date(a.transaction_date_time) - new Date(b.transaction_date_time))[0].transaction_date_time).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : "N/A"
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Maturity Date</p>
                      <p className="text-gray-800">
                        {maturityDate
                          ? new Date(maturityDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : "N/A"
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Interest Earned (Est.)</p>
                      <p className="text-gray-800">
                        {interestAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Remarks</p>
                      <p className="text-gray-800">{remarks || "No remarks"}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Maturity Progress</p>
                  <div className="mb-6">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${maturityProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Start</span>
                      <span>{maturityProgress.toFixed(0)}% Complete</span>
                      <span>Maturity</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-mediumtext-blue-800 mb-2">Time Deposit Benefits</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">✓</span>
                        <span>Higher interest rates compared to regular savings</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">✓</span>
                        <span>Fixed returns for predictable growth</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">✓</span>
                        <span>Option to roll over for continued growth</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">✓</span>
                        <span>Protected by deposit insurance up to PHP 500,000</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            
            {/* Transaction List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">Transactions</h3>
                  <div className="inline-flex bg-gray-100 rounded-lg p-1">
                    <button 
                      className={`px-3 py-1 text-sm font-medium rounded-md ${transactionFilter === 'all' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setTransactionFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm font-medium rounded-md ${transactionFilter === 'deposit' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setTransactionFilter('deposit')}
                    >
                      Deposits
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm font-medium rounded-md ${transactionFilter === 'interest' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setTransactionFilter('interest')}
                    >
                      Interest
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm font-medium rounded-md ${transactionFilter === 'withdrawal' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setTransactionFilter('withdrawal')}
                    >
                      Withdrawals
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Authorized By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.transaction_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.transaction_date_time).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.transaction_type === 'deposit' 
                                ? 'bg-green-100 text-green-800'
                                : tx.transaction_type === 'withdrawal'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              

                            {tx.transaction_type === 'deposit' ? 'Deposit' : tx.transaction_type === 'withdrawal' ? 'Withdrawal' : 'Interest'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parseFloat(tx.amount).toLocaleString('en-PH', {
                              style: 'currency',
                              currency: 'PHP'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.authorized}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                          No transactions found for the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {filteredTransactions.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
                  Showing {filteredTransactions.length} transactions
                </div>
              )}
            </div>
            
            {/* Information Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Time Deposit Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">What is a Time Deposit?</h4>
                  <p className="text-gray-600">A time deposit is a fixed-term investment that includes an agreement between the depositor and the financial institution. The depositor agrees to leave the sum of money on deposit for a specific term, such as 3 months, 6 months, or longer.</p>
                  
                  <h4 className="font-medium text-gray-800">Key Features</h4>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>Fixed term with predetermined maturity date</li>
                    <li>Higher interest rates than regular savings accounts</li>
                    <li>Interest rates are typically fixed for the term</li>
                    <li>Early withdrawal may incur penalties</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Maturity Options</h4>
                  <p className="text-gray-600">When your time deposit matures, you typically have these options:</p>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li><strong>Withdraw:</strong> Take out your principal plus earned interest</li>
                    <li><strong>Roll Over:</strong> Reinvest the principal for another term</li>
                    <li><strong>Roll Over with Interest:</strong> Reinvest both principal and earned interest</li>
                    <li><strong>Partial Withdrawal:</strong> Withdraw some funds and roll over the rest</li>
                  </ul>
                  
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="font-medium text-indigo-800 mb-2">Need Help?</h4>
                    <p className="text-sm text-gray-600">If you have questions about your time deposit or would like to discuss options before maturity, please contact our customer service at <span className="font-medium">support@bank.com</span> or call <span className="font-medium">(123) 456-7890</span>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeDepositDetails;