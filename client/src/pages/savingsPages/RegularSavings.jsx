import React, { useEffect, useState } from "react";
import { FaDollarSign, FaPiggyBank } from 'react-icons/fa';
import axios from "axios"; 
import TransactionForm from "../../components/modal/TransactionForm";

const RegularSavings = ({ openModal, handleDelete }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null); // For storing selected member's details for modal
  const [modalType, setModalType] = useState(null); // For determining whether the modal is for Deposit or Withdraw

  // Fetch data from the backend
  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/members/savings"); // Replace with your backend API base path
        setMembers(response.data.data); // Assuming `data` contains the members array
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
          ? { ...member, savingsAmount: newBalance } // Update the balance for the specific member
          : member
      )
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-0">
      {/* Header with Total Members */}
      <h4 className="text-xl font-bold mb-4">
        Regular Savings Members - {members.length}
      </h4>

      <div className="overflow-x-auto" style={{ maxHeight: "70vh" }}>
        <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
          <thead className="sticky top-0 bg-green-200 z-20 text-center">
            <tr>
              {["Code Number", "Full Name", "Contact Number", "Address", "Savings Amount", "Remarks", "Actions"].map((heading) => (
                <th key={heading} className="py-3 px-4 border-b border-gray-300">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member, index) => (
                <tr
                  key={index}
                  className="text-center hover:bg-gray-100 cursor-pointer"
                >
                  <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.fullName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.contactNumber}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.city || "N/A"}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.savingsAmount}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.savingsStatus}</td>
                  <td className="py-3 px-4 border-b border-gray-300">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleOpenModal('withdraw', member)} // Open withdraw modal
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                      >
                        <FaDollarSign className="mr-1" /> Withdraw
                      </button>
                      <button
                        onClick={() => handleOpenModal('deposit', member)} // Open deposit modal
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

      {/* Conditionally render the modal if selectedMember exists */}
      {selectedMember && (
        <TransactionForm
          member={selectedMember}
          modalType={modalType}
          onClose={handleCloseModal} // Pass the close function to the modal
          onBalanceUpdate={(newBalance) =>
            handleBalanceUpdate(selectedMember.memberId, newBalance)
          } // Update balance
        />
      )}
    </div>
  );
};

export default RegularSavings;
