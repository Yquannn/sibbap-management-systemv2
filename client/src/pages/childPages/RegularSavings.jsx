import React, { useEffect, useState } from "react";
import { FaDollarSign, FaPiggyBank } from 'react-icons/fa';
import axios from "axios"; // Make sure axios is installed

const RegularSavings = ({ openModal, handleDelete }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h4 className="text-xl font-bold mb-4">Regular savings</h4>
      <div className="overflow-x-auto" style={{ maxHeight: "70vh" }}>
        <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
          <thead className="sticky top-0 bg-green-200 z-20 text-center">
            <tr>
              {["Full Name", "Contact Number", "Address", "Savings Amount", "Status", "Actions"].map((heading) => (
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
                  <td className="py-3 px-4 border-b border-gray-300">{member.fullName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.contactNumber}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.city || "N/A"}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.savingsAmount}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.savingsStatus }</td>
                  <td className="py-3 px-4 border-b border-gray-300">
                    <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => openModal(member.memberId)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                    >
                      <FaDollarSign className="mr-1" /> Withdraw
                    </button>
                    <button
                      onClick={() => openModal("depositModal", member)}
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
                <td colSpan={5} className="py-4 text-center">
                  No savings data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegularSavings;
