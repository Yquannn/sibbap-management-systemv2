import React, { useState, useEffect, useCallback } from "react";
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
  const fetchTimeDeposits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3001/api/active/");
      if (response.data.length === 0) {
        throw new Error("No depositor for time deposit.");
      }
      setTimeDeposits(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching time deposits.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchTimeDeposits();
  }, [fetchTimeDeposits]);

  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex justify-between items-center space-x-4 p-0">
        <h4 className="text-xl font-bold">
          Time Deposit Members - {timeDeposits.length} {/* Display total members */}
        </h4>
        <div className="mb-3">
          <button
            onClick={() => handleOpenModal("deposit")} // Open modal with deposit type
            className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          >
            Open Account
          </button>
        </div>
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
                {[
                  "Code Number",
                  "Full Name",
                  "Amount",
                  "Interest",
                  "Payout",
                  "Fixed Term",
                  "Maturity Date",
                  "Remarks",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="py-3 px-4 border-b border-gray-300">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeDeposits && timeDeposits.length > 0 ? (
                timeDeposits.map((depositor, index) => (
                  <tr
                    key={`${depositor.id}-${index}`}
                    className="text-center hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="py-3 px-4 border-b border-gray-300">{depositor.memberCode || "N/A"}</td>
                    <td className="py-3 px-4 border-b border-gray-300">
                    {depositor.firstName} {depositor.LastName} 
                    </td>
                    <td className="py-3 px-4 border-b border-gray-300">{depositor.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{depositor.interest.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{depositor.payout.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b border-gray-300">{depositor.fixedTerm} Months</td>
                    <td className="py-3 px-4 border-b border-gray-300">
                      {new Date(depositor.maturityDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long", // Full month name
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-3 px-4 border-b border-gray-300">{depositor.remarks}</td>
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
