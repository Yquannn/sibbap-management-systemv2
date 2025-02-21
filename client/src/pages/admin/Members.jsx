import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaEye, FaTrash, FaEdit, FaUsers, FaArrowDown, FaArrowUp, FaUserTie } from 'react-icons/fa';
import MemberProfileModal from '../../components/modal/MemberProfileModal';
import AddMemberModal from '../../components/modal/AddMemberModal';
import { UserPlus } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const apiBaseURL = 'http://localhost:3001/api';

const Members = () => {
  const [modalState, setModalState] = useState({
    addOpen: false,
    editOpen: false,
    viewOpen: false,
    selectedMember: null
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [totalMember, setTotalMember] = useState(0);

  const navigate = useNavigate();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = searchTerm ? { name: searchTerm } : {};
      const response = await axios.get(`${apiBaseURL}/members`, { params });
      setMembers(response.data);
    } catch (err) {
      setError('Error fetching members: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const FetchTotalMember = async () => {
    try {
      const response = await axios.get(`${apiBaseURL}/total`);
      setTotalMember(response.data.totalMembers);
    } catch (error) {
      console.error('Error fetching total members:', error);
    }
  };

  useEffect(() => {
    fetchMembers();
    FetchTotalMember();
  }, [fetchMembers]);

  const openModal = (type, member = null) => {
    setModalState({
      addOpen: type === 'addOpen',
      editOpen: type === 'editOpen',
      viewOpen: type === 'viewOpen',
      selectedMember: member
    });
  };

  const closeModal = () => {
    setModalState({
      addOpen: false,
      editOpen: false,
      viewOpen: false,
      selectedMember: null
    });
  };

  const updateMember = async (member) => {
    try {
      setLoading(true);
      await axios.put(`${apiBaseURL}/${member.member_id}`, member, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage({ type: "success", text: "Member updated successfully!" });
      fetchMembers();
      closeModal();
    } catch (error) {
      setMessage({ type: "error", text: "Error updating member: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (member) => {
    if (modalState.editOpen) {
      await updateMember(member);
    }
    fetchMembers();
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        setLoading(true);
        await axios.delete(`${apiBaseURL}/${memberId}`);
        setMembers((prev) => prev.filter((member) => member.member_id !== memberId));
        setMessage({ type: 'success', text: "Member deleted successfully!" });
        fetchMembers();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting member: ' + error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Member List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white shadow-md rounded-lg">
        {/* Total Members */}
        <div className="bg-green-600 shadow rounded-lg p-4 flex items-center h-full">
          <FaUsers className="text-white text-3xl mr-3" />
          <div>
            <h2 className="text-sm font-medium text-white">Total Members</h2>
            <p className="text-xl font-bold mt-1 text-white">{totalMember.toLocaleString()}</p>
          </div>
        </div>

        {/* Total Active Members */}
        <div className="bg-blue-500 shadow rounded-lg p-4 flex items-center h-full">
          <FaArrowDown className="text-white text-3xl mr-3" />
          <div>
            <h2 className="text-sm font-medium text-white">Total Active Members</h2>
            <p className="text-xl font-bold mt-1 text-white">25,000</p>
          </div>
        </div>

        {/* Total Inactive Members */}
        <div className="bg-red-500 shadow rounded-lg p-4 flex items-center h-full">
          <FaArrowUp className="text-white text-3xl mr-3" />
          <div>
            <h2 className="text-sm font-medium text-white">Total Inactive Members</h2>
            <p className="text-xl font-bold mt-1 text-white">15,000</p>
          </div>
        </div>

        {/* Accumulated Membership Fee */}
        <div className="bg-amber-600 shadow rounded-lg p-4 flex items-center h-full">
          <FaUserTie className="text-white text-3xl mr-3" />
          <div>
            <h2 className="text-sm font-medium text-white">Accumulated Membership Fee</h2>
            <p className="text-xl font-bold mt-1 text-white">Php350</p>
          </div>
        </div>
      </div>

      {/* Search Bar & Add Member Button */}
      <div className="flex flex-col sm:flex-row justify-end items-center bg-white p-4 mt-6">
        {message.text && (
          <div className={`text-${message.type === 'success' ? 'green' : 'red'}-600 font-medium mr-auto`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center w-full sm:w-auto mt-2 sm:mt-0">
          <input
            type="text"
            placeholder="Search member..."
            className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-80 mr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition duration-200"
            onClick={() => navigate("/register-member")}
          >
            <UserPlus />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: "60vh" }}>
        <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
          <thead className="sticky top-0 bg-green-200 z-20 text-center">
            <tr>
              {["Code Number", "Name", "Member type", "Date of Birth", "Civil Status", "Contact Number", "Address", "Shared Capital", "Status", "Actions"].map((heading) => (
                <th key={heading} className="py-3 px-4 border-b border-gray-300">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={`${member.member_id}-${index}`} className="text-center hover:bg-gray-100 cursor-pointer">
                <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.last_name} {member.first_name}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.member_type}</td>
                <td className="py-3 px-4 border-b border-gray-300">
                  {new Date(member.date_of_birth).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="py-3 px-4 border-b border-gray-300">{member.civil_status}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.contact_number}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.barangay}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.share_capital}</td>
                <td className="py-3 px-4 border-b border-gray-300">
                  <span className={`px-2 py-1 rounded-full font-semibold ${
                    (!member.status || member.status === "Active" || member.status === "ACTIVE")
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-gray-300">
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => openModal('viewOpen', member)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                    >
                      <FaEye className="mr-1 w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(modalState.addOpen || modalState.editOpen) && (
        <AddMemberModal
          isOpen={modalState.addOpen || modalState.editOpen}
          onClose={closeModal}
          onSave={handleSave}
          memberIdToEdit={modalState.editOpen ? modalState.selectedMember.member_id : null}
        />
      )}
      {modalState.viewOpen && (
        <MemberProfileModal
          isOpen={modalState.viewOpen}
          onClose={closeModal}
          member={modalState.selectedMember}
        />
      )}
    </div>
  );
};

export default Members;
