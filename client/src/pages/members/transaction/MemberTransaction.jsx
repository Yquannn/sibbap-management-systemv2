import React from "react";
import { HandCoins } from "lucide-react";

const dummyNotifications = [
  { date: "Feb 08, 2025", type: "Express Send Notification", message: "You have sent PHP 2100.00 to CE**" },
  { date: "Feb 08, 2025", type: "Express Send Notification", message: "You have received PHP 2800.00" },
  { date: "Feb 03, 2025", type: "Express Send Notification", message: "You have sent PHP 600.00 to GE**" },
  { date: "Feb 03, 2025", type: "GCash Funds Received", message: "You have received PHP 600.00 of GCash" },
  { date: "Feb 03, 2025", type: "Express Send Notification", message: "You have sent PHP 200.00 to MA*Y" },
  { date: "Feb 03, 2025", type: "GCash Funds Received", message: "You have received PHP 200.00 of GCash" },
  { date: "Feb 03, 2025", type: "Express Send Notification", message: "You have sent PHP 200.00 to MA*Y" },
];

const Notifications = ({ notifications = dummyNotifications }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Latest</h2>
      <div className="divide-y divide-gray-200">
        {notifications.map((notif, index) => (
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

export default Notifications;
