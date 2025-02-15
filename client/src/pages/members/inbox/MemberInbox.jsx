import React from "react";
import { Mail, Bell } from "lucide-react";

const dummyTransactions = [
  { date: "Feb 10, 2025", title: "Sale for upcoming Valentine's Day", content: "We have an offer for you: a 50% discount!", targetAudience: "All", status: "Update" },
  { date: "Feb 11, 2025", title: "System Maintenance", content: "Scheduled maintenance on Feb 15 from 1 AM to 4 AM.", targetAudience: "All Users", status: "Notice" },
  { date: "Feb 12, 2025", title: "New Feature Alert!", content: "Introducing instant transfers with zero fees.", targetAudience: "Premium Users", status: "Update" },
  { date: "Feb 13, 2025", title: "Security Reminder", content: "Enable two-factor authentication for better security.", targetAudience: "All", status: "Reminder" },
  { date: "Feb 14, 2025", title: "Valentine's Day Special", content: "Exclusive cashback offers for today only!", targetAudience: "All Users", status: "Promotion" }
];

export const count = dummyTransactions.length; // Correct ES6 export

const Inbox = ({ transactions = dummyTransactions }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-white mb-4">Inbox</h2>
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction, index) => (
          <div key={index} className="flex items-start gap-3 py-3">
            <Bell className="text-green-700 flex-shrink-0" size={24} />
            <div className="flex-1">
              <p className="text-green-500 font-medium">{transaction.title}</p>
              <p className="text-gray-400 text-sm">{transaction.content}</p>
              <p className="text-gray-500 text-sm">Target Audience: {transaction.targetAudience}</p>
              <p className="text-gray-500 text-sm">Status: {transaction.status}</p>
            </div>
            <p className="text-gray-400 text-sm">{transaction.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox;
