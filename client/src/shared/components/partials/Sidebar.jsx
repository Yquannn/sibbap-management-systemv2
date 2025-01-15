import { FaTachometerAlt, FaUsers, FaMoneyBill, FaPiggyBank, FaFile, FaChartLine, FaWrench, FaBullhorn, FaSignOutAlt } from 'react-icons/fa';
import logo from '../partials/logosibbap.png';  

const SideBar = () => {
  return (
    <div className="w-64 h-screen bg-gray-100 p-4 ">
      <img src={logo} alt='sibbap logo' className="w-3/4 h-auto mb-4 mx-auto" />
      
      <ul className="mt-10">
        <li className="mb-6 flex items-center">
          <FaTachometerAlt className="mr-2 text-gray-700" />
          <a href="dashboard" className="text-gray-700 hover:text-blue-500">Dashboard</a>
        </li>
        {/* <li className="mb-4 flex items-center">
          <FaUsers className="mr-2 text-gray-700" />
          <a href="membership" className="text-gray-700 hover:text-blue-500">Membership</a>
        </li> */}
        <li className="mb-6 flex items-center">
          <FaUsers className="mr-2 text-gray-700" />
          <a href="members" className="text-gray-700 hover:text-blue-500">Members</a>
        </li>

        <li className="mb-6 flex items-center">
          <FaMoneyBill className="mr-2 text-gray-700" />
          <a href="loan" className="text-gray-700 hover:text-blue-500">Loan</a>
        </li>
        <li className="mb-6 flex items-center">
          <FaPiggyBank className="mr-2 text-gray-700" />
          <a href="savings" className="text-gray-700 hover:text-blue-500">Savings</a>
        </li>
        <li className="mb-6 flex items-center">
          <FaFile className="mr-2 text-gray-700" />
          <a href="file-maintenance" className="text-gray-700 hover:text-blue-500">File Maintenance</a>
        </li>
        <li className="mb-6 flex items-center">
          <FaChartLine className="mr-2 text-gray-700" />
          <a href="report" className="text-gray-700 hover:text-blue-500">Report</a>
        </li>
        <li className="mb-6 flex items-center">
          <FaUsers className="mr-2 text-gray-700" />
          <a href="users" className="text-gray-700 hover:text-blue-500">Users</a>
        </li>
        <li className="mb-6 flex items-center">
          <FaBullhorn className="mr-2 text-gray-700" />
          <a href="announcement" className="text-gray-700 hover:text-blue-500">Announcement</a>
        </li>
        <li className="mb-6 flex items-center">
          <FaWrench className="mr-2 text-gray-700" />
          <a href="maintenance" className="text-gray-700 hover:text-blue-500">Maintenance</a>
        </li>
        <li className="mb-6 flex items-center">
          <FaSignOutAlt className="mr-2 text-gray-700" /> {/* Updated icon */}
          <a href="logout" className="text-gray-700 hover:text-blue-500">Log out</a>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
