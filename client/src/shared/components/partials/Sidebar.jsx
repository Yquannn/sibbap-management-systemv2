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
  const [maintenanceDropdown, setMaintenanceDropdown] = useState(false); // new state for maintenance dropdown
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
    const baseClasses = "flex items-center w-full p-2 rounded transition-colors";
    const activeClasses = isActive
      ? "bg-green-500 text-white"
      : "text-gray-600 hover:text-green-500 hover:bg-gray-200";
    const iconElement = icon
      ? cloneElement(icon, {
          className: `${isActive ? "text-white" : "text-gray-700"} mr-2`,
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
        <img src={logo} alt="sibbap logo" className="w-12 h-auto mr-2" />
        <h1 className="font-bold text-base text-gray-800">Sibbap Cooperative</h1>
      </div>

      {/* Sidebar Menu Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-white rounded shadow">
        <ul className="space-y-2">
          <li>{renderItem(allowed.dashboard, "/dashboard", <HiOutlineHome />, "Dashboard")}</li>

          {/* Members Dropdown */}
          <li
            className="flex items-center w-full p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors"
            onClick={() => setMembersDropdown(!membersDropdown)}
          >
            {cloneElement(<HiOutlineUserGroup />, { className: "mr-2 text-gray-700" })}
            <span className="flex-grow text-gray-700">Members</span>
            {membersDropdown ? (
              <HiOutlineChevronUp className="text-gray-700" />
            ) : (
              <HiOutlineChevronDown className="text-gray-700" />
            )}
          </li>
          {membersDropdown && (
            <ul className="ml-6 space-y-1">
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

          {/* Savings Dropdown */}
          <li
            className="flex items-center w-full p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors"
            onClick={() => setSavingsDropdown(!savingsDropdown)}
          >
            {cloneElement(<HiOutlineBanknotes />, { className: "mr-2 text-gray-700" })}
            <span className="flex-grow text-gray-700">Savings</span>
            {savingsDropdown ? (
              <HiOutlineChevronUp className="text-gray-700" />
            ) : (
              <HiOutlineChevronDown className="text-gray-700" />
            )}
          </li>
          {savingsDropdown && (
            <ul className="ml-6 space-y-1">
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

          {/* Loan Dropdown */}
          {allowed.loan ? (
            <>
              <li
                className="flex items-center w-full p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors"
                onClick={() => setLoanDropdown(!loanDropdown)}
              >
                {cloneElement(<HiBriefcase />, { className: "mr-2 text-gray-700" })}
                <span className="flex-grow text-gray-700">Loan</span>
                {loanDropdown ? (
                  <HiOutlineChevronUp className="text-gray-700" />
                ) : (
                  <HiOutlineChevronDown className="text-gray-700" />
                )}
              </li>
              {loanDropdown && (
                <ul className="ml-6 space-y-1">
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
                  {/* <li>
                    {renderItem(
                      loanSubAllowed["loan-applicant"],
                      "/loan-applicant",
                      <IoPeople />,
                      "Loan Applicant"
                    )}
                  </li> */}
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
            </>
          ) : (
            <li className="flex items-center w-full p-2 rounded bg-gray-200 cursor-not-allowed">
              {cloneElement(<HiBriefcase />, { className: "mr-2 text-gray-500" })}
              <span className="text-gray-500">Loan</span>
              <HiOutlineLockClosed className="text-gray-500 ml-auto" />
            </li>
          )}

<<<<<<< HEAD
          {/* System Maintenance Dropdown */}
          {allowed.maintenance && (
            <>
              <li
                className="flex items-center w-full p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors"
                onClick={() => setMaintenanceDropdown(!maintenanceDropdown)}
              >
                {cloneElement(<HiOutlineCog />, { className: "mr-2 text-gray-700" })}
                <span className="flex-grow text-gray-700">System Maintenance</span>
                {maintenanceDropdown ? (
                  <HiOutlineChevronUp className="text-gray-700" />
                ) : (
                  <HiOutlineChevronDown className="text-gray-700" />
                )}
              </li>
              {maintenanceDropdown && (
                <ul className="ml-6 space-y-1">
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
            </>
          )}

=======
          {/* {renderItem(
            allowed.fileMaintenance,
            "/file-maintenance",
            <HiOutlineDocumentText />,
            "File Maintenance"
          )} */}
>>>>>>> 5d8b10f5df1ab1705d18c069d523585a10ccea2b
          {renderItem(allowed.report, "/report", <HiOutlineChartBar />, "Report")}
          {renderItem(allowed.users, "/users", <HiOutlineUserGroup />, "Users")}
          {renderItem(allowed.announcement, "/announcement", <HiOutlineBell />, "Announcement")}
          <li>
            <div
              onClick={handleLogout}
              className="flex items-center w-full p-2 rounded bg-red-500 text-white cursor-pointer hover:bg-red-600"
            >
              <HiOutlineLogout className="mr-2" />
              <span>Logout</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Logout Confirmation Modal using Antd v5 "open" prop */}
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
