import React, { useState, useEffect } from "react";
import axios from "axios";

const AddAnnouncement = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [status, setStatus] = useState("New");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  // Fetch all announcements from the backend
  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/announcement");
      setAnnouncements(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to load announcements. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTargetAudience("");
    setStatus("New");
    setPriority("Medium");
    setCategory("General");
    setStartDate("");
    setEndDate("");
    setSelectedAnnouncementId(undefined);
  };

  const handleSubmit = async () => {
    if (!title || !content || !targetAudience || !status) {
      setError("Please fill in all required fields.");
      return;
    }

    const announcementData = {
      title,
      content,  
      targetAudience,
      status,
      priority,
      category,
      startDate: startDate || null,
      endDate: endDate || null
    };

    setIsLoading(true);
    setError("");
    
    try {
      let response;
      if (selectedAnnouncementId) {
        // Update existing announcement
        response = await axios.put(
          `http://localhost:3001/api/announcement/${selectedAnnouncementId}`,
          announcementData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setSuccessMessage("Announcement updated successfully!");
      } else {
        // Add new announcement
        response = await axios.post(
          "http://localhost:3001/api/announcement",
          announcementData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setSuccessMessage("Announcement added successfully!");
      }

      // Clear fields and reset state after successful operation
      resetForm();
      
      // Switch to the list tab after creating/updating
      setActiveTab("list");
  
      // Fetch updated list of announcements
      fetchAnnouncements();
    } catch (error) {
      console.error("Error submitting announcement:", error.response?.data || error.message);
      setError("Failed to save announcement. Please check your inputs and try again.");
    } finally {
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  // Handle selecting an announcement to edit
  const handleEdit = (announcement) => {
    setSelectedAnnouncementId(announcement.announcementId);
    setTitle(announcement.title);
    setContent(announcement.content);
    setTargetAudience(announcement.targetAudience);
    setStatus(announcement.status || "New");
    setPriority(announcement.priority || "Medium");
    setCategory(announcement.category || "General");
    setStartDate(announcement.startDate || "");
    setEndDate(announcement.endDate || "");
    setActiveTab("create");
  };

  // Handle deleting an announcement
  const handleDelete = async (id, event) => {
    event.stopPropagation(); // Prevent triggering the edit function
    
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setIsLoading(true);
      try {
        await axios.delete(`http://localhost:3001/api/announcement/${id}`);
        setSuccessMessage("Announcement deleted successfully!");
        fetchAnnouncements();
        
        // If the deleted announcement was being edited, reset the form
        if (selectedAnnouncementId === id) {
          resetForm();
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
        setError("Failed to delete announcement. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Cancel editing and reset form
  const handleCancel = () => {
    resetForm();
  };

  // Fetch announcements when the component mounts
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Get status color based on announcement status
  const getStatusColor = (status) => {
    switch (status) {
      case "Urgent":
        return "bg-red-500 text-white";
      case "New":
        return "bg-blue-500 text-white";
      case "Update":
        return "bg-green-500 text-white";
      case "Maintenance":
        return "bg-amber-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Get priority color based on announcement priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500 text-white";
      case "Medium":
        return "bg-amber-500 text-white";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Format date to local date string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="">
      <div className="">
        {/* Header with tabs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Announcement Management</h1>
          
          <div className="flex border-b border-gray-200">
            <button
              className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${
                activeTab === "create"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("create")}
            >
              {selectedAnnouncementId ? "Edit Announcement" : "Create Announcement"}
            </button>
            <button
              className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${
                activeTab === "list"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("list");
                fetchAnnouncements();
              }}
            >
              All Announcements
            </button>
          </div>
        </div>
        
        {/* Alert messages */}
        {error && (
          <div className="bg-white border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-white border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>{successMessage}</p>
            </div>
          </div>
        )}
        
        {/* Create/Edit Form */}
        {activeTab === "create" && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {selectedAnnouncementId ? "Edit Announcement" : "Create New Announcement"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter a clear, concise title"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Provide detailed information about the announcement"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="e.g., All Users, Premium Subscribers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="New">New</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Update">Update</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="General">General</option>
                  <option value="System">System</option>
                  <option value="Feature">Feature</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 transition duration-200 shadow-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {selectedAnnouncementId ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  selectedAnnouncementId ? "Update Announcement" : "Create Announcement"
                )}
              </button>
              
              {selectedAnnouncementId && (
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none transition duration-200 shadow-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Announcements List */}
        {activeTab === "list" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">All Announcements</h2>
              <button 
                onClick={fetchAnnouncements}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            
            {isLoading && (
              <div className="flex justify-center items-center p-12">
                <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            
            {!isLoading && announcements.length === 0 && (
              <div className="text-center p-12 bg-gray-50">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4 text-gray-500 text-lg">No announcements found</p>
                <button 
                  onClick={() => setActiveTab("create")}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create your first announcement
                </button>
              </div>
            )}
            
            {!isLoading && announcements.length > 0 && (
              <div className="divide-y divide-gray-100">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.announcementId}
                    className="p-6 hover:bg-gray-50 transition duration-150 cursor-pointer"
                    onClick={() => handleEdit(announcement)}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(announcement.status)}`}>
                            {announcement.status}
                          </span>
                          {announcement.priority && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(announcement.priority)}`}>
                              {announcement.priority}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2">{announcement.content}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md inline-flex items-center">
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {announcement.targetAudience}
                          </span>
                          
                          {announcement.category && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md inline-flex items-center">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {announcement.category}
                            </span>
                          )}
                          
                          {(announcement.startDate || announcement.endDate) && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md inline-flex items-center">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {announcement.startDate && formatDate(announcement.startDate)}
                              {announcement.startDate && announcement.endDate && " - "}
                              {announcement.endDate && formatDate(announcement.endDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(announcement);
                          }}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition flex items-center"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        
                        <button
                          onClick={(e) => handleDelete(announcement.announcementId, e)}
                          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition flex items-center"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAnnouncement;