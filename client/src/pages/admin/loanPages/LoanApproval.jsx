import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDollarSign, FaSearch, FaFilter, FaEye, FaSpinner, FaChevronLeft, FaChevronRight,  } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

const LoanApproval = () => {
  const apiBaseURL = 'http://localhost:3001/api/loan-applicant/approve';

  const [modalState, setModalState] = useState({
    addOpen: false,
    editOpen: false,
    viewOpen: false,
    selectedMember: null,
  });
  const [activeTab, setActiveTab] = useState("All");
  const [borrowers, setBorrowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const navigate = useNavigate();
  
  const loanTypes = [
    "Feeds Loan", "Rice Loan", "Marketing Loan", "Back-to-Back Loan",
    "Regular Loan", "Livelihood Assistance Loan", "Educational Loan",
    "Emergency Loan", "Quick Cash Loan", "Car Loan", "Housing Loan",
    "Motorcycle Loan", "Memorial Lot Loan", "Travel Loan",
    "OFW Assistance Loan", "Savings Loan", "Health Insurance Loan",
    "Special Loan", "Reconstruction Loan"
  ];

  const fetchBorrowers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiBaseURL);
      const sortedBorrowers = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setBorrowers(sortedBorrowers);
      // Reset to first page when fetching new data
      setCurrentPage(1);
    } catch (error) {
      setError('Failed to fetch borrowers. Please try again later.');
      console.error('Error fetching borrowers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesLoanType = activeTab === "All" ? true : borrower.loanType === activeTab;

    const fullName = `${borrower.FirstName || ''} ${borrower.LastName || ''} ${borrower.MiddleName || ''}`.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      (borrower.client_voucher_number &&
        borrower.client_voucher_number.toString().includes(searchQuery)) ||
      (borrower.memberCode &&
        borrower.memberCode.toString().toLowerCase().includes(searchQuery.toLowerCase()));

    const borrowerStatus = borrower.remarks || "Waiting for Approval";
    const matchesStatus =
      statusFilter === "All" ? true : borrowerStatus === statusFilter;

    return matchesLoanType && matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBorrowers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBorrowers.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Navigate to next and previous pages
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle per page change
  const handlePerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      case 'Waiting for Approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Loan Approval</h1>
        <p className="text-gray-600 mt-2">Manage and process loan applications</p>
      </div>

      {/* Filter Section */}
      <div className="mb-8 p-6 bg-white shadow-sm rounded-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Loan Type Dropdown */}
          <div>
            <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <FaFilter className="mr-2 text-indigo-600" /> Loan Type
              </span>
            </label>
            <select
              id="loanType"
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value);
                setCurrentPage(1); // Reset to first page when changing filter
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="All">All Loans</option>
              {loanTypes.map((tab) => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select> 
          </div>

          {/* Search Filter */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <FaSearch className="mr-2 text-indigo-600" /> Search Applicant
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Name, voucher or code number"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <FaFilter className="mr-2 text-indigo-600" /> Status
              </span>
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when changing filter
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Waiting for Approval">Waiting for Approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Header for current view */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {activeTab === "All" ? "All Loan Applications" : `${activeTab} Applications`}
          <span className="ml-2 text-sm font-normal text-gray-500">
            {filteredBorrowers.length} {filteredBorrowers.length === 1 ? 'record' : 'records'}
          </span>
        </h2>
        
        <button
              onClick={() => {
                fetchBorrowers();
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
      </div>

      {/* Borrowers Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-x-auto scrollbar-thin"  style={{ maxHeight: '500px' }}>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-indigo-600 text-2xl mr-2" />
            <span className="text-gray-600">Loading applications...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Information</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((borrower) => (
                      <tr key={borrower.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900">
                              {borrower.last_name || ""}, {borrower.first_name || ""} {borrower.middle_name || ""}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <div>Code: {borrower.memberCode || "N/A"}</div>
                              <div>Voucher: {borrower.client_voucher_number || "N/A"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{borrower.loan_type || "N/A"}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <div>Terms: {borrower.terms || "N/A"}</div>
                              <div>Date: {new Date(borrower.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(borrower.status)}`}>
                            {borrower.status || "Waiting for Approval"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/loan-application-approval/${borrower.loan_application_id}`)}
                            className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                          >
                            <FaEye className="mr-2" />
                            View Evaluation
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-600">No borrowers found matching your filters.</p>
                          <button 
                            onClick={() => {
                              setActiveTab("All");
                              setSearchQuery("");
                              setStatusFilter("All");
                            }}
                            className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredBorrowers.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <span className="text-sm text-gray-700 mr-4">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBorrowers.length)} of {filteredBorrowers.length}
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={handlePerPageChange}
                      className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center h-8 w-8 mr-2 rounded ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition-colors duration-200'
                      }`}
                    >
                      <FaChevronLeft className="h-3 w-3" />
                    </button>
                    
                    {getPageNumbers().map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`flex items-center justify-center h-8 w-8 mx-1 rounded-md ${
                          currentPage === number
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition-colors duration-200'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center h-8 w-8 ml-2 rounded ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition-colors duration-200'
                      }`}
                    >
                      <FaChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoanApproval;