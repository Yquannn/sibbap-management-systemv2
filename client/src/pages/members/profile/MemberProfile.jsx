import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { User, Mail, Settings, LogOut, ArrowLeft, Camera, Phone, MapPin, Edit, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MemberProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          throw new Error("User email not found. Please log in again.");
        }
        const response = await axios.get(
          `http://192.168.254.100:3001/api/member/email/${email}`
        );
        setUser(response.data);
        setEditableData(response.data);
      } catch (err) {
        setError(err.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Remove the scroll listener that reloads the page
  // This is generally not a good UX pattern

  const handleEdit = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await axios.put(`http://192.168.254.100:3001/api/member/update`, {
        email: user.email,
        FirstName: editableData.FirstName,
        LastName: editableData.LastName,
        contactNumber: editableData.contactNumber,
      });
      setUser((prev) => ({
        ...prev,
        FirstName: editableData.FirstName,
        LastName: editableData.LastName,
        contactNumber: editableData.contactNumber,
      }));
      setActiveTab(null);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
    localStorage.removeItem("userEmail");
    localStorage.clear();
    sessionStorage.clear();
  };

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUpdating(true);
    const formData = new FormData();
    formData.append("id_picture", selectedImage);
    formData.append("email", user.email);

    try {
      const response = await axios.post(
        "http://192.168.254.100:3001/api/member/uploadPicture",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUser((prev) => ({ ...prev, id_picture: response.data.fileName }));
      setSelectedImage(null);
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            onClick={() => navigate("/")}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Compute member initials (if no profile image exists)
  const initials = user ? `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase() : "NA";

  return (
    <div className="">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-gray-200 h-24 w-24 rounded-full animate-pulse"></div>
              <div className="bg-gray-200 h-6 w-48 rounded animate-pulse"></div>
              <div className="bg-gray-200 h-4 w-32 rounded animate-pulse"></div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="bg-gray-200 h-12 w-full rounded animate-pulse"></div>
              <div className="bg-gray-200 h-12 w-full rounded animate-pulse"></div>
              <div className="bg-gray-200 h-12 w-full rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              {/* Profile Banner */}
              <div className="h-32 bg-gradient-to-r from-green-400 to-cyan-500"></div>
              
              {/* Profile Image */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
                <div className="relative">
                  {imagePreview || user?.id_picture ? (
                    <img
                      src={
                        imagePreview ||
                        `http://192.168.254.100:3001/uploads/${user.id_picture}`
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-md">
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={handleProfileClick}
                    className="absolute bottom-0 right-0 bg-gray-800 text-white p-1.5 rounded-full shadow-sm hover:bg-gray-700 transition"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Profile Content */}
            <div className="pt-16 pb-6 px-6">
              {selectedImage && (
                <div className="mb-4 flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">New profile picture selected</p>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md text-sm shadow hover:bg-green-600 transition"
                    onClick={handleImageUpload}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Uploading..." : "Confirm Upload"}
                  </button>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="flex items-center justify-center gap-1 text-gray-500 text-sm mt-1">
                  <Mail size={14} /> {user?.email || "No Email Provided"}
                </p>
              </div>

              {activeTab === null && (
                <div className="space-y-3 mt-2">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition text-left"
                    onClick={() => setActiveTab("account")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                        <User size={18} />
                      </div>
                      <span className="font-medium text-gray-700">Account Information</span>
                    </div>
                    <ArrowLeft size={18} className="text-gray-400 transform rotate-180" />
                  </button>

                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition text-left"
                    onClick={() => setActiveTab("settings")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
                        <Settings size={18} />
                      </div>
                      <span className="font-medium text-gray-700">Security Settings</span>
                    </div>
                    <ArrowLeft size={18} className="text-gray-400 transform rotate-180" />
                  </button>

                  <button
                    className="w-full flex items-center px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-lg shadow-sm hover:bg-red-100 transition mt-6"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={18} />
                      <span className="font-medium">Log Out</span>
                    </div>
                  </button>
                </div>
              )}

              {activeTab === "account" && (
                <div className="bg-white rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Account Information
                    </h3>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setActiveTab(null)}
                    >
                      <ArrowLeft size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editableData.FirstName || ""}
                          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          onChange={(e) => handleEdit("FirstName", e.target.value)}
                        />
                        <Edit size={16} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editableData.LastName || ""}
                          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          onChange={(e) => handleEdit("LastName", e.target.value)}
                        />
                        <Edit size={16} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={editableData.email || ""}
                          className="w-full py-2 px-3 border border-gray-200 bg-gray-50 rounded-md text-gray-500"
                          readOnly
                        />
                        <Mail size={16} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editableData.contactNumber || ""}
                          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          onChange={(e) => handleEdit("contactNumber", e.target.value)}
                        />
                        <Phone size={16} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={`${editableData.houseNoStreet || ""}, ${editableData.barangay || ""}, ${editableData.city || ""}, ${editableData.province || ""}`}
                          className="w-full py-2 px-3 border border-gray-200 bg-gray-50 rounded-md text-gray-500"
                          readOnly
                        />
                        <MapPin size={16} className="absolute right-3 top-3 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Contact support to update address</p>
                    </div>

                    <button
                      className="w-full mt-4 bg-green-500 text-white py-3 px-4 rounded-md shadow hover:bg-green-600 transition flex items-center justify-center gap-2"
                      onClick={handleUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-white rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Security Settings
                    </h3>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setActiveTab(null)}
                    >
                      <ArrowLeft size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3 mb-6">
                      <Shield size={20} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        Keeping your account secure is important. We recommend changing your password regularly and enabling two-factor authentication.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <button className="w-full mt-4 bg-green-500 text-white py-3 px-4 rounded-md shadow hover:bg-green-600 transition flex items-center justify-center gap-2">
                      Update Password
                    </button>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Additional Security</h4>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;