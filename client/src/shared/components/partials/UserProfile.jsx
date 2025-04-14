import React, { useMemo } from 'react';
import { FaUserCircle, FaCog, FaSignOutAlt, FaIdCard, FaHistory } from 'react-icons/fa';

const ProfileComponent = ({ 
  name, 
  userType, 
  email = "user@example.com", 
  department = "General",
  joinDate = "Jan 2025",
  onLogout = () => console.log("Logout clicked"), 
  onViewProfile = () => console.log("View profile clicked"),
  onSettings = () => console.log("Settings clicked")
}) => {
  // Get initials from name (filtering out empty strings to avoid errors)
  const initials = useMemo(() => {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(part => part) // remove empty parts
      .map(n => n[0].toUpperCase())
      .join('');
  }, [name]);

  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const profileRef = React.useRef(null);

  // Toggle profile dropdown visibility
  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
  };

  // Close the profile dropdown if click occurs outside its area
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={profileRef}>
      {/* Profile Button */}
      <button 
        className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={toggleProfileMenu}
      >
        {/* Avatar with Initials */}
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm"
        >
          <span className="z-10 text-sm">{initials}</span>
          {/* Subtle pattern for depth */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 75%)',
            }}
          ></div>
        </div>
        
        <div className="text-left hidden md:block">
          <div className="font-medium text-sm">{name || 'User'}</div>
          <div className="text-xs text-gray-500">{userType}</div>
        </div>
      </button>
      
      {/* Profile Dropdown Menu */}
      {showProfileMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Profile Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              {/* Larger Avatar */}
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm"
              >
                <span className="z-10 text-lg">{initials}</span>
                {/* Subtle pattern for depth */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 75%)',
                  }}
                ></div>
              </div>
              
              <div className="ml-3">
                <h4 className="font-semibold text-gray-800">{name || 'User'}</h4>
                <div className="text-sm text-gray-600">{email}</div>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="ml-1 text-xs text-green-600">Online</span>
                </div>
              </div>
            </div>
            
            {/* User Details */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Department</span>
                  <p className="font-medium text-gray-800">{department}</p>
                </div>
                <div>
                  <span className="text-gray-500">Member Since</span>
                  <p className="font-medium text-gray-800">{joinDate}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Role</span>
                  <p className="font-medium text-gray-800">{userType}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Options */}
          <div className="py-2">
            <button
              onClick={onViewProfile}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaIdCard className="w-4 h-4 mr-3 text-gray-500" />
              View Profile
            </button>
            
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaHistory className="w-4 h-4 mr-3 text-gray-500" />
              Activity History
            </button>
            
            <button
              onClick={onSettings}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaCog className="w-4 h-4 mr-3 text-gray-500" />
              Settings
            </button>
            
            <div className="my-1 border-t border-gray-200"></div>
            
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <FaSignOutAlt className="w-4 h-4 mr-3 text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileComponent;