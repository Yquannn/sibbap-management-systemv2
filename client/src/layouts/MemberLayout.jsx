import { Outlet } from "react-router-dom";
import Navbar from "../components/shared/Navbar";

const MemberLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> {/* ✅ Add Navbar here */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default MemberLayout;
