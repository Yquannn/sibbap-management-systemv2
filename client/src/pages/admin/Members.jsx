import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Filter, ChevronDown, Eye, Edit, Trash, Plus } from 'lucide-react';
import MemberProfileModal from '../../components/modal/MemberProfileModal';
import AddMemberModal from '../../components/modal/AddMemberModal';
import { MdPeople, MdCheckCircle, MdRemoveCircleOutline, MdAttachMoney } from 'react-icons/md';

const apiBaseURL = 'http://localhost:3001/api';

const Members = () => {
  const [modalState, setModalState] = useState({
    addOpen: false,
    editOpen: false,
    viewOpen: false,
    selectedMember: null
  });
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMemberType, setFilterMemberType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [totalMember, setTotalMember] = useState(0);

  const navigate = useNavigate();

  // Function to generate image URL if available
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Define an array of background color classes
  const bgColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500",
    "bg-yellow-500", "bg-purple-500", "bg-indigo-500",
    "bg-pink-500", "bg-orange-500"
  ];

  // Helper to compute a consistent background color based on the member's unique id
  const getMemberFallbackColor = (member) => {
    const id = member.memberId ? String(member.memberId) : `${member.first_name || ''}${member.last_name || ''}`;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgColors.length;
    return bgColors[index];
  };

  // Fetch all members without filtering.
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseURL}/members`);
      setAllMembers(response.data);
    } catch (err) {
      setError('Error fetching members: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const FetchTotalMember = async () => {
    try {
      const response = await axios.get(`${apiBaseURL}/total`);
      setTotalMember(response.data.totalMembers);
    } catch (error) {
      console.error('Error fetching total members:', error);
    }
  };

  // Apply frontend filtering using useMemo.
  const filteredMembers = useMemo(() => {
    return allMembers
      .filter(member => {
        const searchTermLower = searchTerm.toLowerCase();
        const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
        const memberCode = member.memberCode?.toLowerCase() || '';
        const matchSearch = searchTerm
          ? (fullName.includes(searchTermLower) || memberCode.includes(searchTermLower))
          : true;
        const matchMemberType = filterMemberType === "All" || member.member_type === filterMemberType;
        // Ensure member.status is defined before checking.
        const memberStatus = member.status ? member.status.toLowerCase() : "";
        const matchStatus = filterStatus === "All" || memberStatus === filterStatus.toLowerCase();
        return matchSearch && matchMemberType && matchStatus;
      })
      // Sort members by numeric part of memberCode in descending order.
      .sort(
        (a, b) => {
          const aCode = a.memberCode?.substring(3) || '0';
          const bCode = b.memberCode?.substring(3) || '0';
          return parseInt(bCode) - parseInt(aCode);
        }
      );
  }, [allMembers, searchTerm, filterMemberType, filterStatus]);

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
      await axios.put(
        `${apiBaseURL}/members/${member.memberId}`,
        member,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
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
        await axios.delete(`${apiBaseURL}/members/${memberId}`);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Member Directory</h1>
        <p className="text-gray-600">View and manage all registered members</p>
      </div>

 
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Total Members Card */}
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-5 flex items-center">
      <div className="rounded-full bg-blue-100 p-3 mr-4">
        <MdPeople className="text-2xl text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">Total Members</p>
        <p className="text-xl font-bold">{totalMember.toLocaleString()}</p>
      </div>
    </div>
    <div className="bg-blue-50 px-5 py-2">
      <p className="text-xs text-blue-600">All registered members</p>
    </div>
  </div>
  
  {/* Active Members Card */}
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-5 flex items-center">
      <div className="rounded-full bg-green-100 p-3 mr-4">
        <MdCheckCircle className="text-2xl text-green-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">Active Members</p>
        <p className="text-xl font-bold">
          {allMembers.filter(member => 
            !member.status || member.status.toLowerCase() === "active"
          ).length.toLocaleString()}
        </p>
      </div>
    </div>
    <div className="bg-green-50 px-5 py-2">
      <p className="text-xs text-green-600">
        {((allMembers.filter(member => 
          !member.status || member.status.toLowerCase() === "active"
        ).length / totalMember) * 100).toFixed(1)}% of total
      </p>
    </div>
  </div>
  
  {/* Member Types Distribution */}
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-5 flex items-center">
      <div className="rounded-full bg-purple-100 p-3 mr-4">
        <MdPeople className="text-2xl text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">Regular Members</p>
        <p className="text-xl font-bold">
          {allMembers.filter(member => 
            member.member_type === "Regular Member"
          ).length.toLocaleString()}
        </p>
      </div>
    </div>
    <div className="bg-purple-50 px-5 py-2">
      <p className="text-xs text-purple-600">
        vs {allMembers.filter(member => 
          member.member_type === "Partial Member"
        ).length.toLocaleString()} partial members
      </p>
    </div>
  </div>
  
  {/* New Members This Month */}
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="p-5 flex items-center">
      <div className="rounded-full bg-orange-100 p-3 mr-4">
        <UserPlus className="text-2xl text-orange-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">New This Month</p>
        <p className="text-xl font-bold">
          {(() => {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return allMembers.filter(member => {
              // Assuming members have a created_at or join_date field
              const joinDate = member.created_at ? new Date(member.created_at) : null;
              return joinDate && joinDate >= firstDayOfMonth;
            }).length;
          })()}
        </p>
      </div>
    </div>
    <div className="bg-orange-50 px-5 py-2">
      <p className="text-xs text-orange-600">Growth rate: 5.2% ↑</p>
    </div>
  </div>
</div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">

        {message.text && (
          <div className={`font-medium px-4 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
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
              placeholder="Search by name or code number..."
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
                value={filterMemberType}
                onChange={(e) => setFilterMemberType(e.target.value)}
              >
                <option value="All">All Member Types</option>
                <option value="Regular Member">Regular Member</option>
                <option value="Partial Member">Partial Member</option>
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
                <option value="All">All Statuses</option>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Type
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
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No members found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, index) => (
                    <tr key={`${member.memberId}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.memberCode || "N/A"}
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
                        {member.member_type || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.contact_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.barangay || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (!member.status || member.status.toLowerCase() === "active") 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="">
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-100"
                            onClick={() => navigate(`/member-profile/${member.memberId}`)}
                            title="View Details"
                          >
                            <Eye className="w-6 h-6" />
                          </button>
                          {/* <button 
                            className="p-1 text-yellow-600 hover:text-yellow-900 rounded-full hover:bg-yellow-100"
                            onClick={() => openModal('editOpen', member)}
                            title="Edit Member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-red-100"
                            onClick={() => handleDelete(member.memberId)}
                            title="Delete Member"
                          >
                            <Trash className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {(modalState.addOpen || modalState.editOpen) && (
        <AddMemberModal
          isOpen={modalState.addOpen || modalState.editOpen}
          onClose={closeModal}
          onSave={handleSave}
          memberIdToEdit={modalState.editOpen ? modalState.selectedMember.memberId : null}
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