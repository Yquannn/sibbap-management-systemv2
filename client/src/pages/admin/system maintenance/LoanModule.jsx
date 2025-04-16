import React, { useState } from "react";
import { Modal, Dropdown, Menu, Tabs, Input, Button } from "antd";
import { HiOutlineFilter } from "react-icons/hi";
import { 
  Plus, Archive as LucideArchive, Edit, Trash2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

// --- DUMMY DATA -----------------------------------------------------
const dummyLoans = [
  { id: 1, loanType: "Personal Loan", interestRate: "2%", loanableAmount: "₱10,000", serviceFee: "3%", penaltyFee: "2%", membershipFee: "₱200" },
  { id: 2, loanType: "Housing Loan", interestRate: "1.75%", loanableAmount: "₱200,000", serviceFee: "1.2%", penaltyFee: "2%", membershipFee: "₱500" },
  { id: 3, loanType: "Car Loan", interestRate: "1.75%", loanableAmount: "₱50,000", serviceFee: "1.2%", penaltyFee: "2%", membershipFee: "₱300" },
  { id: 4, loanType: "Salary Loan", interestRate: "2%", loanableAmount: "₱5,000", serviceFee: "3%", penaltyFee: "2%", membershipFee: "₱150" },
  { id: 5, loanType: "Mortgage Loan", interestRate: "1.75%", loanableAmount: "₱1,000,000", serviceFee: "1.2%", penaltyFee: "2%", membershipFee: "₱700" },
  { id: 6, loanType: "OFW Assistance Loan", interestRate: "2%", loanableAmount: "₱200,000", serviceFee: "5%", penaltyFee: "2%", membershipFee: "₱400" },
  { id: 7, loanType: "Agriculture Loan", interestRate: "3.5%", loanableAmount: "₱100,000", serviceFee: "3%", penaltyFee: "2%", membershipFee: "₱250" },
  { id: 8, loanType: "Educational Loan", interestRate: "1.75%", loanableAmount: "₱50,000", serviceFee: "5%", penaltyFee: "2%", membershipFee: "₱180" },
];

const dummyArchivedLoans = [
  { id: 9, loanType: "Emergency Loan", interestRate: "4%", loanableAmount: "₱15,000", serviceFee: "2.5%", penaltyFee: "2%", archivedDate: "2025-03-15", membershipFee: "₱250" },
  { id: 10, loanType: "Business Loan", interestRate: "3%", loanableAmount: "₱500,000", serviceFee: "2%", penaltyFee: "2%", archivedDate: "2025-02-28", membershipFee: "₱600" },
  { id: 11, loanType: "Medical Loan", interestRate: "1.5%", loanableAmount: "₱75,000", serviceFee: "1%", penaltyFee: "2%", archivedDate: "2025-03-01", membershipFee: "₱400" },
  { id: 12, loanType: "Calamity Loan", interestRate: "1%", loanableAmount: "₱25,000", serviceFee: "0.5%", penaltyFee: "2%", archivedDate: "2025-01-20", membershipFee: "₱100" },
];

// Sample dropdown data remains unchanged
const filterPlaceholders = {
  all: "Search loans...",
  loanType: "Search by Loan Type...",
  interestRate: "Search by Interest Rate...",
  loanableAmount: "Search by Loanable Amount...",
  serviceFee: "Search by Service Fee...",
};

const LoanModule = () => {
  // LOANS + ARCHIVE states
  const [loans, setLoans] = useState(dummyLoans);
  const [archivedLoans, setArchivedLoans] = useState(dummyArchivedLoans);

  // Add/Edit Loan Modal (includes penaltyFee and membershipFee)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [newLoan, setNewLoan] = useState({
    loanType: "",
    interestRate: "",
    loanableAmount: "",
    serviceFee: "",
    penaltyFee: "",
    membershipFee: "",
  });

  // Delete Confirmation Modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);

  // Tab / Filter states
  const [activeTab, setActiveTab] = useState("1");
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
    });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    // Ensure the membershipFee always has a peso sign
    const formattedMembershipFee = newLoan.membershipFee.startsWith("₱") 
        ? newLoan.membershipFee
        : `₱${newLoan.membershipFee}`;

    // Now, format other fields similarly as done previously
    let formattedInterestRate;
    if (newLoan.interestRate.trim().toUpperCase() === "N/A") {
      formattedInterestRate = "N/A";
    } else if (newLoan.interestRate.includes("%")) {
      formattedInterestRate = newLoan.interestRate;
    } else {
      formattedInterestRate = newLoan.interestRate + "%";
    }

    let formattedServiceFee;
    if (newLoan.serviceFee.trim().toUpperCase() === "N/A") {
      formattedServiceFee = "N/A";
    } else if (newLoan.serviceFee.includes("%")) {
      formattedServiceFee = newLoan.serviceFee;
    } else {
      formattedServiceFee = newLoan.serviceFee + "%";
    }

    let formattedPenaltyFee = newLoan.penaltyFee.includes("%")
      ? newLoan.penaltyFee
      : newLoan.penaltyFee + "%";

    let formattedLoanableAmount = newLoan.loanableAmount.includes("₱")
      ? newLoan.loanableAmount
      : "₱" + newLoan.loanableAmount;

    const formattedLoan = {
      ...newLoan,
      interestRate: formattedInterestRate,
      serviceFee: formattedServiceFee,
      penaltyFee: formattedPenaltyFee,
      loanableAmount: formattedLoanableAmount,
      membershipFee: formattedMembershipFee // Ensure the membership fee has the peso sign
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
      membershipFee: "", // Reset membership fee too
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
    setActiveTab("3");
  };

  const handleRestoreLoan = (loan) => {
    const updatedArchived = archivedLoans.filter((item) => item.id !== loan.id);
    setArchivedLoans(updatedArchived);
    const { archivedDate, ...restoredLoan } = loan;
    setLoans([...loans, restoredLoan]);
    setActiveTab("1");
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
  // FILTER: Logic + Menu
  // ---------------------------------------------------------
  const filterMenu = (
    <Menu
      onClick={(e) => {
        setFilterOption(e.key);
        setSearchTerm("");
      }}
    >
      <Menu.Item key="all">All</Menu.Item>
      <Menu.Item key="loanType">Loan Type</Menu.Item>
      <Menu.Item key="interestRate">Interest Rate</Menu.Item>
      <Menu.Item key="loanableAmount">Loanable Amount</Menu.Item>
      <Menu.Item key="serviceFee">Service Fee</Menu.Item>
    </Menu>
  );

  const filteredLoans = loans.filter((loan) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (filterOption === "loanType") {
      return loan.loanType.toLowerCase().includes(lowerSearchTerm);
    } else if (filterOption === "interestRate") {
      return loan.interestRate.toLowerCase().includes(lowerSearchTerm);
    } else if (filterOption === "loanableAmount") {
      return loan.loanableAmount.toLowerCase().includes(lowerSearchTerm);
    } else if (filterOption === "serviceFee") {
      return loan.serviceFee.toLowerCase().includes(lowerSearchTerm);
    }
    return (
      loan.loanType.toLowerCase().includes(lowerSearchTerm) ||
      loan.interestRate.toLowerCase().includes(lowerSearchTerm) ||
      loan.loanableAmount.toLowerCase().includes(lowerSearchTerm) ||
      loan.serviceFee.toLowerCase().includes(lowerSearchTerm) ||
      (loan.penaltyFee || "").toLowerCase().includes(lowerSearchTerm)
    );
  });

  const filteredArchivedLoans = archivedLoans.filter((loan) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (filterOption === "loanType") {
      return loan.loanType.toLowerCase().includes(lowerSearchTerm);
    } else if (filterOption === "interestRate") {
      return loan.interestRate.toLowerCase().includes(lowerSearchTerm);
    } else if (filterOption === "loanableAmount") {
      return loan.loanableAmount.toLowerCase().includes(lowerSearchTerm);
    } else if (filterOption === "serviceFee") {
      return loan.serviceFee.toLowerCase().includes(lowerSearchTerm);
    }
    return (
      loan.loanType.toLowerCase().includes(lowerSearchTerm) ||
      loan.interestRate.toLowerCase().includes(lowerSearchTerm) ||
      loan.loanableAmount.toLowerCase().includes(lowerSearchTerm) ||
      loan.serviceFee.toLowerCase().includes(lowerSearchTerm) ||
      (loan.penaltyFee || "").toLowerCase().includes(lowerSearchTerm)
    );
  });

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="p-6 space-y-4">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{
          fontWeight: "bold",
          fontSize: "14px",
          color: "#4A90E2",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        {/* TAB 1: Loan Type */}
        <TabPane tab="Loan Type" key="1">
          <div className="flex items-center justify-between">
            <button
              onClick={handleAddNewLoan}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add New Loan Configuration
            </button>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={filterPlaceholders[filterOption]}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <Dropdown overlay={filterMenu} trigger={["click"]}>
                <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  <HiOutlineFilter size={20} />
                </button>
              </Dropdown>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white border rounded shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b font-bold text-[#4A90E2]">Loan Type</th>
                  <th className="py-2 px-4 border-b font-bold text-[#4A90E2] text-center">Interest Rate</th>
                  <th className="py-2 px-4 border-b font-bold text-[#4A90E2]">Loanable Amount</th>
                  <th className="py-2 px-4 border-b font-bold text-[#4A90E2]">Service Fee</th>
                  <th className="py-2 px-4 border-b font-bold text-[#4A90E2]">Penalty Fee</th>
                  <th className="py-2 px-4 border-b font-bold text-[#4A90E2]">Membership Fee</th>
                  <th className="py-2 px-4 border-b font-bold text-[#4A90E2]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{loan.loanType}</td>
                    <td className="py-2 px-4 border-b text-center">{loan.interestRate}</td>
                    <td className="py-2 px-4 border-b">{loan.loanableAmount}</td>
                    <td className="py-2 px-4 border-b">{loan.serviceFee}</td>
                    <td className="py-2 px-4 border-b">{loan.penaltyFee}</td>
                    <td className="py-2 px-4 border-b">{loan.membershipFee}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleEditLoan(loan)}
                        className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchiveLoan(loan)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabPane>

        {/* TAB 3: Archive */}
        <TabPane tab="Archive" key="3">
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white border rounded shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left font-bold text-[#4A90E2]">Loan Type</th>
                  <th className="py-2 px-4 border-b text-left font-bold text-[#4A90E2]">Interest Rate</th>
                  <th className="py-2 px-4 border-b text-left font-bold text-[#4A90E2]">Loanable Amount</th>
                  <th className="py-2 px-4 border-b text-left font-bold text-[#4A90E2]">Service Fee</th>
                  <th className="py-2 px-4 border-b text-left font-bold text-[#4A90E2]">Penalty Fee</th>
                  <th className="py-2 px-4 border-b text-left font-bold text-[#4A90E2]">Membership Fee</th>
                  <th className="py-2 px-4 border-b text-left font-bold text-[#4A90E2]">Archived Date</th>
                  <th className="py-2 px-4 border-b text-left font-bold text-[#4A90E2]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArchivedLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{loan.loanType}</td>
                    <td className="py-2 px-4 border-b">{loan.interestRate}</td>
                    <td className="py-2 px-4 border-b">{loan.loanableAmount}</td>
                    <td className="py-2 px-4 border-b">{loan.serviceFee}</td>
                    <td className="py-2 px-4 border-b">{loan.penaltyFee}</td>
                    <td className="py-2 px-4 border-b">{loan.membershipFee}</td>
                    <td className="py-2 px-4 border-b">{loan.archivedDate}</td>
                    <td className="py-2 px-4 border-b flex space-x-2">
                      <button
                        onClick={() => handleRestoreLoan(loan)}
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => showDeleteConfirmModal(loan)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Delete Permanently
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabPane>
      </Tabs>

      {/* MODAL: Add/Edit Loan Configuration */}
      <Modal
        title={editingLoan ? "Edit Loan Configuration" : "Add New Loan Configuration"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loan Type</label>
            <Input
              placeholder="Enter loan type"
              value={newLoan.loanType}
              onChange={(e) => setNewLoan({ ...newLoan, loanType: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Interest Rate</label>
            <Input
              placeholder="Enter interest rate (e.g., 2% or N/A)"
              value={newLoan.interestRate}
              onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <small className="text-gray-500">Example: 1.75%, 2%, 3.5% or N/A</small>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loanable Amount</label>
            <Input
              placeholder="Enter maximum loanable amount (e.g., ₱10,000)"
              value={newLoan.loanableAmount}
              onChange={(e) => setNewLoan({ ...newLoan, loanableAmount: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <small className="text-gray-500">
              This defines the maximum amount the member can borrow.
            </small>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Service Fee</label>
            <Input
              placeholder="Enter service fee (e.g., 3% or N/A)"
              value={newLoan.serviceFee}
              onChange={(e) => setNewLoan({ ...newLoan, serviceFee: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <small className="text-gray-500">Example: 1.2%, 3%, 5% or N/A</small>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Penalty Fee</label>
            <Input
              placeholder="Enter penalty fee (e.g., 2%)"
              value={newLoan.penaltyFee}
              onChange={(e) => setNewLoan({ ...newLoan, penaltyFee: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <small className="text-gray-500">
              Example: 2% per month penalty for late payments
            </small>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Membership Fee</label>
            <Input
  placeholder="Enter membership fee (e.g., 200)"
  value={newLoan.membershipFee}
  onChange={(e) => setNewLoan({ ...newLoan, membershipFee: e.target.value })}
  className="w-full border rounded px-3 py-2"
/>

            <small className="text-gray-500">Example: ₱200 for new members</small>
          </div>
        </div>
      </Modal>

      {/* MODAL: Delete Loan Confirmation */}
      <Modal
        title="Delete Loan Configuration"
        visible={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: "#f44336", borderColor: "#f44336" } }}
      >
        <p>
          Are you sure you want to permanently delete the "{loanToDelete?.loanType}" loan configuration?
        </p>
        <p className="mt-2 text-red-500">This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default LoanModule;
