import React, { useState, useEffect, cloneElement } from "react";
import { Modal } from "antd";
import { 
  HiOutlineHome, 
  HiOutlineUserGroup, 
  HiBriefcase, 
  HiOutlineDocumentText, 
  HiOutlineChartBar, 
  HiOutlineCog, 
  HiCurrencyDollar,
  HiOutlineBell, 
  HiOutlineLogout, 
  HiOutlineChevronDown, 
  HiOutlineChevronUp, 
  HiOutlineLockClosed,
  HiCheckCircle,
} from "react-icons/hi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { IoTimerSharp } from "react-icons/io5";
import { FaShareFromSquare } from "react-icons/fa6";
import { IoPeople } from "react-icons/io5";
import { RiDashboard3Fill } from "react-icons/ri";
import { MdDashboardCustomize } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../partials/logosibbap.png";
import { FaEnvelopeOpenText } from "react-icons/fa";

const SideBar = ({ mode }) => {
  const [loanDropdown, setLoanDropdown] = useState(false);
  const [savingsDropdown, setSavingsDropdown] = useState(false);
  const [membersDropdown, setMembersDropdown] = useState(false);
  const [maintenanceDropdown, setMaintenanceDropdown] = useState(false);
  const [userType, setUserType] = useState("");
  const [activePath, setActivePath] = useState("");
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Set active path based on the mode prop (if provided) or current location
  useEffect(() => {
    // Retrieve userType from session storage and check allowed roles
    const storedUserType = sessionStorage.getItem("usertype");
    const allowedAdminRoles = [
      "Account Officer",
      "Loan Manager",
      "Treasurer",
      "General Manager",
      "System Admin",
    ];
    if (!storedUserType || !allowedAdminRoles.includes(storedUserType)) {
      navigate("/authorize");
    } else {
      setUserType(storedUserType);
      // If a mode is provided, override activePath with the corresponding route
      if (mode === "memberRegistration") {
        setActivePath("/members-registration");
      } else if (mode === "memberApplication") {
        setActivePath("/member-application");
      } else {
        setActivePath(location.pathname);
      }
    }
  }, [navigate, location.pathname, mode]);

  // Logout modal functions
  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLogoutModalVisible(false);
    navigate("/");
  };

  const isSystemAdmin = userType === "System Admin";

  const allowed = {
    dashboard: true,
    members: isSystemAdmin || userType === "Account Officer",
    savings: isSystemAdmin || userType === "Account Officer",
    loan: isSystemAdmin || (userType === "General Manager" || userType === "Loan Officer"),
    fileMaintenance: isSystemAdmin,
    report: isSystemAdmin || userType === "General Manager",
    users: isSystemAdmin,
    announcement: isSystemAdmin,
    maintenance: isSystemAdmin,
    logout: true,
  };

  const loanSubAllowed = {
    borrower: isSystemAdmin || userType === "Loan Manager",
    "loan-dashboard": isSystemAdmin || userType === "Loan Manager",
    "loan-application": isSystemAdmin || userType === "Loan Manager",
    "loan-applicant": isSystemAdmin || userType === "Loan Manager",
    "loan-approval": isSystemAdmin || userType === "Treasurer",
  };

  const savingsSubAllowed = {
    "savings-dashboard": isSystemAdmin || userType === "Account Officer",
    "share-capital": isSystemAdmin || userType === "Account Officer",
    "regular-savings": isSystemAdmin || userType === "Account Officer",
    "time-deposit": isSystemAdmin || userType === "Account Officer",
  };

  // Helper function to render a menu item with active styling
  const renderItem = (allowedFlag, to, icon, label, onClick = null) => {
    const isActive = activePath === to;
    const baseClasses = "flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200";
    const activeClasses = isActive
      ? "bg-green-600 text-white font-medium shadow-md"
      : "text-gray-700 hover:text-green-600 hover:bg-green-50";
    const iconElement = icon
      ? cloneElement(icon, {
          className: `${isActive ? "text-white" : "text-gray-600"} mr-3 text-lg`,
        })
      : null;
    const handleClick = (e) => {
      if (onClick) onClick(e);
      setActivePath(to);
    };

    if (allowedFlag) {
      return (
        <Link to={to} onClick={handleClick} className={`${baseClasses} ${activeClasses}`}>
          {iconElement}
          <span className="text-sm">{label}</span>
        </Link>
      );
    } else {
      return (
        <div className="flex items-center w-full px-4 py-2 rounded-md bg-gray-100 cursor-not-allowed">
          {icon && cloneElement(icon, { className: "text-gray-400 mr-3 text-lg" })}
          <span className="text-gray-400 text-sm">{label}</span>
          <HiOutlineLockClosed className="text-gray-400 ml-auto" />
        </div>
      );
    }
  };

  // Helper function to render dropdown headers
  const renderDropdownHeader = (isOpen, setIsOpen, icon, label, isAllowed = true) => {
    const baseClasses = "flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200";
    const classes = isAllowed
      ? `${baseClasses} text-gray-700 hover:text-green-600 hover:bg-green-50 cursor-pointer`
      : `${baseClasses} bg-gray-100 cursor-not-allowed`;
    
    return (
      <div
        className={classes}
        onClick={() => isAllowed && setIsOpen(!isOpen)}
      >
        {cloneElement(icon, { className: `${isAllowed ? "text-gray-600" : "text-gray-400"} mr-3 text-lg` })}
        <span className={`flex-grow text-sm ${isAllowed ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
        {isAllowed && (
          isOpen ? (
            <HiOutlineChevronUp className="text-gray-600" />
          ) : (
            <HiOutlineChevronDown className="text-gray-600" />
          )
        )}
        {!isAllowed && <HiOutlineLockClosed className="text-gray-400 ml-auto" />}
      </div>
    );
  };

  return (
    <div className="w-64 h-screen flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Logo Container */}
      <div className="p-4 bg-white border-b border-gray-200 flex items-center">
        <img src={logo} alt="Sibbap logo" className="w-10 h-auto mr-3" />
        <h1 className="font-bold text-lg text-gray-800">Sibbap Cooperative</h1>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
        <div className="text-sm font-medium text-green-800">{userType}</div>
        <div className="text-xs text-gray-500">Logged in</div>
      </div>

      {/* Sidebar Menu Container */}
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Main Menu</div>
        <ul className="space-y-1 px-2 mb-6">
          <li>{renderItem(allowed.dashboard, "/dashboard", <HiOutlineHome />, "Dashboard")}</li>

          {/* Members Dropdown */}
          <li>
            {renderDropdownHeader(
              membersDropdown, 
              setMembersDropdown, 
              <HiOutlineUserGroup />, 
              "Members", 
              allowed.members
            )}
            {membersDropdown && allowed.members && (
              <ul className="ml-7 mt-1 space-y-1 border-l-2 border-green-100 pl-2">
                {mode !== "memberRegistration" &&
                  renderItem(
                    allowed.members,
                    "/member-application",
                    <FaEnvelopeOpenText />,
                    "Member Application"
                  )}
                {mode !== "memberApplication" &&
                  renderItem(
                    allowed.members,
                    "/members-registration",
                    <HiCheckCircle />,
                    "Member Registration"
                  )}
                {renderItem(allowed.members, "/members", <HiOutlineUserGroup />, "Member List")}
              </ul>
            )}
          </li>

          {/* Savings Dropdown */}
          <li>
            {renderDropdownHeader(
              savingsDropdown, 
              setSavingsDropdown, 
              <HiOutlineBanknotes />, 
              "Savings", 
              allowed.savings
            )}
            {savingsDropdown && allowed.savings && (
              <ul className="ml-7 mt-1 space-y-1 border-l-2 border-green-100 pl-2">
                <li>
                  {renderItem(
                    savingsSubAllowed["savings-dashboard"],
                    "/savings-dashboard",
                    <RiDashboard3Fill />,
                    "Savings Dashboard"
                  )}
                </li>
                <li>
                  {renderItem(
                    savingsSubAllowed["share-capital"],
                    "/share-capital",
                    <FaShareFromSquare />,
                    "Share Capital"
                  )}
                </li>
                <li>
                  {renderItem(
                    savingsSubAllowed["regular-savings"],
                    "/regular-savings",
                    <HiCurrencyDollar />,
                    "Regular Savings"
                  )}
                </li>
                <li>
                  {renderItem(
                    savingsSubAllowed["time-deposit"],
                    "/time-deposit",
                    <IoTimerSharp />,
                    "Time Deposit"
                  )}
                </li>
              </ul>
            )}
          </li>

          {/* Loan Dropdown */}
          <li>
            {renderDropdownHeader(
              loanDropdown, 
              setLoanDropdown, 
              <HiBriefcase />, 
              "Loan", 
              allowed.loan
            )}
            {loanDropdown && allowed.loan && (
              <ul className="ml-7 mt-1 space-y-1 border-l-2 border-green-100 pl-2">
                <li>
                  {renderItem(
                    loanSubAllowed["loan-dashboard"],
                    "/loan-dashboard",
                    <MdDashboardCustomize />,
                    "Loan Dashboard"
                  )}
                </li>
                <li>
                  {renderItem(
                    loanSubAllowed["loan-application"],
                    "/loan-application",
                    <HiOutlineDocumentText />,
                    "Loan Application"
                  )}
                </li>
                <li>
                  {renderItem(
                    loanSubAllowed["loan-approval"],
                    "/loan-approval",
                    <HiCheckCircle />,
                    "Loan Approval"
                  )}
                </li>
                <li>
                  {renderItem(
                    loanSubAllowed["borrower"],
                    "/borrower",
                    <HiOutlineUserGroup />,
                    "Borrowers"
                  )}
                </li>
              </ul>
            )}
          </li>
        </ul>

        <div className="px-3 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Administration</div>
        <ul className="space-y-1 px-2">
          {/* System Maintenance Dropdown */}
          <li>
            {renderDropdownHeader(
              maintenanceDropdown, 
              setMaintenanceDropdown, 
              <HiOutlineCog />, 
              "System Maintenance", 
              allowed.maintenance
            )}
            {maintenanceDropdown && allowed.maintenance && (
              <ul className="ml-7 mt-1 space-y-1 border-l-2 border-green-100 pl-2">
                <li>
                  {renderItem(
                    allowed.maintenance,
                    "/system-maintenance/loan",
                    <HiBriefcase />,
                    "Loan Module"
                  )}
                </li>
                <li>
                  {renderItem(
                    allowed.maintenance,
                    "/system-maintenance/savings",
                    <HiOutlineBanknotes />,
                    "Savings Module"
                  )}
                </li>
                <li>
                  {renderItem(
                    allowed.maintenance,
                    "/system-maintenance/members",
                    <HiOutlineUserGroup />,
                    "Members Module"
                  )}
                </li>
              </ul>
            )}
          </li>

          <li>{renderItem(allowed.report, "/report", <HiOutlineChartBar />, "Report")}</li>
          <li>{renderItem(allowed.users, "/users", <HiOutlineUserGroup />, "Users")}</li>
          <li>{renderItem(allowed.announcement, "/announcement", <HiOutlineBell />, "Announcement")}</li>
        </ul>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-2 rounded-md bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
        >
          <HiOutlineLogout className="mr-2" />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        open={isLogoutModalVisible}
        onOk={confirmLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
        okText="Yes, Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
    </div>
  );
};

export default SideBar;