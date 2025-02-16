import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HandCoins, ArrowLeft } from "lucide-react";

const dummyNotifications = [
  { date: "Feb 08, 2025", type: "Express Send Notification", message: "You have sent PHP 2100.00 to CE**" },
  { date: "Feb 08, 2025", type: "Express Send Notification", message: "You have received PHP 2800.00" },
  { date: "Feb 03, 2025", type: "Express Send Notification", message: "You have sent PHP 600.00 to GE**" },
  { date: "Feb 03, 2025", type: "GCash Funds Received", message: "You have received PHP 600.00 of GCash" },
  { date: "Feb 03, 2025", type: "Express Send Notification", message: "You have sent PHP 200.00 to MA*Y" },
  { date: "Feb 03, 2025", type: "GCash Funds Received", message: "You have received PHP 200.00 of GCash" },
  { date: "Feb 03, 2025", type: "Express Send Notification", message: "You have sent PHP 200.00 to MA*Y" },
];

const Transaction = ({ notifications = dummyNotifications }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Latest");

  // Function to sort and filter notifications
  const getFilteredNotifications = () => {
    let sortedNotifications = [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filter === "Transactions") {
      return sortedNotifications.filter((notif) =>
        notif.type.includes("Send") || notif.type.includes("Received")
      );
    }

    return sortedNotifications;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back Button */}
      <button className="flex items-center text-gray-700 hover:text-black mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      {/* Filter Buttons */}
      <div className="flex space-x-3 mb-4">
        {["Latest", "All", "Transactions"].map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === category ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="divide-y divide-gray-200">
        {getFilteredNotifications().map((notif, index) => (
          <div key={index} className="flex items-start gap-3 py-3">
            <HandCoins className="text-green-700 flex-shrink-0" size={24} />
            <div className="flex-1">
              <p className="text-green-500 font-medium">{notif.type}</p>
              <p className="text-gray-400 text-sm">{notif.message}</p>
            </div>
            <p className="text-gray-500 text-sm">{notif.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transaction;
