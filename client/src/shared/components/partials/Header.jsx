import React, { useState, useEffect, useRef } from 'react';
import { 
  FaCog, 
  FaQuestionCircle, 
  FaBell, 
  FaUserCircle, 
  FaTimes, 
  FaCircle 
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserHeader = ({ name, userType }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Get initials from name
  const initials = React.useMemo(() => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0].toUpperCase())
      .join('');
  }, [name]);

  // Generate a consistent color based on name
  const avatarColor = React.useMemo(() => {
    if (!name) return "#A0C4FF";
    const pastelColors = [
      "#FFADAD", "#FFD6A5", "#FDFFB6", 
      "#CAFFBF", "#9BF6FF", "#A0C4FF", 
      "#BDB2FF", "#FFC6FF"
    ];
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return pastelColors[charCodeSum % pastelColors.length];
  }, [name]);

  // Get userId from session storage; if no userId exists, the user is not logged in.
  const userId = sessionStorage.getItem('userId');

  // Helper to compute "time ago" from createdAt timestamp
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInSec = Math.floor(diffInMs / 1000);
    if (diffInSec < 60) {
      return `${diffInSec} sec ago`;
    }
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) {
      return `${diffInMin} min ago`;
    }
    const diffInHr = Math.floor(diffInMin / 60);
    if (diffInHr < 24) {
      return `${diffInHr} hrs ago`;
    }
    const diffInDays = Math.floor(diffInHr / 24);
    return `${diffInDays} days ago`;
  };

  // Fetch notifications from API and transform the data
  const fetchNotifications = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:3001/api/notifications/${userId}`);
      // Transform the API response to match the expected structure
      const transformedNotifications = response.data.map((notif) => ({
        id: notif.id,
        title: 'Notification',
        content: notif.message,
        time: getTimeAgo(notif.createdAt),
        read: notif.isRead === 1
      }));
      setNotifications(transformedNotifications);
    } catch (err) {
      setError('Failed to load notifications');
      // For demo purposes, set sample notifications if API call fails
      setNotifications([
        { id: 1, title: 'Notification', content: 'You have a new message from Admin', time: '5 min ago', read: false },
        { id: 2, title: 'System update', content: 'System maintenance scheduled for tonight', time: '1 hour ago', read: false },
        { id: 3, title: 'Welcome aboard!', content: 'Welcome to our platform! Let us know if you need help.', time: '1 day ago', read: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch notifications if the user is logged in
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle notifications visibility
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Mark a single notification as read via API call
  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:3001/api/notifications/${id}/read`);
      setNotifications(
        notifications.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  // Mark all notifications as read via multiple API calls
  const markAllAsRead = async () => {
    try {
      // For each unread notification, call the API endpoint
      await Promise.all(
        notifications
          .filter(notif => !notif.read)
          .map(notif =>
            axios.put(`http://localhost:3001/api/notifications/${notif.id}/read`)
          )
      );
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read", error);
    }
  };

  // Delete notification via local state update (and optionally call an API endpoint)
  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(notif => notif.id !== id));
    // In a real app, also delete the notification from the backend.
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="px-6 py-4 mb-4 flex justify-between items-center bg-white shadow-sm border border-gray-100">
      {/* Left Section - User Info */}
      <div className="flex items-center space-x-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-800">Welcome, {name || 'User'}!</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-600">{userType}</span>
            <div className="ml-3 flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section - Actions */}
      <div className="flex items-center space-x-1 md:space-x-3">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <FaBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500 text-sm">{error}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                ) : (
                  <ul>
                    {notifications.map((notif) => (
                      <li 
                        key={notif.id} 
                        className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="p-3 flex relative cursor-pointer">
                          {!notif.read && (
                            <div className="absolute left-3 top-4">
                              <FaCircle className="text-blue-500 w-2 h-2" />
                            </div>
                          )}
                          <div className={`flex-1 ${!notif.read ? 'pl-4' : ''}`}>
                            <div className="flex justify-between">
                              <p className="font-medium text-sm text-gray-800">{notif.title}</p>
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={(e) => deleteNotification(notif.id, e)}
                                aria-label="Delete notification"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{notif.content}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* <div className="p-2 border-t border-gray-200 text-center">
                <button 
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications');
                  }}
                >
                  View all notifications
                </button>
              </div> */}
            </div>
          )}
        </div>
        
        {/* Settings */}
        <button className="flex items-center p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <FaCog className="w-5 h-5" />
          <span className="hidden md:inline text-sm ml-1.5 font-medium">Settings</span>
        </button>
        
        {/* Help */}
        <button className="flex items-center p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <FaQuestionCircle className="w-5 h-5" />
          <span className="hidden md:inline text-sm ml-1.5 font-medium">Help</span>
        </button>
        
        {/* Profile Menu */}
        <div className="hidden md:block pl-3 ml-2 border-l border-gray-200">
          <button className="flex items-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <FaUserCircle className="w-5 h-5" />
            <span className="text-sm ml-1.5 font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
