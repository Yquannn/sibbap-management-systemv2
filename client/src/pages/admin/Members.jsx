import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaEye, FaTrash, FaEdit } from 'react-icons/fa';
import MemberProfileModal from '../../components/modal/MemberProfileModal';
import AddMemberModal from '../../components/modal/AddMemberModal';

const apiBaseURL = 'http://localhost:3001/api/members';

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

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = searchTerm ? { name: searchTerm } : {};
      const response = await axios.get(apiBaseURL, { params });
      setMembers(response.data);
    } catch (err) {
      setError('Error fetching members: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchMembers();
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
      await axios.put(`${apiBaseURL}/${member.id}`, member, {
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
    fetchMembers()
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        setLoading(true);
        await axios.delete(`${apiBaseURL}/${memberId}`);
        setMembers((prev) => prev.filter((member) => member.id !== memberId));
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
      <div className=" flex justify-between mb-6 p-2 bg-white shadow-lg rounded-lg">
        <div>
          {message.text && <div className={`text-${message.type === 'success' ? 'green' : 'red'}-600 mb-4`}>{message.text}</div>}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search member..."
            className="px-10 py-2 border border-gray-300 rounded-md w-full relative w-80 mr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="px-2 py-3 bg-green-500 text-white rounded hover:bg-green-700 flex items-center space-x-2"
            onClick={() => openModal('addOpen')}
          >
            <FaPlus />
            <span>Add Member</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto" style={{ maxHeight: "70vh" }}>
        <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
          <thead className="sticky top-0 bg-green-200 z-20 text-center">
            <tr>
              {["Code Number", "Last Name", "First Name", "Contact Number", "Address", "Shared Capital", "Status", "Actions"].map((heading) => (
                <th key={heading} className="py-3 px-4 border-b border-gray-300">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={`${member.id}-${index}`} className="text-center hover:bg-gray-100 cursor-pointer">
                <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.LastName}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.FirstName}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.contactNumber}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.barangay}</td>
                <td className="py-3 px-4 border-b border-gray-300">{member.shareCapital}</td>
                <td className="py-3 px-4 border-b border-gray-300"> <span  className={`px-2 py-1 rounded-full font-semibold ${
                        (!member.status || member.status === "Active" || member.status === "ACTIVE")
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >{member.status}</span></td>
                <td className="py-3 px-4 border-b border-gray-300">
                  <div className="flex justify-center space-x-3">
                    <button onClick={() => openModal('editOpen', member)} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                      <FaEdit /> Update
                    </button>
                    {/* <button onClick={() => handleDelete(member.memberId)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      <FaTrash /> Delete
                    </button> */}
                    <button onClick={() => openModal('viewOpen', member)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      <FaEye /> View
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
          memberIdToEdit={modalState.editOpen ? modalState.selectedMember.id : null}
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
