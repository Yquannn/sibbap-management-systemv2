import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ShareCapital = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchMembers() {
    try {
      const response = await axios.get("http://localhost:3001/api/members"); 
      setLoading(false);
      if (response.status !== 200) {
        throw new Error("Failed to fetch members");
      }
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  }
  useEffect(() => {
    fetchMembers();
  }, []);


  return (
    <div className="p-0">
      <h4 className="text-xl font-bold mb-4">Share Capital</h4>
      <div className="overflow-y-auto max-h-[60vh] card bg-white shadow-md rounded-lg p-4">
        <table className="table w-full">
          <thead className="text-center">
            <tr>
              {["Member Code", "Name", "Contact Number", "Address", "Actions"].map((heading) => (
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
                  <td className="py-3 px-4 border-b border-gray-300">{member.first_name} {member.last_name}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.contact_number}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.house_no_street} {member.barangay} {member.city}</td>
                  {/* <td className="py-3 px-4 border-b border-gray-300">{member.shareCapital}</td> */}
                  <td className="py-3 px-4 border-b border-gray-300">
                                        <div className="flex justify-center space-x-3">
                                          <button
                                            onClick={() =>
                                              navigate(`/member/share-capital/${null}`)
                                            }
                                            className="btn btn-success btn-sm flex items-center"
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

export default ShareCapital;
