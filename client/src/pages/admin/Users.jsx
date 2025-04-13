import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit, FaSearch, FaUser, FaExclamationCircle, FaCheckCircle, FaChevronLeft, FaChevronRight, FaFilter, FaQuestion } from "react-icons/fa";
import AddUserModal from "../../components/modal/AddUserModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Advanced filtering
  const [filters, setFilters] = useState({
    role: "",
    gender: "",
    ageRange: { min: "", max: "" }
  });
  const [showFilters, setShowFilters] = useState(false);

  const apiClient = axios.create({
    baseURL: "http://localhost:3001/api",
  });

  const debounceTimeout = useRef(null);

  // Fetch users with debounce
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage("");

    try {
      const params = searchTerm ? { name: searchTerm } : {};
      const response = await apiClient.get("/users", { params });
      setUsers(response.data);
      applyFilters(response.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to fetch users.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Apply all filters to users
  const applyFilters = useCallback((userList = users) => {
    let result = [...userList];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        (user.userName && user.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.contactNo && user.contactNo.includes(searchTerm))
      );
    }
    
    // Apply role filter
    if (filters.role) {
      result = result.filter(user => 
        user.userType && user.userType.toLowerCase() === filters.role.toLowerCase()
      );
    }
    
    // Apply gender filter
    if (filters.gender) {
      result = result.filter(user => 
        user.gender && user.gender.toLowerCase() === filters.gender.toLowerCase()
      );
    }
    
    // Apply age range filter
    if (filters.ageRange.min !== "") {
      result = result.filter(user => user.age >= parseInt(filters.ageRange.min));
    }
    
    if (filters.ageRange.max !== "") {
      result = result.filter(user => user.age <= parseInt(filters.ageRange.max));
    }
    
    setFilteredUsers(result);
    setTotalPages(Math.ceil(result.length / usersPerPage));
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [filters, searchTerm, users, usersPerPage]);

  // Debounce the search input
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm, fetchUsers]);
  
  // Update filtered users when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  const openAddEditModal = (user) => {
    setIsAddEditModalOpen(true);
    setSelectedUser(user); // Pass the user for editing or null for adding
  };
  
  const closeModals = () => {
    setIsAddEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async (user) => {
    closeModals();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (user.id) {
        await apiClient.put(`/user/${user.id}`, user);
        setSuccessMessage("User updated successfully!");
      } else {
        await apiClient.post("/user", user);
        setSuccessMessage("User added successfully!");
      }
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      setErrorMessage(error.response?.data?.message || "Error saving user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    setErrorMessage("");

    try {
      await apiClient.delete(`/user/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      applyFilters(users.filter(user => user.id !== userId));
      setSuccessMessage("User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      setErrorMessage(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  // Get user type badge color
  const getUserTypeBadge = (userType) => {
    switch (userType?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'customer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Pagination handlers
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
  
  const handlePerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setUsersPerPage(value);
    setTotalPages(Math.ceil(filteredUsers.length / value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Get current users for the current page
  const getCurrentUsers = () => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      role: "",
      gender: "",
      ageRange: { min: "", max: "" }
    });
    setSearchTerm("");
  };

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">Manage system users, roles and permissions</p>
      </div>


      {/* Search, Filter and Add Section */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-2 flex-grow">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search for a user"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 border border-gray-300"
              aria-label="Toggle filters"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            <div className="relative inline-block ml-2">
              <button
                onClick={() => setShowFilterTooltip(!showFilterTooltip)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Filter help"
              >
                <FaQuestion size={16} />
              </button>
              {showFilterTooltip && (
                <div className="absolute z-20 right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 text-sm border border-gray-200">
                  <p className="mb-2"><strong>Quick Filter Tips:</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Search looks in name, email, and address</li>
                    <li>Combine filters for precise results</li>
                    <li>Reset filters to see all users</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          aria-label="Add a new user"
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
          onClick={() => openAddEditModal(null)}
        >
          <FaPlus />
          <span>Add New User</span>
        </button>
      </div>
      
      {/* Advanced Filters Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="mb-3 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Advanced Filters</h3>
            <button 
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                id="roleFilter"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <label htmlFor="genderFilter" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="genderFilter"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.gender}
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={filters.ageRange.min}
                  onChange={(e) => setFilters({
                    ...filters, 
                    ageRange: {...filters.ageRange, min: e.target.value}
                  })}
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={filters.ageRange.max}
                  onChange={(e) => setFilters({
                    ...filters, 
                    ageRange: {...filters.ageRange, max: e.target.value}
                  })}
                  min={filters.ageRange.min || "0"}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMessage && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg flex items-center">
          <FaExclamationCircle className="mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 border border-green-200 bg-green-50 text-green-700 rounded-lg flex items-center">
          <FaCheckCircle className="mr-2 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* User Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">System Users</h2>
          </div>
          <div className="text-sm text-gray-500">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* User Table */}
        {!loading && (
          <div className="overflow-x-auto" style={{ maxHeight: '500px' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentUsers().length > 0 ? (
                  getCurrentUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.userName || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{user.age || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{user.gender || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{user.address || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{user.contactNo || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 underline">{user.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getUserTypeBadge(user.userType)}`}>
                          {user.userType || 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openAddEditModal(user)}
                            className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex items-center"
                            aria-label={`Edit ${user.userName}`}
                          >
                            <FaEdit className="mr-1.5" size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                            aria-label={`Delete ${user.userName}`}
                          >
                            <FaTrash className="mr-1.5" size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-lg font-medium">No users found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                        {(searchTerm || filters.role || filters.gender || filters.ageRange.min || filters.ageRange.max) && (
                          <button 
                            onClick={resetFilters}
                            className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Reset all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">
                Show
              </span>
              <select
                className="border border-gray-300 rounded p-1 text-sm"
                value={usersPerPage}
                onChange={handlePerPageChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-700 ml-3">
                entries
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {`Page ${currentPage} of ${totalPages}`}
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  aria-label="Previous page"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  aria-label="Next page"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddEditModalOpen && (
        <AddUserModal
          isOpen={isAddEditModalOpen}
          onClose={closeModals}
          onSave={handleSave}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default Users;