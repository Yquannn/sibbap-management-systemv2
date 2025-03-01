import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDollarSign, FaFilter, FaSearch } from 'react-icons/fa';
import RepaymentModal from './modal/RepaymentModal';

const Borrowers = () => {
  const apiBaseURL = 'http://localhost:3001/api/borrowers'; // test api to get all applicant in loan 

  const [borrowers, setBorrowers] = useState([]);
  const [activeTab, setActiveTab] = useState("All"); // Default to "All" loans
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState(""); // State for handling error messages
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
const [selectedLoanBorrower, setSelectedLoanBorrower] = useState(null);


  // List of loan types available for filtering
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

  // Filter borrowers based on the selected loan type, search query, and status filter.
  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesLoanType = activeTab === "All" ? true : borrower.loanType === activeTab;

    // Create a full name string (case-insensitive)
    const fullName = `${borrower.first_name} ${borrower.last_name} ${borrower.middle_name}`.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      (borrower.clientVoucherNumber &&
        borrower.clientVoucherNumber.toString().includes(searchQuery));

    // Assume borrower.remarks holds the status (Approved, Pending, Rejected, etc.)
    const matchesStatus = statusFilter === "All"
      ? true
      : borrower.remarks && borrower.remarks.toLowerCase() === statusFilter.toLowerCase();

    return matchesLoanType && matchesSearch && matchesStatus;
  });

  const openLoanDetailsModal = (borrower) => {
    setSelectedLoanBorrower(borrower);
    setIsLoanModalOpen(true);
  };

  const openRepaymentModal = (borrower) => {
    console.log("Opening modal for borrower:", borrower); // Debugging
    setSelectedBorrower(borrower);
    setIsModalOpen(true);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Borrowers</h2>

      {/* Filter Section */}
      <div className="mb-6 p-6 bg-white shadow-lg rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Loan Type Filter */}
          <div className="flex flex-col">
            <label htmlFor="loanType" className="block text-sm font-medium text-gray-600 mb-1">
              <span className="flex items-center">
                <FaFilter className="mr-1" /> Kinds of Loan
              </span>
            </label>
            <select
              id="loanType"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="All">All Loans</option>
              {loanTypes.map((tab) => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select>
          </div>

          {/* Search Borrowers Filter */}
          <div className="flex flex-col">
            <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">
              <span className="flex items-center">
                <FaSearch className="mr-1" /> Search Borrowers
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by name or voucher number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Status Filter */}
        </div>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Borrower Table */}
      <h3 className="text-2xl font-semibold mb-4">
        Borrower List for {activeTab === "All" ? "All Loans" : activeTab}
      </h3>
      <div className="overflow-x-auto" style={{ maxHeight: "65vh" }}>
        <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
          <thead className="sticky top-0 bg-green-200 z-20 text-center">
            <tr>
              <th className="px-4 py-2 text-left text-sm">Client Voucher Number</th>
              <th className="px-4 py-2 text-left text-sm">Code Number</th>
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
            {filteredBorrowers.length > 0 ? (
              filteredBorrowers.map((borrower) => (
                <tr key={borrower.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.client_voucher_number || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.memberCode|| "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.last_name}, {borrower.first_name} {borrower.middle_name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.loan_type || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {borrower.application|| "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.loan_amount || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.interest || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.terms || "N/A"}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-300">
                      {new Date(borrower.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    {borrower.balance || 0}
                  </td>
                  <td className="px-4 py-2 text-center text-sm">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${
                        (!borrower.status || borrower.status === "Approved")
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {borrower.status || "Approved"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-700">
                    <div className="flex justify-center space-x-3">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                        onClick={() => openLoanDetailsModal(borrower)}
                      >
                        View Loan
                      </button>

                      <button
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center"
                        onClick={() => openRepaymentModal(borrower)}
                      >
                        <FaDollarSign className="mr-1" /> Repayment
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
      {isLoanModalOpen && selectedLoanBorrower && (
        <RepaymentModal
          isOpen={isLoanModalOpen}
          onClose={() => setIsLoanModalOpen(false)}
          borrower={selectedLoanBorrower}
        />
      )}

    </div>
  );
};

export default Borrowers;
