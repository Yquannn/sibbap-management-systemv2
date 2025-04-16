import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MemberAccountModal = ({ showModal, closeModal }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const apiBaseURL = "http://localhost:3001/api/members";

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = searchTerm ? { name: searchTerm } : {};
      const response = await axios.get(apiBaseURL, { params });
      
      // Check if the response contains data and handle appropriately
      if (response.data && response.data) {
        if (response.data.length === 0) {
          setError("No members found matching your search criteria.");
        } else {
          setMembers(response.data);
          console.log(members)
          setError(null);
        }
      } else {
        setMembers([]);
        setError("Invalid response format from server.");
      }
    } catch (err) {
      setMembers([]);
      setError("Error fetching members: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (showModal) {
      fetchMembers();
    } else {
      // Clear data when modal is closed
      setMembers([]);
      setError(null);
    }
  }, [showModal, fetchMembers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-0 relative overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h4 className="text-xl font-semibold">Select Member for Time Deposit</h4>
          <button 
            onClick={closeModal} 
            className="text-white hover:text-gray-200 transition-colors focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members by name..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && members && (
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Code", "Last Name", "First Name", "Contact", "Address", "Actions"].map((heading) => (
                      <th 
                        key={heading} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.length > 0 ? (
                    members.map((member) => (
                      <tr
                        key={member.memberId || member.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.memberCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.first_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.contact_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                          {member.barangay}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() =>
                              navigate(`/apply-timedeposit/${member.memberId || member.id}`, {
                                state: { selectedMember: member },
                              })
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                        No members found. Try adjusting your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-200">
          <button
            onClick={closeModal}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mr-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberAccountModal;