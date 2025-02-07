import { 
  FaTachometerAlt, FaUsers, FaMoneyBill, FaPiggyBank, FaFile, 
  FaChartLine, FaWrench, FaBullhorn, FaSignOutAlt, FaCaretDown, FaCaretUp 
} from 'react-icons/fa';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../partials/logosibbap.png';

const SideBar = () => {
  const [loanDropdown, setLoanDropdown] = useState(false);

  return (
    <div className="w-64 h-screen bg-gray-100 p-4">
      <img src={logo} alt="sibbap logo" className="w-3/4 h-auto mb-4 mx-auto" />

      <ul className="mt-10">
        <li className="mb-2">
          <Link
            to="/dashboard"
            className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaTachometerAlt className="mr-2 text-gray-700" />
            <span>Dashboard</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            to="/members"
            className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaUsers className="mr-2 text-gray-700" />
            <span>Members</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            to="/savings"
            className="flex items-center w-full text-gray-700 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaPiggyBank className="mr-2 text-gray-700" />
            <span>Savings</span>
          </Link>
        </li>

        <li
          className="mb-2 flex items-center w-full p-2 rounded-md hover:bg-gray-200 cursor-pointer"
          onClick={() => setLoanDropdown(!loanDropdown)}
        >
          <FaMoneyBill className="mr-2 text-gray-700" />
          <span className="flex-grow text-gray-700 hover:text-blue-500">Loan</span>
          {loanDropdown ? <FaCaretUp className="text-gray-700" /> : <FaCaretDown className="text-gray-700" />}
        </li>

        {loanDropdown && (
          <ul className="ml-6">
            <li className="mb-2">
              <Link
                to="/borrower"
                className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
              >
                <span>Borrowers</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/apply-for-loan"
                className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
              >
                <span>Apply for Loan</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/loan-applicant"
                className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
              >
                <span>Loan Applicant</span>
              </Link>
            </li>
            {/* Uncomment if needed
            <li className="mb-2">
              <Link
                to="/loan-evaluation"
                className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
              >
                <span>Loan Evaluation</span>
              </Link>
            </li>
            */}
            <li className="mb-2">
              <Link
                to="/loan-approval"
                className="flex items-center w-full text-gray-600 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
              >
                <span>Loan Approval</span>
              </Link>
            </li>
          </ul>
        )}

        <li className="mb-2">
          <Link
            to="/file-maintenance"
            className="flex items-center w-full text-gray-700 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaFile className="mr-2 text-gray-700" />
            <span>File Maintenance</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            to="/report"
            className="flex items-center w-full text-gray-700 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaChartLine className="mr-2 text-gray-700" />
            <span>Report</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            to="/users"
            className="flex items-center w-full text-gray-700 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaUsers className="mr-2 text-gray-700" />
            <span>Users</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            to="/announcement"
            className="flex items-center w-full text-gray-700 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaBullhorn className="mr-2 text-gray-700" />
            <span>Announcement</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            to="/maintenance"
            className="flex items-center w-full text-gray-700 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaWrench className="mr-2 text-gray-700" />
            <span>Maintenance</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            to="/logout"
            className="flex items-center w-full text-gray-700 hover:text-blue-500 p-2 rounded-md hover:bg-gray-200"
          >
            <FaSignOutAlt className="mr-2 text-gray-700" />
            <span>Log out</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
