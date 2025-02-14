import { Outlet } from "react-router-dom";
import SideBar from "../shared/components/partials/Sidebar";

const AdminLayout = () => {
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
