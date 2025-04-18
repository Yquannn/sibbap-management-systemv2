import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Filter, ChevronDown, Edit, UserCheck, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { MdPeople, MdCheckCircle, MdRemoveCircleOutline, MdCalendarToday } from 'react-icons/md';

const apiBaseURL = 'http://localhost:3001/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]); // Store all unfiltered members
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompletion, setFilterCompletion] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [totalMember, setTotalMember] = useState(0);
  const [newRegistrationsThisMonth, setNewRegistrationsThisMonth] = useState(0);
  const [completeMembers, setCompleteMembers] = useState(0);
  const [incompleteMembers, setIncompleteMembers] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  // Helper to generate image URL if available
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Background colors for avatar fallback
  const bgColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500",
    "bg-yellow-500", "bg-purple-500", "bg-indigo-500",
    "bg-pink-500", "bg-orange-500"
  ];

  // Compute a consistent background color based on member data
  const getMemberFallbackColor = (member) => {
    const id = member.memberId
      ? String(member.memberId)
      : `${member.first_name || ''}${member.last_name || ''}`;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgColors.length;
    return bgColors[index];
  };

  // Calculate dashboard statistics based on all members (not filtered)
  const calculateStats = (membersData) => {
    const complete = membersData.filter(member => 
      member.status?.toLowerCase() === 'completed').length;
    const incomplete = membersData.filter(member => 
      member.status?.toLowerCase() === 'incomplete').length;
    
    setCompleteMembers(complete);
    setIncompleteMembers(incomplete);
    setTotalMember(membersData.length);
    
    // Calculate new registrations this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthRegistrations = membersData.filter(member => {
      if (!member.created_at) return false;
      const createdDate = new Date(member.created_at);
      return createdDate.getMonth() === currentMonth && 
             createdDate.getFullYear() === currentYear;
    }).length;
    
    setNewRegistrationsThisMonth(thisMonthRegistrations);
  };

  // Fetch all members first
  const fetchAllMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseURL}/members/applicant`);
      const apiData = response.data.data;
      const membersData = Array.isArray(apiData[0]) ? apiData[0] : apiData;
      const sortedMembers = membersData.sort(
        (a, b) => parseInt(b.memberCode, 10) - parseInt(a.memberCode, 10)
      );
      setAllMembers(sortedMembers);
      calculateStats(sortedMembers); // Calculate stats based on all members
    } catch (err) {
      setError("Error fetching members: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to the members
  const applyFilters = useCallback(() => {
    if (!allMembers.length) return;

    let filteredMembers = [...allMembers];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredMembers = filteredMembers.filter(member => 
        (member.first_name && member.first_name.toLowerCase().includes(searchLower)) ||
        (member.last_name && member.last_name.toLowerCase().includes(searchLower)) ||
        (`${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply completion filter
    if (filterCompletion !== "All") {
      const statusToFilter = filterCompletion.toLowerCase() === "complete" ? "completed" : "incomplete";
      filteredMembers = filteredMembers.filter(member => 
        member.status?.toLowerCase() === statusToFilter
      );
    }
    
    // Apply account status filter
    if (filterStatus !== "All") {
      filteredMembers = filteredMembers.filter(member => 
        member.accountStatus?.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    setMembers(filteredMembers);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allMembers, searchTerm, filterCompletion, filterStatus]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = members.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(members.length / itemsPerPage);

  // Initial fetch of all members
  useEffect(() => {
    fetchAllMembers();
  }, [fetchAllMembers]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Membership Management</h1>
        <p className="text-gray-600">View and manage all member applicants</p>
      </div>

      {/* Dashboard Cards - Using stats from all members, not filtered ones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <MdPeople className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Registered Members</p>
              <p className="text-xl font-bold">{totalMember.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <MdCheckCircle className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Complete Applications</p>
              <p className="text-xl font-bold">{completeMembers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <MdRemoveCircleOutline className="text-2xl text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Incomplete Applications</p>
              <p className="text-xl font-bold">{incompleteMembers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <MdCalendarToday className="text-2xl text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">New Registrations This Month</p>
              <p className="text-xl font-bold">{newRegistrationsThisMonth.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterCompletion}
                onChange={(e) => setFilterCompletion(e.target.value)}
              >
                <option value="All">All Completion</option>
                <option value="Complete">Complete</option>
                <option value="Incomplete">Incomplete</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="w-full flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Members Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMembers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No members found matching your criteria
                    </td>
                  </tr>
                ) : (
                                      currentMembers.map((member, index) => (
                    <tr key={`${member.memberId}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {imageUrl(member.id_picture) ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={imageUrl(member.id_picture)} alt="" />
                            ) : (
                              <div className={`flex items-center justify-center h-10 w-10 rounded-full ${getMemberFallbackColor(member)}`}>
                                <span className="text-sm font-medium text-white">
                                  {`${member.first_name?.charAt(0) || ''}${member.last_name?.charAt(0) || ''}`.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {`${member.first_name || ''} ${member.last_name || ''}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.country || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.contact_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.barangay || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status?.toLowerCase() === "completed" 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="px-3 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors inline-flex items-center"
                            onClick={() => navigate(`/member-registration/add/${member.memberId}`)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </button>
                          <button 
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors inline-flex items-center"
                            onClick={() => navigate(`/member-registration/edit/${member.memberId}`)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button 
                            className={`px-3 py-1 rounded inline-flex items-center ${
                              member.status?.toLowerCase() === "incomplete" 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200 transition-colors'
                            }`}
                            onClick={() => member.status?.toLowerCase() !== "incomplete" && navigate(`/member-registration/register/${member.memberId}`)}
                            disabled={member.status?.toLowerCase() === "incomplete"}
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Register
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {members.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, members.length)}
                  </span>{" "}
                  of <span className="font-medium">{members.length}</span> members
                </span>
                
                <div className="ml-4">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className="text-sm border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  onClick={() => setCurrentPage(currentPage - 1)}
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
                        onClick={() => setCurrentPage(pageNumber)}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
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

export default Members;