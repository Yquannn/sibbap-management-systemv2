import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Archive,
  Edit2,
  Trash2,
  RefreshCw,
  Info,
  Filter,
  AlertCircle,
  Clock,
  DollarSign,
  Percent
} from "lucide-react";

// --- DUMMY DATA -----------------------------------------------------
const dummyLoans = [
  { id: 1, loanType: "Personal Loan", interestRate: "2%", loanableAmount: "₱10,000", serviceFee: "3%", penaltyFee: "2%", membershipFee: "₱200", maintenanceCycle: "Monthly", maintenanceFee: "₱50" },
  { id: 2, loanType: "Housing Loan", interestRate: "1.75%", loanableAmount: "₱200,000", serviceFee: "1.2%", penaltyFee: "2%", membershipFee: "₱500", maintenanceCycle: "Quarterly", maintenanceFee: "₱100" },
  { id: 3, loanType: "Car Loan", interestRate: "1.75%", loanableAmount: "₱50,000", serviceFee: "1.2%", penaltyFee: "2%", membershipFee: "₱300", maintenanceCycle: "Monthly", maintenanceFee: "₱75" },
  { id: 4, loanType: "Salary Loan", interestRate: "2%", loanableAmount: "₱5,000", serviceFee: "3%", penaltyFee: "2%", membershipFee: "₱150", maintenanceCycle: "Monthly", maintenanceFee: "₱25" },
  { id: 5, loanType: "Mortgage Loan", interestRate: "1.75%", loanableAmount: "₱1,000,000", serviceFee: "1.2%", penaltyFee: "2%", membershipFee: "₱700", maintenanceCycle: "Quarterly", maintenanceFee: "₱200" },
  { id: 6, loanType: "OFW Assistance Loan", interestRate: "2%", loanableAmount: "₱200,000", serviceFee: "5%", penaltyFee: "2%", membershipFee: "₱400", maintenanceCycle: "Semi-Annual", maintenanceFee: "₱150" },
  { id: 7, loanType: "Agriculture Loan", interestRate: "3.5%", loanableAmount: "₱100,000", serviceFee: "3%", penaltyFee: "2%", membershipFee: "₱250", maintenanceCycle: "Quarterly", maintenanceFee: "₱100" },
  { id: 8, loanType: "Educational Loan", interestRate: "1.75%", loanableAmount: "₱50,000", serviceFee: "5%", penaltyFee: "2%", membershipFee: "₱180", maintenanceCycle: "Semi-Annual", maintenanceFee: "₱75" },
];

const dummyArchivedLoans = [
  { id: 9, loanType: "Emergency Loan", interestRate: "4%", loanableAmount: "₱15,000", serviceFee: "2.5%", penaltyFee: "2%", archivedDate: "2025-03-15", membershipFee: "₱250", maintenanceCycle: "Monthly", maintenanceFee: "₱50" },
  { id: 10, loanType: "Business Loan", interestRate: "3%", loanableAmount: "₱500,000", serviceFee: "2%", penaltyFee: "2%", archivedDate: "2025-02-28", membershipFee: "₱600", maintenanceCycle: "Quarterly", maintenanceFee: "₱150" },
  { id: 11, loanType: "Medical Loan", interestRate: "1.5%", loanableAmount: "₱75,000", serviceFee: "1%", penaltyFee: "2%", archivedDate: "2025-03-01", membershipFee: "₱400", maintenanceCycle: "Monthly", maintenanceFee: "₱60" },
  { id: 12, loanType: "Calamity Loan", interestRate: "1%", loanableAmount: "₱25,000", serviceFee: "0.5%", penaltyFee: "2%", archivedDate: "2025-01-20", membershipFee: "₱100", maintenanceCycle: "Monthly", maintenanceFee: "₱35" },
];

// Maintenance cycle options
const maintenanceCycleOptions = ["None", "Monthly", "Quarterly", "Semi-Annual", "Annual"];

