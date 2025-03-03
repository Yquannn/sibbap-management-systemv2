import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memberId } from "../home/MemberDashboard";

const MemberLoanPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch loans from backend for the given memberId
  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://192.168.254.103:3001/api/member-loan-application/${memberId}`
        );
        setLoans(response.data);
      } catch (err) {
        console.error("Error fetching loans:", err);
        setError("Failed to fetch loans.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  // Map backend status to display status:
  // "Waiting for evaluation" or "Passed" → "Pending"
  // "Failed" → "Rejected"
  const mapStatus = (status) => {
    if (status === "Waiting for Approval") {
      return "Pending";
    }
    if (status === "Failed") {
      return "Rejected";
    }
    return status;
  };

  // Return appropriate color classes based on display status
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

  // Return the icon based on display status
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

  // Filter loans based on selected filter using mapped status
  const filteredLoans = loans.filter((loan) => {
    const displayStatus = mapStatus(loan.status);
    if (filter === "All") return true;
    return displayStatus === filter;
  });

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Loan Application Tracker</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {["All", "Approved", "Pending", "Rejected"].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === status ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Loading and Error States */}
      {loading && <p className="text-center text-gray-500">Loading loans...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Loans List */}
      <div className="divide-y divide-gray-200 mb-14">
        {filteredLoans.map((loan) => {
          const displayStatus = mapStatus(loan.status);
          return (
  <div
    key={loan.loan_application_id}
    className="grid grid-cols-2 gap-4 py-4 cursor-pointer  transition-colors"
    onClick={() => navigate(`/member-loan-details/${loan.loan_application_id}`)}
  >
    {/* Top Row: Date (left) & Voucher Number (right) */}
    <div>
      <p className="text-sm text-gray-500">
        {new Date(loan.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
    <div className="flex justify-end">
      <p className="text-xs text-gray-8 00">
        {loan.client_voucher_number || "N/A"} 
      </p>
    </div>

    {/* Bottom Row: Loan type & amount (left) & Status (right) */}
    <div>
      <p className="font-semibold text-gray-800">{loan.loan_type}</p>
      <p className="text-gray-700 font-medium">
        ₱{parseFloat(loan.loan_amount).toLocaleString()}
      </p>
      {mapStatus(loan.status) === "Rejected" && loan.remarks && (
        <p className="text-xs text-red-600">Remarks: {loan.remarks}</p>
      )}
    </div>
    <div className="flex items-center justify-end gap-3">
      {getStatusIcon(mapStatus(loan.status))}
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(mapStatus(loan.status))}`}
      >
        {mapStatus(loan.status)}
      </span>
      <ChevronRight size={30} className="text-gray-400" />
    </div>
  </div>
);



        })}
      </div>

      {filteredLoans.length === 0 && !loading && (
        <p className="mt-6 text-center text-gray-500">
          No loans found for the selected filter.
        </p>
      )}
    </div>
  );
};

export default MemberLoanPage;
