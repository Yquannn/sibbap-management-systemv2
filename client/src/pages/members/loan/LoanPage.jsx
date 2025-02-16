import React, { useState } from "react";
import { CheckCircle, Clock, XCircle, Eye, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";  // Import useNavigate

const dummyLoans = [
  { id: 1, type: "Personal Loan", amount: 50000, status: "Approved", date: "2025-02-10" },
  { id: 2, type: "Home Loan", amount: 200000, status: "Pending", date: "2025-02-08" },
  { id: 3, type: "Car Loan", amount: 100000, status: "Rejected", date: "2025-02-05" },
  { id: 4, type: "Business Loan", amount: 300000, status: "Approved", date: "2025-02-01" },
];

const MemberLoanPage = () => {
  const [loans] = useState(dummyLoans);
const navigate = useNavigate();  
  

  // Function to get status color
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

  // Function to get status icon
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
<div className="max-w-lg mx-auto">
  <button
    className="flex items-center text-gray-700 hover:text-black mb-4"
    onClick={() => navigate(-1)} // Go back to the previous page
  >
    <ArrowLeft size={20} className="mr-2" /> Back
  </button>
  <h2 className="text-xl font-semibold">Loan Application Tracker</h2>

  <div className="divide-y divide-gray-200 mt-2">
    {loans.map((loan) => (
      <div key={loan.id} className="flex justify-between items-center py-4">
        {/* Left Section: Loan Details */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500">
            {new Date(loan.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="font-medium">{loan.type}</p>
          <p className="text-gray-700 font-semibold">₱{loan.amount.toLocaleString()}</p>
        </div>

        {/* Right Section: Status & View Button */}
        <div className="flex items-center gap-3">
          {getStatusIcon(loan.status)}
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
            {loan.status}
          </span>
          <button className="text-gray-600 hover:text-black">
            <Eye size={20} />
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

  );
};

export default MemberLoanPage;
