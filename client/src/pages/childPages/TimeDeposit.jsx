import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import MemberAccountModal from "../childModal/MemberAccountModal";

const TimeDeposit = ({ openModal, handleDelete }) => {
  const [timeDeposits, setTimeDeposits] = useState([]); // State to store time deposits
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [modalType, setModalType] = useState(""); // Modal type (deposit or withdraw)

  const handleOpenModal = (type) => {
    setModalType(type); // Set modal type
    setIsModalOpen(true); // Open modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
    setModalType(""); // Reset modal type
  };

  // Fetch active time deposits
  const fetchTimeDeposits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3001/api/active/");
      setTimeDeposits(response.data);
    } catch (err) {
      setError("Error fetching time deposits: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTimeDeposits();
  }, []);

  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex justify-between items-center space-x-4 p-2">
        <h4 className="text-xl font-bold">Time deposit members</h4>
        <button
          onClick={() => handleOpenModal("deposit")} // Open modal with deposit type
          className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
        >
          Open Account
        </button>
      </div>

      {/* Modal */}
      <MemberAccountModal
        openModal={openModal}
        handleDelete={handleDelete}
        showModal={isModalOpen}
        closeModal={handleCloseModal}
        modalType={modalType} // Pass modalType to the modal
      />

      {/* Loading, Error, and Table */}
      <div className="overflow-x-auto" style={{ maxHeight: "70vh" }}>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
            <thead className="sticky top-0 bg-green-200 z-20 text-center">
              <tr>
                {[ "Member Code", "Last Name", "First Name", "Amount", "Interest", "Payout", "Maturity Date", "Remarks", "Actions" ].map((heading) => (
                  <th key={heading} className="py-3 px-4 border-b border-gray-300">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeDeposits && timeDeposits.length > 0 ? (
                timeDeposits.map((deposit, index) => (
                  <tr key={`${deposit.id}-${index}`} className="text-center hover:bg-gray-100 cursor-pointer">
                    <td className="py-3 px-4 border-b border-gray-300">{deposit.memberCode || "N/A"}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{deposit.fullNameLastName }</td>
                    <td className="py-3 px-4 border-b border-gray-300">{deposit.fullNamefirstName}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{deposit.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{deposit.interest.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{deposit.payout.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{deposit.maturityDate}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{deposit.payout.toFixed(2)}</td>

                    <td className="py-3 px-4 border-b border-gray-300">
                      <div className="flex justify-center space-x-3">
                        {/* <button
                          onClick={() => handleOpenModal("edit")}
                          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center"
                        >
                          <FaEdit className="mr-1" /> Update
                        </button>
                        <button
                          onClick={() => handleDelete(deposit.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                        <button
                          onClick={() => handleOpenModal("view")}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                        >
                          <FaEye className="mr-1" /> View
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center">
                    No active time deposits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TimeDeposit;
