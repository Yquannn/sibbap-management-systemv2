import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import success from "../../components/Success";

// 1) IMPORT THE CHART COMPONENTS (if you still need them elsewhere)
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// REGISTER CHART.JS COMPONENTS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ------------------ SUCCESS COMPONENT ------------------
const SuccessComponent = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white w-full max-w-md rounded shadow-lg p-6 relative flex flex-col items-center">
      <img src={success} alt="Success" className="w-16 h-16 mb-4" />
      <h2 className="text-xl font-bold mb-4 text-green-600">{message}</h2>
      <button
        onClick={onClose}
        className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
      >
        Close
      </button>
    </div>
  </div>
);

const MemberProfilePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notification states
  const [activationLoading, setActivationLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [message, setMessage] = useState("");

  // Modal control for "View All Information" and Add Transaction
  const [showAllInfoModal, setShowAllInfoModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // State for tabs – one of: Documents, Beneficiaries, Account Info, Loan History, Share Capital, Purchase History
  const [activeTab, setActiveTab] = useState("Documents");

  // Define an array of background color classes for fallback avatar
  const bgColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ];

  // Helper to compute a consistent background color based on member's unique id
  const getMemberFallbackColor = (m) => {
    const idString = m?.memberId
      ? String(m.memberId)
      : `${m.first_name || ""}${m.last_name || ""}`;
    let hash = 0;
    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgColors.length;
    return bgColors[index];
  };

  // Helper to build an image URL
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch the member data from your API
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/member-info/${memberId}`
        );
        // Use fetched member data; your backend already returns nested arrays
        const memberData = { ...response.data };
        setMember(memberData);
      } catch (error) {
        console.error("Error fetching member data:", error);
        setMessage("Error fetching member data.");
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMember();
    } else {
      setMessage("Member ID is missing!");
      setLoading(false);
    }
  }, [memberId]);

  if (loading) return <p className="p-8 text-xl">Loading...</p>;
  if (!member) return <p className="p-8 text-xl">{message}</p>;

  // For showing messages from modal updates
  const handleModalMessage = (type, text) => {
    setMessageType(type);
    setMessage(text);
    setShowMessage(true);
  };

  // When the modal saves updated data, update our main "member" state
  const handleUpdateMember = (updated) => {
    setMember(updated);
  };

  // When a new transaction is added, update the member's purchase history
  const handleAddTransaction = (newTransaction) => {
    setMember((prev) => ({
      ...prev,
      purchase_history: [...(prev.purchase_history || []), newTransaction],
    }));
  };

  // ------------------ BASIC INFO SECTION ------------------
  const BasicInfoSection = () => {
    return (
      <div className="flex items-start rounded-xl shadow-md p-4 bg-white">
        {/* Left: Avatar */}
        <div className="w-56 h-56 mr-4">
          {member.id_picture ? (
            <img
              src={imageUrl(member.id_picture)}
              alt="Profile"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div
              className={`w-full h-full rounded-full flex items-center justify-center ${getMemberFallbackColor(
                member
              )}`}
            >
              <span className="text-white text-6xl font-bold">
                {member.first_name?.charAt(0)}
                {member.last_name?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex-1 leading-relaxed">
          <div className="mb-2">
            <span className="bg-green-800 text-white text-xs px-2 py-1 rounded-full">
              {member.member_type}
            </span>
            <h2 className="text-xl font-bold text-gray-800 mt-1">
              {member.first_name} {member.last_name} {member.middle_name}
            </h2>
            <h4 className="text-lg font-bold text-gray-600 mt-1">
              {member.memberCode}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-semibold">Address:</span>{" "}
                <span className="max-w-xs break-words">
                  {member.house_no_street} {member.barangay}, {member.city}
                </span>
              </p>
              <p>
                <span className="font-semibold">Age:</span>{" "}
                {member.age || "N/A"}
              </p>
              <p>
                <span className="font-semibold">DOB:</span>{" "}
                {member.date_of_birth ? formatDate(member.date_of_birth) : "N/A"}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-semibold">Contact Number:</span>{" "}
                {member.contact_number || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Civil Status:</span>{" "}
                {member.civil_status || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Registered on:</span>{" "}
                {member.registration_date
                  ? formatDate(member.registration_date)
                  : "N/A"}
              </p>
            </div>
          </div>

          <button
            className="mt-3 border border-green-600 text-green-600 px-4 py-1 rounded-full hover:bg-green-50 text-sm"
            onClick={() => setShowAllInfoModal(true)}
          >
            Edit profile
          </button>
        </div>
      </div>
    );
  };

  // ------------------ DOCUMENTS SECTION ------------------
  const DocumentsSection = () => {
    const [showDocs, setShowDocs] = useState(false);
    return (
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Documents</h3>
        <button
          onClick={() => setShowDocs(!showDocs)}
          className="mb-4 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm"
        >
          {showDocs ? "Hide Documents" : "View Documents"}
        </button>
        {showDocs && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {member.id_picture && (
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  ID Picture
                </p>
                <a
                  href={imageUrl(member.id_picture)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={imageUrl(member.id_picture)}
                    alt="ID"
                    className="w-32 h-32 object-cover rounded shadow hover:opacity-80 transition"
                  />
                </a>
              </div>
            )}
            {member.barangay_clearance && (
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Barangay Clearance
                </p>
                <a
                  href={imageUrl(member.barangay_clearance)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={imageUrl(member.barangay_clearance)}
                    alt="Barangay Clearance"
                    className="w-32 h-32 object-cover rounded shadow hover:opacity-80 transition"
                  />
                </a>
              </div>
            )}
            {member.tax_identification_id && (
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  TIN Document
                </p>
                <a
                  href={imageUrl(member.tax_identification_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={imageUrl(member.tax_identification_id)}
                    alt="TIN"
                    className="w-32 h-32 object-cover rounded shadow hover:opacity-80 transition"
                  />
                </a>
              </div>
            )}
            {member.valid_id && (
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Valid ID
                </p>
                <a
                  href={imageUrl(member.valid_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={imageUrl(member.valid_id)}
                    alt="Valid ID"
                    className="w-32 h-32 object-cover rounded shadow hover:opacity-80 transition"
                  />
                </a>
              </div>
            )}
            {member.membership_agreement && (
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Membership Agreement
                </p>
                <a
                  href={imageUrl(member.membership_agreement)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={imageUrl(member.membership_agreement)}
                    alt="Membership Agreement"
                    className="w-32 h-32 object-cover rounded shadow hover:opacity-80 transition"
                  />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ------------------ BENEFICIARIES SECTION ------------------
  const BeneficiariesSection = () => (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Beneficiaries & References
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
        <div>
          <h4 className="text-lg font-semibold mb-2">Beneficiaries</h4>
          <p>
            <strong>Name:</strong> {member.beneficiaryName || "N/A"}
          </p>
          <p>
            <strong>Relationship:</strong> {member.relationship || "N/A"}
          </p>
          <p>
            <strong>Contact:</strong>{" "}
            {member.beneficiary_contactNumber || "N/A"}
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Character Reference</h4>
          <p>
            <strong>Name:</strong> {member.referenceName || "N/A"}
          </p>
          <p>
            <strong>Position:</strong> {member.position || "N/A"}
          </p>
          <p>
            <strong>Contact:</strong>{" "}
            {member.reference_contactNumber || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );

  // ------------------ ACCOUNT INFO SECTION ------------------
  const AccountInfoSection = () => (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Account Info</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700">
        <div>
          <p className="font-semibold">Username:</p>
          <p>{member.email}</p>
        </div>
        <div>
          <p className="font-semibold">Password:</p>
          <p>{member.password}</p>
        </div>
        <div>
          <p className="font-semibold">Account Status:</p>
          <p>{member.accountStatus}</p>
        </div>
      </div>

      {member.accountStatus &&
        member.accountStatus.toUpperCase() !== "ACTIVATED" && (
          <button
            onClick={async () => {
              setActivationLoading(true);
              try {
                await axios.put(
                  `http://localhost:3001/api/activate/${member.memberId}`
                );
                setMember((prev) => ({ ...prev, accountStatus: "ACTIVATED" }));
                setMessageType("success");
                setMessage("Account activated successfully!");
                setShowMessage(true);
              } catch (error) {
                console.error("Error activating account:", error);
                setMessageType("error");
                setMessage("Error activating account.");
                setShowMessage(true);
              } finally {
                setActivationLoading(false);
              }
            }}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            disabled={activationLoading}
          >
            {activationLoading ? "Activating..." : "Activate Account"}
          </button>
        )}
    </div>
  );

  // ------------------ LOAN HISTORY SECTION ------------------
  const LoanHistorySection = () => {
    if (!member.loan_history || member.loan_history.length === 0) {
      return (
        <div className="p-6">
          <p className="text-gray-600 text-base">No loan history available.</p>
        </div>
      );
    }
    return (
      <div className="p-6">
  <h3 className="text-xl font-bold mb-4 text-gray-800">Loan History</h3>
  <div className="space-y-4">
    {member.loan_history.map((loan, index) => (
      <div
        key={index}
        className="bg-white shadow-sm"
      >
        <p className="text-gray-700">
          <strong className="font-medium">Loan Type:</strong> {loan.loan_type}
        </p>
        <p className="text-gray-700">
          <strong className="font-medium">Amount:</strong> ₱
          {parseFloat(loan.loan_amount).toLocaleString()}
        </p>
        <p className="text-gray-700">
          <strong className="font-medium">Term:</strong> {loan.terms} months
        </p>
        <p className="text-gray-700">
          <strong className="font-medium">Loan Status:</strong> {loan.loan_status}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Applied on: {formatDate(loan.created_at)}
        </p>
      </div>
    ))}
  </div>
</div>


    );
  };

  // ------------------ INITIAL CONTRIBUTION SECTION ------------------
  const InitialContributionSection = () => {
    return (
      <div className="p-6">
        <h3 className="text-3xl font-bold text-gray-900 border-b pb-3 mb-5">
          Current Contributions
        </h3>
        <div className="grid grid-cols-1 gap-4 text-gray-700">
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              Share Capital
            </h4>
            <p className="flex justify-between items-center group transition-all">
              <span>Current Share Capital:</span>
              <span className="font-medium text-blue-500 group-hover:text-blue-600">
                ₱{member.share_capital}
              </span>
            </p>
          </div>
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Fees</h4>
            {[
              { label: "Initial Shared Capital", value: member.initial_shared_capital },
              { label: "Identification Card Fee", value: member.identification_card_fee },
              { label: "Membership Fee", value: member.membership_fee },
              { label: "Kalinga Fund Fee", value: member.kalinga_fund_fee },
            ].map((item, index) => (
              <p
                key={index}
                className="flex justify-between items-center hover:text-blue-600 transition-all"
              >
                <span>{item.label}:</span>
                <span className="font-medium text-blue-500">₱{item.value}</span>
              </p>
            ))}
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Savings</h4>
            <p className="flex justify-between items-center hover:text-blue-600 transition-all">
              <span>Initial Savings:</span>
              <span className="font-medium text-blue-500">₱{member.initial_savings}</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const PurchaseHistorySection = () => {
    const purchaseHistory = member.purchase_history || [];
  
    // Calculate the total purchase amount
    const totalPurchase = purchaseHistory.reduce(
      (acc, transaction) => acc + parseFloat(transaction.amount),
      0
    );
  
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Purchase History</h3>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Add New Transaction
          </button>
        </div>
        <div className="mb-4">
          <p className="text-lg font-medium text-gray-700">
            Total Purchase: ₱{totalPurchase.toFixed(2)}
          </p>
        </div>
        {purchaseHistory.length === 0 ? (
          <p className="text-gray-600">No purchase history available.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchaseHistory.map((transaction, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  <p className="text-lg font-semibold text-gray-700">
                    ₱{transaction.amount}
                  </p>
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Service:</span> {transaction.service}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(transaction.purchase_date)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  
  

  // ------------------ ADD TRANSACTION MODAL ------------------
  const AddTransactionModal = ({ memberId, onClose, onAddTransaction, onMessage }) => {
    const [formData, setFormData] = useState({ totalAmount: "", service: "" });
    const [saving, setSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
      if (!formData.totalAmount || !formData.service) {
        onMessage("error", "Please fill in all fields.");
        return;
      }
      setSaving(true);
      try {
        const response = await axios.post(
          `http://localhost:3001/api/purchase-history/${memberId}`,
          {
            amount: parseFloat(formData.totalAmount), // sending "amount" as required by backend
            service: formData.service,
          }
        );
        // Assuming response.data.result contains the new transaction details
        onAddTransaction(response.data.result);
        onMessage("success", "Transaction added successfully!");
        setIsSuccess(true);
      } catch (error) {
        console.error(
          "Error adding transaction:",
          error.response ? error.response.data : error.message
        );
        onMessage("error", "Error adding transaction.");
      } finally {
        setSaving(false);
      }
    };

    if (isSuccess) {
      return (
        <SuccessComponent
          message="Transaction added successfully!"
          onClose={onClose}
        />
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white w-full max-w-md rounded shadow-lg p-6 relative">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Transaction</h2>
          <div className="mb-4">
            <label className="font-medium">Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
              placeholder="Enter total amount"
            />
          </div>
          <div className="mb-4">
            <label className="font-medium">Service</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">Select Service</option>
              <option value="Consumer">Consumer</option>
              <option value="Store">Store</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ------------------ ALL INFO MODAL (EDITABLE) ------------------
  const AllInfoModal = ({ member, memberId, onClose, onUpdateMember, onMessage }) => {
    const [formData, setFormData] = useState({ ...member });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
      setSaving(true);
      try {
        const response = await axios.put(
          `http://localhost:3001/api/member/${memberId}`,
          formData
        );
        onUpdateMember(response.data.updatedMember || formData);
        onMessage("success", "Profile updated successfully!");
        onClose();
      } catch (error) {
        console.error("Error updating profile:", error);
        onMessage("error", "Error updating profile.");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white w-full max-w-3xl rounded shadow-lg p-6 relative">
          <h2 className="text-xl font-bold mb-4 text-gray-800">All Information</h2>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="flex flex-col">
                <label className="font-medium">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Extension Name</label>
                <input
                  type="text"
                  name="extension_name"
                  value={formData.extension_name || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Maiden Name</label>
                <input
                  type="text"
                  name="maiden_name"
                  value={formData.maiden_name || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Sex</label>
                <input
                  type="text"
                  name="sex"
                  value={formData.sex || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Civil Status</label>
                <input
                  type="text"
                  name="civil_status"
                  value={formData.civil_status || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Religion</label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Birthplace Province</label>
                <input
                  type="text"
                  name="birthplace_province"
                  value={formData.birthplace_province || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Registration Type</label>
                <input
                  type="text"
                  name="registration_type"
                  value={formData.registration_type || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Registration Date</label>
                <input
                  type="date"
                  name="registration_date"
                  value={
                    formData.registration_date
                      ? formData.registration_date.slice(0, 10)
                      : ""
                  }
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Member Type</label>
                <input
                  type="text"
                  name="member_type"
                  value={formData.member_type || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Status</label>
                <input
                  type="text"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium">Is Borrower</label>
                <input
                  type="number"
                  name="is_borrower"
                  value={formData.is_borrower || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>
            <hr className="my-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <label className="font-medium">Annual Income</label>
                <input
                  type="number"
                  name="annual_income"
                  value={formData.annual_income || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">Number of Dependents</label>
                <input
                  type="text"
                  name="number_of_dependents"
                  value={formData.number_of_dependents || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">Share Capital</label>
                <input
                  type="text"
                  name="share_capital"
                  value={formData.share_capital || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">Membership Fee</label>
                <input
                  type="number"
                  name="membership_fee"
                  value={formData.membership_fee || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">Initial Savings</label>
                <input
                  type="number"
                  name="initial_savings"
                  value={formData.initial_savings || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
              </div>
              <div>
                <label className="font-medium">Occupation</label>
                <input
                  type="text"
                  name="occupation_source_of_income"
                  value={formData.occupation_source_of_income || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">Spouse Name</label>
                <input
                  type="text"
                  name="spouse_name"
                  value={formData.spouse_name || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">Spouse Occupation</label>
                <input
                  type="text"
                  name="spouse_occupation_source_of_income"
                  value={formData.spouse_occupation_source_of_income || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">House No/Street</label>
                <input
                  type="text"
                  name="house_no_street"
                  value={formData.house_no_street || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">Barangay</label>
                <input
                  type="text"
                  name="barangay"
                  value={formData.barangay || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
              </div>
              <div>
                <label className="font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">Contact Number</label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
                <label className="font-medium">TIN Number</label>
                <input
                  type="text"
                  name="tin_number"
                  value={formData.tin_number || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full mb-3"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ------------------ MAIN RENDER ------------------
  return (
    <div className="">
      {showMessage && (
        <div
          className={`mb-4 p-4 rounded ${
            messageType === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Member Profile Overview
          </h1>
          <p className="text-base text-gray-500">
            Manage and review member details
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <BasicInfoSection />

      <div className="bg-white rounded-xl shadow-md mt-6">
        <div className="border-b">
          <nav className="flex space-x-4">
            {[
              "Documents",
              "Beneficiaries",
              "Account Info",
              "Loan History",
              "Share Capital",
              "Purchase History",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 font-semibold ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {activeTab === "Documents" && <DocumentsSection />}
          {activeTab === "Beneficiaries" && <BeneficiariesSection />}
          {activeTab === "Account Info" && <AccountInfoSection />}
          {activeTab === "Loan History" && <LoanHistorySection />}
          {activeTab === "Share Capital" && <InitialContributionSection />}
          {activeTab === "Purchase History" && <PurchaseHistorySection />}
        </div>
      </div>

      {showAllInfoModal && (
        <AllInfoModal
          member={member}
          memberId={memberId}
          onClose={() => setShowAllInfoModal(false)}
          onUpdateMember={handleUpdateMember}
          onMessage={handleModalMessage}
        />
      )}

      {showTransactionModal && (
        <AddTransactionModal
          memberId={memberId}
          onClose={() => setShowTransactionModal(false)}
          onAddTransaction={handleAddTransaction}
          onMessage={handleModalMessage}
        />
      )}
    </div>
  );
};

export default MemberProfilePage;
