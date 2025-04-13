import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDollarSign, FaFilter, FaSearch, FaSort, FaEye, FaChartBar, FaUsers, FaExclamationCircle, FaMoneyBill } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Borrowers = () => {
  const apiBaseURL = 'http://localhost:3001/api/borrowers';
  const navigate = useNavigate();

  const [borrowers, setBorrowers] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Analytics states
  const [analytics, setAnalytics] = useState({
    totalBorrowers: 0,
    totalLoanAmount: 0,
    pendingApplications: 0,
    outstandingBalance: 0
  });

  // List of loan types available for filtering
  const loanTypes = [
    "Feeds Loan", "Rice Loan", "Marketing Loan", "Back-to-Back Loan",
    "Regular Loan", "Livelihood Assistance Loan", "Educational Loan",
    "Emergency Loan", "Quick Cash Loan", "Car Loan", "Housing Loan",
    "Motorcycle Loan", "Memorial Lot Loan", "Travel Loan",
    "OFW Assistance Loan", "Savings Loan", "Health Insurance Loan",
    "Special Loan", "Reconstruction Loan"
  ];

  // Status options for filtering
  const statusOptions = ["All", "Approved", "Pending", "Rejected"];

  useEffect(() => {
    fetchBorrowers();
  }, []);

  useEffect(() => {
    if (borrowers.length > 0) {
      calculateAnalytics();
    }
  }, [borrowers]);

  const fetchBorrowers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiBaseURL);
      // Sort borrowers by application date in descending order
      const sortedBorrowers = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setBorrowers(sortedBorrowers);
      console.log("Fetched Borrowers:", sortedBorrowers);
    } catch (error) {
      setError('Failed to fetch borrowers. Please try again later.');
      console.error('Error fetching borrowers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics from borrowers data
  const calculateAnalytics = () => {
    const totalBorrowers = borrowers.length;
    
    const totalLoanAmount = borrowers.reduce((sum, borrower) => {
      return sum + (parseFloat(borrower.loan_amount) || 0);
    }, 0);
    
    const pendingApplications = borrowers.filter(
      borrower => borrower.status?.toLowerCase() === 'pending'
    ).length;
    
    const outstandingBalance = borrowers.reduce((sum, borrower) => {
      return sum + (parseFloat(borrower.balance) || 0);
    }, 0);
    
    setAnalytics({
      totalBorrowers,
      totalLoanAmount,
      pendingApplications,
      outstandingBalance
    });
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Perform sorting
  const sortedBorrowers = React.useMemo(() => {
    let sortableBorrowers = [...borrowers];
    if (sortConfig.key) {
      sortableBorrowers.sort((a, b) => {
        // Handle different data types
        if (sortConfig.key === 'created_at') {
          // Date comparison
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'asc' 
            ? dateA - dateB 
            : dateB - dateA;
        } else if (sortConfig.key === 'loan_amount' || sortConfig.key === 'balance') {
          // Number comparison
          const numA = parseFloat(a[sortConfig.key] || 0);
          const numB = parseFloat(b[sortConfig.key] || 0);
          return sortConfig.direction === 'asc' 
            ? numA - numB 
            : numB - numA;
        } else {
          // String comparison
          const valueA = String(a[sortConfig.key] || '').toUpperCase();
          const valueB = String(b[sortConfig.key] || '').toUpperCase();
          return sortConfig.direction === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
      });
    }
    return sortableBorrowers;
  }, [borrowers, sortConfig]);

  // Filter borrowers based on the selected loan type, search query, and status filter
  const filteredBorrowers = sortedBorrowers.filter(borrower => {
    const matchesLoanType = activeTab === "All" ? true : borrower.loan_type === activeTab;

    // Create a full name string (case-insensitive)
    const fullName = `${borrower.first_name} ${borrower.last_name} ${borrower.middle_name || ''}`.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      (borrower.client_voucher_number &&
        borrower.client_voucher_number.toString().includes(searchQuery));

    // Assume borrower.status holds the status (Approved, Pending, Rejected, etc.)
    const matchesStatus = statusFilter === "All"
      ? true
      : borrower.status && borrower.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesLoanType && matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBorrowers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBorrowers.length / itemsPerPage);

  // Generate page numbers
  const pageNumbers = [];
  const maxPageNumbersShown = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersShown / 2));
  let endPage = startPage + maxPageNumbersShown - 1;
  
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageNumbersShown + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Generate sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 text-gray-300" />;
    return sortConfig.direction === 'asc' 
      ? <FaSort className="ml-1 text-blue-500" />
      : <FaSort className="ml-1 text-blue-500 transform rotate-180" />;
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200'; // Default to approved
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Borrower Management</h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Borrowers Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="mr-4 bg-blue-100 p-3 rounded-full">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Borrowers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalBorrowers}</p>
            </div>
          </div>

          {/* Total Loan Amount Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="mr-4 bg-green-100 p-3 rounded-full">
              <FaMoneyBill className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Loan Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₱{analytics.totalLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Pending Applications Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="mr-4 bg-yellow-100 p-3 rounded-full">
              <FaExclamationCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.pendingApplications}</p>
            </div>
          </div>

          {/* Outstanding Balance Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
            <div className="mr-4 bg-red-100 p-3 rounded-full">
              <FaChartBar className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₱{analytics.outstandingBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-6 bg-white shadow-sm rounded-xl border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loan Type Filter */}
            <div className="flex flex-col">
              <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FaFilter className="mr-2 text-gray-500" /> Loan Type
                </span>
              </label>
              <select
                id="loanType"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700"
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
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FaSearch className="mr-2 text-gray-500" /> Search
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Name or voucher number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col">
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FaFilter className="mr-2 text-gray-500" /> Status
                </span>
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Borrower Table */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {activeTab === "All" ? "All Borrowers" : `${activeTab} Borrowers`}
            </h3>
            <div className="text-sm text-gray-500">
              {filteredBorrowers.length} {filteredBorrowers.length === 1 ? 'borrower' : 'borrowers'} found
            </div>
          </div>
          
          <div className="overflow-x-auto scrollbar-thin" style={{ maxHeight: '480px' }}>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredBorrowers.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('client_voucher_number')}>
                      <div className="flex items-center">
                        Voucher No. {getSortIndicator('client_voucher_number')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('memberCode')}>
                      <div className="flex items-center">
                        Code {getSortIndicator('memberCode')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('last_name')}>
                      <div className="flex items-center">
                        Full Name {getSortIndicator('last_name')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('loan_type')}>
                      <div className="flex items-center">
                        Loan Type {getSortIndicator('loan_type')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('loan_amount')}>
                      <div className="flex items-center">
                        Amount {getSortIndicator('loan_amount')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('interest')}>
                      <div className="flex items-center">
                        Interest {getSortIndicator('interest')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('created_at')}>
                      <div className="flex items-center">
                        Date {getSortIndicator('created_at')}
                      </div>
                    </th>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('balance')}>
                      <div className="flex items-center">
                        Balance {getSortIndicator('balance')}
                      </div>
                    </th> */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>
                      <div className="flex items-center">
                        Status {getSortIndicator('status')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((borrower) => (
                    <tr key={borrower.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrower.client_voucher_number || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrower.memberCode || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {borrower.last_name}, {borrower.first_name} {borrower.middle_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {borrower.loan_type || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrower.loan_amount
                          ? `₱${Number(borrower.loan_amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrower.interest ? `${borrower.interest}%` : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(borrower.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={borrower.balance > 0 ? "text-red-600" : "text-green-600"}>
                          {borrower.balance
                            ? `₱${Number(borrower.balance).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                            : "₱0.00"}
                        </span>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getStatusBadgeColor(borrower.status)}`}>
                          {borrower.status || "Approved"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                            onClick={() => navigate(`/borrower-loan-information/${borrower.memberId}`)}
                          >
                            <FaEye className="mr-1.5" size={14} /> View
                          </button>
                          <button
                            className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center"
                            onClick={() => navigate(`/repayment/${borrower.id}`)}
                          >
                            <FaDollarSign className="mr-1.5" size={14} /> Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No borrowers found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {filteredBorrowers.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-3">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBorrowers.length)} of {filteredBorrowers.length} results
                </span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border border-gray-300 flex items-center`}
                >
                  Previous
                </button>
                
                {pageNumbers.map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === number
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    } border border-gray-300`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border border-gray-300 flex items-center`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Borrowers;