import React from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const TimeDeposit = ({ members, openModal, handleDelete }) => {
  return (
    <div className="p-0">
      <div className="flex justify-between items-center space-x-4 p-2">
      <h4 className="text-xl font-bold">Time Deposit</h4>
      <button 
        className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50">
        Open Account
      </button>
    </div>

      <div className="overflow-x-auto" style={{ maxHeight: "70vh" }}>
        <table className="min-w-full table-auto bg-white border border-gray-300 text-sm">
          <thead className="sticky top-0 bg-green-200 z-20 text-center">
            <tr>
              {["Member Code", "Last Name", "First Name", "Contact Number", "Address", "Shared Capital", "Actions"].map((heading) => (
                <th key={heading} className="py-3 px-4 border-b border-gray-300">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members && members.length > 0 ? (
              members.map((member, index) => (
                <tr
                  key={`${member.id}-${index}`}
                  className="text-center hover:bg-gray-100 cursor-pointer"
                >
                  <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.lastName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.firstName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.contactNumber}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.address}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.shareCapital}</td>
                  <td className="py-3 px-4 border-b border-gray-300">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => openModal("editOpen", member)}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center"
                      >
                        <FaEdit className="mr-1" /> Update
                      </button>
                      <button
                        onClick={() => handleDelete(member.memberId)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                      <button
                        onClick={() => openModal("viewOpen", member)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeDeposit;
