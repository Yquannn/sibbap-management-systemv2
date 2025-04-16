import React, { useState } from 'react';
import { Plus, Edit, Archive, Filter, X, Check, ArrowRight, Trash2 } from 'lucide-react';

/* ================================
   DUMMY DATA & INITIAL VALUES
==================================== */
const initialDropdownData = {
  civilStatusOptions: ["Single", "Married", "Widow", "Separated"],
  genderOptions: ["Male", "Female", "Other"],
  loanTypeOptions: ["Personal Loan", "Housing Loan", "Car Loan", "Salary Loan", "Mortgage Loan"],
  interestRateOptions: ["1%", "1.5%", "1.75%", "2%", "2.5%", "3%", "3.5%", "4%"],
  serviceFeeOptions: ["0.5%", "1%", "1.2%", "2%", "3%", "5%"]
};

const initialButtons = [
  { id: 1, label: "Submit" },
  { id: 2, label: "Cancel" },
  { id: 3, label: "Reset" }
];

/* ================================
   ADD BUTTON COMPONENT WITH MODERN UI
==================================== */
const AddButtonModal = ({ isOpen, onClose, onSave }) => {
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonType, setButtonType] = useState('primary');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSave = () => {
    if (!buttonLabel.trim()) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onSave({ label: buttonLabel, type: buttonType, id: Date.now() });
      setIsProcessing(false);
      setButtonLabel('');
      setButtonType('primary');
      onClose();
    }, 800);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-400 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Add New Button</h3>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Button Label</label>
            <input
              type="text"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder="Enter button label..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Button Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`px-4 py-2 rounded-lg border text-center transition-all ${
                  buttonType === 'primary' 
                    ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setButtonType('primary')}
              >
                Primary
              </button>
              <button
                className={`px-4 py-2 rounded-lg border text-center transition-all ${
                  buttonType === 'secondary' 
                    ? 'bg-gray-100 border-gray-400 text-gray-700 font-medium' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setButtonType('secondary')}
              >
                Secondary
              </button>
              <button
                className={`px-4 py-2 rounded-lg border text-center transition-all ${
                  buttonType === 'danger' 
                    ? 'bg-red-100 border-red-400 text-red-700 font-medium' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setButtonType('danger')}
              >
                Danger
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!buttonLabel.trim() || isProcessing}
            className={`px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
              !buttonLabel.trim() || isProcessing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Add Button</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================================
   ADD NEW DROPDOWN COMPONENT WITH MODERN UI
==================================== */
const AddDropdownModal = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dropdownName, setDropdownName] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const addOption = () => {
    if (!newOption.trim()) return;
    setDropdownOptions([...dropdownOptions, newOption]);
    setNewOption('');
  };
  
  const removeOption = (index) => {
    setDropdownOptions(dropdownOptions.filter((_, i) => i !== index));
  };
  
  const nextStep = () => {
    if (currentStep === 1 && !dropdownName.trim()) return;
    setCurrentStep(2);
  };
  
  const prevStep = () => {
    setCurrentStep(1);
  };
  
  const handleSave = () => {
    if (dropdownOptions.length === 0) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onSave({
        name: dropdownName + 'Options',
        options: dropdownOptions
      });
      setIsProcessing(false);
      resetForm();
      onClose();
    }, 800);
  };
  
  const resetForm = () => {
    setCurrentStep(1);
    setDropdownName('');
    setDropdownOptions([]);
    setNewOption('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-400 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            {currentStep === 1 ? 'Create New Dropdown' : 'Add Dropdown Options'}
          </h3>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-white text-green-600' : 'bg-green-200 text-green-800'}`}>
                1
              </div>
              <div className="w-8 h-1 bg-white"></div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-white text-green-600' : 'bg-green-200 text-green-800'}`}>
                2
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Dropdown Name</label>
                <input
                  type="text"
                  value={dropdownName}
                  onChange={(e) => setDropdownName(e.target.value)}
                  placeholder="Enter dropdown name..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  autoFocus
                />
                <p className="text-sm text-gray-500">
                  Enter a descriptive name for your dropdown. This will be used as an identifier.
                </p>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!dropdownName.trim()}
                  className={`px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 ${
                    !dropdownName.trim() ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Dropdown Options</label>
                  <span className="text-sm text-gray-500">{dropdownOptions.length} options added</span>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add a new option..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newOption.trim()) {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <button
                    onClick={addOption}
                    disabled={!newOption.trim()}
                    className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                      !newOption.trim() ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          {currentStep === 1 ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={prevStep}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          )}
          
          {currentStep === 2 && (
            <button
              onClick={handleSave}
              disabled={dropdownOptions.length === 0 || isProcessing}
              className={`px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 ${
                dropdownOptions.length === 0 || isProcessing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Dropdown...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Create Dropdown</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================
   INITIAL CONTRIBUTION TAB
==================================== */
const InitialContributionTab = ({ onArchiveMember, switchToArchive }) => {
  const [members, setMembers] = useState([
    { id: 'MEM-001', name: 'Juan Dela Cruz', initialContribution: 5000, lastEdited: null },
    { id: 'MEM-002', name: 'Maria Santos', initialContribution: 3500, lastEdited: null },
    { id: 'MEM-003', name: 'Pedro Reyes', initialContribution: 7500, lastEdited: '2025-03-15' },
    { id: 'MEM-004', name: 'Ana Gonzales', initialContribution: 2000, lastEdited: null },
    { id: 'MEM-005', name: 'Roberto Lim', initialContribution: 10000, lastEdited: '2025-04-02' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [newContribution, setNewContribution] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  // States for Add Member modal
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberContribution, setNewMemberContribution] = useState('');

  // Generate a new member ID
  const generateNewMemberId = () => {
    const lastId = members.reduce((max, member) => {
      const num = parseInt(member.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `MEM-${String(lastId + 1).padStart(3, '0')}`;
  };

  // Filter members based on searchTerm
  const filteredMembers = members.filter(member =>
    member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
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

  const handleEditContribution = (member) => {
    setCurrentMember(member);
    setNewContribution(member.initialContribution.toString());
    setIsEditing(true);
  };

  const handleArchiveContribution = (member) => {
    onArchiveMember(member);
    setMembers(prev => prev.filter(m => m.id !== member.id));
    switchToArchive();
  };

  const saveContribution = () => {
    const amount = parseFloat(newContribution);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid contribution amount');
      return;
    }
    setMembers(prev =>
      prev.map(m =>
        m.id === currentMember.id
          ? { ...m, initialContribution: amount, lastEdited: new Date().toISOString().split('T')[0] }
          : m
      )
    );
    setIsEditing(false);
    setCurrentMember(null);
    setNewContribution('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentMember(null);
    setNewContribution('');
  };

  // Add Member functions
  const handleOpenAddModal = () => {
    setNewMemberId(generateNewMemberId());
    setNewMemberName('');
    setNewMemberContribution('');
    setIsAdding(true);
  };
  const handleCloseAddModal = () => {
    setIsAdding(false);
    setNewMemberId('');
    setNewMemberName('');
    setNewMemberContribution('');
  };
  const handleSaveAddMember = () => {
    if (!newMemberId.trim() || !newMemberName.trim()) {
      alert('Please enter a valid Member ID and Name');
      return;
    }
    const contribution = parseFloat(newMemberContribution);
    if (isNaN(contribution) || contribution < 0) {
      alert('Please enter a valid contribution amount');
      return;
    }
    const newMember = {
      id: newMemberId,
      name: newMemberName,
      initialContribution: contribution,
      lastEdited: new Date().toISOString().split('T')[0]
    };
    setMembers(prev => [...prev, newMember]);
    handleCloseAddModal();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Initial Member Contributions</h2>
          <p className="text-gray-500">Manage and track members' initial contributions</p>
        </div>
        <div className="flex space-x-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or name"
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add Member
          </button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-y-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th
                  onClick={() => requestSort('id')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Member ID
                    {sortConfig.key === 'id' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => requestSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Name
                    {sortConfig.key === 'name' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => requestSort('initialContribution')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Initial Contribution
                    {sortConfig.key === 'initialContribution' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Edited
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(member.initialContribution)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lastEdited ? member.lastEdited : <span className="text-gray-400">Not edited</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditContribution(member)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchiveContribution(member)}
                      className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 px-3 py-1 rounded transition-colors"
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No members found matching your search.</p>
        </div>
      )}

      {/* Edit Contribution Modal */}
      {isEditing && currentMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Initial Contribution</h3>
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Member Details</p>
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">ID:</span>
                <span className="ml-2 text-gray-900">{currentMember.id}</span>
              </div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{currentMember.name}</span>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Contribution: {formatCurrency(currentMember.initialContribution)}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₱</span>
                <input
                  type="number"
                  value={newContribution}
                  onChange={(e) => setNewContribution(e.target.value)}
                  placeholder="Enter new amount"
                  className="pl-8 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {currentMember.lastEdited && (
                <p className="mt-2 text-xs text-gray-500">Last edited on: {currentMember.lastEdited}</p>
              )}
              <p className="mt-4 text-xs text-gray-500">
                Note: Editing this contribution will record today's date as the last edit date.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => cancelEdit()}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveContribution}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Member</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
              <input
                type="text"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Member ID"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Member Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Contribution</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₱</span>
                <input
                  type="number"
                  value={newMemberContribution}
                  onChange={(e) => setNewMemberContribution(e.target.value)}
                  className="pl-8 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter initial contribution"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseAddModal}
                className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddMember}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================================
   DROPDOWN MANAGER TAB
==================================== */
const DropdownManagerTab = ({ setActiveTab, archiveData, setArchiveData, dropdownData, setDropdownData }) => {
  const [isEditingDropdown, setIsEditingDropdown] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState(null);
  const [newDropdownOption, setNewDropdownOption] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredDropdownKeys = Object.keys(dropdownData).filter((key) =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditDropdown = (dropdownName) => {
    setCurrentDropdown(dropdownName);
    setIsEditingDropdown(true);
  };

  const handleAddOption = () => {
    if (!newDropdownOption.trim()) return;
    setDropdownData(prev => ({
      ...prev,
      [currentDropdown]: [...prev[currentDropdown], newDropdownOption]
    }));
    setNewDropdownOption("");
  };

  const handleDeleteOption = (index) => {
    setDropdownData(prev => {
      const updatedOptions = [...prev[currentDropdown]];
      updatedOptions.splice(index, 1);
      return { ...prev, [currentDropdown]: updatedOptions };
    });
  };

  const saveChanges = () => {
    setIsEditingDropdown(false);
    setCurrentDropdown(null);
  };

  const closeEditDropdown = () => {
    setIsEditingDropdown(false);
    setCurrentDropdown(null);
    setNewDropdownOption("");
  };

  const handleArchiveDropdown = (dropdownName) => {
    const archivedItem = {
      name: dropdownName,
      options: dropdownData[dropdownName],
      archivedDate: new Date().toISOString().split('T')[0]
    };
    setArchiveData(prev => [...prev, archivedItem]);
    setDropdownData(prev => {
      const updated = { ...prev };
      delete updated[dropdownName];
      return updated;
    });
    setActiveTab('archive');
  };

  const handleAddDropdown = (newDropdown) => {
    setDropdownData(prev => ({
      ...prev,
      [newDropdown.name]: newDropdown.options
    }));
    setShowAddModal(false);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header & Right-aligned Search + Add */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Dropdown Manager</h2>
          <p className="text-gray-500">Configure and manage dropdown options for your member application form.</p>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dropdown name"
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add New Dropdown
          </button>
        </div>
      </div>

      {/* List of Dropdowns */}
      <div className="space-y-4">
        {filteredDropdownKeys.length > 0 ? (
          filteredDropdownKeys.map((dropdownName, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white border rounded-lg shadow-sm p-4 hover:shadow transition-shadow"
            >
              <div>
                <h4 className="font-medium text-gray-800">
                  {dropdownName.replace(/([A-Z])/g, ' $1').trim().replace("Options", "")}
                </h4>
                <p className="text-sm text-gray-500">{dropdownData[dropdownName].length} available</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditDropdown(dropdownName)}
                  className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleArchiveDropdown(dropdownName)}
                  className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                >
                  <Archive size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No dropdowns found matching your search.</p>
        )}
      </div>

      {/* Modal for Editing Dropdown */}
      {isEditingDropdown && currentDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Edit {currentDropdown.replace(/([A-Z])/g, ' $1').trim().replace("Options", "")} Options
              </h3>
              <button onClick={closeEditDropdown} className="p-1 rounded hover:bg-gray-100">
                &times;
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {dropdownData[currentDropdown].map((option, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="flex-1 px-3 py-2 bg-gray-50 rounded">{option}</span>
                    <button onClick={() => handleDeleteOption(index)} className="ml-2 p-1.5 text-red-500 rounded hover:bg-red-50">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Add New Option</label>
                <div className="flex">
                  <input
                    type="text"
                    value={newDropdownOption}
                    onChange={(e) => setNewDropdownOption(e.target.value)}
                    placeholder="Enter new option"
                    className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={handleAddOption} className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button onClick={closeEditDropdown} className="px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveChanges} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dropdown Modal */}
      <AddDropdownModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddDropdown}
      />
    </div>
  );
};

/* ================================
   BUTTON MANAGER TAB
   (Changed delete icon to archive icon. When archive button is clicked,
    the button is archived and the active tab switches to Archive.)
==================================== */
const ButtonManagerTab = ({ setActiveTab, setArchivedButtons }) => {
  const [buttons, setButtons] = useState(initialButtons);
  const [isEditing, setIsEditing] = useState(false);
  const [currentButton, setCurrentButton] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredButtons = buttons.filter(btn =>
    btn.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditButton = (id) => {
    const btn = buttons.find(b => b.id === id);
    setCurrentButton(btn);
    setIsEditing(true);
  };

  const saveButtonChanges = () => {
    setButtons(prev => prev.map(btn => (btn.id === currentButton.id ? currentButton : btn)));
    setIsEditing(false);
    setCurrentButton(null);
  };

  // Archive button: remove from buttons and archive it, then switch to Archive tab
  const handleArchiveButton = (id) => {
    const btn = buttons.find(b => b.id === id);
    setButtons(prev => prev.filter(button => button.id !== id));
    setArchivedButtons(prev => [...prev, { ...btn, archivedDate: new Date().toISOString().split('T')[0] }]);
    setActiveTab('archive');
  };

  const handleAddButton = (newButton) => {
    setButtons(prev => [...prev, newButton]);
    setShowAddModal(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Button Manager</h2>
          <p className="text-gray-500">Manage and edit clickable buttons for your application.</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by button label"
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add Button
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredButtons.length > 0 ? (
          filteredButtons.map(btn => (
            <div
              key={btn.id}
              className="flex justify-between items-center bg-white border rounded-lg shadow-sm p-4 hover:shadow transition-shadow"
            >
              <span className="text-gray-800">{btn.label}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditButton(btn.id)}
                  className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleArchiveButton(btn.id)}
                  className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                >
                  <Archive size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No buttons found matching your search.</p>
        )}
      </div>

      {isEditing && currentButton && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <h3 className="text-lg font-medium mb-4">Edit Button</h3>
            <input
              type="text"
              value={currentButton.label}
              onChange={(e) => setCurrentButton({ ...currentButton, label: e.target.value })}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => { setIsEditing(false); setCurrentButton(null); }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveButtonChanges}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Button Modal */}
      <AddButtonModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddButton}
      />
    </div>
  );
};

/* ================================
   ARCHIVE TAB
==================================== */
const ArchiveTab = ({
  archiveData,
  setArchiveData,
  handleRestoreDropdown,
  handleDeleteDropdownPermanently,
  archivedMembers,
  handleRestoreMember,
  handleDeleteMemberPermanently,
  archivedButtons,
  setArchivedButtons
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [archiveCategory, setArchiveCategory] = useState('all'); // 'all' | 'dropdowns' | 'members' | 'buttons'
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredArchiveDropdowns = archiveData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredArchivedMembers = archivedMembers.filter(member =>
    member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredArchivedButtons = archivedButtons.filter(btn =>
    btn.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-gray-800">Archived Data</h2>
      
      {/* Search and Filter Bar */}
      <div className="flex justify-end items-center space-x-2 mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search archived data"
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            <Filter size={18} className="text-gray-600" />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
              <button
                onClick={() => { setArchiveCategory('all'); setShowFilterMenu(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-blue-50"
              >
                All
              </button>
              <button
                onClick={() => { setArchiveCategory('dropdowns'); setShowFilterMenu(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-blue-50"
              >
                Dropdowns
              </button>
              <button
                onClick={() => { setArchiveCategory('members'); setShowFilterMenu(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-blue-50"
              >
                Member Contributions
              </button>
              <button
                onClick={() => { setArchiveCategory('buttons'); setShowFilterMenu(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-blue-50"
              >
                Buttons
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Dropdowns */}
      {(archiveCategory === 'all' || archiveCategory === 'dropdowns') && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Archived Dropdowns</h3>
          <div className="space-y-4">
            {filteredArchiveDropdowns.length > 0 ? (
              filteredArchiveDropdowns.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {item.name.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-500">{item.options.length} available</p>
                    <p className="text-sm text-gray-400">Archived on: {item.archivedDate}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRestoreDropdown(index)}
                      className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteDropdownPermanently(index)}
                      className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No archived dropdowns found matching your search.</p>
            )}
          </div>
        </div>
      )}

      {/* Render Archived Member Contributions */}
      {(archiveCategory === 'all' || archiveCategory === 'members') && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Archived Member Contributions</h3>
          <div className="space-y-4">
            {filteredArchivedMembers.length > 0 ? (
              filteredArchivedMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">{member.id} - {member.name}</h4>
                    <p className="text-sm text-gray-500">
                      Contribution: {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(member.initialContribution)}
                    </p>
                    <p className="text-sm text-gray-400">Archived on: {member.archivedDate}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRestoreMember(index)}
                      className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteMemberPermanently(index)}
                      className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No archived member contributions found matching your search.</p>
            )}
          </div>
        </div>
      )}

      {/* Render Archived Buttons */}
      {(archiveCategory === 'all' || archiveCategory === 'buttons') && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Archived Buttons</h3>
          <div className="space-y-4">
            {filteredArchivedButtons.length > 0 ? (
              filteredArchivedButtons.map((btn, index) => (
                <div
                  key={btn.id}
                  className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm hover:shadow transition-shadow"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">{btn.label}</h4>
                    <p className="text-sm text-gray-400">Archived on: {btn.archivedDate}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Restore button: add it back to Button Manager
                        handleRestoreMember(index); // reuse similar logic or implement your own
                      }}
                      className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete button "${btn.label}"?`)) {
                          setArchivedButtons(prev => prev.filter((_, i) => i !== index));
                        }
                      }}
                      className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No archived buttons found matching your search.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================================
   MAIN MEMBERS MODULE WITH TABS
==================================== */
const MembersModule = () => {
  const [activeTab, setActiveTab] = useState('manager'); // Default to Dropdown Manager
  const [archiveData, setArchiveData] = useState([]);
  const [dropdownData, setDropdownData] = useState(initialDropdownData);
  const [archivedMembers, setArchivedMembers] = useState([]);
  const [archivedButtons, setArchivedButtons] = useState([]);

  // Restore archived dropdown
  const handleRestoreDropdown = (index) => {
    const itemToRestore = archiveData[index];
    setDropdownData(prev => ({
      ...prev,
      [itemToRestore.name]: itemToRestore.options
    }));
    setArchiveData(prev => prev.filter((_, i) => i !== index));
  };

  // Delete archived dropdown permanently
  const handleDeleteDropdownPermanently = (index) => {
    setArchiveData(prev => prev.filter((_, i) => i !== index));
  };

  // Archive a member from the InitialContributionTab
  const handleArchiveMember = (member) => {
    const archivedMember = { ...member, archivedDate: new Date().toISOString().split('T')[0] };
    setArchivedMembers(prev => [...prev, archivedMember]);
  };

  // Restore archived member
  const handleRestoreMember = (index) => {
    const memberToRestore = archivedMembers[index];
    setArchivedMembers(prev => prev.filter((_, i) => i !== index));
    alert(`Member ${memberToRestore.name} has been restored`);
  };

  // Permanently delete archived member
  const handleDeleteMemberPermanently = (index) => {
    const memberToDelete = archivedMembers[index];
    if (window.confirm(`Are you sure you want to permanently delete ${memberToDelete.name}?`)) {
      setArchivedMembers(prev => prev.filter((_, i) => i !== index));
      alert(`Member ${memberToDelete.name} has been permanently deleted`);
    }
  };

  return (
    <div className="p-6 font-sans">
      {/* Tabs */}
      <div className="flex justify-center items-center mb-4 space-x-4">
        <button
          className={`py-2 px-6 ${activeTab === 'button' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('button')}
        >
          Button Manager
        </button>
        <button
          className={`py-2 px-6 ${activeTab === 'manager' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('manager')}
        >
          Dropdown Manager
        </button>
        <button
          className={`py-2 px-6 ${activeTab === 'initialContribution' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('initialContribution')}
        >
          Initial Contribution
        </button>
        <button
          className={`py-2 px-6 ${activeTab === 'archive' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('archive')}
        >
          Archive
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-4" />

      {/* Tab Content */}
      <div>
        {activeTab === 'button' && <ButtonManagerTab setActiveTab={setActiveTab} setArchivedButtons={setArchivedButtons} />}
        {activeTab === 'manager' && (
          <DropdownManagerTab
            setActiveTab={setActiveTab}
            archiveData={archiveData}
            setArchiveData={setArchiveData}
            dropdownData={dropdownData}
            setDropdownData={setDropdownData}
          />
        )}
        {activeTab === 'initialContribution' && (
          <InitialContributionTab
            onArchiveMember={handleArchiveMember}
            switchToArchive={() => setActiveTab('archive')}
          />
        )}
        {activeTab === 'archive' && (
          <ArchiveTab
            archiveData={archiveData}
            setArchiveData={setArchiveData}
            handleRestoreDropdown={handleRestoreDropdown}
            handleDeleteDropdownPermanently={handleDeleteDropdownPermanently}
            archivedMembers={archivedMembers}
            handleRestoreMember={handleRestoreMember}
            handleDeleteMemberPermanently={handleDeleteMemberPermanently}
            archivedButtons={archivedButtons}
            setArchivedButtons={setArchivedButtons}
          />
        )}
      </div>
    </div>
  );
};

export default MembersModule;
