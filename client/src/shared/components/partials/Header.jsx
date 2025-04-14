import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FaCog, FaQuestionCircle, FaBell, FaUserCircle, FaTimes, FaCircle, FaCheck, FaRegBell, FaChevronLeft } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserHeader = ({ name, userType }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Get initials from name (filtering out empty strings to avoid errors)
  const initials = useMemo(() => {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(part => part) // remove empty parts
      .map(n => n[0].toUpperCase())
      .join('');
  }, [name]);

  // Get userId from session storage
  const userId = sessionStorage.getItem('userid');

  // Helper function to compute relative "time ago" from a timestamp
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

  // Convert timestamp to formatted date
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Fetch notifications from API and transform the data
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3001/api/notifications/${userId}`);
      const transformedNotifications = response.data.map((item) => {
        // Handle the nested structure - each item may have notification and announcement objects
        const notif = item.notification || item;
        const announcement = item.announcement || null;
        
        return {
          id: notif.id,
          title: notif.title || announcement?.title || 'Notification',
          content: notif.content || notif.message,
          time: getTimeAgo(notif.createdAt),
          formattedTime: formatDateTime(notif.createdAt),
          read: notif.isRead === 1,
          priority: notif.priority || 'normal',
          category: notif.category || 'general',
          createdAt: notif.createdAt,
          actionUrl: notif.actionUrl || null,
          authorized: notif.authorized || 'System',
          // Announcement specific fields
          announcement_id: announcement?.announcement_id || null,
          target_audience: notif.target_audience || null,
          status: notif.status || null,
          start_date: notif.start_date || null,
          end_date: notif.end_date || null
        };
      });
      setNotifications(transformedNotifications);
      console.log(selectedNotification)
    } catch (err) {
      setError('Failed to load notifications');
      // For demo purposes, use sample notifications if API call fails
      // setNotifications([
      //   { 
      //     id: 1, 
      //     title: 'New Message', 
      //     content: 'You have a new message from Admin regarding your recent ticket submission. The admin has requested additional information about the issue you reported.',
      //     time: '5 min ago', 
      //     formattedTime: 'April 14, 2025, 10:23 AM',
      //     read: false,
      //     priority: 'high',
      //     category: 'message',
      //     createdAt: '2025-04-14T10:23:00',
      //     actionUrl: '/messages/123',
      //     sender: 'System Admin'
      //   },
      //   { 
      //     id: 2, 
      //     title: 'System Maintenance', 
      //     content: 'System maintenance is scheduled for tonight from 11:00 PM to 2:00 AM EST. During this time, the platform may experience brief periods of unavailability as we implement important updates and security patches.',
      //     time: '1 hour ago', 
      //     formattedTime: 'April 14, 2025, 09:15 AM',
      //     read: false,
      //     priority: 'medium',
      //     category: 'system',
      //     createdAt: '2025-04-14T09:15:00',
      //     actionUrl: null,
      //     sender: 'IT Department'
      //   },
      //   { 
      //     id: 3, 
      //     title: 'Welcome aboard!', 
      //     content: 'Welcome to our platform! We\'re excited to have you join us. Please take a moment to complete your profile and explore our features. If you have any questions or need assistance, our support team is available 24/7.',
      //     time: '1 day ago', 
      //     formattedTime: 'April 13, 2025, 02:30 PM',
      //     read: true,
      //     priority: 'normal',
      //     category: 'onboarding',
      //     createdAt: '2025-04-13T14:30:00',
      //     actionUrl: '/profile',
      //     sender: 'Onboarding Team'
      //   },
      // ]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch notifications upon mounting (if userId exists) and whenever userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Re-fetch notifications when the dropdown is opened
  useEffect(() => {
    if (showNotifications && userId) {
      fetchNotifications();
    }
  }, [showNotifications, userId, fetchNotifications]);

  // Close the notifications dropdown if click occurs outside its area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle notifications dropdown visibility
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
    // If closing notifications panel, also close detail view
    if (showNotifications) {
      setShowDetailView(false);
    }
  };

  // Open notification detail view
  const openNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setShowDetailView(true);
    // Mark as read when opened
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // Close notification detail view
  const closeDetailView = () => {
    setShowDetailView(false);
  };

  // Mark a single notification as read via API call
  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:3001/api/notifications/${id}/read`);
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  };

  // Mark all notifications as read via multiple API calls
  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(notif => !notif.read)
          .map(notif => axios.put(`http://localhost:3001/api/notifications/${notif.id}/read`))
      );
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read', error);
    }
  };

  // Delete a notification (only from local state in this demo)
  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prevNotifications =>
      prevNotifications.filter(notif => notif.id !== id)
    );
    // If the deleted notification is the one in detail view, close the detail view
    if (selectedNotification && selectedNotification.id === id) {
      setShowDetailView(false);
    }
  };

  // Navigate to action URL if available
  const handleActionClick = (url) => {
    if (url) {
      navigate(url);
      setShowNotifications(false);
      setShowDetailView(false);
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'message':
        return <div className="bg-blue-100 text-blue-500 p-2 rounded-full"><FaRegBell className="w-4 h-4" /></div>;
      case 'system':
      case 'maintenance':
        return <div className="bg-orange-100 text-orange-500 p-2 rounded-full"><FaCog className="w-4 h-4" /></div>;
      case 'onboarding':
        return <div className="bg-green-100 text-green-500 p-2 rounded-full"><FaCheck className="w-4 h-4" /></div>;
      case 'policy update':
        return <div className="bg-purple-100 text-purple-500 p-2 rounded-full"><FaCog className="w-4 h-4" /></div>;
      case 'feature':
        return <div className="bg-blue-100 text-blue-500 p-2 rounded-full"><FaCheck className="w-4 h-4" /></div>;
      default:
        return <div className="bg-gray-100 text-gray-500 p-2 rounded-full"><FaRegBell className="w-4 h-4" /></div>;
    }
  };

  // Get priority indicator
  const getPriorityIndicator = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <div className="w-2 h-2 bg-red-500 rounded-full" title="High priority"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-orange-500 rounded-full" title="Medium priority"></div>;
      case 'normal':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" title="Normal priority"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" title="Low priority"></div>;
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="px-6 py-4 mb-4 flex justify-between items-center bg-white shadow-sm border border-gray-100">
      {/* Left Section - User Info */}
      <div className="flex items-center space-x-4">
        {/* Modern Avatar with Initials */}
        <div
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm cursor-pointer"
        >
          <span className="z-10">{initials}</span>
          {/* Modern overlay effect on hover */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          {/* Subtle pattern for depth */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 75%)',
            }}
          ></div>
          {/* Subtle border for definition */}
          <div className="absolute inset-0 rounded-full border border-white border-opacity-20"></div>
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
          
          {/* Modern Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Notifications</h3>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button 
                    onClick={toggleNotifications}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Notification List or Detail View */}
              {!showDetailView ? (
                <div className="max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id}
                          onClick={() => openNotificationDetail(notification)}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start">
                            {/* Category Icon */}
                            <div className="mr-3 mt-1">
                              {getCategoryIcon(notification.category)}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium text-sm truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center ml-2">
                                  {getPriorityIndicator(notification.priority)}
                                  <button 
                                    onClick={(e) => deleteNotification(notification.id, e)}
                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                  >
                                    <FaTimes className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 truncate mb-1">
                                {notification.content}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{notification.time}</span>
                                {!notification.read && (
                                  <span className="flex items-center text-blue-600">
                                    <FaCircle className="w-2 h-2 mr-1" />
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Detail View */
                <div className="max-h-96 overflow-y-auto">
                  {/* Detail Header */}
                  <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <button 
                      onClick={closeDetailView}
                      className="mr-2 text-gray-500 hover:text-gray-700"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="font-medium text-gray-800 truncate">{selectedNotification?.title}</h3>
                  </div>
                  
                  {/* Notification Content */}
                  {selectedNotification && (
                    <div className="p-4 overflow-y-auto flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {getCategoryIcon(selectedNotification.category)}
                          <span className="ml-2 text-sm font-medium text-gray-600 capitalize">
                            {selectedNotification.category || 'General'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {getPriorityIndicator(selectedNotification.priority)}
                          <span className="ml-1 text-xs text-gray-500 capitalize">
                            {selectedNotification.priority || 'Normal'} priority
                          </span>
                        </div>
                      </div>
                      
                      {/* Show notification content */}
                      <p className="text-gray-800 mb-4 text-sm leading-relaxed">
                        {selectedNotification.content}
                      </p>
                      
                      {/* Additional Announcement details if available */}
                      {selectedNotification.announcement_id && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-2">Announcement Details</h4>
                          
                          <div className="space-y-2 text-sm">
                            {selectedNotification.title && (
                              <div className="flex flex-col">
                                <span className="text-gray-500">Title:</span>
                                <span className="font-medium text-gray-800">{selectedNotification.title}</span>
                              </div>
                            )}
                            
                            {selectedNotification.content && (
                              <div className="flex flex-col">
                                <span className="text-gray-500">Content:</span>
                                <span className="font-medium text-gray-800">{selectedNotification.content}</span>
                              </div>
                            )}
                            
                            {selectedNotification.status && (
                              <div className="flex flex-col">
                                <span className="text-gray-500">Status:</span>
                                <span className="font-medium text-gray-800">{selectedNotification.status}</span>
                              </div>
                            )}
                            
                            {selectedNotification.target_audience && (
                              <div className="flex flex-col">
                                <span className="text-gray-500">Target Audience:</span>
                                <span className="font-medium text-gray-800">{selectedNotification.target_audience}</span>
                              </div>
                            )}
                            
                            {selectedNotification.start_date && (
                              <div className="flex flex-col">
                                <span className="text-gray-500">Start Date:</span>
                                <span className="font-medium text-gray-800">
                                  {new Date(selectedNotification.start_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                            
                            {selectedNotification.end_date && (
                              <div className="flex flex-col">
                                <span className="text-gray-500">End Date:</span>
                                <span className="font-medium text-gray-800">
                                  {new Date(selectedNotification.end_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Action button if available */}
                      {selectedNotification.actionUrl && (
                        <button
                          onClick={() => handleActionClick(selectedNotification.actionUrl)}
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-4 mb-2">
                        From: <span className="font-medium">{selectedNotification.authorized}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Received: <span className="font-medium">{selectedNotification.formattedTime || new Date(selectedNotification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
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