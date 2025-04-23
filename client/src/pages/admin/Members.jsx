import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Filter, ChevronDown, Eye, ChevronLeft } from 'lucide-react';
import { MdPeople, MdCheckCircle } from 'react-icons/md';

const apiBaseURL = 'http://localhost:3001/api';

const Members = () => {
  const [modalState, setModalState] = useState({
    addOpen: false,
    editOpen: false,
    viewOpen: false,
    selectedMember: null,
  });
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMemberType, setFilterMemberType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [totalMember, setTotalMember] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  // Add this helper function that correctly accepts a member parameter
  const getRandomColor = (member) => {
    // Modern color palette - softer, more professional colors
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-green-100 text-green-800',
      'bg-amber-100 text-amber-800',
      'bg-rose-100 text-rose-800',
      'bg-teal-100 text-teal-800',
      'bg-indigo-100 text-indigo-800',
      'bg-orange-100 text-orange-800',
      'bg-emerald-100 text-emerald-800',
      'bg-cyan-100 text-cyan-800'
    ];
    
    // Use the member's ID or name as a seed to keep color consistent
    const nameInitials = `${member.first_name || ''}${member.last_name || ''}`;
    const seed = member.memberId || nameInitials.length;
    return colors[seed % colors.length];
  };

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseURL}/members`);
      setAllMembers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error fetching members: ' + err.message);
      setAllMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch total count
  const fetchTotalMembers = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseURL}/total`);
      setTotalMember(response.data.totalMembers || 0);
    } catch (err) {
      console.error('Error fetching total members:', err);
      setTotalMember(0);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchTotalMembers();
  }, [fetchMembers, fetchTotalMembers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMemberType, filterStatus]);

  // Frontend filtering/sorting
  const filteredMembers = useMemo(() => {
    if (!Array.isArray(allMembers)) return [];
    return allMembers
      .filter((m) => {
        const term = searchTerm.toLowerCase();
        const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
        const code = m.memberCode?.toLowerCase() || '';
        const matchSearch = term ? fullName.includes(term) || code.includes(term) : true;
        const matchType = filterMemberType === 'All' || m.member_type === filterMemberType;
        const status = m.status?.toLowerCase() || '';
        const matchStatus = filterStatus === 'All' || status === filterStatus.toLowerCase();
        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => {
        const aNum = parseInt(a.memberCode?.substring(3) || '0', 10);
        const bNum = parseInt(b.memberCode?.substring(3) || '0', 10);
        return bNum - aNum;
      });
  }, [allMembers, searchTerm, filterMemberType, filterStatus]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexFirst, indexLast);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Create member
  const createMember = async (member) => {
    try {
      setLoading(true);
      await axios.post(`${apiBaseURL}/members`, member, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ type: 'success', text: 'Member added successfully!' });
      fetchMembers();
      closeModal();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error adding member: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Update member
  const updateMember = async (member) => {
    try {
      setLoading(true);
      await axios.put(
        `${apiBaseURL}/members/${member.memberId}`,
        member,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessage({ type: 'success', text: 'Member updated successfully!' });
      fetchMembers();
      closeModal();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating member: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (member) => {
    if (modalState.editOpen) {
      await updateMember(member);
    } else {
      await createMember(member);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      setLoading(true);
      await axios.delete(`${apiBaseURL}/members/${id}`);
      setMessage({ type: 'success', text: 'Member deleted successfully!' });
      fetchMembers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error deleting member: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, member = null) => {
    setModalState({
      addOpen: type === 'addOpen',
      editOpen: type === 'editOpen',
      viewOpen: type === 'viewOpen',
      selectedMember: member,
    });
  };

  const closeModal = () => {
    setModalState({ addOpen: false, editOpen: false, viewOpen: false, selectedMember: null });
  };

  // Stats
  const activeCount = allMembers.filter((m) => m.status?.toLowerCase() === 'active').length;
  const activePct = totalMember ? ((activeCount / totalMember) * 100).toFixed(1) : 0;
  const regCount = allMembers.filter((m) => m.member_type === 'Regular Member').length;
  const partCount = allMembers.filter((m) => m.member_type === 'Partial Member').length;
  const newThisMonth = allMembers.filter((m) => {
    const dt = m.created_at ? new Date(m.created_at) : null;
    const start = new Date();
    start.setDate(1);
    return dt && dt >= start;
  }).length;

  return (
    <div>
      {/* Header & Stats Cards */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Member Directory</h1>
        <p className="text-gray-600">View and manage all registered members</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Members */}
        {/* <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
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
        </div> */}
        {/* Active */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-5 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <MdCheckCircle className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Members</p>
              <p className="text-xl font-bold">{activeCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-2">
            <p className="text-xs text-green-600">{activePct}% of total</p>
          </div>
        </div>
        {/* Types */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-5 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <MdPeople className="text-2xl text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Regular Members</p>
              <p className="text-xl font-bold">{regCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-purple-50 px-5 py-2">
            <p className="text-xs text-purple-600">vs {partCount.toLocaleString()} partial</p>
          </div>
        </div>
        {/* New This Month */}
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-5 flex items-center">
            <div className="rounded-full bg-orange-100 p-3 mr-4">
              <UserPlus className="text-2xl text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">New This Month</p>
              <p className="text-xl font-bold">{newThisMonth}</p>
            </div>
          </div>
          <div className="bg-orange-50 px-5 py-2">
            <p className="text-xs text-orange-600">Growth rate: 5.2% ↑</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      {message.text && (
        <div className={`font-medium px-4 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>
      )}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Member Type Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
              <select
                value={filterMemberType}
                onChange={(e) => setFilterMemberType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="All">All Member Types</option>
                <option value="Regular Member">Regular Member</option>
                <option value="Partial Member">Partial Member</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

      {/* Table */}
      {loading && <div className="w-full flex justify-center my-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"/></div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: '450px' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox"/></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">{searchTerm ? 'No matching members found' : 'No members found'}</p>
                        <p className="text-gray-400 mt-1">{searchTerm ? 'Try a different search term' : 'Add members to see them here'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentMembers.map((member) => (
                    <tr key={member.memberId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox"/></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.memberCode || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* Avatar */}
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            {member.id_picture ? 
                              <img src={`http://localhost:3001/uploads/${member.id_picture}`} alt="" className="h-10 w-10 rounded-full object-cover"/> : 
                              <div className={`flex items-center justify-center h-10 w-10 rounded-full ${getRandomColor(member)}`}>
                                <span className="text-sm font-medium">{`${member.first_name?.charAt(0) || ''}${member.last_name?.charAt(0) || ''}`.toUpperCase()}</span>
                              </div>
                            }
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{`${member.first_name || ''} ${member.last_name || ''}`}</div>
                            <div className="text-sm text-gray-500">{member.country || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.member_type || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.contact_number || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.barangay || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{member.status || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => navigate(`/member-profile/${member.memberId}`)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full">
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {filteredMembers.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <span className="text-sm text-gray-700">Showing <span className="font-medium">{indexFirst + 1}</span> to <span className="font-medium">{Math.min(indexLast, filteredMembers.length)}</span> of <span className="font-medium">{filteredMembers.length}</span> members</span>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="ml-4 text-sm border border-gray-300 rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-100'}`}><ChevronLeft className="h-4 w-4 mr-1"/>Prev</button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let page = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                  }
                  return (
                    <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1.5 text-sm font-medium rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 bg-white hover:bg-gray-100'}`}>{page}</button>
                  );
                })}
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-100'}`}>Next<ChevronDown className="h-4 w-4 ml-1"/></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;