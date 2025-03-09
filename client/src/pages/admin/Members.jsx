import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEye, FaUsers, FaArrowDown, FaArrowUp, FaUserTie } from 'react-icons/fa';
import MemberProfileModal from '../../components/modal/MemberProfileModal';
import AddMemberModal from '../../components/modal/AddMemberModal';
import { UserPlus } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import blankPicture from '../../components/blankPicture.png';
import { MdPeople, MdCheckCircle, MdRemoveCircleOutline, MdAttachMoney } from 'react-icons/md';

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
  const [filterMemberType, setFilterMemberType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [totalMember, setTotalMember] = useState(0);

  const navigate = useNavigate();

  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.name = searchTerm;
      if (filterMemberType !== "All") params.member_type = filterMemberType;
      if (filterStatus !== "All") params.status = filterStatus;
      const response = await axios.get(`${apiBaseURL}/members`, { params });
      setMembers(response.data);
    } catch (err) {
      setError('Error fetching members: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterMemberType, filterStatus]);

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
    <div className="">
      <h2 className="text-3xl font-bold mb-4">Member List</h2>
      


<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div className="card bg-gradient-to-r from-green-400 to-green-600 shadow-xl text-white">
    <div className="card-body flex items-center">
      <MdPeople className="text-5xl mr-4" />
      <div>
        <h2 className="card-title text-sm">Total Members</h2>
        <p className="text-xl font-bold">{totalMember.toLocaleString()}</p>
      </div>
    </div>
  </div>
  <div className="card bg-gradient-to-r from-blue-400 to-blue-600 shadow-xl text-white">
    <div className="card-body flex items-center">
      <MdCheckCircle className="text-5xl mr-4" />
      <div>
        <h2 className="card-title text-sm">Active Members</h2>
        <p className="text-xl font-bold">25,000</p>
      </div>
    </div>
  </div>
  <div className="card bg-gradient-to-r from-red-400 to-red-600 shadow-xl text-white">
    <div className="card-body flex items-center">
      <MdRemoveCircleOutline className="text-5xl mr-4" />
      <div>
        <h2 className="card-title text-sm">Inactive Members</h2>
        <p className="text-xl font-bold">15,000</p>
      </div>
    </div>
  </div>
  <div className="card bg-gradient-to-r from-purple-400 to-purple-600 shadow-xl text-white">
    <div className="card-body flex items-center">
      <MdAttachMoney className="text-5xl mr-4" />
      <div>
        <h2 className="card-title text-sm">Membership Fee</h2>
        <p className="text-xl font-bold">Php350</p>
      </div>
    </div>
  </div>
</div>


      {/* Search & Filter Bar with Add Member Button */}
      <div className="flex flex-col sm:flex-row justify-end items-center bg-base-200 p-4 rounded-lg mb-6 gap-4">
        {message.text && (
          <div className={`font-medium mr-auto ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </div>
        )}
        <div className="flex items-center gap-4">
          <select
            className="select select-bordered"
            value={filterMemberType}
            onChange={(e) => setFilterMemberType(e.target.value)}
          >
            <option>All</option>
            <option>New</option>
            <option>Transfer</option>
          </select>
          <select
            className="select select-bordered"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search member..."
            className="input input-bordered w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-success"
            onClick={() => navigate("/register-member")}
          >
            <UserPlus className="mr-2" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Table with vertical scrolling */}
      <div className="overflow-y-auto max-h-[60vh]">
        <table className="table w-full">
          <thead>
            <tr>
              <th>
              
              </th>
              <th>Code Number</th>
              <th>Name</th>
              <th>Member Type</th>
              <th>Date of Birth</th>
              <th>Civil Status</th>
              <th>Contact Number</th>
              <th>Address</th>
              <th>Shared Capital</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={`${member.member_id}-${index}`} className="hover">
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>
                <td>{member.memberCode}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img
                          src={imageUrl(member.id_picture) || blankPicture}
                          alt="Avatar"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">
                        {member.last_name} {member.first_name}
                      </div>
                      <div className="text-sm opacity-50">{member.country || ""}</div>
                    </div>
                  </div>
                </td>
                <td>{member.member_type}</td>
                <td>
                  {new Date(member.date_of_birth).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </td>
                <td>{member.civil_status}</td>
                <td>{member.contact_number}</td>
                <td>{member.barangay}</td>
                <td>{member.share_capital}</td>
                <td>
                  <span className={`badge ${(!member.status || member.status.toLowerCase() === "active") ? 'badge-success' : 'badge-error'}`}>
                    {member.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-gray" onClick={() => openModal('viewOpen', member)}>
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* <tfoot>
            <tr>
              <th></th>
              <th>Code Number</th>
              <th>Name</th>
              <th>Member Type</th>
              <th>Date of Birth</th>
              <th>Civil Status</th>
              <th>Contact Number</th>
              <th>Address</th>
              <th>Shared Capital</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </tfoot> */}
        </table>
      </div>

      {/* Modals */}
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
