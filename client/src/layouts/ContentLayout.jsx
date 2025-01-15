import { Outlet } from "react-router-dom";
import Dashboard from "../pages/Dashboard";


const ContentLayout = () => {
  return (
    <div className="root-main">    
       {/* <SideBar/> */}
        {/* <Dashboard/> */}
      <Outlet />
    </div>
  );
}

export default ContentLayout;
