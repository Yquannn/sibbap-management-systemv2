import React, { useState, useEffect } from "react";
import axios from "axios";

const UserModal = ({ onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    userName: "",
    age: "",
    gender: "",
    address: "",
    contactNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    status: "Active",
    dateCreated: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Function to fetch user data for editing
  const fetchUserData = async (id) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const response = await axios.get(`http://localhost:3001/api/user/${id}`);
      if (response.data) {
        setFormData({
          userName: response.data.userName || "",
          age: response.data.age || "",
          gender: response.data.gender || "",
          address: response.data.address || "",
          contactNo: response.data.contactNo || "",
          email: response.data.email || "",
          password: response.data.password || "",
          confirmPassword: response.data.password || "",
          userType: response.data.userType || "",
          status: response.data.status || "Active",
          dateCreated: response.data.dateCreated || new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err.message);
      setSubmitError("Failed to fetch user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when the modal opens (if a user is provided)
  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id);
    } else {
      // Reset the form if no user is passed (i.e., for adding a new user)
      setFormData({
        userName: "",
        age: "",
        gender: "",
        address: "",
        contactNo: "",
        email: "",
        password: "",
        confirmPassword: "",
        userType: "",
        status: "Active",
        dateCreated: new Date().toISOString().split('T')[0]
      });
    }
  }, [user]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userName.trim()) {
      newErrors.userName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!user && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!user && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!user && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.userType) {
      newErrors.userType = "User type is required";
    }
    
    if (formData.contactNo && !/^\d{10,15}$/.test(formData.contactNo.replace(/[-()\s]/g, ''))) {
      newErrors.contactNo = "Please enter a valid contact number";
    }
    
    if (formData.age && (isNaN(formData.age) || formData.age < 18 || formData.age > 100)) {
      newErrors.age = "Please enter a valid age between 18-100";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save the user data (either create or update based on the user id)
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Prepare data for saving
    const dataToSave = { ...formData };
    delete dataToSave.confirmPassword; // Remove confirmPassword before saving
    
    // Call the onSave function passed as a prop
    onSave(dataToSave, user?.id);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 w-4/5 max-w-4xl max-h-5/6 overflow-y-auto relative z-10">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h1 className="text-2xl font-bold text-gray-800">
            {user ? "Edit User" : "Add New System User"}
          </h1>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl font-bold">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : submitError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{submitError}</p>
            <button 
              onClick={() => setSubmitError(null)} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={`mt-1 p-2 border ${errors.userName ? 'border-red-500' : 'border-gray-300'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    className={`mt-1 p-2 border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    className={`mt-1 p-2 border ${errors.contactNo ? 'border-red-500' : 'border-gray-300'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.contactNo && <p className="text-red-500 text-xs mt-1">{errors.contactNo}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={`mt-1 p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    User Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className={`mt-1 p-2 border ${errors.userType ? 'border-red-500' : 'border-gray-300'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select User Type</option>
                    <option value="System Admin">System Admin</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Loan Officer">Loan Officer</option>
                    <option value="Account Officer">Account Officer</option>
                    <option value="Clerk">Clerk</option>
                  </select>
                  {errors.userType && <p className="text-red-500 text-xs mt-1">{errors.userType}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Password {!user && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={user ? "Leave blank to keep current password" : "Enter password"}
                    className={`mt-1 p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Confirm Password {!user && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`mt-1 p-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                {user && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Date Created
                    </label>
                    <input
                      type="date"
                      name="dateCreated"
                      value={formData.dateCreated}
                      onChange={handleChange}
                      disabled
                      className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-gray-100"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {user ? "Update User" : "Create User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserModal;