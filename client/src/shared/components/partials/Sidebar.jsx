import React, { useState, useEffect, cloneElement } from 'react';
import { 
  HiOutlineHome, 
  HiOutlineUserGroup, 
  HiBriefcase, 
  HiOutlineDocumentText, 
  HiOutlineChartBar, 
  HiOutlineCog, 
  HiOutlineBell, 
  HiOutlineLogout, 
  HiOutlineChevronDown, 
  HiOutlineChevronUp, 
  HiOutlineLockClosed,
} from 'react-icons/hi';
import { HiOutlineBanknotes } from "react-icons/hi2";

import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../partials/logosibbap.png';

const SideBar = () => {
  const [loanDropdown, setLoanDropdown] = useState(false);
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Retrieve userType from session storage
    const storedUserType = sessionStorage.getItem('usertype');
    const allowedAdminRoles = ["Teller", "Loan Manager", "Treasurer", "General Manager", "System Admin"];
    
    if (!storedUserType || !allowedAdminRoles.includes(storedUserType)) {
      navigate("/member-dashboard");
    } else {
      setUserType(storedUserType);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const isSystemAdmin = userType === "System Admin";

  // Allowed modules based on userType
  const allowed = {
    dashboard: true,
    members: isSystemAdmin,
    savings: isSystemAdmin || userType === "Teller",
    loan: isSystemAdmin || (userType === "Loan Manager" || userType === "Treasurer"),
    fileMaintenance: isSystemAdmin,
    report: isSystemAdmin || userType === "General Manager",
    users: isSystemAdmin,
    announcement: isSystemAdmin,
    maintenance: isSystemAdmin,
    logout: true,
  };

  const loanSubAllowed = {
    borrower: isSystemAdmin || userType === "Loan Manager",
    "apply-for-loan": isSystemAdmin || userType === "Loan Manager",
    "loan-applicant": isSystemAdmin || userType === "Loan Manager",
    "loan-approval": isSystemAdmin || userType === "Treasurer",
  };

  // Helper function that adds extra styling if the route is active.
  const renderItem = (allowedFlag, to, icon, label, onClick = null) => {
    const isActive = location.pathname === to;
    const baseClasses = "flex items-center w-full p-2 rounded transition-colors";
    const activeClasses = isActive
      ? "bg-green-500 text-white"
      : "text-gray-600 hover:text-green-500 hover:bg-gray-200";
      
    // If an icon is provided, clone it and update its className based on active state.
    const iconElement = icon 
      ? cloneElement(icon, { className: `${isActive ? 'text-white' : 'text-gray-700'} mr-2` })
      : null;
      
    if (allowedFlag) {
      return (
        <Link 
          to={to} 
          onClick={onClick} 
          className={`${baseClasses} ${activeClasses}`}
        >
          {iconElement}
          <span>{label}</span>
        </Link>
      );
    } else {
      return (
        <div className="flex items-center w-full p-2 rounded bg-gray-200 cursor-not-allowed">
          {icon && cloneElement(icon, { className: "text-gray-500 mr-2" })}
          <span className="text-gray-500">{label}</span>
          <HiOutlineLockClosed className="text-gray-500 ml-auto" />
        </div>
      );
    }
  };

  return (
    <div className="w-56 h-screen flex flex-col mr-4">
      {/* Logo Container */}
      <div className="p-4 bg-white rounded shadow mb-4 flex items-center justify-center">
        <img 
          src={logo} 
          alt="sibbap logo" 
          className="w-12 h-auto mr-2" 
        />
        <h1 className="font-bold text-base text-gray-800">Sibbap Cooperative</h1>
      </div>

      {/* Sidebar Menu Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-white rounded shadow">
        <ul className="space-y-2">
          <li>
            {renderItem(allowed.dashboard, "/dashboard", <HiOutlineHome />, "Dashboard")}
          </li>
          <li>
            {renderItem(allowed.members, "/members", <HiOutlineUserGroup />, "Members")}
          </li>
          <li>
            {renderItem(allowed.savings, "/savings", <HiOutlineBanknotes  />, "Savings")}
          </li>
          {allowed.loan ? (
            <>
              <li 
                className="flex items-center w-full p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors"
                onClick={() => setLoanDropdown(!loanDropdown)}
              >
                {cloneElement(<HiBriefcase />, { className: "mr-2 text-gray-700" })}
                <span className="flex-grow text-gray-700">Loan</span>
                {loanDropdown ? <HiOutlineChevronUp className="text-gray-700" /> : <HiOutlineChevronDown className="text-gray-700" />}
              </li>
              {loanDropdown && (
                <ul className="ml-6 space-y-1">
                  <li>{renderItem(loanSubAllowed["borrower"], "/borrower", null, "Borrowers")}</li>
                  <li>{renderItem(loanSubAllowed["apply-for-loan"], "/apply-for-loan", null, "Apply for Loan")}</li>
                  <li>{renderItem(loanSubAllowed["loan-applicant"], "/loan-applicant", null, "Loan Applicant")}</li>
                  <li>{renderItem(loanSubAllowed["loan-approval"], "/loan-approval", null, "Loan Approval")}</li>
                </ul>
              )}
            </>
          ) : (
            <li className="flex items-center w-full p-2 rounded bg-gray-200 cursor-not-allowed">
              {cloneElement(<HiBriefcase />, { className: "mr-2 text-gray-500" })}
              <span className="text-gray-500">Loan</span>
              <HiOutlineLockClosed className="text-gray-500 ml-auto" />
            </li>
          )}
          <li>
            {renderItem(allowed.fileMaintenance, "/file-maintenance", <HiOutlineDocumentText />, "File Maintenance")}
          </li>
          <li>
            {renderItem(allowed.report, "/report", <HiOutlineChartBar />, "Report")}
          </li>
          <li>
            {renderItem(allowed.users, "/users", <HiOutlineUserGroup />, "Users")}
          </li>
          <li>
            {renderItem(allowed.announcement, "/announcement", <HiOutlineBell />, "Announcement")}
          </li>
          <li>
            {renderItem(allowed.maintenance, "/maintenance", <HiOutlineCog />, "Maintenance")}
          </li>
          <li>
            <div
              onClick={handleLogout}
              className="flex items-center w-full text-gray-600 hover:text-green-500 p-2 rounded hover:bg-green-200 transition-colors cursor-pointer"
            >
              <HiOutlineLogout className="mr-2 text-gray-700" />
              <span>Log out</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
