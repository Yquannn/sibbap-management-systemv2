import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Search,
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Wallet,
  BarChart,
  TrendingUp,
  RefreshCw,
  Loader
} from "lucide-react";

const ShareCapital = () => {
  // Store the full list of members (fetched once from the API)
  const [allMembers, setAllMembers] = useState([]);
  // For client-side pagination, use state for the current page and items per page.
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage, setMembersPerPage] = useState(15);
  
  // Analytics information
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    totalShareCapital: '316,999.95',
    averageShareCapital: 6000,
    growthRate: 5.2
  });
  
  // Other states: loading, error, search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state for filtered results
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();

  // Fetch the full list of members (without using any pagination params)
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/members");
      if (response.status !== 200) {
        throw new Error("Failed to fetch members");
      }
      const fetchedMembers = response.data.members || response.data;
      
      // Ensure fetchedMembers is always an array
      const membersArray = Array.isArray(fetchedMembers) ? fetchedMembers : [];
      
      setAllMembers(membersArray);
      calculateAnalytics(membersArray);
      setError(null);
    } catch (err) {
      setError("Error fetching members: " + err.message);
      // Initialize with empty array on error
      setAllMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics information.
  const calculateAnalytics = (data) => {
    const computedTotalMembers = data.length;
    const totalShareCapital = data.reduce(
      (acc, member) => acc + (member.shareCapital || 0),
      0
    );
    const averageShareCapital = data.length > 0 ? totalShareCapital / data.length : 0;
    setAnalytics({
      totalMembers: computedTotalMembers,
      totalShareCapital,
      averageShareCapital,
      growthRate: 5.2 // Adjust this value as needed.
    });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Apply filtering based on search term on the full dataset.
  const filteredMembers = Array.isArray(allMembers) 
    ? allMembers.filter(member => {
        const query = searchTerm.toLowerCase();
        const firstName = member.first_name ? member.first_name.toLowerCase() : "";
        const lastName = member.last_name ? member.last_name.toLowerCase() : "";
        const code = member.memberCode ? member.memberCode.toLowerCase() : "";
        return query === "" || firstName.includes(query) || lastName.includes(query) || code.includes(query);
      })
    : [];

  // Sort the filtered list so higher memberId values (assumed more recent) come first.
  const sortedMembers = [...filteredMembers].sort((a, b) => b.memberId - a.memberId);

  // Update total pages and reset pagination whenever search, sorted members, or items per page change.
  useEffect(() => {
    setTotalPages(Math.ceil(sortedMembers.length / membersPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, sortedMembers.length, membersPerPage]);

  // Compute the slice for the current page
  const indexOfFirst = (currentPage - 1) * membersPerPage;
  const indexOfLast = currentPage * membersPerPage;
  const paginatedMembers = sortedMembers.slice(indexOfFirst, indexOfLast);
  const displayMembers = paginatedMembers;

  // Handler to navigate to a specific page.
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handler for search Enter key press (resets pagination).
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
    }
  };

  // Handler for items per page change.
  const handleItemsPerPageChange = (e) => {
    setMembersPerPage(Number(e.target.value));
  };

  // Format numbers as Philippine Peso.
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP"
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Share Capital</h1>
        <p className="text-gray-600">View and manage share capital analytics and member details</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Members Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Members</p>
              <p className="text-3xl font-bold text-gray-800">{analytics.totalMembers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  +2.5%
                </span>
                <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
        
        {/* Total Share Capital Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Share Capital</p>
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(316,999.95)}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  +4.3%
                </span>
                <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Wallet className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
        
        {/* Average Share Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Share</p>
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(analytics.averageShareCapital)}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  +1.7%
                </span>
                <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <BarChart className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
        
        {/* Growth Rate Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Growth Rate</p>
              <p className="text-3xl font-bold text-gray-800">{analytics.growthRate}%</p>
              <div className="flex items-center mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  +0.8%
                </span>
                <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or code number..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                fetchMembers();
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Members Table with max height */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Member Code
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium">
                        {searchTerm ? "No matching members found" : "No members found"}
                      </p>
                      <p className="text-gray-400 mt-1">
                        {searchTerm ? "Try a different search term" : "Add members to see them here"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayMembers.map((member, index) => (
                  <tr key={member.memberId || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {member.memberCode || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {member.first_name} {member.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.contact_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.house_no_street} {member.barangay} {member.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/member/share-capital/${member.memberId}`)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-md hover:bg-green-100 transition-colors"
                        title="View Share Capital Details"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {/* Only render pagination if there are members to paginate */}
        {sortedMembers.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLast, sortedMembers.length)}
                </span>{" "}
                of <span className="font-medium">{sortedMembers.length}</span> results
              </span>
              
              <div className="ml-4">
                <select
                  value={membersPerPage}
                  onChange={handleItemsPerPageChange}
                  className="text-sm border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </button>
              
              <div className="flex items-center">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate which page numbers to show based on current page and total pages.
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
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
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white hover:bg-gray-100"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCapital;