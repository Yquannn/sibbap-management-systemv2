import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Eye,
  Search,
  Clock,
  Plus,
  BarChart4,
  Users,
  Loader,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import MemberAccountModal from "../../childModal/MemberAccountModal";
import { useNavigate } from "react-router-dom";

// Helper to format numbers with comma separators and two decimals
const formatCurrency = (value) => {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const TimeDeposit = ({ openModal, handleDelete }) => {
  const [timeDeposits, setTimeDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const navigate = useNavigate();

  const handleOpenModal = (type, member = null) => {
    setModalType(type);
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setSelectedMember(null);
  };

  const fetchTimeDeposits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3001/api/active");
      
      // Check if the response data contains 'data' array
      if (Array.isArray(response.data.data)) {
        if (response.data.data.length === 0) {
          throw new Error("No depositor for time deposit.");
        }
        setTimeDeposits(response.data.data);  // Corrected this line
      } else {
        throw new Error("Expected an array of time deposits.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Error fetching time deposits."
      );
    } finally {
      setLoading(false);
    }
  }, []);
  
  
  useEffect(() => {
    fetchTimeDeposits();
  }, [fetchTimeDeposits]);

  const filteredDeposits = timeDeposits.filter((depositor) => {
    const query = filterQuery.toLowerCase();
    const fullName = `${depositor.first_name} ${depositor.last_name}`.toLowerCase();
    const code = depositor.memberCode ? depositor.memberCode.toLowerCase() : "";
    return query === "" || fullName.includes(query) || code.includes(query);
  });

  const sortedDeposits = [...filteredDeposits].sort(
    (a, b) => b.timeDepositId - a.timeDepositId
  );

  // Calculate total deposits amount
  const totalDepositsAmount = sortedDeposits.reduce((sum, depositor) => 
    sum + (parseFloat(depositor.amount) || 0), 0
  );
  
  // Get average deposit amount
  const averageDepositAmount = sortedDeposits.length 
    ? totalDepositsAmount / sortedDeposits.length 
    : 0;
    
  // Pagination logic
  const totalPages = Math.ceil(sortedDeposits.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedDeposits.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Time Deposit</h1>
        <p className="text-gray-600">Manage time deposit accounts and transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Accounts Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Accounts</p>
              <p className="text-3xl font-bold text-gray-800">{sortedDeposits.length}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Total Deposits Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Deposits</p>
              <p className="text-3xl font-bold text-gray-800">₱{formatCurrency(totalDepositsAmount)}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Across all accounts</span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Clock className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Average Deposit Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Deposit</p>
              <p className="text-3xl font-bold text-gray-800">₱{formatCurrency(averageDepositAmount)}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Per account</span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <BarChart4 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Time Deposit Accounts
          </h4>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or code..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex gap-3">
            <button
              onClick={() => {
                fetchTimeDeposits();
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
            <button
              onClick={() => handleOpenModal("deposit")}
              className="flex items-center justify-center bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Open Account
            </button>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <MemberAccountModal
        openModal={openModal}
        handleDelete={handleDelete}
        showModal={isModalOpen}
        closeModal={handleCloseModal}
        modalType={modalType}
        member={selectedMember}
      />

      {/* Loading State */}
      {loading && (
        <div className="w-full flex justify-center my-12">
          <div className="flex flex-col items-center">
            <Loader className="h-10 w-10 text-green-600 animate-spin" />
            <p className="mt-4 text-gray-600">Loading time deposits...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          <p className="flex items-center font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Error
          </p>
          <p className="mt-1 ml-7">{error}</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Code Number
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Account No.
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Account Type
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Account Holder
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Deposited Amount
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Term
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length > 0 ? (
                    currentItems.map((depositor, index) => (
                      <tr
                        key={`${depositor.id}-${index}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Code Number */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                          {depositor.memberCode || "N/A"}
                        </td>
                        {/* Account No. */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {depositor.account_number || "N/A"}
                        </td>
                        {/* Account Type */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {depositor.account_type || "N/A"}
                          </span>
                        </td>
                        {/* Account Holder */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {depositor.first_name} {depositor.last_name}
                        </td>
                        {/* Deposited Amount */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                          ₱{formatCurrency(depositor.amount)}
                        </td>
                        {/* Term */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {depositor.fixedTerm} Months
                          </span>
                        </td>
                        {/* Account Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (!depositor.account_status || depositor.account_status === "ACTIVE")
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {depositor.account_status || "ACTIVE"}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate(`/member/time-deposit-info/${depositor.timeDepositId}`)
                            }
                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-md hover:bg-green-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">
                            No active time deposits
                          </p>
                          <p className="text-gray-400 mt-1">
                            Click "Open Account" to create a new time deposit
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination Controls */}
          {sortedDeposits.length > 0 && (
  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between">
    <div className="flex items-center mb-4 sm:mb-0">
      <span className="text-sm text-gray-700">
        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
        <span className="font-medium">
          {Math.min(indexOfLastItem, sortedDeposits.length)}
        </span>{" "}
        of <span className="font-medium">{sortedDeposits.length}</span> deposits
      </span>
      
      <div className="ml-4">
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="text-sm border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    </div>
    
    <div className="flex items-center space-x-1">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
          currentPage === 1
            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
            : "text-gray-700 bg-white hover:bg-gray-100"
        }`}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
      </button>
      
      <div className="flex items-center">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Logic to determine which page numbers to show
          let pageNumber;
          
          if (totalPages <= 5) {
            // If we have 5 or fewer pages, show all of them
            pageNumber = i + 1;
          } else if (currentPage <= 3) {
            // If we're near the start, show 1 through 5
            pageNumber = i + 1;
          } else if (currentPage >= totalPages - 2) {
            // If we're near the end, show the last 5 pages
            pageNumber = totalPages - 4 + i;
          } else {
            // Otherwise show 2 before and 2 after current page
            pageNumber = currentPage - 2 + i;
          }
          
          return (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-3 py-1.5 mx-0.5 text-sm font-medium rounded-md ${
                currentPage === pageNumber
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 bg-white hover:bg-gray-100"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
          currentPage === totalPages
            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
            : "text-gray-700 bg-white hover:bg-gray-100"
        }`}
      >
        Next <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  </div>
)} 
        </div>
      )}
    </div>
  );
};

export default TimeDeposit;