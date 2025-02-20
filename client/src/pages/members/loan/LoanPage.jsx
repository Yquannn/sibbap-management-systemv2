import React, { useState } from "react";
import { CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const dummyLoans = [
  { id: 1, type: "Personal Loan", amount: 50000, status: "Approved", date: "2025-02-10" },
  { id: 2, type: "Home Loan", amount: 200000, status: "Pending", date: "2025-02-08" },
  { id: 3, type: "Car Loan", amount: 100000, status: "Rejected", date: "2025-02-05" },
  { id: 4, type: "Business Loan", amount: 300000, status: "Approved", date: "2025-02-01" },
];

const MemberLoanPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

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

  // Filter loans based on selection
  const filteredLoans = filter === "All" ? dummyLoans : dummyLoans.filter((loan) => loan.status === filter);

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Loan Application Tracker</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {["All", "Approved", "Pending", "Rejected"].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === status ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>
      

      <div className="divide-y divide-gray-200">
        {filteredLoans.map((loan) => (
          <div
            key={loan.id}
            className="flex justify-between items-center py-4 cursor-pointer hover:bg-gray-100 rounded-lg"
            // onClick={() => navigate(`/member-loan-details/${loan.id}`)}
               onClick={() => navigate(`/member-loan-details`)}

          >
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

            {/* Right Section: Status & Icon */}
            <div className="flex items-center gap-3">
              {getStatusIcon(loan.status)}
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                {loan.status}
              </span>
              <ChevronRight size={30} className="text-gray-400 hover:text-black" />
            </div>
          </div>
        ))}
      </div>

      {/* Show message if no loans match the filter */}
      {filteredLoans.length === 0 && (
        <p className="text-gray-500 text-center mt-4">No loans found for the selected filter.</p>
      )}
    </div>
  );
};

export default MemberLoanPage;
