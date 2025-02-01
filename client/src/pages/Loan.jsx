import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import LoanCalculator from '../components/utils/LoanCalculator';
import LoanApplicationForm from '../components/utils/ApplyForLoan';

const apiBaseURL = 'http://localhost:3001/api/members';

const Loan = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

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

  const openLoanModal = (member, event) => {
    event.stopPropagation(); // Prevent highlighting entire row
    setSelectedMember(member);
    setIsLoanModalOpen(true);
  };

  const closeLoanModal = () => {
    setSelectedMember(null);
    setIsLoanModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Apply for Loan</h2>

      <div className="mb-4 flex justify-between">
        <div className="flex items-center w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search member..."
            className="px-4 py-2 border border-gray-300 rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Table Section */}
        <div className="bg-white shadow-md rounded-lg md:w-2/3 flex-1 max-h-[70vh] overflow-y-auto">
          <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
            <thead className="sticky top-0 bg-green-200 z-20 text-center">
              <tr>
                {["Code Number", "Last Name", "First Name", "Middle Name", "Contact Number", "Address", "Share Capital", "Actions"].map((heading) => (
                  <th key={heading} className="py-3 px-4 border-b border-gray-300">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={`${member.id}-${index}`} className="text-center hover:bg-gray-100">
                  <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.LastName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.FirstName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.MiddleName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.contactNumber}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.barangay}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.shareCapital}</td>
                  <td className="px-4 py-2 text-center  text-sm text-gray-700">
                    <div className="flex justify-center space-x-3 ">
                      <button
                      onClick={(event) => openLoanModal(member, event)}
                      className="flex items-center  space-x-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                      >
                        <FaEdit />
                        <span>Apply for Loan</span>
                      </button>
                   </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loan Calculator Section */}
        <div className="">
          <LoanCalculator />
        </div>
      </div>

      {/* Loan Application Form Modal */}
      {isLoanModalOpen && selectedMember && (
  <LoanApplicationForm 
    isOpen={isLoanModalOpen} 
    setIsOpen={setIsLoanModalOpen} 
    member={selectedMember} 
  />
)}

    </div>
  );
};

export default Loan;
