import React, {
  useState,
  useEffect,
  useCallback,
  createContext
} from "react";
import axios from "axios";
import {
  FaEdit,
  FaSearch,
  FaExclamationTriangle,
  FaFilter,
  FaTimes
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const LoanContext = createContext();

const apiBaseURL = "http://localhost:3001/api/members";

const Loan = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "eligible", "not-eligible"
  const [sortField, setSortField] = useState("last_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [showNotEligibleModal, setShowNotEligibleModal] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  // Fetch members from the API, always normalizing to an array
  const fetchMembers = useCallback(async () => {
    try {
      const params = searchTerm ? { name: searchTerm } : {};
      const response = await axios.get(apiBaseURL, { params });

      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data.members)) {
        data = response.data.members;
      }

      setMembers(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembers([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Advanced filtering and sorting
  const processedMembers = members
    .filter((member) => {
      const fullName = `${member.first_name || ""} ${member.last_name ||
        ""} ${member.middle_name || ""}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        fullName.includes(searchLower) ||
        (member.memberCode &&
          member.memberCode.toLowerCase().includes(searchLower));

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "eligible" && Number(member.is_borrower) !== 1) ||
        (filterStatus === "not-eligible" && Number(member.is_borrower) === 1);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const fieldA = (a[sortField] || "").toString().toLowerCase();
      const fieldB = (b[sortField] || "").toString().toLowerCase();
      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });

  // Pagination calculations
  const totalItems = processedMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = processedMembers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Open loan application or show "not eligible" modal
  const openLoanModal = (member) => {
    if (Number(member.is_borrower) === 1) {
      setShowNotEligibleModal(true);
      return;
    }
    setSelectedMember(member);
    navigate("/apply-loan", {
      state: { selectedMember: member, members }
    });
  };
  const closeNotEligibleModal = () => setShowNotEligibleModal(false);

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Items-per-page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setSortField("last_name");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  // Build pagination numbers
  const pageNumbers = [];
  const maxVisiblePages = 5;
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push("...");
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
  }

  return (
    <LoanContext.Provider
      value={{
        members,
        selectedMember,
        setSelectedMember,
        isLoanModalOpen,
        setIsLoanModalOpen
      }}
    >
      <div className="">
        {/* Header & Filters */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Loan Management
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <FaFilter
                className={isFilterOpen ? "text-blue-600" : "text-gray-500"}
              />
              <span>
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </span>
            </button>
            {(searchTerm ||
              filterStatus !== "all" ||
              sortField !== "last_name" ||
              sortDirection !== "asc") && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
              >
                <FaTimes />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search by name or code number"
            className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <FaSearch className="text-gray-400 text-lg" />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="mb-8 bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Advanced Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Eligibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eligibility Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50"
                >
                  <option value="all">All Members</option>
                  <option value="eligible">Eligible for Loan</option>
                  <option value="not-eligible">
                    Not Eligible (Current Borrowers)
                  </option>
                </select>
              </div>
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50"
                >
                  <option value="last_name">Last Name</option>
                  <option value="first_name">First Name</option>
                  <option value="memberCode">Code Number</option>
                  <option value="share_capital">Share Capital</option>
                </select>
              </div>
              {/* Sort Direction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Direction
                </label>
                <select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50"
                >
                  <option value="asc">Ascending (A-Z, 0-9)</option>
                  <option value="desc">Descending (Z-A, 9-0)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { label: "Code Number", field: "memberCode" },
                    { label: "Full Name", field: "last_name" },
                    { label: "Contact Number", field: "contact_number" },
                    { label: "Location", field: "barangay" },
                    { label: "Share Capital", field: "share_capital" },
                    { label: "Status", field: "is_borrower" },
                    { label: "Actions", field: null }
                  ].map((column) => (
                    <th
                      key={column.label}
                      className={`py-4 px-6 text-left text-sm font-semibold text-gray-600 ${
                        column.field ? "cursor-pointer hover:bg-gray-100" : ""
                      }`}
                      onClick={() =>
                        column.field && handleSort(column.field)
                      }
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {sortField === column.field && (
                          <span className="text-blue-600">
                            {sortDirection === "asc" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentMembers.length > 0 ? (
                  currentMembers.map((member, idx) => (
                    <tr
                      key={member.id || idx}
                      className={`hover:bg-blue-50 transition duration-150 ${
                        Number(member.is_borrower) === 1 ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {member.memberCode}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 font-medium">
                        {member.last_name}, {member.first_name}{" "}
                        {member.middle_name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {member.contact_number}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {member.barangay}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        ₱
                        {parseFloat(member.share_capital || 0).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {Number(member.is_borrower) === 1 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Current Borrower
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Eligible
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openLoanModal(member)}
                          className={`inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition duration-200 text-sm font-medium shadow-sm ${
                            Number(member.is_borrower) === 1
                              ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          disabled={Number(member.is_borrower) === 1}
                        >
                          <FaEdit />
                          <span>Apply for Loan</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-xl font-medium">No members found</p>
                        <p className="text-sm max-w-md">
                          Try adjusting your search or filter criteria to find
                          what you’re looking for
                        </p>
                        <button
                          onClick={clearFilters}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500 mb-4 md:mb-0 space-y-3 md:space-y-0 md:space-x-4">
              <div>
                Showing {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, totalItems)} of {totalItems} members
              </div>
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="itemsPerPage"
                  className="text-sm text-gray-600"
                >
                  Show:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex space-x-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {pageNumbers.map((number, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      typeof number === "number" ? goToPage(number) : null
                    }
                    disabled={number === "..."}
                    className={`px-3 py-1 border rounded-md ${
                      number === currentPage
                        ? "bg-blue-600 text-white border-blue-600 font-medium"
                        : number === "..."
                        ? "bg-white text-gray-400 border-gray-300 cursor-default"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Not Eligible Modal */}
        {showNotEligibleModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
              onClick={closeNotEligibleModal}
            />
            <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto transform transition-all">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <FaExclamationTriangle className="text-red-500 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Not Eligible
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  This member is already a borrower and cannot apply for
                  another loan until the current one is settled.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={closeNotEligibleModal}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={closeNotEligibleModal}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Understood
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoanContext.Provider>
  );
};

export default Loan;