const filterPlaceholders = {
  all: "Search all fields...",
  loanType: "Search by loan type...",
  interestRate: "Search by interest rate...",
  loanableAmount: "Search by loanable amount...",
  serviceFee: "Search by service fee...",
  maintenanceFee: "Search by maintenance fee...",
};

const LoanModule = () => {
  // LOANS + ARCHIVE states
  const [loans, setLoans] = useState(dummyLoans);
  const [archivedLoans, setArchivedLoans] = useState(dummyArchivedLoans);

  // Add/Edit Loan Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [newLoan, setNewLoan] = useState({
    loanType: "",
    interestRate: "",
    loanableAmount: "",
    serviceFee: "",
    penaltyFee: "",
    membershipFee: "",
    maintenanceCycle: "None",
    maintenanceFee: "₱0",
  });

  // Info Modal
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [infoType, setInfoType] = useState("");

  // Delete Confirmation Modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);

  // Tab / Filter states
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  const navigate = useNavigate();

  // ---------------------------------------------------------
  // LOAN TYPE TAB: Handlers
  // ---------------------------------------------------------
  const handleAddNewLoan = () => {
    setEditingLoan(null);
    setNewLoan({
      loanType: "",
      interestRate: "",
      loanableAmount: "",
      serviceFee: "",
      penaltyFee: "",
      membershipFee: "",
      maintenanceCycle: "None",
      maintenanceFee: "₱0",
    });
    setIsModalVisible(true);
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setNewLoan({
      loanType: loan.loanType,
      interestRate: loan.interestRate,
      loanableAmount: loan.loanableAmount,
      serviceFee: loan.serviceFee,
      penaltyFee: loan.penaltyFee || "",
      membershipFee: loan.membershipFee || "",
      maintenanceCycle: loan.maintenanceCycle || "None",
      maintenanceFee: loan.maintenanceFee || "₱0",
    });
    setIsModalVisible(true);
  };

  const handleShowInfo = (type) => {
    setInfoType(type);
    setIsInfoModalVisible(true);
  };

  const handleModalOk = () => {
    // Format all currency and percentage fields
    const formattedMembershipFee = newLoan.membershipFee.startsWith("₱") 
        ? newLoan.membershipFee
        : `₱${newLoan.membershipFee}`;

    const formattedMaintenanceFee = newLoan.maintenanceFee.startsWith("₱")
        ? newLoan.maintenanceFee
        : `₱${newLoan.maintenanceFee}`;
        
    const formattedInterestRate = newLoan.interestRate.trim().toUpperCase() === "N/A" 
        ? "N/A" 
        : newLoan.interestRate.includes("%") 
            ? newLoan.interestRate 
            : `${newLoan.interestRate}%`;

    const formattedServiceFee = newLoan.serviceFee.trim().toUpperCase() === "N/A" 
        ? "N/A" 
        : newLoan.serviceFee.includes("%") 
            ? newLoan.serviceFee 
            : `${newLoan.serviceFee}%`;

    const formattedPenaltyFee = newLoan.penaltyFee.includes("%")
        ? newLoan.penaltyFee
        : `${newLoan.penaltyFee}%`;

    const formattedLoanableAmount = newLoan.loanableAmount.includes("₱")
        ? newLoan.loanableAmount
        : `₱${newLoan.loanableAmount}`;

    const formattedLoan = {
      ...newLoan,
      interestRate: formattedInterestRate,
      serviceFee: formattedServiceFee,
      penaltyFee: formattedPenaltyFee,
      loanableAmount: formattedLoanableAmount,
      membershipFee: formattedMembershipFee,
      maintenanceFee: formattedMaintenanceFee,
    };

    // Update existing loan or create a new one
    if (editingLoan) {
      const updatedLoans = loans.map((l) =>
        l.id === editingLoan.id ? { ...l, ...formattedLoan } : l
      );
      setLoans(updatedLoans);
    } else {
      const newLoanId = loans.length > 0 ? Math.max(...loans.map((l) => l.id)) + 1 : 1;
      setLoans([...loans, { id: newLoanId, ...formattedLoan }]);
    }

    // Reset form state and close modal
    setNewLoan({
      loanType: "",
      interestRate: "",
      loanableAmount: "",
      serviceFee: "",
      penaltyFee: "",
      membershipFee: "",
      maintenanceCycle: "None",
      maintenanceFee: "₱0",
    });
    setEditingLoan(null);
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingLoan(null);
  };

  // ---------------------------------------------------------
  // ARCHIVE TAB: Handlers
  // ---------------------------------------------------------
  const handleArchiveLoan = (loan) => {
    const updatedLoans = loans.filter((item) => item.id !== loan.id);
    setLoans(updatedLoans);

    const today = new Date().toISOString().split("T")[0];
    const archivedLoan = { ...loan, archivedDate: today };
    setArchivedLoans([...archivedLoans, archivedLoan]);
    setActiveTab("archived");
  };

  const handleRestoreLoan = (loan) => {
    const updatedArchived = archivedLoans.filter((item) => item.id !== loan.id);
    setArchivedLoans(updatedArchived);
    const { archivedDate, ...restoredLoan } = loan;
    setLoans([...loans, restoredLoan]);
    setActiveTab("active");
  };

  const showDeleteConfirmModal = (loan) => {
    setLoanToDelete(loan);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (loanToDelete) {
      const updatedArchived = archivedLoans.filter((item) => item.id !== loanToDelete.id);
      setArchivedLoans(updatedArchived);
      setLoanToDelete(null);
    }
    setIsDeleteModalVisible(false);
  };

  const handleCancelDelete = () => {
    setLoanToDelete(null);
    setIsDeleteModalVisible(false);
  };

  // ---------------------------------------------------------
  // FILTER: Logic + Functions
  // ---------------------------------------------------------
  const handleFilterChange = (option) => {
    setFilterOption(option);
    setSearchTerm("");
  };

  const getFilteredLoans = (loanList) => {
    return loanList.filter((loan) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (filterOption === "loanType") {
        return loan.loanType.toLowerCase().includes(lowerSearchTerm);
      } else if (filterOption === "interestRate") {
        return loan.interestRate.toLowerCase().includes(lowerSearchTerm);
      } else if (filterOption === "loanableAmount") {
        return loan.loanableAmount.toLowerCase().includes(lowerSearchTerm);
      } else if (filterOption === "serviceFee") {
        return loan.serviceFee.toLowerCase().includes(lowerSearchTerm);
      } else if (filterOption === "maintenanceFee") {
        return (loan.maintenanceFee || "").toLowerCase().includes(lowerSearchTerm);
      }
      // All fields search (default)
      return (
        loan.loanType.toLowerCase().includes(lowerSearchTerm) ||
        loan.interestRate.toLowerCase().includes(lowerSearchTerm) ||
        loan.loanableAmount.toLowerCase().includes(lowerSearchTerm) ||
        loan.serviceFee.toLowerCase().includes(lowerSearchTerm) ||
        (loan.penaltyFee || "").toLowerCase().includes(lowerSearchTerm) ||
        (loan.membershipFee || "").toLowerCase().includes(lowerSearchTerm) ||
        (loan.maintenanceCycle || "").toLowerCase().includes(lowerSearchTerm) ||
        (loan.maintenanceFee || "").toLowerCase().includes(lowerSearchTerm)
      );
    });
  };

  const filteredLoans = getFilteredLoans(loans);
  const filteredArchivedLoans = getFilteredLoans(archivedLoans);

  // Get information text based on info type
  const getInfoText = () => {
    switch (infoType) {
      case "maintenance":
        return (
          <div className="space-y-2">
            <p>Loan maintenance includes regular fees that are charged to borrowers to cover the administrative costs of managing their loans.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Maintenance Cycle:</strong> How often the maintenance fee is charged (Monthly, Quarterly, etc.)</li>
              <li><strong>Maintenance Fee:</strong> The amount charged per cycle for loan account administration</li>
            </ul>
            <p>These fees help cover costs related to account management, statement generation, and other administrative tasks.</p>
          </div>
        );
      case "interest":
        return (
          <div className="space-y-2">
            <p>Interest rate is the percentage charged on the principal loan amount for borrowing funds.</p>
            <p>It's typically expressed as an annual percentage rate (APR) and may be fixed or variable depending on the loan type.</p>
          </div>
        );
      case "fees":
        return (
          <div className="space-y-2">
            <p>Various fees associated with loans:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Service Fee:</strong> One-time fee charged when processing the loan</li>
              <li><strong>Penalty Fee:</strong> Additional charge if payments are late or missed</li>
              <li><strong>Membership Fee:</strong> Fee required to become eligible for the loan program</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="p-6 bg-gray-50 ">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Loan Configuration Management</h1>
          <p className="text-gray-600">Configure and manage all loan types and their associated fees</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "active"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Active Loans
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "archived"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Archived Loans
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            {activeTab === "active" && (
              <button
                onClick={handleAddNewLoan}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span>Add Loan Configuration</span>
              </button>
            )}
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  placeholder={filterPlaceholders[filterOption]}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <Filter size={16} />
                </div>
              </div>
              
              <div className="dropdown relative">
                <select
                  value={filterOption}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Fields</option>
                  <option value="loanType">Loan Type</option>
                  <option value="interestRate">Interest Rate</option>
                  <option value="loanableAmount">Loanable Amount</option>
                  <option value="serviceFee">Service Fee</option>
                  <option value="maintenanceFee">Maintenance Fee</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="overflow-x-auto">
            {activeTab === "active" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        Interest Rate
                        <button onClick={() => handleShowInfo("interest")} className="ml-1 text-gray-400 hover:text-blue-500">
                          <Info size={14} />
                        </button>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loanable Amount</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        Fees
                        <button onClick={() => handleShowInfo("fees")} className="ml-1 text-gray-400 hover:text-blue-500">
                          <Info size={14} />
                        </button>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        Maintenance
                        <button onClick={() => handleShowInfo("maintenance")} className="ml-1 text-gray-400 hover:text-blue-500">
                          <Info size={14} />
                        </button>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{loan.loanType}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <Percent size={14} className="mr-1" />
                            {loan.interestRate}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign size={16} className="text-gray-500 mr-1" />
                            <span className="text-gray-900">{loan.loanableAmount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            <div><span className="font-medium">Service:</span> {loan.serviceFee}</div>
                            <div><span className="font-medium">Penalty:</span> {loan.penaltyFee}</div>
                            <div><span className="font-medium">Membership:</span> {loan.membershipFee}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            <div><span className="font-medium">Cycle:</span> {loan.maintenanceCycle || "None"}</div>
                            <div><span className="font-medium">Fee:</span> {loan.maintenanceFee || "₱0"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditLoan(loan)}
                              className="p-1.5 bg-blue-50 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleArchiveLoan(loan)}
                              className="p-1.5 bg-amber-50 rounded-md text-amber-600 hover:bg-amber-100 transition-colors"
                              title="Archive"
                            >
                              <Archive size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <AlertCircle size={36} className="text-gray-400 mb-2" />
                          <p>No loan configurations found matching your search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "archived" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        Archived Date
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArchivedLoans.length > 0 ? (
                    filteredArchivedLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{loan.loanType}</div>
                          <div className="text-sm text-gray-500">{loan.loanableAmount}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-gray-900">{loan.interestRate}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            <div><span className="font-medium">Service:</span> {loan.serviceFee}</div>
                            <div><span className="font-medium">Penalty:</span> {loan.penaltyFee}</div>
                            <div><span className="font-medium">Membership:</span> {loan.membershipFee}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            <div><span className="font-medium">Cycle:</span> {loan.maintenanceCycle || "None"}</div>
                            <div><span className="font-medium">Fee:</span> {loan.maintenanceFee || "₱0"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {loan.archivedDate}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleRestoreLoan(loan)}
                              className="p-1.5 bg-green-50 rounded-md text-green-600 hover:bg-green-100 transition-colors"
                              title="Restore"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button
                              onClick={() => showDeleteConfirmModal(loan)}
                              className="p-1.5 bg-red-50 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete Permanently"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Archive size={36} className="text-gray-400 mb-2" />
                          <p>No archived loan configurations found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Loan Configuration Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLoan ? "Edit Loan Configuration" : "Add New Loan Configuration"}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Loan Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
                <input
                  type="text"
                  placeholder="Enter loan type"
                  value={newLoan.loanType}
                  onChange={(e) => setNewLoan({ ...newLoan, loanType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    Interest Rate
                    <button
                      type="button"
                      onClick={() => handleShowInfo("interest")}
                      className="ml-1 text-gray-400 hover:text-blue-500"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="Enter interest rate (e.g., 2% or N/A)"
                  value={newLoan.interestRate}
                  onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Example: 1.75%, 2%, 3.5% or N/A</p>
              </div>
              
              {/* Loanable Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loanable Amount</label>
                <input
                  type="text"
                  placeholder="Enter maximum loanable amount (e.g., ₱10,000)"
                  value={newLoan.loanableAmount}
                  onChange={(e) => setNewLoan({ ...newLoan, loanableAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">This defines the maximum amount the member can borrow.</p>
              </div>
              
              {/* Service Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Fee</label>
                <input
                  type="text"
                  placeholder="Enter service fee (e.g., 3% or N/A)"
                  value={newLoan.serviceFee}
                  onChange={(e) => setNewLoan({ ...newLoan, serviceFee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Example: 1.2%, 3%, 5% or N/A</p>
              </div>
              
              {/* Penalty Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Fee</label>
                <input
                  type="text"
                  placeholder="Enter penalty fee (e.g., 2%)"
                  value={newLoan.penaltyFee}
                  onChange={(e) => setNewLoan({ ...newLoan, penaltyFee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Example: 2% per month penalty for late payments</p>
              </div>
              
              {/* Membership Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Fee</label>
                <input
                  type="text"
                  placeholder="Enter membership fee (e.g., 200)"
                  value={newLoan.membershipFee}
                  onChange={(e) => setNewLoan({ ...newLoan, membershipFee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Example: ₱200 for new members</p>
              </div>
              
              {/* Maintenance Section */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Loan Maintenance</h4>
                  <button
                    type="button"
                    onClick={() => handleShowInfo("maintenance")}
                    className="ml-1 text-gray-400 hover:text-blue-500"
                  >
                    <Info size={14} />
                  </button>
                </div>
                
                {/* Maintenance Cycle */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Cycle</label>
                  <select
                    value={newLoan.maintenanceCycle}
                    onChange={(e) => setNewLoan({ ...newLoan, maintenanceCycle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {maintenanceCycleOptions.map((cycle) => (
                      <option key={cycle} value={cycle}>
                        {cycle}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Maintenance Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Fee</label>
                  <input
                    type="text"
                    placeholder="Enter maintenance fee (e.g., ₱50)"
                    value={newLoan.maintenanceFee}
                    onChange={(e) => setNewLoan({ ...newLoan, maintenanceFee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={newLoan.maintenanceCycle === "None"}
                  />
                  <p className="mt-1 text-xs text-gray-500">Regular fee charged to maintain the loan account</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleModalCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalOk}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Information Modal */}
      {isInfoModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {infoType === "maintenance" && "Loan Maintenance Information"}
                {infoType === "interest" && "Interest Rate Information"}
                {infoType === "fees" && "Loan Fees Information"}
              </h3>
              <button
                onClick={() => setIsInfoModalVisible(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">{getInfoText()}</div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInfoModalVisible(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Loan Configuration</h3>
              <p className="text-center text-gray-500">
                Are you sure you want to permanently delete the "{loanToDelete?.loanType}" loan configuration?
              </p>
              <p className="mt-2 text-center text-red-500 text-sm">This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanModule;