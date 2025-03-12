import React, { useState, useEffect } from 'react';
import { 
  FaTachometerAlt, FaUsers, FaMoneyBill, FaPiggyBank, FaFile, 
  FaChartLine, FaWrench, FaBullhorn, FaSignOutAlt, FaCaretDown, FaCaretUp, FaLock 
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../partials/logosibbap.png';

const SideBar = () => {
  const [loanDropdown, setLoanDropdown] = useState(false);
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve userType from session storage
    const storedUserType = sessionStorage.getItem('usertype');
    // Allowed admin roles
    const allowedAdminRoles = ["Teller", "Loan Manager", "Treasurer", "General Manager", "System Admin"];
    
    if (!storedUserType || !allowedAdminRoles.includes(storedUserType)) {
      // Redirect to member dashboard if user is not authorized to access the admin panel.
      navigate("/member-dashboard");
    } else {
      setUserType(storedUserType);
    }
  }, [navigate]);

  // Function to handle logout: clear storage then navigate to login route
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/'); // Adjust route if needed
  };

  const isSystemAdmin = userType === "System Admin";

  // Define allowed modules based on userType or if System Admin
  const allowed = {
    dashboard: true,
    members: isSystemAdmin ? true : false,
    savings: isSystemAdmin ? true : userType === "Teller",
    loan: isSystemAdmin ? true : (userType === "Loan Manager" || userType === "Treasurer"),
    fileMaintenance: isSystemAdmin ? true : false,
    report: isSystemAdmin ? true : userType === "General Manager",
    users: isSystemAdmin ? true : false,
    announcement: isSystemAdmin ? true : false,
    maintenance: isSystemAdmin ? true : false,
    logout: true,
  };

  // For the loan dropdown, define allowed submodules:
  const loanSubAllowed = {
    borrower: isSystemAdmin ? true : userType === "Loan Manager",
    "apply-for-loan": isSystemAdmin ? true : userType === "Loan Manager",
    "loan-applicant": isSystemAdmin ? true : userType === "Loan Manager",
    "loan-approval": isSystemAdmin ? true : userType === "Treasurer",
  };

  // Helper to render enabled link vs. disabled item with a lock icon.
  const renderItem = (allowedFlag, to, icon, label, onClick = null) => {
    if (allowedFlag) {
      return (
        <Link 
          to={to} 
          onClick={onClick} 
          className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          {icon && <span className="mr-2">{icon}</span>}
          <span>{label}</span>
        </Link>
      );
    } else {
      return (
        <div className="flex items-center w-full p-2 rounded-md bg-gray-200 cursor-not-allowed">
          {icon && <span className="mr-2 text-gray-500">{icon}</span>}
          <span className="text-gray-500">{label}</span>
          <FaLock className="text-gray-500 ml-auto" />
        </div>
      );
    }
  };

  return (
    <div className="w-56 h-screen p-4 z-[10]">
      <img 
        src={logo} 
        alt="sibbap logo" 
        className="w-3/4 h-auto mb-4 mx-auto" 
      />

      <ul className="mt-10 space-y-2">
        {/* Dashboard - Always allowed */}
        <li className="mb-2">
          {renderItem(allowed.dashboard, "/dashboard", <FaTachometerAlt className="text-gray-700" />, "Dashboard")}
        </li>

        {/* Members */}
        <li className="mb-2">
          {renderItem(allowed.members, "/members", <FaUsers className="text-gray-700" />, "Members")}
        </li>

        {/* Savings - Only for Teller or System Admin */}
        <li className="mb-2">
          {renderItem(allowed.savings, "/savings", <FaPiggyBank className="text-gray-700" />, "Savings")}
        </li>

        {/* Loan Module - Only for Loan Manager, Treasurer or System Admin */}
        {allowed.loan ? (
          <>
            <li 
              className="mb-2 flex items-center w-full p-2 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"
              onClick={() => setLoanDropdown(!loanDropdown)}
            >
              <FaMoneyBill className="mr-2 text-gray-700" />
              <span className="flex-grow text-gray-700 hover:text-blue-500">Loan</span>
              {loanDropdown ? <FaCaretUp className="text-gray-700" /> : <FaCaretDown className="text-gray-700" />}
            </li>
            {loanDropdown && (
              <ul className="ml-6 space-y-1">
                <li className="mb-2">
                  {renderItem(loanSubAllowed["borrower"], "/borrower", null, "Borrowers")}
                </li>
                <li className="mb-2">
                  {renderItem(loanSubAllowed["apply-for-loan"], "/apply-for-loan", null, "Apply for Loan")}
                </li>
                <li className="mb-2">
                  {renderItem(loanSubAllowed["loan-applicant"], "/loan-applicant", null, "Loan Applicant")}
                </li>
                <li className="mb-2">
                  {renderItem(loanSubAllowed["loan-approval"], "/loan-approval", null, "Loan Approval")}
                </li>
              </ul>
            )}
          </>
        ) : (
          <li className="mb-2 flex items-center w-full p-2 rounded-md bg-gray-200 cursor-not-allowed">
            <FaMoneyBill className="mr-2 text-gray-500" />
            <span className="text-gray-500">Loan</span>
            <FaLock className="text-gray-500 ml-auto" />
          </li>
        )}

        {/* File Maintenance */}
        <li className="mb-2">
          {renderItem(allowed.fileMaintenance, "/file-maintenance", <FaFile className="text-gray-700" />, "File Maintenance")}
        </li>

        {/* Report Generation */}
        <li className="mb-2">
          {renderItem(allowed.report, "/report", <FaChartLine className="text-gray-700" />, "Report")}
        </li>

        {/* Users */}
        <li className="mb-2">
          {renderItem(allowed.users, "/users", <FaUsers className="text-gray-700" />, "Users")}
        </li>

        {/* Announcement */}
        <li className="mb-2">
          {renderItem(allowed.announcement, "/announcement", <FaBullhorn className="text-gray-700" />, "Announcement")}
        </li>

        {/* Maintenance */}
        <li className="mb-2">
          {renderItem(allowed.maintenance, "/maintenance", <FaWrench className="text-gray-700" />, "Maintenance")}
        </li>

        {/* Log out - Always allowed */}
        <li className="mb-2">
          <div
            onClick={handleLogout}
            className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <FaSignOutAlt className="mr-2 text-gray-700" />
            <span>Log out</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
