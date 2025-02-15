import React, { useEffect, useState } from "react";
import axios from "axios";
import { ConciergeBell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import defaultPicture from "../assets/blankPicture.png";

const Dashboard = () => {
  const [member, setMember] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDividend, setShowDividend] = useState(false);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          throw new Error("User email not found. Please log in again.");
        }

        const response = await axios.get(
          `http://192.168.254.103:3001/api/member/email/${email}`
        );

        if (response.data) {
          setMember(response.data);
        } else {
          throw new Error("No member data found.");
        }
      } catch (err) {
        setError(err.message || "Error fetching member data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
        <div className="flex items-center">
          <img
            src={member?.idPicture ? `http://192.168.254.103:3001/uploads/${member.idPicture}` : defaultPicture}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <p className="text-gray-500 text-sm">Welcome</p>
            <p className="text-lg font-semibold">
              {member?.FirstName} {member?.LastName}
            </p>
          </div>
        </div>
        <button className="text-cyan-600 p-2 rounded-full hover:bg-green-100">
          <ConciergeBell className="w-6 h-6" />
        </button>
      </div>

      {/* Animated Section */}
      <div className="relative w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {showDividend ? (
            <motion.div
              key="dividend"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center mt-6"
            >
              {/* Dividend Card */}
              
              {/* <div className="bg-gradient-to-r from-blue-700 to-green-700 text-white p-6 rounded-lg text-center w-full"> */}

              <div className="bg-cyan-700 text-white p-6 rounded-lg text-center w-full">
              <p className="text-sm">Dividend Collected Balance</p>
                <p className="text-3xl font-bold">
                  ₱
                  {new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(
                    member?.savingsAmount || 0
                  )}
                </p>
                <div className="mt-3 flex justify-center gap-4">
                  <button className="bg-white text-sm text-cyan-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition">
                    View Transaction
                  </button>
                  <button
                    className="bg-white text-sm text-cyan-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition"
                    onClick={() => setShowDividend(false)}
                  > View Saving
                  </button>
                </div>
              </div>
             
            </motion.div>
          ) : (
            <motion.div
              key="regularSavings"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center mt-6"
            >
              {/* Balance Card */}
              <div className="bg-green-800 text-white p-6 rounded-lg text-center w-full">
                <p className="text-sm">Regular Savings Balance</p>
                <p className="text-3xl font-bold">
                  ₱
                  {new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(
                    member?.savingsAmount || 0
                  )}
                </p>
                <div className="mt-3 flex justify-center gap-4">
                  <button className="bg-white text-sm text-green-800 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition">
                    View Transaction
                  </button>
                  <button
                    className="bg-white text-sm text-green-800 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition"
                    onClick={() => setShowDividend(true)}
                  > View Dividend
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Announcements */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-700">Announcement</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {member?.announcements?.length > 0 ? (
            member.announcements.map((announcement, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h3 className="text-md font-semibold">{announcement.title}</h3>
                <p className="text-gray-600 text-sm">{announcement.description}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No announcements available.</p>
          )}
        </div>
      </div>

      {/* Badge Section */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-700 text-sm">Earned a Badge</p>
        <p className="text-lg font-bold">{member?.badge || "No Badge Yet"}</p>
      </div>
    </div>
  );
};

export default Dashboard;
