import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../shared/components/partials/Sidebar";

const AdminLayout = () => {
  useEffect(() => {
    // Request Notification Permission
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("🔔 Admin: Notification permission granted.");
        } else {
          console.warn("🚫 Admin: Notification permission denied.");
        }
      } catch (error) {
        console.error("❌ Admin: Error requesting notification permission:", error);
      }
    };

    requestNotificationPermission();
  }, []);

  return (
    <div className="flex">
      <SideBar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
