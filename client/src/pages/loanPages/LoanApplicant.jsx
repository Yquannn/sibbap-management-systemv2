import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDollarSign } from 'react-icons/fa';
import LoanEvaluationProfileModal from './component/LoanEvaluationProfileModal';

const LoanApproval = () => {
  const apiBaseURL = 'http://localhost:3001/api/members'; // Ensure this URL is correct

  const [modalState, setModalState] = useState({
    addOpen: false,
    editOpen: false,
    viewOpen: false,
    selectedMember: null,
  });

  const [borrowers, setBorrowers] = useState([]);
  const [activeTab, setActiveTab] = useState("RegularSavings");
  const [error, setError] = useState(""); // State for handling error messages

  const loanTypes = [
    "Feeds Loan", "Rice Loan", "Marketing Loan", "Back-to-Back Loan",
    "Regular Loan", "Livelihood Assistance Loan", "Educational Loan",
    "Emergency Loan", "Quick Cash Loan", "Car Loan", "Housing Loan",
    "Motorcycle Loan", "Memorial Lot Loan", "Travel Loan",
    "OFW Assistance Loan", "Savings Loan", "Health Insurance Loan",
    "Special Loan", "Reconstruction Loan"
  ];

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      const response = await axios.get(apiBaseURL);
      setBorrowers(response.data);
    } catch (error) {
      setError('Failed to fetch borrowers. Please try again later.');
      console.error('Error fetching borrowers:', error);
    }
  };

  const openModal = (type, borrower = null) => {
    setModalState({
      addOpen: type === 'addOpen',
      editOpen: type === 'editOpen',
      viewOpen: type === 'viewOpen',
      selectedMember: borrower
    });
  };

  // Event handler to mark a borrower as approved.
  const handleApprove = (id) => {
    const updatedBorrowers = borrowers.map((borrower) =>
      borrower.id === id ? { ...borrower, remarks: "Approved" } : borrower
    );
    setBorrowers(updatedBorrowers);
  };

  // Event handler to mark a borrower as rejected.
  const handleReject = (id) => {
    const updatedBorrowers = borrowers.map((borrower) =>
      borrower.id === id ? { ...borrower, remarks: "Rejected" } : borrower
    );
    setBorrowers(updatedBorrowers);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalState({
      addOpen: false,
      editOpen: false,
      viewOpen: false,
      selectedMember: null,
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">List of Loan Applicant</h2>
      
      {/* Loan Type Dropdown */}
      <div className="mb-6 p-4 bg-gray-100 shadow-sm rounded-lg">
        <label htmlFor="loanType" className="block text-lg font-medium text-gray-700 mb-2">
          Kinds of Loan
        </label>
        <select
          id="loanType"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 max-w-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loanTypes.map((tab) => (
            <option key={tab} value={tab}>
              {tab.replace(/([A-Z])/g, ' $1').trim()}
            </option>
          ))}
        </select>
      </div>

      {/* Error Handling */}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {/* Borrower Table */}
      <h3 className="text-2xl font-semibold mb-4">
        Borrower List for {activeTab.replace(/([A-Z])/g, ' $1').trim()}
      </h3>
      <div className="overflow-x-auto" style={{ maxHeight: "65vh" }}>
        <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
          <thead className="sticky top-0 bg-green-200 z-20 text-center">
            <tr>
              <th className="px-4 py-2 text-left text-sm">Client Voucher Number</th>
              <th className="px-4 py-2 text-left text-sm">Full Name</th>
              <th className="px-4 py-2 text-left text-sm">Loan Type</th>
              <th className="px-4 py-2 text-left text-sm">Application</th>
              <th className="px-4 py-2 text-center text-sm">Loan Amount</th>
              <th className="px-4 py-2 text-center text-sm">Interest</th>
              <th className="px-4 py-2 text-center text-sm">Terms</th>
              <th className="px-4 py-2 text-center text-sm">Application Date</th>
              <th className="px-4 py-2 text-center text-sm">Balance</th>
              <th className="px-4 py-2 text-center text-sm">Status</th>
              <th className="px-4 py-2 text-center text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.length > 0 ? (
              borrowers.map((borrower) => (
                <tr key={borrower.id} className="border-b">
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.clientVoucherNumber || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.LastName}, {borrower.FirstName} {borrower.MiddleName}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.loanType || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.applicationDate || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.loanAmount || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.interest || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.terms || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.applicationDate || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.balance || 0}
                  </td>
                  <td className="px-4 py-2 text-center text-sm">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${
                        borrower.remarks === "Approved"
                          ? "bg-green-500 text-white"
                          : borrower.remarks === "Rejected"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {borrower.remarks || "Waiting for Approval"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => openModal('viewOpen', borrower)}
                        className="bg-green-500 text-sm text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        View Evaluation
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4 text-gray-600">
                  No borrowers available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalState.viewOpen && modalState.selectedMember && (
        <LoanEvaluationProfileModal 
          member={modalState.selectedMember} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default LoanApproval;
