import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaMoneyBillWave, FaHandHoldingUsd } from "react-icons/fa";
import defaultProfileImage from "./blankPicture.png";
import TransactionForm from "./TransactionForm";

const RegularSavingsInfo = () => {
  const { memberId } = useParams();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for modal
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [modalType, setModalType] = useState(""); // "deposit" or "withdraw"

  useEffect(() => {
    if (!memberId) {
      setError("No memberId provided in the route.");
      setLoading(false);
      return;
    }

    const fetchMemberData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/members/savings/${memberId}`);
        setMemberData(response.data.data);
      } catch (err) {
        setError("Failed to fetch member data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId]);

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }
  if (error) {
    return <div className="text-center p-6 text-red-600">{error}</div>;
  }
  if (!memberData) {
    return <div className="text-center p-6">No member data found.</div>;
  }

  const {
    profileImage,
    last_name,
    first_name,
    member_type,
    date_of_birth,
    age,
    civil_status,
    occupation,
    annual_income,
    highest_education_attainment,
    tin_number,
    status,
    city,
    availableBalance = memberData.amount,
    transactions,
  } = memberData;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="bg-white shadow-md rounded-md p-4 md:p-6 w-full">
        {/* Top section */}
        <div className="bg-green-700 text-white p-4 flex flex-col md:flex-row items-center rounded-md">
          <div className="flex-shrink-0">
            <img
              src={profileImage || defaultProfileImage}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border-4 border-green-700"
            />
          </div>
          <div className="md:ml-6 mt-4 md:mt-0 flex-1">
            <h2 className="text-2xl font-bold">
              {last_name} {first_name}
            </h2>
            <p className="italic text-gray-200">{member_type || "N/A"}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div>
                <span className="font-semibold">Date of Birth: </span>
                {new Date(date_of_birth).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div>
                <span className="font-semibold">Age: </span>
                {age || "N/A"} Years Old
              </div>
              <div>
                <span className="font-semibold">Civil Status: </span>
                {civil_status || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Occupation: </span>
                {occupation || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Annual Income (PHP): </span>
                {annual_income || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Highest Education: </span>
                {highest_education_attainment || "N/A"}
              </div>
              <div>
                <span className="font-semibold">TIN: </span>
                {tin_number || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Membership Status: </span>
                {status || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Address: </span>
                {city || "N/A"}
              </div>
            </div>
          </div>
        </div>
        {/* Middle section (Balance and buttons) */}
        <div className="text-center p-4 md:p-6">
          <h1 className="text-3xl font-bold mb-2">
            {availableBalance
              ? parseFloat(availableBalance).toLocaleString("en-PH", {
                  style: "currency",
                  currency: "PHP",
                })
              : "PHP 0.00"}
          </h1>
          <div className="flex justify-center gap-4 mt-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
              onClick={() => {
                setModalType("deposit");
                setShowTransactionForm(true);
              }}
            >
              <FaMoneyBillWave className="mr-2" />
              Deposit
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
              onClick={() => {
                setModalType("withdraw");
                setShowTransactionForm(true);
              }}
            >
              <FaHandHoldingUsd className="mr-2" />
              Withdraw
            </button>
          </div>
        </div>
        {/* Transaction History */}
        <div className="border-t p-4 md:p-6">
          <h3 className="text-xl font-bold mb-4">TRANSACTION HISTORY</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Description</th>
                  <th className="py-2 px-4 border-b text-right">Amount (PHP)</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{tx.date || "N/A"}</td>
                      <td className="py-2 px-4">{tx.description || "N/A"}</td>
                      <td className="py-2 px-4 text-right">
                        {tx.amount
                          ? parseFloat(tx.amount).toLocaleString("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            })
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => alert("View all transactions")}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              View All Transaction History
            </button>
          </div>
        </div>
      </div>
      {showTransactionForm && (
        <TransactionForm
          modalType={modalType}
          member={memberData}
          onClose={() => setShowTransactionForm(false)}
        />
      )}
    </div>
  );
};

export default RegularSavingsInfo;
