import { Outlet } from "react-router-dom";
import ContentLayout from "./ContentLayout";
import SideBar from "../shared/components/partials/Sidebar";
import LogIn from "../pages/LogIn";

const RootLayout = () => {
  return (
    <div className="flex">
      <SideBar />
      <div className="flex-1">
        <ContentLayout>
          <Outlet /> 
          <LogIn/>
        </ContentLayout>
      </div>
    </div>
  );
}

export default RootLayout;
