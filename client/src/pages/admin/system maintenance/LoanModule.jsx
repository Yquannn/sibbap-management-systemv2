import React, { useState } from "react";
import { Modal, Dropdown, Select, Tabs, message } from "antd";
import { HiOutlineFilter, HiOutlineClock, HiOutlineUser } from "react-icons/hi";
import { MdEdit, MdArchive, MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TabPane } = Tabs;

// Added validation rules
const VALIDATION_RULES = {
  loanType: (value) => !!value || "Loan Type is required",
  interestRate: (value) => !!value || "Interest Rate is required",
  loanableAmount: (value) => !!value || "Loanable Amount is required",
  serviceFee: (value) => !!value || "Service Fee is required",
};

// Enhanced loan types with more details
const LOAN_TYPES = [
  {
    value: "Personal Loan",
    description: "Short-term loan for personal expenses",
    maxTerm: 36,
    requirements: ["Valid ID", "Proof of Income", "Bank Statement"],
  },
  {
    value: "Housing Loan",
    description: "Long-term loan for home purchase or construction",
    maxTerm: 300,
    requirements: ["Property Documents", "Income Tax Returns", "Employment Certificate"],
  },
  // ... other loan types remain the same
];

const LoanModule = () => {
  const navigate = useNavigate();
  
  // Sample data for loan configurations
  const [loans, setLoans] = useState([
    {
      id: 1,
      loanType: "Personal Loan",
      interestRate: "1.75%",
      loanableAmount: "₱50,000",
      serviceFee: "3%",
    },
    {
      id: 2,
      loanType: "Housing Loan",
      interestRate: "3.5%",
      loanableAmount: "₱1,000,000",
      serviceFee: "1.2%",
    },
  ]);

  // State for managing modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [newLoan, setNewLoan] = useState({
    loanType: "",
    interestRate: "",
    loanableAmount: "",
    serviceFee: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("loanType");
  const filterPlaceholders = {
    loanType: "Search by loan type...",
    interestRate: "Search by interest rate...",
    loanableAmount: "Search by loanable amount...",
    serviceFee: "Search by service fee...",
  };

  // Filter loans based on search term and filter option
  const filteredLoans = loans.filter((loan) => {
    return loan[filterOption]
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  // Handler for adding new loan
  const handleAddNewLoan = () => {
    setEditingLoan(null);
    setNewLoan({
      loanType: "",
      interestRate: "",
      loanableAmount: "",
      serviceFee: "",
    });
    setValidationErrors({});
    setIsModalVisible(true);
  };

  // Handler for editing loan
  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setNewLoan({ ...loan });
    setValidationErrors({});
    setIsModalVisible(true);
  };

  // Handler for archiving loan
  const handleArchive = (loan) => {
    Modal.confirm({
      title: "Archive Loan Configuration",
      content: `Are you sure you want to archive ${loan.loanType}?`,
      onOk() {
        setLoans(loans.filter((item) => item.id !== loan.id));
        message.success("Loan configuration archived successfully");
      },
    });
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    for (const [key, validator] of Object.entries(VALIDATION_RULES)) {
      const result = validator(newLoan[key]);
      if (result !== true) {
        errors[key] = result;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler for modal OK button
  const handleModalOk = () => {
    if (!validateForm()) {
      return;
    }

    if (editingLoan) {
      // Update existing loan
      setLoans(
        loans.map((loan) =>
          loan.id === editingLoan.id ? { ...newLoan, id: loan.id } : loan
        )
      );
      message.success("Loan configuration updated successfully");
    } else {
      // Add new loan
      setLoans([...loans, { ...newLoan, id: Date.now() }]);
      message.success("Loan configuration added successfully");
    }
    setIsModalVisible(false);
  };

  // Handler for modal cancel button
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Filter menu items
  const filterItems = [
    {
      key: "loanType",
      label: "Loan Type",
    },
    {
      key: "interestRate",
      label: "Interest Rate",
    },
    {
      key: "loanableAmount",
      label: "Loanable Amount",
    },
    {
      key: "serviceFee",
      label: "Service Fee",
    },
  ];

  // Filter menu component
  const filterMenu = (
    <div className="bg-white shadow-lg rounded-md p-2 w-48">
      {filterItems.map((item) => (
        <div
          key={item.key}
          className={`px-4 py-2 cursor-pointer rounded-md ${
            filterOption === item.key ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
          }`}
          onClick={() => setFilterOption(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Date/Time and User Info */}
      <div className="mb-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <HiOutlineClock className="mr-2" />
            <span className="text-sm">2025-04-09 15:35:16 UTC</span>
          </div>
          <div className="flex items-center text-gray-600">
            <HiOutlineUser className="mr-2" />
            <span className="text-sm">Yquannn</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md">
        <Tabs 
          defaultActiveKey="1"
          className="p-4"
          tabBarStyle={{
            marginBottom: '16px',
          }}
        >
          <TabPane tab="Loan Type" key="1">
            {/* Action Buttons and Search */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleAddNewLoan}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                <MdAdd className="mr-2" />
                Add New Loan Configuration
              </button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={filterPlaceholders[filterOption]}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Dropdown overlay={filterMenu} trigger={["click"]}>
                  <button className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
                    <HiOutlineFilter className="text-gray-600 text-xl" />
                  </button>
                </Dropdown>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loanable Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.loanType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.interestRate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.loanableAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.serviceFee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditLoan(loan)}
                          className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2 transition-colors duration-200"
                        >
                          <MdEdit className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchive(loan)}
                          className="inline-flex items-center px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200"
                        >
                          <MdArchive className="mr-1" />
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPane>

          <TabPane tab="Dropdown Manager" key="2">
            {/* Content for Dropdown Manager */}
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">Dropdown Manager Content</h3>
              {/* Add your dropdown manager content here */}
            </div>
          </TabPane>

          <TabPane tab="Archive" key="3">
            {/* Content for Archive */}
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">Archive Content</h3>
              {/* Add your archive content here */}
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* Modal */}
      <Modal
        title={editingLoan ? "Edit Loan Configuration" : "Add New Loan Configuration"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save"
        cancelText="Cancel"
        className="rounded-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Type
            </label>
            <Select
              placeholder="Select loan type"
              className="w-full"
              value={newLoan.loanType}
              onChange={(value) => setNewLoan({ ...newLoan, loanType: value })}
              status={validationErrors.loanType ? "error" : ""}
            >
              {LOAN_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.value}
                </Option>
              ))}
            </Select>
            {validationErrors.loanType && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.loanType}</p>
            )}
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate
            </label>
            <Select
              placeholder="Select interest rate"
              className="w-full"
              value={newLoan.interestRate}
              onChange={(value) => setNewLoan({ ...newLoan, interestRate: value })}
              status={validationErrors.interestRate ? "error" : ""}
            >
              <Option value="1.75%">1.75%</Option>
              <Option value="2%">2%</Option>
              <Option value="3.5%">3.5%</Option>
            </Select>
            {validationErrors.interestRate && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.interestRate}</p>
            )}
          </div>

          {/* Loanable Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loanable Amount
            </label>
            <Select
              placeholder="Select loanable amount"
              className="w-full"
              value={newLoan.loanableAmount}
              onChange={(value) => setNewLoan({ ...newLoan, loanableAmount: value })}
              status={validationErrors.loanableAmount ? "error" : ""}
            >
              <Option value="₱5,000">₱5,000</Option>
              <Option value="₱10,000">₱10,000</Option>
              <Option value="₱50,000">₱50,000</Option>
              <Option value="₱100,000">₱100,000</Option>
              <Option value="₱200,000">₱200,000</Option>
              <Option value="₱1,000,000">₱1,000,000</Option>
            </Select>
            {validationErrors.loanableAmount && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.loanableAmount}</p>
            )}
          </div>

          {/* Service Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Fee
            </label>
            <Select
              placeholder="Select service fee"
              className="w-full"
              value={newLoan.serviceFee}
              onChange={(value) => setNewLoan({ ...newLoan, serviceFee: value })}
              status={validationErrors.serviceFee ? "error" : ""}
            >
              <Option value="3%">3%</Option>
              <Option value="1.2%">1.2%</Option>
              <Option value="5%">5%</Option>
            </Select>
            {validationErrors.serviceFee && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.serviceFee}</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoanModule;