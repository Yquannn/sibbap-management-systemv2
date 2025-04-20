import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, Check, Search, ChevronDown, ToggleLeft, ToggleRight, Trash2, Archive, RefreshCw } from 'lucide-react';
import axios from 'axios';

/* ================================
   CONTRIBUTION TYPE COMPONENT
==================================== */
const ContributionTypeTab = () => {
  // Existing state variables
  const [contributionTypes, setContributionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentContribution, setCurrentContribution] = useState(null);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'contribution_type_id', direction: 'ascending' });
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showColumn, setShowColumn] = useState({
    name: true,
    amount: true,
    description: true,
    is_active: true,
    updated_at: true
  });

  // New state variables for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showArchived, setShowArchived] = useState(false); // Toggle for showing archived items

  // Function to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  // Fetch contribution types from API
  const fetchContributionTypes = async () => {
    try {
      setLoading(true);
      // Modify API call to include archived status parameter
      const endpoint = showArchived 
        ? 'http://localhost:3001/api/contribution-type/archive' 
        : 'http://localhost:3001/api/contribution-type';
      
      const response = await axios.get(endpoint);
      setContributionTypes(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch contribution types. Please try again later.');
      console.error('Error fetching contribution types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributionTypes();
  }, [showArchived]); // Re-fetch when showArchived changes

  // Filter and sort contribution types
  const filteredContributions = contributionTypes.filter(contribution =>
    contribution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contribution.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedContributions = [...filteredContributions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  const handleEditContribution = (contribution) => {
    setCurrentContribution(contribution);
    setNewName(contribution.name);
    setNewAmount(contribution.amount.toString());
    setNewDescription(contribution.description);
    setNewIsActive(contribution.is_active === 1);
    setIsEditing(true);
  };

  // Update saveContribution to show success modal
  const saveContribution = async () => {
    const amount = parseFloat(newAmount);
    
    if (!newName.trim() || isNaN(amount) || amount < 0) {
      alert('Please enter valid information for all fields');
      return;
    }

    try {
      await axios.put(`http://localhost:3001/api/contribution-type/${currentContribution.contribution_type_id}`, {
        name: newName,
        amount: amount,
        description: newDescription
      });
      
      // Refetch data after update
      fetchContributionTypes();
      
      setIsEditing(false);
      setCurrentContribution(null);
      resetForm();
      
      // Show success message
      showSuccess('Contribution type updated successfully!');
    } catch (err) {
      alert('Failed to update contribution type. Please try again.');
      console.error('Error updating contribution type:', err);
    }
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAdding(true);
  };
  
  const handleCloseAddModal = () => {
    setIsAdding(false);
    resetForm();
  };
  
  const resetForm = () => {
    setNewName('');
    setNewAmount('');
    setNewDescription('');
    setNewIsActive(true);
  };
  
  // Update handleSaveAddContribution to show success modal
  const handleSaveAddContribution = async () => {
    if (!newName.trim()) {
      alert('Please enter a valid contribution name');
      return;
    }
    
    const amount = parseFloat(newAmount);
    
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/contribution-type', {
        name: newName,
        amount: amount,
        description: newDescription
      });
      
      // Refetch data after adding
      fetchContributionTypes();
      handleCloseAddModal();
      
      // Show success message
      showSuccess('New contribution type added successfully!');
    } catch (err) {
      alert('Failed to add contribution type. Please try again.');
      console.error('Error adding contribution type:', err);
    }
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    setShowColumn(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Confirm archive dialog
  const handleConfirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  // Fixed archive function
  const handleArchiveContribution = async () => {
    try {
      // Use the archive endpoint with the deleteId
      await axios.put(`http://localhost:3001/api/contribution-type/archive/${deleteId}`);
      
      // Refetch data after archiving
      fetchContributionTypes();
      
      // Close modal and reset state
      setIsDeleting(false);
      setDeleteId(null);
      
      // Show success message
      showSuccess('Contribution type archived successfully!');
    } catch (err) {
      alert('Failed to archive contribution type. Please try again.');
      console.error('Error archiving contribution type:', err);
    }
  };

  // Handle restore archived contribution
  const handleRestoreContribution = async (id) => {
    try {
      await axios.put(`http://localhost:3001/api/contribution-type/restore/${id}`);
      
      // Refetch data after restoring
      fetchContributionTypes();
      
      // Show success message
      showSuccess('Contribution type restored successfully!');
    } catch (err) {
      alert('Failed to restore contribution type. Please try again.');
      console.error('Error restoring contribution type:', err);
    }
  };

  // Toggle showing archived items
  const toggleShowArchived = () => {
    setShowArchived(prev => !prev);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">
          {showArchived ? 'Archived Contribution Types' : 'Active Contribution Types'}
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contributions"
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          
          {/* Archive toggle button */}
          <button
            onClick={toggleShowArchived}
            className={`px-4 py-2 border rounded-md flex items-center ${showArchived ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
          >
            {showArchived ? (
              <>
                <RefreshCw size={16} className="mr-2" />
                Show Active
              </>
            ) : (
              <>
                <Archive size={16} className="mr-2" />
                Show Archived
              </>
            )}
          </button>
          
          {/* Column visibility dropdown */}
          <div className="relative group">
            <button className="px-4 py-2 border rounded-md bg-white flex items-center">
              <span className="mr-1">Columns</span>
              <ChevronDown size={16} />
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-10 hidden group-hover:block">
              <div className="p-2">
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.name}
                    onChange={() => toggleColumnVisibility('name')}
                    className="mr-2"
                  />
                  Name
                </label>
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.amount}
                    onChange={() => toggleColumnVisibility('amount')}
                    className="mr-2"
                  />
                  Amount
                </label>
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.description}
                    onChange={() => toggleColumnVisibility('description')}
                    className="mr-2"
                  />
                  Description
                </label>
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.updated_at}
                    onChange={() => toggleColumnVisibility('updated_at')}
                    className="mr-2"
                  />
                  Last Updated
                </label>
              </div>
            </div>
          </div>
          
          {/* Only show Add button when not viewing archived items */}
          {!showArchived && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus size={18} className="mr-1" />
              Add Contribution Type
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => requestSort('contribution_type_id')}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    ID
                    {sortConfig.key === 'contribution_type_id' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                {showColumn.name && (
                  <th
                    onClick={() => requestSort('name')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === 'name' && (
                        <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                )}
                {showColumn.amount && (
                  <th
                    onClick={() => requestSort('amount')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Amount
                      {sortConfig.key === 'amount' && (
                        <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                )}
                {showColumn.description && (
                  <th
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                )}
                {showColumn.updated_at && (
                  <th
                    onClick={() => requestSort('updated_at')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Last Updated
                      {sortConfig.key === 'updated_at' && (
                        <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                )}
                {/* Always show Actions column, but with different actions depending on view */}
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedContributions.map((contribution) => (
                <tr key={contribution.contribution_type_id} className={`hover:bg-gray-50 ${showArchived ? 'bg-gray-50' : ''}`}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contribution.contribution_type_id}</td>
                  {showColumn.name && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{contribution.name}</td>
                  )}
                  {showColumn.amount && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(parseFloat(contribution.amount))}</td>
                  )}
                  {showColumn.description && (
                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{contribution.description}</td>
                  )}
                  {showColumn.updated_at && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contribution.updated_at).toLocaleDateString()}
                    </td>
                  )}
                  {/* Show different action buttons based on the view */}
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {showArchived ? (
                        <button
                          onClick={() => handleRestoreContribution(contribution.contribution_type_id)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                        >
                          <RefreshCw size={16} className="inline mr-1" />
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditContribution(contribution)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                          >
                            <Edit size={16} className="inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(contribution.contribution_type_id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                          >
                            <Archive size={16} className="inline mr-1" />
                            Archive
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredContributions.length === 0 && !loading && (
        <div className="text-center py-4 bg-gray-50 rounded-md border">
          <p className="text-gray-500">
            {showArchived 
              ? 'No archived contribution types found matching your search.'
              : 'No active contribution types found matching your search.'}
          </p>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center z-50 animate-fade-in-up">
          <div className="bg-green-100 rounded-full p-1 mr-3">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
          <button 
            onClick={() => setShowSuccessModal(false)}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Edit Contribution Modal */}
      {isEditing && currentContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4">
            <h3 className="text-lg font-medium mb-4">Edit Contribution Type</h3>
            <div className="mb-4">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">ID:</span>
                <span className="ml-2 text-gray-900">{currentContribution.contribution_type_id}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₱</span>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="pl-8 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description 
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              
              {currentContribution.updated_at && (
                <p className="mt-4 text-xs text-gray-500">Last updated on: {new Date(currentContribution.updated_at).toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => { setIsEditing(false); setCurrentContribution(null); }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveContribution}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contribution Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4">
            <h3 className="text-lg font-medium mb-4">Add New Contribution Type</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter contribution name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₱</span>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="pl-8 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter amount"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCloseAddModal}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddContribution}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Contribution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <h3 className="text-lg font-medium mb-4">Confirm Archiving</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to archive this contribution type? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setIsDeleting(false); setDeleteId(null); }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveContribution}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

/* ================================
   MAIN MODULE COMPONENT
==================================== */
const ContributionTypeModule = () => {
  return (
    <div className="bg-gray-100">
      <div className="max-w-full mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b">
            <h1 className="text-xl font-bold p-4">System Maintenance</h1>
            <div className="flex border-b">
              <button
                className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600"
              >
                Contribution Types
              </button>
            </div>
          </div>
          
          <ContributionTypeTab />
        </div>
      </div>
    </div>
  );
};

export default ContributionTypeModule;