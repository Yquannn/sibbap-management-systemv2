import React, { useEffect, useState } from "react";
import { FaDollarSign, FaPiggyBank, FaSearch } from "react-icons/fa";
import axios from "axios"; 
import TransactionForm from "../../../components/modal/TransactionForm";

const RegularSavings = ({ openModal, handleDelete }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState(""); // New filtering state
  const [selectedMember, setSelectedMember] = useState(null); // For storing selected member's details for modal
  const [modalType, setModalType] = useState(null); // For determining whether the modal is for Deposit or Withdraw

  // Fetch data from the backend
  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/members/savings");
        // Assuming the response data structure is { data: [...] }
        setMembers(response.data.data);
      } catch (error) {
        console.error("Error fetching member savings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();
  }, []);

  const handleOpenModal = (type, member) => {
    setModalType(type); // Set modal type (deposit or withdraw)
    setSelectedMember(member); // Set selected member data
  };

  const handleCloseModal = () => {
    setModalType(null); // Close modal by resetting state
    setSelectedMember(null); // Reset selected member
  };

  // Handle balance update from the modal
  const handleBalanceUpdate = (memberId, newBalance) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.memberId === memberId
          ? { ...member, savingsAmount: newBalance }
          : member
      )
    );
  };

  // Filtering logic: filter members based on the filterQuery
  const filteredMembers = members.filter((member) => {
    const query = filterQuery.toLowerCase();
    const fullName = member.fullName ? member.fullName.toLowerCase() : "";
    const code = member.memberCode ? member.memberCode.toLowerCase() : "";
    return (
      query === "" ||
      fullName.includes(query) ||
      code.includes(query)
    );
  });

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-0">
      {/* Header with Total Members */}
      <div className="p-4 bg-white shadow-lg rounded-lg mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* Title */}
        <h4 className="text-xl font-bold">
          Regular Savings Members - {members.length}
        </h4>
        {/* Search Input */}
        <div className="w-full md:w-1/3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, code..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Savings Table */}
      <div className="overflow-x-auto" style={{ maxHeight: "60vh" }}>
        <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
          <thead className="sticky top-0 bg-green-200 z-20 text-center">
            <tr>
              {["Code Number", "Account No.", "Full Name", "Contact Number", "Address", "Savings Amount", "Status", "Actions"].map((heading) => (
                <th key={heading} className="py-3 px-4 border-b border-gray-300">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => (
                <tr
                  key={index}
                  className="text-center hover:bg-gray-100 cursor-pointer"
                >
                  <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.fullName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.contactNumber}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.city || "N/A"}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.savingsAmount}</td>
                  <td className="py-3 px-4 border-b border-gray-300"> <span  className={`px-2 py-1 rounded-full font-semibold ${
                        (!member.savingsStatus || member.savingsStatus === "ACTIVE" || member.savingsStatus === "Active")
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >{member.savingsStatus}</span></td>
                  <td className="py-3 px-4 border-b border-gray-300">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleOpenModal('withdraw', member)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                      >
                        <FaDollarSign className="mr-1" /> Withdraw
                      </button>
                      <button
                        onClick={() => handleOpenModal('deposit', member)}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center"
                      >
                        <FaPiggyBank className="mr-1" /> Deposit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center">
                  No savings data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedMember && (
        <TransactionForm
          member={selectedMember}
          modalType={modalType}
          onClose={handleCloseModal}
          onBalanceUpdate={(newBalance) =>
            handleBalanceUpdate(selectedMember.memberId, newBalance)
          }
        />
      )}
    </div>
  );
};

export default RegularSavings;
