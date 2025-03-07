import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegularSavings = ({ openModal, handleDelete }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const navigate = useNavigate();

  // Fetch data from the backend
  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/members/savings");
        setMembers(response.data.data);
      } catch (error) {
        console.error("Error fetching member savings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();
  }, []);

  // Filtering logic: filter members based on the filterQuery
  const filteredMembers = members.filter((member) => {
    const query = filterQuery.toLowerCase();
    const fullName = member.fullName ? member.fullName.toLowerCase() : "";
    const code = member.memberCode ? member.memberCode.toLowerCase() : "";
    return query === "" || fullName.includes(query) || code.includes(query);
  });

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-0">
      {/* Header with Total Members */}
      <div className="p-4 bg-white shadow-lg rounded-lg mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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
              {[
                "Code Number",
                "Account No.",
                "Full Name",
                "Date of birth",
                "Age",
                "Contact Number",
                "Address",
                "Balance",
                "Account Status",
                "Actions",
              ].map((heading) => (
                <th key={heading} className="py-3 px-4 border-b border-gray-300">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => (
                <tr key={index} className="text-center hover:bg-gray-100 cursor-pointer">
                  <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.memberCode}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.fullName}</td>
                  <td className="py-3 px-4 border-b border-gray-300">
                    {new Date(member.date_of_birth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.age}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.contact_number}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.city || "N/A"}</td>
                  <td className="py-3 px-4 border-b border-gray-300">{member.savingsAmount}</td>
                  <td className="py-3 px-4 border-b border-gray-300">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${
                        (!member.savingsStatus || member.savingsStatus === "ACTIVE" || member.savingsStatus === "Active")
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {member.savingsStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-gray-300">
                    <div className="flex justify-center">
                      {/* Pass the memberId in the URL */}
                      <button
                        onClick={() => {
                          navigate(`/regular-savings-info/${member.memberId}`);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                      >
                        <FaSearch className="mr-1" /> View Info
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-4 text-center">
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
