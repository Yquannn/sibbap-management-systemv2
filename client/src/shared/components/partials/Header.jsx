import React from 'react';
import blank from './blankPicture.png';
import { FaCog, FaSignOutAlt, FaQuestionCircle } from 'react-icons/fa';

const UserHeader = ({ name, userType, notifications, logout }) => {
  return (
    <div className="p-5 shadow-md flex justify-between items-center bg-white">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <div className="avatar">
          <div className="w-12 h-12 rounded-full border-2 border-gray-300 overflow-hidden">
            <img 
              src={blank} 
              alt={`${name} avatar`} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
        <div>
          <div className="font-bold text-lg">Welcome, {name}!</div>
          <div className="text-sm text-gray-500 flex items-center">
            {userType}
            <span className="ml-2 flex items-center text-green-500 text-xs">
              <svg className="w-2 h-2 fill-current mr-1" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Online
            </span>
          </div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <button className="relative">
          <svg 
            className="w-6 h-6 text-gray-600 hover:text-gray-800" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15 17h5l-1.403-2.807A2 2 0 0118 12.382V8a6 6 0 10-12 0v4.382a2 2 0 01-.597 1.411L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
            />
          </svg>
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {notifications}
            </span>
          )}
        </button>
        {/* Settings */}
        <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
          <FaCog className="w-6 h-6" />
          <span className="hidden md:inline text-sm">Settings</span>
        </button>
        {/* Help */}
        <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
          <FaQuestionCircle className="w-6 h-6" />
          <span className="hidden md:inline text-sm">Help</span>
        </button>
        {/* Logout */}
        
      </div>
    </div>
  );
};

export default UserHeader;
