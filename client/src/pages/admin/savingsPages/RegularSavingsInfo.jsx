import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaMoneyBillWave, FaHandHoldingUsd } from "react-icons/fa";
import defaultProfileImage from "./blankPicture.png";
import TransactionForm from "./utils/TransactionForm";

const RegularSavingsInfo = () => {
  const { memberId } = useParams();
  const [memberData, setMemberData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [modalType, setModalType] = useState(""); // "deposit" or "withdraw"

  // NEW: State for transaction number filter
  const [transactionNumberFilter, setTransactionNumberFilter] = useState("");


  // Fetch member data when memberId changes.
  useEffect(() => {
    if (!memberId) {
      setError("No memberId provided in the route.");
      setLoading(false);
      return;
    }
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3001/api/members/savings/${memberId}`
        );
        setMemberData(response.data.data);
      } catch (err) {
        setError("Failed to fetch member data.");
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, [memberId]);

  // Once memberData is available, fetch transactions using the member's email.
  useEffect(() => {
    if (!memberData) return;
    const email = memberData.email;
    if (!email) {
      setError("Email not found. Please log in.");
      return;
    }
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://192.168.254.104:3001/api/member/email/${email}`
        );
        if (response.data && response.data.transactions) {
          setTransactions(response.data.transactions);
        } else {
          throw new Error("No transactions found.");
        }
      } catch (err) {
        setError(err.message || "Error fetching transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [memberData]);

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
    id_picture,
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
    amount,
  } = memberData;

  const availableBalance = amount;

  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Filter the transactions by the transactionNumberFilter
  const filteredTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.transaction_date_time) - new Date(a.transaction_date_time)
    )
    .filter((tx) => {
      // If there's no filter, include all transactions
      if (!transactionNumberFilter.trim()) return true;
      // Otherwise, match partial or full transaction_number (case-insensitive)
      return tx.transaction_number
        ?.toLowerCase()
        .includes(transactionNumberFilter.toLowerCase());
    });

  return (
    <div className="max-h-screen">
      <h2 className="text-3xl font-bold p-6">Regular Savings</h2>

      <div>
        {/* Profile and Details Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-shrink-0 flex flex-col items-center">
              <img
                src={imageUrl(memberData.id_picture) || defaultProfileImage}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full border-4 border-green-700"
              />
              <h2 className="text-3xl font-bold text-center mt-2">
                {last_name} {first_name}
              </h2>
              <p className="text-center text-gray-500">
                {member_type || "N/A"}
              </p>
            </div>
            <div className="md:ml-8 mt-4 md:mt-0 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
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
                <div className="md:col-span-2">
                  <span className="font-semibold">Address: </span>
                  {city || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance and Action Buttons Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-center text-sm">Available balance (PHP)</h1>

          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {availableBalance
                ? parseFloat(availableBalance).toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  })
                : "PHP 0.00"}
            </h1>
            <div className="flex justify-center gap-6">
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded inline-flex items-center transition duration-300"
                onClick={() => {
                  setModalType("deposit");
                  setShowTransactionForm(true);
                }}
              >
                <FaMoneyBillWave className="mr-2" size={20} />
                Deposit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded inline-flex items-center transition duration-300"
                onClick={() => {
                  setModalType("withdraw");
                  setShowTransactionForm(true);
                }}
              >
                <FaHandHoldingUsd className="mr-2" size={20} />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History Card */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Top Bar with Filters/Metrics */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Transaction History</span>
              <span className="text-gray-400">|</span>
              <button className="text-blue-600 font-semibold">All Apps</button>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">0% Overall</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">0% Unauthorized</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">0% Administrative</span>
            </div>
            <div className="mb-4 flex items-center">
            <label htmlFor="txNumberFilter" className="mr-2 font-semibold">
              Filter by Transaction Number:
            </label>
            <input
              id="txNumberFilter"
              type="text"
              className="border rounded px-8 py-1"
              placeholder="e.g., TXN12345"
              value={transactionNumberFilter}
              onChange={(e) => setTransactionNumberFilter(e.target.value)}
            />
          </div>
            {/* <a href="#learn-more" className="text-blue-500 text-sm font-semibold">
              Learn More
            </a> */}
          </div>

          {/* NEW: Transaction Number Filter */}
         

          {/* Scrollable container for the table */}
          <div className="overflow-x-auto overflow-y-auto max-h-72">
            <table className="w-full text-sm text-left">
              <thead className="bg-green-200">
                <tr>
                <th className="py-3 px-4 whitespace-nowrap">
                    Transaction No
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">Date Created</th>
    
                  <th className="py-3 px-4 whitespace-nowrap">Authorized By</th>

                  <th className="py-3 px-4 whitespace-nowrap">User type</th>



                  <th className="py-3 px-4 whitespace-nowrap">Type</th>
                  <th className="py-3 px-4 whitespace-nowrap">Amount (PHP)</th>
                  <th className="py-3 px-4 whitespace-nowrap text-right">
                    Transaction Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap">
                        {tx.transaction_number || "N/A"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.transaction_date_time
                          ? new Date(tx.transaction_date_time).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              }
                            )
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.authorized || "N/A"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.user_type || "N/A"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.transaction_type || "N/A"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.amount
                          ? parseFloat(tx.amount).toLocaleString("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            })
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 mr-2">
                          {tx.transaction_status || "Success"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
