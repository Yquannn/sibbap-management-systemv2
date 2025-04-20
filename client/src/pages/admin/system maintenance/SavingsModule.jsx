import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, Check, Search, ChevronDown, Archive, RefreshCw, Trash2, Download, Calendar } from 'lucide-react';
import axios from 'axios';

/* ================================
   INTEREST RATE MODULE
==================================== */
const InterestRateTab = () => {
  // Basic modules state
  const [modules, setModules] = useState([]);
  const [archivedModules, setArchivedModules] = useState([]);
  
  // Time deposit specific rates structure
  const [timeDepositRates, setTimeDepositRates] = useState({
    6: [],
    12: []
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showTimeDepositDetails, setShowTimeDepositDetails] = useState(false);
  const [activeTermMonths, setActiveTermMonths] = useState(6); // 6 or 12 months
  const [currentTimeDepositModuleId, setCurrentTimeDepositModuleId] = useState(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newUpdater, setNewUpdater] = useState('');
  
  // Time deposit rate editing
  const [isEditingTieredRate, setIsEditingTieredRate] = useState(false);
  const [currentTier, setCurrentTier] = useState(null);
  const [currentTermMonths, setCurrentTermMonths] = useState(null);
  const [newThreshold, setNewThreshold] = useState('');
  const [newTieredRate, setNewTieredRate] = useState('');
  
  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  
  // Archive confirmation
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Success message
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Column visibility
  const [showColumn, setShowColumn] = useState({
    name: true,
    interestRate: true,
    updatedBy: true,
    lastEdited: true
  });
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

  // API base URL
  const API_URL = 'http://localhost:3001/api/';

  // Fetch modules from API
  useEffect(() => {
    fetchModules();
  }, [showArchived]);

  // Fetch time deposit rates when showing time deposit details
  useEffect(() => {
    if (showTimeDepositDetails && currentTimeDepositModuleId) {
      fetchTimeDepositRates(currentTimeDepositModuleId);
    }
  }, [showTimeDepositDetails, currentTimeDepositModuleId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/modules?archived=${showArchived}`);
      
      if (showArchived) {
        setArchivedModules(response.data);
      } else {
        setModules(response.data);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch interest rate modules. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeDepositRates = async (moduleId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/time-deposit/${moduleId}`);
      
      // Group rates by term months
      const rates = {
        6: [],
        12: []
      };
      
      response.data.forEach(rate => {
        if (rate.term_months === 6 || rate.term_months === 12) {
          rates[rate.term_months].push({
            id: rate.id,
            threshold: rate.threshold === 9999999999 ? Infinity : rate.threshold,
            rate: rate.rate
          });
        }
      });
      
      // Sort rates by threshold
      rates[6].sort((a, b) => a.threshold - b.threshold);
      rates[12].sort((a, b) => a.threshold - b.threshold);
      
      setTimeDepositRates(rates);
      setError(null);
    } catch (err) {
      setError('Failed to fetch time deposit rates. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: format interest rate
  const formatPercentage = (rate) => `${rate}%`;
  
  // Format currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  
  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  // Filter modules by search term
  const filteredModules = (showArchived ? archivedModules : modules).filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort modules
  const sortedModules = [...filteredModules].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    setShowColumn(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Toggle showing archived items
  const toggleShowArchived = () => {
    setShowArchived(prev => !prev);
    setSearchTerm('');
  };

  // Archive a module
  const handleConfirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  const handleArchiveModule = async () => {
    try {
      setLoading(true);
      
      await axios.put(`${API_URL}/modules/archive/${deleteId}`);
      
      // Re-fetch modules
      await fetchModules();
      
      setIsDeleting(false);
      setDeleteId(null);
      showSuccess('Module archived successfully!');
    } catch (err) {
      setError('Failed to archive module. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Restore a module from archive
  const handleRestoreModule = async (id) => {
    try {
      setLoading(true);
      
      await axios.put(`${API_URL}/modules/restore/${id}`);
      
      // Re-fetch archived modules
      await fetchModules();
      
      showSuccess('Module restored successfully!');
    } catch (err) {
      setError('Failed to restore module. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const handleEditModule = (module) => {
    setCurrentModule(module);
    
    if (module.module_type === 'tiered') {
      // For Time Deposit, open tiered details view
      setCurrentTimeDepositModuleId(module.id);
      setShowTimeDepositDetails(true);
    } else {
      // For standard rate modules
      setNewName(module.name);
      setNewRate(module.interest_rate.toString());
      setNewUpdater(module.updated_by);
      setIsEditing(true);
    }
  };

  // Edit a specific Time Deposit tier
  const handleEditTier = (tierData, termMonths) => {
    setCurrentTier(tierData);
    setCurrentTermMonths(termMonths);
    setNewThreshold(tierData.threshold === Infinity ? 'Infinity' : tierData.threshold.toString());
    setNewTieredRate(tierData.rate.toString());
    setIsEditingTieredRate(true);
  };

  // Save tiered rate
  const saveTieredRate = async () => {
    const rate = parseFloat(newTieredRate);
    let threshold = newThreshold === 'Infinity' ? 9999999999 : parseFloat(newThreshold);
    
    if ((isNaN(threshold) && newThreshold !== 'Infinity') || isNaN(rate) || rate < 0) {
      alert('Please enter valid values');
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.put(`${API_URL}/time-deposit/${currentTier.id}`, {
        threshold: threshold,
        rate: rate
      });
      
      // Re-fetch time deposit rates
      await fetchTimeDepositRates(currentTimeDepositModuleId);
      
      setIsEditingTieredRate(false);
      setCurrentTier(null);
      setCurrentTermMonths(null);
      setNewThreshold('');
      setNewTieredRate('');
      
      showSuccess('Time deposit tier updated successfully!');
    } catch (err) {
      setError('Failed to update time deposit rate. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save edited module
  const saveModule = async () => {
    const rate = parseFloat(newRate);
    
    if (!newName.trim() || isNaN(rate) || rate < 0) {
      alert('Please enter valid information for all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      if (currentModule.module_type === 'standard') {
        // For regular savings and other standard modules
        await axios.put(`${API_URL}/modules/${currentModule.id}`, {
          name: newName,
          interest_rate: rate,
          updated_by: newUpdater
        });
      } else if (currentModule.name === 'Share Capital') {
        // For share capital module
        await axios.post(`${API_URL}/share-capital`, {
          module_id: currentModule.id,
          rate: rate,
          updated_by: newUpdater
        });
      }
      
      // Re-fetch modules
      await fetchModules();
      
      setIsEditing(false);
      setCurrentModule(null);
      resetForm();
      
      showSuccess('Interest rate module updated successfully!');
    } catch (err) {
      setError('Failed to update module. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new module
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
    setNewRate('');
    setNewUpdater('');
  };
  
  const handleSaveAddModule = async () => {
    if (!newName.trim()) {
      alert('Please enter a valid module name');
      return;
    }
    
    const rate = parseFloat(newRate);
    
    if (isNaN(rate) || rate < 0) {
      alert('Please enter a valid interest rate');
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.post(`${API_URL}/modules`, {
        name: newName,
        module_type: 'standard',
        interest_rate: rate,
        updated_by: newUpdater || 'Current User'
      });
      
      // Re-fetch modules
      await fetchModules();
      
      handleCloseAddModal();
      showSuccess('New interest rate module added successfully!');
    } catch (err) {
      setError('Failed to add module. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Export as CSV
  const exportModulesCSV = () => {
    setLoading(true);
    
    setTimeout(() => {
      const headers = ["ID", "Module Name", "Interest Rate (%)", "Updated By", "Last Edited"];
      const rows = modules.map(m => {
        if (m.module_type === 'tiered') {
          return [
            m.id, 
            m.name, 
            "Tiered rates", 
            m.updated_by, 
            m.last_edited || 'Not edited'
          ];
        } else {
          return [
            m.id, 
            m.name, 
            m.interest_rate, 
            m.updated_by, 
            m.last_edited || 'Not edited'
          ];
        }
      });
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `interest_rates_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLoading(false);
      showSuccess('Interest rates data exported successfully.');
    }, 800);
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
      {/* Main UI or Time Deposit Details */}
      {!showTimeDepositDetails ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">
              {showArchived ? 'Archived Interest Rate Modules' : 'Active Interest Rate Modules'}
            </h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search modules"
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
              
              {/* Export button */}
              <button
                onClick={exportModulesCSV}
                className="px-4 py-2 border rounded-md bg-white flex items-center text-gray-700"
              >
                <Download size={16} className="mr-2" />
                Export CSV
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
                      Module Name
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showColumn.interestRate}
                        onChange={() => toggleColumnVisibility('interestRate')}
                        className="mr-2"
                      />
                      Interest Rate
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showColumn.updatedBy}
                        onChange={() => toggleColumnVisibility('updatedBy')}
                        className="mr-2"
                      />
                      Updated By
                    </label>
                    <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showColumn.lastEdited}
                        onChange={() => toggleColumnVisibility('lastEdited')}
                        className="mr-2"
                      />
                      Last Edited
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
                  Add Interest Rate Module
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
                      onClick={() => requestSort('id')}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        ID
                        {sortConfig.key === 'id' && (
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
                          Module Name
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    
                    {showColumn.interestRate && (
                      <th
                        onClick={() => requestSort('interest_rate')}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Interest Rate (%)
                          {sortConfig.key === 'interest_rate' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    
                    {showColumn.updatedBy && (
                      <th
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Updated By
                      </th>
                    )}
                    
                    {showColumn.lastEdited && (
                      <th
                        onClick={() => requestSort('last_edited')}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Last Edited
                          {sortConfig.key === 'last_edited' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    )}
                    
                    {/* Always show Actions column */}
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedModules.map((module) => (
                    <tr key={module.id} className={`hover:bg-gray-50 ${showArchived ? 'bg-gray-50' : ''}`}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{module.id}</td>
                      
                      {showColumn.name && (
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{module.name}</td>
                      )}
                      
                      {showColumn.interestRate && (
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {module.module_type === 'tiered' ? (
                            <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md">
                              Tiered Rates
                            </span>
                          ) : (
                            formatPercentage(module.interest_rate)
                          )}
                        </td>
                      )}
                      
                      {showColumn.updatedBy && (
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{module.updated_by}</td>
                      )}
                      
                      {showColumn.lastEdited && (
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {module.last_edited ? new Date(module.last_edited).toLocaleDateString() : 'Not edited'}
                        </td>
                      )}
                      
                      {/* Show different actions based on view */}
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {showArchived ? (
                            <button
                              onClick={() => handleRestoreModule(module.id)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                            >
                              <RefreshCw size={16} className="inline mr-1" />
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditModule(module)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                              >
                                <Edit size={16} className="inline mr-1" />
                                {module.module_type === 'tiered' ? 'View Details' : 'Edit'}
                              </button>
                              <button
                                onClick={() => handleConfirmDelete(module.id)}
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

          {filteredModules.length === 0 && !loading && (
            <div className="text-center py-4 bg-gray-50 rounded-md border">
              <p className="text-gray-500">
                {showArchived 
                  ? 'No archived interest rate modules found matching your search.'
                  : 'No active interest rate modules found matching your search.'}
              </p>
            </div>
          )}
        </>
      ) : (
        /* Time Deposit Detailed View */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowTimeDepositDetails(false)} 
                className="text-blue-600 hover:text-blue-800"
              >
                &larr; Back to Modules
              </button>
              <h2 className="text-xl font-medium">Time Deposit Interest Rates</h2>
            </div>
            
            {/* Term length tabs */}
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setActiveTermMonths(6)}
                className={`px-4 py-2 flex items-center ${activeTermMonths === 6 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Calendar size={16} className="mr-2" />
                6 Months
              </button>
              <button
                onClick={() => setActiveTermMonths(12)}
                className={`px-4 py-2 flex items-center ${activeTermMonths === 12 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Calendar size={16} className="mr-2" />
                12 Months
              </button>
            </div>
          </div>
          
          {/* Time Deposit Rate Table */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minimum Amount
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maximum Amount
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Rate (%)
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeDepositRates[activeTermMonths].map((tier, index) => {
                    // Calculate the minimum amount (previous tier's threshold or 0 for first tier)
                    const minAmount = index === 0 ? 0 : timeDepositRates[activeTermMonths][index - 1].threshold;
                    const maxAmount = tier.threshold === Infinity ? 'and above' : `to less than ${formatCurrency(tier.threshold)}`;
                    
                    return (
                      <tr key={tier.id || index} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(minAmount)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {maxAmount}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(tier.rate)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditTier(tier, activeTermMonths)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                          >
                            <Edit size={16} className="inline mr-1" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Example calculation section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
          <h3 className="text-md font-medium text-blue-800 mb-2">Example Calculation</h3>
            <p className="text-sm text-blue-700">
              For a time deposit of {formatCurrency(250000)} for {activeTermMonths} months:
              {(() => {
                // Find the applicable rate tier
                const applicableTier = timeDepositRates[activeTermMonths].find(
                  tier => 250000 < tier.threshold
                ) || timeDepositRates[activeTermMonths][timeDepositRates[activeTermMonths].length - 1];
                
                if (!applicableTier) return " (No rate tiers available)";
                
                const rate = applicableTier.rate;
                const interestAmount = 250000 * (rate / 100) * (activeTermMonths / 12);
                
                return (
                  <> Interest rate: {formatPercentage(rate)}<br />
                  Interest earned after {activeTermMonths} months: {formatCurrency(interestAmount)}</>
                );
              })()}
            </p>
          </div>
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

      {/* Edit Module Modal */}
      {isEditing && currentModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4">
            <h3 className="text-lg font-medium mb-4">Edit Interest Rate Module</h3>
            <div className="mb-4">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">ID:</span>
                <span className="ml-2 text-gray-900">{currentModule.id}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Name
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
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Updated By
                  </label>
                  <input
                    type="text"
                    value={newUpdater}
                    onChange={(e) => setNewUpdater(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {currentModule.last_edited && (
                <p className="mt-4 text-xs text-gray-500">Last edited on: {new Date(currentModule.last_edited).toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => { setIsEditing(false); setCurrentModule(null); }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveModule}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Time Deposit Tier Modal */}
      {isEditingTieredRate && currentTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4">
            <h3 className="text-lg font-medium mb-4">
              Edit Time Deposit Rate ({currentTermMonths} months)
            </h3>
            <div className="mb-4">              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Threshold Amount (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₱</span>
                    <input
                      type="text"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(e.target.value)}
                      className="pl-8 px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter amount or 'Infinity' for no upper limit"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter 'Infinity' (without quotes) for the highest tier with no upper limit
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={newTieredRate}
                    onChange={(e) => setNewTieredRate(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => { 
                  setIsEditingTieredRate(false); 
                  setCurrentTier(null);
                  setCurrentTermMonths(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveTieredRate}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4">
            <h3 className="text-lg font-medium mb-4">Add New Interest Rate Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter module name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter interest rate"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Updated By
                </label>
                <input
                  type="text"
                  value={newUpdater}
                  onChange={(e) => setNewUpdater(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your name"
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
                onClick={handleSaveAddModule}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Module
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
              Are you sure you want to archive this interest rate module? You can restore it later from the archive.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setIsDeleting(false); setDeleteId(null); }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveModule}
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
const InterestRateModule = () => {
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
                Interest Rate Modules
              </button>
            </div>
          </div>
          
          <InterestRateTab />
        </div>
      </div>
    </div>
  );
};

export default InterestRateModule;