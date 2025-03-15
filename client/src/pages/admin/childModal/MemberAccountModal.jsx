import React, { useState, useEffect, useCallback } from "react";
import { FaPiggyBank } from "react-icons/fa";
import axios from "axios";
import AmountModal from "./TimedepositAmountModal";

const MemberAccountModal = ({ openModal, handleDelete, showModal, closeModal }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalType, setModalType] = useState("deposit"); // Default modalType to "deposit"

  const apiBaseURL = "http://localhost:3001/api/timedepositor";

  // Fetch members from the API
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = searchTerm ? { name: searchTerm } : {};
      const response = await axios.get(apiBaseURL, { params });

      if (response.data.data.length === 0) {
        setError("No members found without active time deposits.");
      } else {
        setError(null);
      }

      setMembers(response.data.data);
    } catch (err) {
      setError("Error fetching members: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Fetch members when the modal is shown or the search term changes
  useEffect(() => {
    if (showModal) {
      fetchMembers();
    }
  }, [showModal, fetchMembers]);

  const handleOpenAmountModal = (member) => {
    setSelectedMember(member);
    setModalType("deposit");
    setAmountModalVisible(true);
  };

  const handleCloseAmountModal = () => {
    setSelectedMember(null);
    setAmountModalVisible(false);
  };

  // Callback to refresh data after a transaction
  const handleDataUpdate = () => {
    fetchMembers();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold">Member List</h4>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members by name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500"
          />
        </div>

        {loading && <p className="text-center text-gray-500">Loading members...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="overflow-y-auto max-h-[60vh] card bg-white shadow-md rounded-lg p-4">
            <table className="table w-full">
              <thead className="text-center">
                <tr>
                  {["Code Number", "Last Name", "First Name", "Contact Number", "Address", "Actions"].map((heading) => (
                    <th key={heading} className="py-3 px-4 border-b border-gray-300">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members && members.length > 0 ? (
                  members.map((member, index) => (
                    <tr
                      key={`${member.id}-${index}`}
                      className="text-center hover:bg-gray-100 cursor-pointer"
                    >
                      <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                      <td className="py-3 px-4 border-b border-gray-300">{member.last_name}</td>
                      <td className="py-3 px-4 border-b border-gray-300">{member.first_name}</td>
                      <td className="py-3 px-4 border-b border-gray-300">{member.contact_number}</td>
                      <td className="py-3 px-4 border-b border-gray-300">{member.barangay}</td>
                      <td className="py-3 px-4 border-b border-gray-300">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => handleOpenAmountModal(member)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                          >
                            Apply for Time Deposit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center">
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AmountModal */}
      {amountModalVisible && (
        <AmountModal
          modalType={modalType}
          member={selectedMember}
          onClose={handleCloseAmountModal}
          onDataUpdate={handleDataUpdate}
        />
      )}
    </div>
  );
};

export default MemberAccountModal;
