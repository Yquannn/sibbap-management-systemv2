import React, { useEffect, useState, useCallback } from "react";
import { FaEye, FaSearch, FaSyncAlt, FaChevronDown } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const KalingaFunds = ({ openModal, handleDelete }) => {
  // State for different data types
  const [contributions, setContributions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [settings, setSettings] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const navigate = useNavigate();

  // Fetch data from our endpoints
  const fetchData = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // Fetch all data in parallel
      const [membersRes, contributionsRes, claimsRes, settingsRes] = await Promise.all([
        axios.get("http://localhost:3001/api/members"),
        axios.get("http://localhost:3001/api/kalinga/contributions"),
        axios.get("http://localhost:3001/api/kalinga/claims"),
        axios.get("http://localhost:3001/api/kalinga/settings/active")
      ]);

      // Process the data
      const membersData = Array.isArray(membersRes.data) ? membersRes.data : [];
      const contributionsData = Array.isArray(contributionsRes.data) ? contributionsRes.data : [];
      const claimsData = Array.isArray(claimsRes.data) ? claimsRes.data : [];

      // Update state
      setContributions(contributionsData);
      setClaims(claimsData);
      setSettings(settingsRes.data);

      // Process member data for display
      const processedMembers = processMembers(membersData, contributionsData, claimsData);
      setKalingaMembers(processedMembers);
    } catch (err) {
      console.error("Error fetching Kalinga funds data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Process members with their Kalinga fund information
  const processMembers = (members, contributions, claims) => {
    return members.map(member => {
      // Get this member's contributions
      const memberContributions = contributions.filter(c => c.memberId === member.memberId);
      const earliestContribution = memberContributions.length > 0 
        ? memberContributions.sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date))[0].payment_date
        : null;
      
      // Get this member's claims
      const memberClaims = claims.filter(c => c.memberId === member.memberId);
      const hasClaimed = memberClaims.some(claim => 
        claim.status === "Approved" || claim.status === "Disbursed");
      
      // Determine member status
      let status = "Active";
      if (hasClaimed) status = "Claimed";
      if (memberContributions.length === 0) status = "Inactive";
      
      // Get beneficiary if any
      const beneficiary = memberClaims.length > 0 ? memberClaims[0].beneficiary_name : "";

      return {
        memberId: member.memberId,
        memberCode: member.memberCode,
        fullName: member.full_name || `${member.first_name} ${member.last_name}`,
        kalingaContribution: member.kalinga_fund_fee,
        kalinga_join_date: earliestContribution,
        kalingaStatus: status,
        beneficiaryName: beneficiary
      };
    });
  };

  // Combined data for display
  const [kalingaMembers, setKalingaMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter + sort
  const filtered = kalingaMembers.filter((m) => {
    const q = filterQuery.toLowerCase();
    const name = (m.fullName || "").toLowerCase();
    const code = (m.memberCode || "").toLowerCase();
    const status = m.kalingaStatus || "Active";

    return (
      (q === "" || name.includes(q) || code.includes(q)) &&
      (selectedStatus === "All" || status === selectedStatus)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    // Sort by memberId numerically (if possible)
    const idA = parseInt(a.memberId) || 0;
    const idB = parseInt(b.memberId) || 0;
    return idB - idA;
  });

  // Pagination slice
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  const paginated = sorted.slice(start, end);

  // If searching, show *all* matches; otherwise page
  const display = filterQuery.trim() ? sorted : paginated;
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  // Handlers
  const goToPage = (p) => p >= 1 && p <= totalPages && setCurrentPage(p);
  const handleItemsChange = (e) => {
    setItemsPerPage(+e.target.value);
    setCurrentPage(1);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") setCurrentPage(1);
  };

  // Handler to view member details
  const handleViewMember = (memberId) => {
    console.log(members.memberId)
    // Find the member contributions and claims
    const memberContributions = contributions.filter(c => c.memberId === members.memberId);
    const memberClaims = claims.filter(c => c.memberId === members.memberId);
    
    // Store in session storage for detail view
    sessionStorage.setItem('kalingaMemberContributions', JSON.stringify(memberContributions));
    sessionStorage.setItem('kalingaMemberClaims', JSON.stringify(memberClaims));
    
    navigate(`/kalinga-fund-info/${memberId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Kalinga Fund</h1>
        <p className="text-gray-600">Manage and view member Kalinga fund accounts</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {/* Total Members */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Members</p>
              <p className="text-3xl font-bold text-gray-800">{members.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div> */}

        {/* Active */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Accounts</p>
              <p className="text-3xl font-bold text-gray-800">
                {
                  kalingaMembers.filter(
                    (m) => m.kalingaStatus === "Active"
                  ).length
                }
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Contributions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Contributions</p>
              <p className="text-3xl font-bold text-gray-800">
                ₱{contributions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg
                className="h-6 w-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* New This Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">New This Month</p>
              <p className="text-3xl font-bold text-gray-800">
                {
                  contributions.filter((c) => {
                    const contributionDate = new Date(c.payment_date || null);
                    const now = new Date();
                    return (
                      contributionDate.getMonth() === now.getMonth() &&
                      contributionDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <svg
                className="h-6 w-6 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative md:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Claimed">Claimed</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={fetchData}
              disabled={refreshing}
              className={`flex items-center gap-2 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition ${
                refreshing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <FaSyncAlt
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  
                  "Code Number",
                  "Full Name",
                  "Contribution",
                  "Beneficiary",
                  "Join Date",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {display.length > 0 ? (
                display.map((m, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {m.memberCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {m.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ₱{(m.kalingaContribution || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {m.beneficiaryName || "Not specified"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {m.kalinga_join_date ? new Date(m.kalinga_join_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      ) : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          m.kalingaStatus === "Inactive"
                            ? "bg-gray-100 text-gray-800"
                            : m.kalingaStatus === "Claimed"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {m.kalingaStatus || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewMember(m.memberId)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <FaEye className="mr-1.5 h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-300 mb-4"
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
                      <p className="text-gray-500 text-lg font-medium">
                        {filterQuery
                          ? "No matching Kalinga fund members found"
                          : "No Kalinga fund members found"}
                      </p>
                      <p className="text-gray-400 mt-1">
                        {filterQuery
                          ? "Try a different search term"
                          : "Add members to see them here"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filterQuery.trim() === "" && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{start + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(end, sorted.length)}
                </span>{" "}
                of <span className="font-medium">{sorted.length}</span>{" "}
                results
              </span>
              <div className="ml-4">
                <select
                  value={itemsPerPage}
                  onChange={handleItemsChange}
                  className="text-sm border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 10, 15, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} per page
                    </option>
                  ))}
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
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                )
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      p === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 bg-white hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
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
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KalingaFunds;