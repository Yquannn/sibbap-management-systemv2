import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  X, 
  Check, 
  Search, 
  ChevronDown, 
  Trash2, 
  Archive, 
  RefreshCw, 
  Info, 
  Percent,
  DollarSign,
  Package,
  Filter
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:3001/api/loan-types";

const LoanTypeManagement = () => {
  // State variables
  const [loans, setLoans] = useState([]);
  const [archivedLoans, setArchivedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  
  // Modal states
  const [isEditing, setIsEditing] = useState(false);
  const [currentLoan, setCurrentLoan] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Form states
  const [newLoanType, setNewLoanType] = useState('');
  const [newInterestRate, setNewInterestRate] = useState('');
  const [newServiceFee, setNewServiceFee] = useState('');
  const [newPenaltyFee, setNewPenaltyFee] = useState('');
  const [newAdditionalSavings, setNewAdditionalSavings] = useState('0');
  
  // Commodity fields
  const [isCommodityLoan, setIsCommodityLoan] = useState(false);
  const [commodityType, setCommodityType] = useState('feeds');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [maxUnits, setMaxUnits] = useState('');
  const [loanPercentage, setLoanPercentage] = useState('70');
  
  // Success message state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Calculation preview state
  const [showCalculation, setShowCalculation] = useState(false);
  const [calculationAmount, setCalculationAmount] = useState(0);
  const [calculationUnits, setCalculationUnits] = useState(1);
  
  // Column visibility state
  const [showColumn, setShowColumn] = useState({
    loan_type: true,
    interest_rate: true,
    service_fee: true,
    penalty_fee: true,
    additional_savings: true,
    commodity_details: true,
    updated_at: false
  });

  // Function to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };
  
  // Calculate loanable amount
  const calculateLoanableAmount = (price, units, percentage) => {
    if (!price || !units || !percentage) return 0;
    const totalValue = parseFloat(price) * parseInt(units);
    return (totalValue * parseFloat(percentage)) / 100;
  };
  
  // Preview calculation handler
  const handleShowCalculation = (loan) => {
    if (!loan.price_per_unit || !loan.max_units || !loan.loan_percentage) return;
    
    setCalculationUnits(1);
    setCalculationAmount(calculateLoanableAmount(
      loan.price_per_unit, 
      1, 
      loan.loan_percentage
    ));
    setShowCalculation(true);
  };
  
  // Update calculation on unit change
  const handleUnitChange = (e, loan) => {
    const units = parseInt(e.target.value) || 0;
    setCalculationUnits(units);
    setCalculationAmount(calculateLoanableAmount(
      loan.price_per_unit, 
      units, 
      loan.loan_percentage
    ));
  };

  // Fetch loan types from API
  const fetchLoanTypes = async () => {
    try {
      setLoading(true);
      const activeResponse = await axios.get(API_URL);
      setLoans(activeResponse.data.data || []);
      
      const archivedResponse = await axios.get(`${API_URL}?includeArchived=true`);
      const allLoans = archivedResponse.data.data || [];
      setArchivedLoans(allLoans.filter(loan => loan.is_archived === 1));
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch loan types. Please try again later.');
      console.error('Error fetching loan types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  // Filter and sort functions
  const getLoansByArchiveStatus = () => showArchived ? archivedLoans : loans;
  
  const filteredLoans = getLoansByArchiveStatus().filter(loan =>
    loan.loan_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loan.commodity_type && loan.commodity_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedLoans = [...filteredLoans].sort((a, b) => {
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

  // Format currency for display
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  // Handlers
  const handleEditLoan = (loan) => {
    setCurrentLoan(loan);
    setNewLoanType(loan.loan_type);
    setNewInterestRate(loan.interest_rate.toString());
    setNewServiceFee(loan.service_fee.toString());
    setNewPenaltyFee(loan.penalty_fee.toString());
    setNewAdditionalSavings((loan.additional_savings_deposit || 0).toString());
    
    // Set commodity fields if they exist
    if (loan.commodity_type) {
      setIsCommodityLoan(true);
      setCommodityType(loan.commodity_type);
      setPricePerUnit(loan.price_per_unit?.toString() || '');
      setMaxUnits(loan.max_units?.toString() || '');
      setLoanPercentage(loan.loan_percentage?.toString() || '70');
    } else {
      setIsCommodityLoan(false);
      setCommodityType('feeds');
      setPricePerUnit('');
      setMaxUnits('');
      setLoanPercentage('70');
    }
    
    setIsEditing(true);
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
    setNewLoanType('');
    setNewInterestRate('');
    setNewServiceFee('');
    setNewPenaltyFee('');
    setNewAdditionalSavings('0');
    setIsCommodityLoan(false);
    setCommodityType('feeds');
    setPricePerUnit('');
    setMaxUnits('');
    setLoanPercentage('70');
  };

  const saveLoanChanges = async () => {
    const interestRate = parseFloat(newInterestRate);
    const serviceFee = parseFloat(newServiceFee);
    const penaltyFee = parseFloat(newPenaltyFee);
    const additionalSavings = parseFloat(newAdditionalSavings || '0');
        
    if (!newLoanType.trim() || isNaN(interestRate) || isNaN(serviceFee) || isNaN(penaltyFee) || isNaN(additionalSavings)) {
      alert('Please enter valid information for all required fields');
      return;
    }
    
    // Create request data
    const requestData = {
      loan_type: newLoanType,
      interest_rate: interestRate,
      service_fee: serviceFee,
      penalty_fee: penaltyFee,
      additional_savings_deposit: additionalSavings
    };
        
    // Add commodity details if it's a commodity loan
    if (isCommodityLoan) {
      const price = parseFloat(pricePerUnit);
      const units = parseInt(maxUnits);
      const percent = parseFloat(loanPercentage);
            
      if (isNaN(price) || isNaN(units) || isNaN(percent)) {
        alert('Please enter valid information for all commodity fields');
        return;
      }
            
      requestData.commodity_type = commodityType;
      requestData.price_per_unit = price;
      requestData.max_units = units;
      requestData.loan_percentage = percent;
    }
    
    try {
      await axios.put(`${API_URL}/${currentLoan.id}`, requestData);
            
      fetchLoanTypes();
      setIsEditing(false);
      setCurrentLoan(null);
      resetForm();
            
      showSuccess('Loan type updated successfully!');
    } catch (err) {
      alert('Failed to update loan type. Please try again.');
      console.error('Error updating loan type:', err);
    }
   };
   


  
  const handleSaveAddLoan = async () => {
    const interestRate = parseFloat(newInterestRate);
    const serviceFee = parseFloat(newServiceFee);
    const penaltyFee = parseFloat(newPenaltyFee);
    const additionalSavings = parseFloat(newAdditionalSavings || '0');
    
    if (!newLoanType.trim() || isNaN(interestRate) || isNaN(serviceFee) || isNaN(penaltyFee) || isNaN(additionalSavings)) {
      alert('Please enter valid information for all required fields');
      return;
    }

    // Create request data
    const requestData = {
      loan_type: newLoanType,
      interest_rate: interestRate,
      service_fee: serviceFee,
      penalty_fee: penaltyFee,
      additional_savings_deposit: additionalSavings
    };
    
    // Add commodity details if it's a commodity loan
    if (isCommodityLoan) {
      const price = parseFloat(pricePerUnit);
      const units = parseInt(maxUnits);
      const percent = parseFloat(loanPercentage);
      
      if (isNaN(price) || isNaN(units) || isNaN(percent)) {
        alert('Please enter valid information for all commodity fields');
        return;
      }
      
      requestData.commodity_type = commodityType;
      requestData.price_per_unit = price;
      requestData.max_units = units;
      requestData.loan_percentage = percent;
    }

    try {
      await axios.post(API_URL, requestData);
      
      fetchLoanTypes();
      handleCloseAddModal();
      
      showSuccess('New loan type added successfully!');
    } catch (err) {
      alert('Failed to add loan type. Please try again.');
      console.error('Error adding loan type:', err);
    }
  };

  // Other handlers
  const toggleColumnVisibility = (column) => {
    setShowColumn(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleConfirmArchive = (id) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  const handleArchiveLoan = async () => {
    try {
      await axios.patch(`${API_URL}/${deleteId}/archive`);
      fetchLoanTypes();
      setIsDeleting(false);
      setDeleteId(null);
      showSuccess('Loan type archived successfully!');
    } catch (err) {
      alert('Failed to archive loan type. Please try again.');
      console.error('Error archiving loan type:', err);
    }
  };

  const handleRestoreLoan = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/unarchive`);
      fetchLoanTypes();
      showSuccess('Loan type restored successfully!');
    } catch (err) {
      alert('Failed to restore loan type. Please try again.');
      console.error('Error restoring loan type:', err);
    }
  };

  const toggleShowArchived = () => {
    setShowArchived(prev => !prev);
  };
  
  // Info modal state
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [infoType, setInfoType] = useState("");

  const handleShowInfo = (type) => {
    setInfoType(type);
    setIsInfoModalVisible(true);
  };
  
  // Get information text
  const getInfoText = () => {
    switch (infoType) {
      case "interest":
        return (
          <div className="space-y-2">
            <p>Interest rate is the percentage charged on the principal loan amount for borrowing funds.</p>
            <p>It's typically expressed as an annual percentage rate (APR).</p>
          </div>
        );
      case "fees":
        return (
          <div className="space-y-2">
            <p>Various fees associated with loans:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Fee:</strong> One-time fee charged when processing the loan</li>
              <li><strong>Penalty Fee:</strong> Additional charge if payments are late or missed</li>
            </ul>
          </div>
        );
      case "commodity":
        return (
          <div className="space-y-2">
            <p>For rice and feeds loans, you can specify:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Commodity Type:</strong> Rice or Feeds</li>
              <li><strong>Price Per Sack:</strong> Current market price for one sack</li>
              <li><strong>Maximum Units:</strong> Maximum number of sacks that can be borrowed</li>
              <li><strong>Loan Percentage:</strong> Percentage of the total value that can be loaned</li>
            </ul>
            <p className="mt-2">The loanable amount is calculated as:</p>
            <p className="font-medium">Loanable Amount = (Price per Sack × Number of Sacks) × Loan Percentage</p>
          </div>
        );
      case "savings":
        return (
          <div className="space-y-2">
            <p>Additional Savings Deposit is an automatic deduction from the loan amount that goes into the member's savings account.</p>
            <p>For example, with a 5% additional savings deposit on a ₱10,000 loan:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>₱500 would be deposited to savings</li>
              <li>Member receives ₱9,500 in cash</li>
              <li>Full ₱10,000 is still the loan amount due</li>
            </ul>
            <p className="mt-2">This helps members build savings while taking loans.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Loading and error states
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
          {showArchived ? 'Archived Loan Types' : 'Active Loan Types'}
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search loan types"
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
                    checked={showColumn.loan_type}
                    onChange={() => toggleColumnVisibility('loan_type')}
                    className="mr-2"
                  />
                  Loan Type
                </label>
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.interest_rate}
                    onChange={() => toggleColumnVisibility('interest_rate')}
                    className="mr-2"
                  />
                  Interest Rate
                </label>
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.service_fee}
                    onChange={() => toggleColumnVisibility('service_fee')}
                    className="mr-2"
                  />
                  Service Fee
                </label>
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.penalty_fee}
                    onChange={() => toggleColumnVisibility('penalty_fee')}
                    className="mr-2"
                  />
                  Penalty Fee
                </label>
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.additional_savings}
                    onChange={() => toggleColumnVisibility('additional_savings')}
                    className="mr-2"
                  />
                  Additional Savings
                </label>
                <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showColumn.commodity_details}
                    onChange={() => toggleColumnVisibility('commodity_details')}
                    className="mr-2"
                  />
                  Commodity Details
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
          
          {/* Add button */}
          {!showArchived && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus size={18} className="mr-1" />
              Add Loan Type
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
                {showColumn.loan_type && (
                  <th
                    onClick={() => requestSort('loan_type')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Loan Type
                      {sortConfig.key === 'loan_type' && (
                        <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                )}
                {showColumn.interest_rate && (
                  <th
                    onClick={() => requestSort('interest_rate')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Interest Rate
                      <button onClick={() => handleShowInfo("interest")} className="ml-1 text-gray-400 hover:text-blue-500">
                        <Info size={14} />
                      </button>
                    </div>
                  </th>
                )}
                {showColumn.service_fee && (
                  <th
                    onClick={() => requestSort('service_fee')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Service Fee
                    </div>
                  </th>
                )}
                {showColumn.penalty_fee && (
                  <th
                    onClick={() => requestSort('penalty_fee')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Penalty Fee
                      <button onClick={() => handleShowInfo("fees")} className="ml-1 text-gray-400 hover:text-blue-500">
                        <Info size={14} />
                      </button>
                    </div>
                  </th>
                )}
                {showColumn.additional_savings && (
                  <th
                    onClick={() => requestSort('additional_savings_deposit')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Additional Savings
                      <button onClick={() => handleShowInfo("savings")} className="ml-1 text-gray-400 hover:text-blue-500">
                        <Info size={14} />
                      </button>
                    </div>
                  </th>
                )}
                {showColumn.commodity_details && (
                  <th
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      Commodity Details
                      <button onClick={() => handleShowInfo("commodity")} className="ml-1 text-gray-400 hover:text-blue-500">
                        <Info size={14} />
                      </button>
                    </div>
                  </th>
                )}
                {showColumn.updated_at && (
                  <th
                    onClick={() => requestSort('updated_at')}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Last Updated
                    </div>
                  </th>
                )}
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLoans.map((loan) => (
                <tr key={loan.id} className={`hover:bg-gray-50 ${showArchived ? 'bg-gray-50' : ''}`}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.id}</td>
                  
                  {showColumn.loan_type && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{loan.loan_type}</td>
                  )}
                  
                  {showColumn.interest_rate && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-sm">
                        <Percent size={14} className="mr-1" />
                        {loan.interest_rate}%
                      </span>
                    </td>
                  )}
                  {showColumn.service_fee && (
                   <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                     {loan.service_fee}%
                   </td>
                 )}
                 
                 {showColumn.penalty_fee && (
                   <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                     {loan.penalty_fee}%
                   </td>
                 )}
                 
                 {showColumn.additional_savings && (
                   <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                     <span className={`inline-flex items-center px-2 py-1 rounded ${parseFloat(loan.additional_savings_deposit || 0) > 0 ? 'bg-green-50 text-green-700' : 'text-gray-500'}`}>
                       {loan.additional_savings_deposit ? `${loan.additional_savings_deposit}%` : '0%'}
                     </span>
                   </td>
                 )}
                 
                 {showColumn.commodity_details && (
                   <td className="px-3 py-4 text-sm text-gray-500">
                     {loan.commodity_type ? (
                       <div>
                         <span className={`inline-flex items-center px-2 py-1 rounded ${
                           loan.commodity_type === 'feeds' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                         }`}>
                           <Package size={14} className="mr-1" />
                           {loan.commodity_type === 'feeds' ? 'Feeds' : 'Rice'}
                         </span>
                         
                         <div className="mt-1">
                           <span className="text-gray-700 font-medium">Price:</span> {formatCurrency(loan.price_per_unit)}
                         </div>
                         
                         <div>
                           <span className="text-gray-700 font-medium">Max Units:</span> {loan.max_units} sacks
                         </div>
                         
                         <div>
                           <span className="text-gray-700 font-medium">Max Loanable:</span> {formatCurrency(
                             calculateLoanableAmount(
                               loan.price_per_unit, 
                               loan.max_units, 
                               loan.loan_percentage
                             )
                           )} ({loan.loan_percentage}%)
                         </div>
                         
                         <button
                           onClick={() => handleShowCalculation(loan)}
                           className="text-blue-600 text-xs mt-1 hover:underline"
                         >
                           Calculate for specific quantity
                         </button>
                       </div>
                     ) : (
                       <span className="text-gray-400">N/A</span>
                     )}
                   </td>
                 )}
                 
                 {showColumn.updated_at && (
                   <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                     {loan.updated_at ? new Date(loan.updated_at).toLocaleDateString() : 'N/A'}
                   </td>
                 )}
                 
                 <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <div className="flex justify-end space-x-2">
                     {showArchived ? (
                       <button
                         onClick={() => handleRestoreLoan(loan.id)}
                         className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded flex items-center"
                       >
                         <RefreshCw size={16} className="mr-1" />
                        Restore
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditLoan(loan)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded flex items-center"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleConfirmArchive(loan.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded flex items-center"
                        >
                          <Archive size={16} className="mr-1" />
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

    {sortedLoans.length === 0 && !loading && (
      <div className="text-center py-4 bg-gray-50 rounded-md border">
        <p className="text-gray-500">
          {showArchived 
            ? 'No archived loan types found matching your search.'
            : 'No active loan types found matching your search.'}
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

    {/* Edit Loan Modal */}
    {isEditing && currentLoan && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Edit Loan Type</h3>
          <div className="mb-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">ID:</span>
              <span className="ml-2 text-gray-900">{currentLoan.id}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type
                </label>
                <input
                  type="text"
                  value={newLoanType}
                  onChange={(e) => setNewLoanType(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={newInterestRate}
                  onChange={(e) => setNewInterestRate(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Fee (%)
                </label>
                <input
                  type="number"
                  value={newServiceFee}
                  onChange={(e) => setNewServiceFee(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penalty Fee (%)
                </label>
                <input
                  type="number"
                  value={newPenaltyFee}
                  onChange={(e) => setNewPenaltyFee(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Savings Deposit (%)
                </label>
                <input
                  type="number"
                  value={newAdditionalSavings}
                  onChange={(e) => setNewAdditionalSavings(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  step="0.01"
                  placeholder="Enter additional savings percentage"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Percentage of loan amount automatically deposited to savings (0 for none)
                </p>
              </div>
              
              {/* Commodity toggle */}
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isCommodityLoan"
                    checked={isCommodityLoan}
                    onChange={(e) => setIsCommodityLoan(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="isCommodityLoan" className="text-sm font-medium text-gray-700">
                    Products Loan
                  </label>
                </div>
                <p className="text-xs text-gray-500">Enable this for products types that involve specific amounts.</p>
              </div>
              
              {/* Commodity specific fields */}
              {isCommodityLoan && (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-3">
                  <h4 className="font-medium text-gray-700">Commodity Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commodity Type
                    </label>
                    <select
                      value={commodityType}
                      onChange={(e) => setCommodityType(e.target.value)}
                      className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="feeds">Feeds</option>
                      <option value="rice">Rice</option>
                      <option value="other">Other</option>

                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Per Sack (₱)
                    </label>
                    <input
                      type="number"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      step="0.01"
                      placeholder="Enter price per sack"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Units
                    </label>
                    <input
                      type="number"
                      value={maxUnits}
                      onChange={(e) => setMaxUnits(e.target.value)}
                      className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="1"
                      placeholder="Maximum number of sacks"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={loanPercentage}
                      onChange={(e) => setLoanPercentage(e.target.value)}
                      className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="1"
                      max="100"
                      placeholder="Percentage of total value"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of the total commodity value that can be borrowed
                    </p>
                  </div>
                  
                  {/* Preview calculation */}
                  {pricePerUnit && maxUnits && loanPercentage && (
                    <div className="bg-blue-50 p-2 rounded border border-blue-100 text-blue-800">
                      <p className="font-medium">Maximum Loanable Amount:</p>
                      <p className="text-lg">
                        {formatCurrency(calculateLoanableAmount(pricePerUnit, maxUnits, loanPercentage))}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Based on {maxUnits} sacks at {formatCurrency(pricePerUnit)} per sack with {loanPercentage}% loan ratio
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {currentLoan.updated_at && (
              <p className="mt-4 text-xs text-gray-500">Last updated on: {new Date(currentLoan.updated_at).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => { setIsEditing(false); setCurrentLoan(null); }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={saveLoanChanges}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Add Loan Modal */}
    {isAdding && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Add New Loan Type</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Type
              </label>
              <input
                type="text"
                value={newLoanType}
                onChange={(e) => setNewLoanType(e.target.value)}
                className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter loan type name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={newInterestRate}
                onChange={(e) => setNewInterestRate(e.target.value)}
                className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                step="0.01"
                placeholder="Enter interest rate percentage"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Fee (%)
              </label>
              <input
                type="number"
                value={newServiceFee}
                onChange={(e) => setNewServiceFee(e.target.value)}
                className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                step="0.01"
                placeholder="Enter service fee percentage"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penalty Fee (%)
              </label>
              <input
                type="number"
                value={newPenaltyFee}
                onChange={(e) => setNewPenaltyFee(e.target.value)}
                className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                step="0.01"
                placeholder="Enter penalty fee percentage"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Savings Deposit (%)
              </label>
              <input
                type="number"
                value={newAdditionalSavings}
                onChange={(e) => setNewAdditionalSavings(e.target.value)}
                className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                step="0.01"
                placeholder="Enter additional savings percentage"
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentage of loan amount automatically deposited to savings (0 for none)
              </p>
            </div>
            
            {/* Commodity toggle */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isCommodityLoanNew"
                  checked={isCommodityLoan}
                  onChange={(e) => setIsCommodityLoan(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isCommodityLoanNew" className="text-sm font-medium text-gray-700">
                  This is a rice/feeds loan type
                </label>
              </div>
              <p className="text-xs text-gray-500">Enable this for loan types that involve specific amounts of rice or feeds.</p>
            </div>
            
            {/* Commodity specific fields */}
            {isCommodityLoan && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-3">
                <h4 className="font-medium text-gray-700">Commodity Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commodity Type
                  </label>
                  <select
                    value={commodityType}
                    onChange={(e) => setCommodityType(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="feeds">Feeds</option>
                    <option value="rice">Rice</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Sack (₱)
                  </label>
                  <input
                    type="number"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    step="0.01"
                    placeholder="Enter price per sack"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Units
                  </label>
                  <input
                    type="number"
                    value={maxUnits}
                    onChange={(e) => setMaxUnits(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                    placeholder="Maximum number of sacks"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={loanPercentage}
                    onChange={(e) => setLoanPercentage(e.target.value)}
                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                    max="100"
                    placeholder="Percentage of total value"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of the total commodity value that can be borrowed
                  </p>
                </div>
                
                {/* Preview calculation */}
                {pricePerUnit && maxUnits && loanPercentage && (
                  <div className="bg-blue-50 p-2 rounded border border-blue-100 text-blue-800">
                    <p className="font-medium">Maximum Loanable Amount:</p>
                    <p className="text-lg">
                      {formatCurrency(calculateLoanableAmount(pricePerUnit, maxUnits, loanPercentage))}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Based on {maxUnits} sacks at {formatCurrency(pricePerUnit)} per sack with {loanPercentage}% loan ratio
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={handleCloseAddModal}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAddLoan}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Loan Type
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Calculation Modal */}
    {showCalculation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
          <h3 className="text-lg font-medium mb-4">Calculate Loanable Amount</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Sacks
              </label>
              <input
                type="number"
                value={calculationUnits}
                onChange={(e) => handleUnitChange(e, currentLoan)}
                className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="1"
                max={currentLoan?.max_units || 100}
              />
              {currentLoan?.max_units && (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum allowed: {currentLoan.max_units} sacks
                </p>
              )}
            </div>
            
            <div className="bg-blue-50 p-3 rounded border border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Price per sack:</div>
                  <div className="text-gray-800 font-medium">
                    {formatCurrency(currentLoan?.price_per_unit || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total value:</div>
                  <div className="text-gray-800 font-medium">
                    {formatCurrency((currentLoan?.price_per_unit || 0) * calculationUnits)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Loan percentage:</div>
                  <div className="text-gray-800 font-medium">
                    {currentLoan?.loan_percentage || 70}%
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-sm text-blue-600">Loanable amount:</div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(calculationAmount)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowCalculation(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Close
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
            Are you sure you want to archive this loan type? This action can be reversed later.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => { setIsDeleting(false); setDeleteId(null); }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleArchiveLoan}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Information Modal */}
    {isInfoModalVisible && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {infoType === "interest" ? "Interest Rate Information" : 
               infoType === "fees" ? "Loan Fees Information" : 
               infoType === "savings" ? "Additional Savings Information" :
               "Commodity Loan Information"}
            </h3>
            <button
              onClick={() => setIsInfoModalVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">{getInfoText()}</div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsInfoModalVisible(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Close
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
const LoanTypeModule = () => {
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
              Loan Types
            </button>
          </div>
        </div>
        
        <LoanTypeManagement />
      </div>
    </div>
  </div>
);
};

export default LoanTypeModule;