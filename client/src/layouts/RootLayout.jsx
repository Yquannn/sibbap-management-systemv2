import { Navigate, Outlet } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import MemberLayout from "./MemberLayout";

const RootLayout = () => {
  // Get user type from localStorage or API
  const userType = localStorage.getItem("userType"); 

  if (userType === "admin") {
    return <AdminLayout />;
  } else if (userType === "member") {
    return <MemberLayout />;
  } else {
    return <Navigate to="/" />; // Redirect if not logged in
  }
};

export default RootLayout;
