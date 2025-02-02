import { FaTachometerAlt, FaUsers, FaMoneyBill, FaPiggyBank, FaFile, FaChartLine, FaWrench, FaBullhorn, FaSignOutAlt, FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import logo from '../partials/logosibbap.png';

const SideBar = () => {
  const [loanDropdown, setLoanDropdown] = useState(false);

  return (
    <div className="w-64 h-screen bg-gray-100 p-4">
      <img src={logo} alt='sibbap logo' className="w-3/4 h-auto mb-4 mx-auto" />

      <ul className="mt-10">
        <li className="mb-6 flex items-center">
          <FaTachometerAlt className="mr-2 text-gray-700" />
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-500">Dashboard</Link>
        </li>

        <li className="mb-6 flex items-center">
          <FaUsers className="mr-2 text-gray-700" />
          <Link to="/members" className="text-gray-700 hover:text-blue-500">Members</Link>
        </li>

        <li className="mb-6 flex items-center">
          <FaPiggyBank className="mr-2 text-gray-700" />
          <Link to="/savings" className="text-gray-700 hover:text-blue-500">Savings</Link>
        </li>

        <li className="mb-6 flex items-center cursor-pointer" onClick={() => setLoanDropdown(!loanDropdown)}>
          <FaMoneyBill className="mr-2 text-gray-700" />
          <span className="text-gray-700 hover:text-blue-500 flex-grow">Loan</span>
          {loanDropdown ? <FaCaretUp className="text-gray-700" /> : <FaCaretDown className="text-gray-700" />}
        </li>

        {loanDropdown && (
          <ul className="ml-6">
            <li className="mb-2">
              <Link to="/borrower" className="text-gray-600 hover:text-blue-500 block pl-4 py-1 rounded-md hover:bg-gray-200">Borrowers</Link>
            </li>
            <li className="mb-2">
              <Link to="/apply-for-loan" className="text-gray-600 hover:text-blue-500 block pl-4 py-1 rounded-md hover:bg-gray-200">Apply for Loan</Link>
            </li>
            <li className="mb-2">
              <Link to="/loan-applicant" className="text-gray-600 hover:text-blue-500 block pl-4 py-1 rounded-md hover:bg-gray-200">Loan Applicant</Link>
            </li>
            {/* <li className="mb-2">
              <Link to="/loan-evaluation" className="text-gray-600 hover:text-blue-500 block pl-4 py-1 rounded-md hover:bg-gray-200">Loan Evaluation</Link>
            </li> */}
            <li className="mb-2">
              <Link to="/loan-approval" className="text-gray-600 hover:text-blue-500 block pl-4 py-1 rounded-md hover:bg-gray-200">Loan Approval</Link>
            </li>
          </ul>
        )}

        <li className="mb-6 flex items-center">
          <FaFile className="mr-2 text-gray-700" />
          <Link to="/file-maintenance" className="text-gray-700 hover:text-blue-500">File Maintenance</Link>
        </li>

        <li className="mb-6 flex items-center">
          <FaChartLine className="mr-2 text-gray-700" />
          <Link to="/report" className="text-gray-700 hover:text-blue-500">Report</Link>
        </li>

        <li className="mb-6 flex items-center">
          <FaUsers className="mr-2 text-gray-700" />
          <Link to="/users" className="text-gray-700 hover:text-blue-500">Users</Link>
        </li>

        <li className="mb-6 flex items-center">
          <FaBullhorn className="mr-2 text-gray-700" />
          <Link to="/announcement" className="text-gray-700 hover:text-blue-500">Announcement</Link>
        </li>

        <li className="mb-6 flex items-center">
          <FaWrench className="mr-2 text-gray-700" />
          <Link to="/maintenance" className="text-gray-700 hover:text-blue-500">Maintenance</Link>
        </li>

        <li className="mb-6 flex items-center">
          <FaSignOutAlt className="mr-2 text-gray-700" />
          <Link to="/logout" className="text-gray-700 hover:text-blue-500">Log out</Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
