import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";

// Define the tabs for different maintenance sections
const tabs = [
  { label: "Member Management", key: "member" },
  { label: "Savings & Deposits", key: "savings" },
  { label: "Loan Management", key: "loan" },
  { label: "Transaction Policies", key: "transaction" },
  { label: "System Logs & Audit", key: "logs" },
  { label: "Backup & Restore", key: "backup" },
];

// Initial static values for each section
const initialValues = {
  member: {
    defaultEmail: "contact@cooperative.org",
    defaultPhone: "(123) 456-7890",
    classifications: "Regular, Associate",
  },
  savings: {
    regularSavingsInterest: 2.0,
    timeDepositInterest: 5.0,
    timeDepositTerm: "6 months",
    shareCapitalMinBalance: 1000,
    dividendRate: 3.0,
  },
  loan: {
    loanInterestRate: 10.5,
    repaymentTerm: 12,
    latePaymentPenalty: 1.0,
    processingFee: 2.0,
  },
  transaction: {
    savingsWithdrawalLimit: 5000,
    timeDepositWithdrawal: "Not allowed before maturity",
    minimumMaintainingBalance: 100,
    serviceFee: 50,
  },
  logs: {
    lastUpdate: "2025-03-20 14:00",
    auditNote: "All user activities are logged for compliance.",
  },
  backup: {
    lastBackup: "2025-03-20 10:00 AM",
    restoreInstructions:
      "In case of system failure, contact IT support to initiate a restore.",
  },
};

const Maintenance = () => {
  const [selectedTab, setSelectedTab] = useState("member");
  const [values, setValues] = useState(initialValues);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(values[selectedTab]);

  // When switching tabs, update local formData and disable edit mode.
  const handleTabChange = (key) => {
    setSelectedTab(key);
    setFormData(values[key]);
    setEditMode(false);
  };

  // Handle input changes for active tab's form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes to local state
  const handleSaveChanges = () => {
    setValues((prev) => ({ ...prev, [selectedTab]: formData }));
    setEditMode(false);
  };

  // Render content based on selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case "member":
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium">Default Contact Email</label>
              <input
                type="email"
                name="defaultEmail"
                value={formData.defaultEmail}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Default Phone Number</label>
              <input
                type="text"
                name="defaultPhone"
                value={formData.defaultPhone}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Membership Classifications</label>
              <input
                type="text"
                name="classifications"
                value={formData.classifications}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
          </div>
        );
      case "savings":
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium">Regular Savings Interest Rate (%)</label>
              <input
                type="number"
                name="regularSavingsInterest"
                value={formData.regularSavingsInterest}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Time Deposit Interest Rate (%)</label>
              <input
                type="number"
                name="timeDepositInterest"
                value={formData.timeDepositInterest}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Time Deposit Term</label>
              <input
                type="text"
                name="timeDepositTerm"
                value={formData.timeDepositTerm}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Share Capital Minimum Balance</label>
              <input
                type="number"
                name="shareCapitalMinBalance"
                value={formData.shareCapitalMinBalance}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Dividend Rate (%)</label>
              <input
                type="number"
                name="dividendRate"
                value={formData.dividendRate}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
          </div>
        );
      case "loan":
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium">Loan Interest Rate (%)</label>
              <input
                type="number"
                name="loanInterestRate"
                value={formData.loanInterestRate}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Repayment Term (months)</label>
              <input
                type="number"
                name="repaymentTerm"
                value={formData.repaymentTerm}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Late Payment Penalty (%)</label>
              <input
                type="number"
                name="latePaymentPenalty"
                value={formData.latePaymentPenalty}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Processing Fee (%)</label>
              <input
                type="number"
                name="processingFee"
                value={formData.processingFee}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
          </div>
        );
      case "transaction":
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium">Savings Withdrawal Limit (PHP)</label>
              <input
                type="number"
                name="savingsWithdrawalLimit"
                value={formData.savingsWithdrawalLimit}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Time Deposit Withdrawal Policy</label>
              <input
                type="text"
                name="timeDepositWithdrawal"
                value={formData.timeDepositWithdrawal}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Minimum Maintaining Balance (PHP)</label>
              <input
                type="number"
                name="minimumMaintainingBalance"
                value={formData.minimumMaintainingBalance}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block font-medium">Service Fee per Transaction (PHP)</label>
              <input
                type="number"
                name="serviceFee"
                value={formData.serviceFee}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`w-full border rounded px-3 py-2 ${
                  editMode ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>
          </div>
        );
      case "logs":
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium">Last Update</label>
              <input
                type="text"
                name="lastUpdate"
                value={formData.lastUpdate || "2025-03-20 14:00"}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block font-medium">Audit Note</label>
              <textarea
                name="auditNote"
                value={formData.auditNote || "All user activities are logged for compliance."}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>
        );
      case "backup":
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium">Last Backup</label>
              <input
                type="text"
                name="lastBackup"
                value={formData.lastBackup || "2025-03-20 10:00 AM"}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block font-medium">Restore Instructions</label>
              <textarea
                name="restoreInstructions"
                value={
                  formData.restoreInstructions ||
                  "Contact IT support to initiate data restore."
                }
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        System Maintenance Module
      </h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center mb-6 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded ${
              selectedTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {tabs.find((t) => t.key === selectedTab)?.label}
        </h2>
        {renderContent()}
      </div>

      {/* Edit / Save Controls (only for editable sections) */}
      {selectedTab !== "logs" && selectedTab !== "backup" && (
        <div className="flex justify-end">
          {editMode ? (
            <>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(values[selectedTab]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Maintenance;
