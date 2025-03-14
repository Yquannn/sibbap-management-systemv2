import React, { useState, useEffect, useCallback, createContext } from 'react';
import axios from 'axios';
import { FaEdit, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export const LoanContext = createContext();

const apiBaseURL = 'http://localhost:3001/api/members';

const Loan = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch members from the API, filtering by name if needed.
  const fetchMembers = useCallback(async () => {
    try {
      const params = searchTerm ? { name: searchTerm } : {};
      const response = await axios.get(apiBaseURL, { params });
      setMembers(response.data);
    } catch (err) {
      console.error('Error fetching members:', err.message);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Compute unique Barangay options from fetched members.
  const barangayOptions = ["All", ...Array.from(new Set(members.map(member => member.barangay)))];

  // Client-side filtering.
  const filteredMembers = members.filter(member => {
    const fullName = `${member.FirstName} ${member.LastName} ${member.MiddleName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchLower) ||
      (member.memberCode && member.memberCode.toLowerCase().includes(searchLower));
    const matchesBarangay = barangayFilter === "All" || member.barangay === barangayFilter;
    return matchesSearch && matchesBarangay;
  });

  // Open the Loan Application page and pass the selected member via state.
  const openLoanModal = (member) => {
    setSelectedMember(member);
    navigate("/apply-loan", { state: { selectedMember: member, members } });
  };

  // (The closeLoanModal function is here for completeness.)
  const closeLoanModal = () => {
    setSelectedMember(null);
    setIsLoanModalOpen(false);
  };

  return (
    <LoanContext.Provider
      value={{ 
        members, // fetched data available to children if needed
        selectedMember, 
        setSelectedMember, 
        isLoanModalOpen, 
        setIsLoanModalOpen 
      }}
    >
      <div className="">

        {/* Filter Section */}
        <div className="mb-6 p-6 bg-white shadow-lg rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or code number"
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>
          {/* Barangay Filter Dropdown */}
          <div>
            <select
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              {barangayOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Members Table Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white shadow-md overflow-hidden md:w-2/3 flex-1 max-h-[70vh] overflow-y-auto">
            <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
              <thead className="bg-green-200 sticky top-0 z-20">
                <tr className="text-center">
                  {["Code Number", "Full Name", "Contact Number", "Address", "Share Capital", "Actions"].map((heading) => (
                    <th key={heading} className="py-3 px-4 border-b border-gray-300">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => (
                    <tr key={member.id || index} className="text-center hover:bg-gray-100">
                      <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                      <td className="py-3 px-4 border-b border-gray-300">
                        {member.first_name} {member.last_name} {member.middle_name}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-300">{member.contact_number}</td>
                      <td className="py-3 px-4 border-b border-gray-300">{member.barangay}</td>
                      <td className="py-3 px-4 border-b border-gray-300">{member.share_capital}</td>
                      <td className="py-3 px-4 border-b border-gray-300">
                        <button
                          onClick={() => openLoanModal(member)}
                          className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                        >
                          <FaEdit />
                          <span>Apply for Loan</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LoanContext.Provider>
  );
};

export default Loan;
