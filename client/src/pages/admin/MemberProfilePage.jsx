import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SuccessModal from "./loanPages/components/SuccessModal";

// Import Chart.js components
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const EditProfileModal = ({ member, memberId, onClose, onUpdateMember, onMessage }) => {
  const [formData, setFormData] = useState({ ...member });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `http://localhost:3001/api/member/${memberId}`,
        formData
      );
      onUpdateMember(response.data.updatedMember || formData);
      onMessage("success", "Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      onMessage("error", "Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center py-2 px-4 whitespace-nowrap ${
        activeTab === id
          ? "border-b-2 border-blue-500 text-blue-600 font-medium"
          : "text-gray-600 hover:text-blue-500"
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-7xl rounded-lg shadow-xl p-6 relative my-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Member Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b overflow-x-auto mb-6">
          <TabButton 
            id="personal" 
            label="Personal Information" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            } 
          />
          <TabButton 
            id="contact" 
            label="Contact & Education" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1"></path>
              </svg>
            } 
          />
          <TabButton 
            id="employment" 
            label="Employment & Income" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            } 
          />
          <TabButton 
            id="family" 
            label="Family & Beneficiaries" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            } 
          />
          <TabButton 
            id="membership" 
            label="Membership" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"></path>
              </svg>
            } 
          />
          <TabButton 
            id="docs" 
            label="Documents" 
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            } 
          />
        </div>

        {/* Tab Content */}
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Extension Name</label>
                    <input
                      type="text"
                      name="extension_name"
                      value={formData.extension_name || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Jr., Sr., III"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Maiden Name</label>
                    <input
                      type="text"
                      name="maiden_name"
                      value={formData.maiden_name || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">TIN Number</label>
                    <input
                      type="text"
                      name="tin_number"
                      value={formData.tin_number || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Birth & Demographics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth ? formData.date_of_birth.slice(0, 10) : ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Birthplace Province</label>
                    <input
                      type="text"
                      name="birthplace_province"
                      value={formData.birthplace_province || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Sex</label>
                    <select
                      name="sex"
                      value={formData.sex || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Civil Status</label>
                    <select
                      name="civil_status"
                      value={formData.civil_status || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Religion</label>
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Number of Dependents</label>
                    <input
                      type="number"
                      name="number_of_dependents"
                      value={formData.number_of_dependents || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact & Education Tab */}
          {activeTab === "contact" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">House No/Street</label>
                    <input
                      type="text"
                      name="house_no_street"
                      value={formData.house_no_street || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Barangay</label>
                    <input
                      type="text"
                      name="barangay"
                      value={formData.barangay || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Education
                </h3>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Highest Educational Attainment</label>
                  <select
                    name="highest_educational_attainment"
                    value={formData.highest_educational_attainment || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Elementary">Elementary</option>
                    <option value="High School">High School</option>
                    <option value="Vocational">Vocational</option>
                    <option value="Associate's Degree">Associate's Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                  </select>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Spouse Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Spouse Name</label>
                    <input
                      type="text"
                      name="spouse_name"
                      value={formData.spouse_name || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Spouse Occupation/Source of Income</label>
                    <input
                      type="text"
                      name="spouse_occupation_source_of_income"
                      value={formData.spouse_occupation_source_of_income || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employment & Income Tab */}
          {activeTab === "employment" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Occupation/Source of Income</label>
                    <input
                      type="text"
                      name="occupation_source_of_income"
                      value={formData.occupation_source_of_income || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Financial Information
                </h3>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Annual Income</label>
                  <input
                    type="number"
                    name="annual_income"
                    value={formData.annual_income || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Family & Beneficiaries Tab */}
          {activeTab === "family" && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Beneficiary Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Beneficiary Name</label>
                    <input
                      type="text"
                      name="beneficiaryName"
                      value={formData.beneficiaryName || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      name="relationship"
                      value={formData.relationship || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Beneficiary Contact Number</label>
                    <input
                      type="text"
                      name="beneficiaryContactNumber"
                      value={formData.beneficiaryContactNumber || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  References
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Reference Name</label>
                    <input
                      type="text"
                      name="referenceName"
                      value={formData.referenceName || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Reference Position</label>
                    <input
                      type="text"
                      name="referencePosition"
                      value={formData.referencePosition || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Reference Contact Number</label>
                    <input
                      type="text"
                      name="referenceContactNumber"
                      value={formData.referenceContactNumber || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Membership Tab */}
          {activeTab === "membership" && (
            <div>
             
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  Login Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Email (Username)</label>
                    <input
                      type="text"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "docs" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                Documents
              </h3>
              <p className="text-gray-600">
                Document fields are shown here only for reference. (Upload or update functionality can be added as needed.)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">ID Picture</label>
                  <input
                    type="text"
                    name="id_picture"
                    value={formData.id_picture || ""}
                    onChange={handleChange}
                    placeholder="File name or URL"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Barangay Clearance</label>
                  <input
                    type="text"
                    name="barangay_clearance"
                    value={formData.barangay_clearance || ""}
                    onChange={handleChange}
                    placeholder="File name or URL"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Tax Identification ID</label>
                  <input
                    type="text"
                    name="tax_identification_id"
                    value={formData.tax_identification_id || ""}
                    onChange={handleChange}
                    placeholder="File name or URL"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Valid ID</label>
                  <input
                    type="text"
                    name="valid_id"
                    value={formData.valid_id || ""}
                    onChange={handleChange}
                    placeholder="File name or URL"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-gray-700 mb-1">Membership Agreement</label>
                  <input
                    type="text"
                    name="membership_agreement"
                    value={formData.membership_agreement || ""}
                    onChange={handleChange}
                    placeholder="File name or URL"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save/Cancel Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};




// Modal to add a new transaction
const AddTransactionModal = ({ memberId, onClose, onAddTransaction, onMessage }) => {
  const [formData, setFormData] = useState({ totalAmount: "", service: "" });
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.totalAmount || !formData.service) {
      onMessage("error", "Please fill in all fields.");
      return;
    }
    setSaving(true);
    try {
      const response = await axios.post(
        `http://localhost:3001/api/purchase-history/${memberId}`,
        {
          amount: parseFloat(formData.totalAmount),
          service: formData.service,
        }
      );
      onAddTransaction(response.data.result);
      onMessage("success", "Transaction added successfully!");
      setIsSuccess(true);
      // Optionally close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error adding transaction:", error);
      onMessage("error", "Error adding transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Add New Transaction</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Total Amount</label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-lg"
            placeholder="Enter total amount"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Service</label>
          <input
            type="text"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-lg"
            placeholder="Enter service"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? (
              <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MemberProfilePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notification states
  const [activationLoading, setActivationLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");

  // Modal control
  const [showAllInfoModal, setShowAllInfoModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState("Documents");

  // Avatar background colors for fallback
  const bgColors = [
    "bg-rose-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-orange-500",
  ];

  // Helper to compute a consistent background color based on member's ID
  const getMemberFallbackColor = (m) => {
    const idString = m?.memberId
      ? String(m.memberId)
      : `${m.first_name || ""}${m.last_name || ""}`;
    let hash = 0;
    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgColors.length;
    return bgColors[index];
  };

  // Helper to build an image URL
  const imageUrl = (filename) =>
    filename ? `http://localhost:3001/uploads/${filename}` : "";

  // Format dates helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch member data
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/member-info/${memberId}`
        );
        setMember({ ...response.data });
      } catch (error) {
        console.error("Error fetching member data:", error);
        setMessage("Error fetching member data.");
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMember();
    } else {
      setMessage("Member ID is missing!");
      setLoading(false);
    }
  }, [memberId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!member)
    return (
      <div className="p-8 text-center text-gray-600 bg-gray-100 rounded-lg">
        <p className="text-xl">{message}</p>
      </div>
    );

  // Handle modal messages
  const handleModalMessage = (type, text) => {
    setMessageType(type);
    setMessage(text);
    setShowMessage(true);
    // Auto-dismiss message after 3 seconds
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  // Update member data after edit
  const handleUpdateMember = (updated) => {
    setMember(updated);
  };

  // Add a new transaction
  const handleAddTransaction = (newTransaction) => {
    setMember((prev) => ({
      ...prev,
      purchase_history: [...(prev.purchase_history || []), newTransaction],
    }));
  };

  // BASIC INFO SECTION
  const BasicInfoSection = () => {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar/Profile Image */}
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0">
            {member.id_picture ? (
              <img
                src={imageUrl(member.id_picture)}
                alt="Profile"
                className="w-full h-full object-cover rounded-xl shadow-md"
              />
            ) : (
              <div
                className={`w-full h-full rounded-xl flex items-center justify-center ${getMemberFallbackColor(
                  member
                )}`}
              >
                <span className="text-white text-4xl md:text-5xl font-bold">
                  {member.first_name?.charAt(0)}
                  {member.last_name?.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Member Details */}
          <div className="flex-1 w-full text-center md:text-left">
            <div className="mb-3">
              <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                {member.member_type}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                {member.first_name} {member.last_name} {member.middle_name}
              </h2>
              <p className="text-lg font-medium text-gray-500 mt-1">
                {member.memberCode}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2 text-gray-600">
                <p className="flex items-start">
                  <span className="font-semibold min-w-24">Address:</span>
                  <span className="max-w-xs break-words">
                    {member.house_no_street} {member.barangay}, {member.city}
                  </span>
                </p>
                <p>
                  <span className="font-semibold min-w-24">Age:</span>
                  <span>{member.age || "N/A"}</span>
                </p>
                <p>
                  <span className="font-semibold min-w-24">DOB:</span>
                  <span>
                    {member.date_of_birth
                      ? formatDate(member.date_of_birth)
                      : "N/A"}
                  </span>
                </p>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-semibold min-w-24">Contact:</span>
                  <span>{member.contact_number || "N/A"}</span>
                </p>
                <p>
                  <span className="font-semibold min-w-24">Civil Status:</span>
                  <span>{member.civil_status || "N/A"}</span>
                </p>
                <p>
                  <span className="font-semibold min-w-24">Registered:</span>
                  <span>
                    {member.registration_date
                      ? formatDate(member.registration_date)
                      : "N/A"}
                  </span>
                </p>
              </div>
            </div>

            <button
              className="mt-4 border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              onClick={() => setShowAllInfoModal(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  // DOCUMENTS SECTION
  const DocumentsSection = () => {
    const [showDocs, setShowDocs] = useState(false);
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Documents</h3>
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            {showDocs ? "Hide Documents" : "View Documents"}
          </button>
        </div>

        {showDocs && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {member.id_picture && (
              <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all z-10 flex items-center justify-center">
                  <a
                    href={imageUrl(member.id_picture)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg text-gray-800 font-medium transition-all"
                  >
                    View Full Size
                  </a>
                </div>
                <div className="p-3 bg-gray-800 text-white text-sm font-medium">
                  ID Picture
                </div>
                <img
                  src={imageUrl(member.id_picture)}
                  alt="ID"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {member.barangay_clearance && (
              <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all z-10 flex items-center justify-center">
                  <a
                    href={imageUrl(member.barangay_clearance)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg text-gray-800 font-medium transition-all"
                  >
                    View Full Size
                  </a>
                </div>
                <div className="p-3 bg-gray-800 text-white text-sm font-medium">
                  Barangay Clearance
                </div>
                <img
                  src={imageUrl(member.barangay_clearance)}
                  alt="Barangay Clearance"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {member.tax_identification_id && (
              <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all z-10 flex items-center justify-center">
                  <a
                    href={imageUrl(member.tax_identification_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg text-gray-800 font-medium transition-all"
                  >
                    View Full Size
                  </a>
                </div>
                <div className="p-3 bg-gray-800 text-white text-sm font-medium">
                  TIN Document
                </div>
                <img
                  src={imageUrl(member.tax_identification_id)}
                  alt="TIN"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {member.valid_id && (
              <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all z-10 flex items-center justify-center">
                  <a
                    href={imageUrl(member.valid_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg text-gray-800 font-medium transition-all"
                  >
                    View Full Size
                  </a>
                </div>
                <div className="p-3 bg-gray-800 text-white text-sm font-medium">
                  Valid ID
                </div>
                <img
                  src={imageUrl(member.valid_id)}
                  alt="Valid ID"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {member.membership_agreement && (
              <div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all z-10 flex items-center justify-center">
                  <a
                    href={imageUrl(member.membership_agreement)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg text-gray-800 font-medium transition-all"
                  >
                    View Full Size
                  </a>
                </div>
                <div className="p-3 bg-gray-800 text-white text-sm font-medium">
                  Membership Agreement
                </div>
                <img
                  src={imageUrl(member.membership_agreement)}
                  alt="Membership Agreement"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        )}

        {showDocs &&
          Object.keys(member).filter(
            (key) =>
              [
                "id_picture",
                "barangay_clearance",
                "tax_identification_id",
                "valid_id",
                "membership_agreement",
              ].includes(key) && member[key]
          ).length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No documents available
            </p>
          )}
      </div>
    );
  };

  // BENEFICIARIES SECTION
  const BeneficiariesSection = () => (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Beneficiaries & References
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h4 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
            Beneficiaries
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Name</span>
              <span className="font-medium text-gray-800">
                {member.beneficiaryName || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Relationship</span>
              <span className="font-medium text-gray-800">
                {member.relationship || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Contact</span>
              <span className="font-medium text-gray-800">
                {member.beneficiary_contactNumber || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h4 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
            Character Reference
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Name</span>
              <span className="font-medium text-gray-800">
                {member.referenceName || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Position</span>
              <span className="font-medium text-gray-800">
                {member.position || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Contact</span>
              <span className="font-medium text-gray-800">
                {member.reference_contactNumber || "Not specified"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ACCOUNT INFO SECTION
  const AccountInfoSection = () => (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Account Information</h3>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Username</p>
            <p className="font-medium text-gray-800">{member.email}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Password</p>
            <p className="font-medium text-gray-800">{member.password}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Account Status</p>
            <p
              className={`font-medium ${
                member.accountStatus?.toUpperCase() === "ACTIVATED"
                  ? "text-green-600"
                  : "text-orange-500"
              }`}
            >
              {member.accountStatus || "Not Set"}
            </p>
          </div>
        </div>

        {member.accountStatus &&
          member.accountStatus.toUpperCase() !== "ACTIVATED" && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={async () => {
                  setActivationLoading(true);
                  try {
                    await axios.put(
                      `http://localhost:3001/api/activate/${member.memberId}`
                    );
                    setMember((prev) => ({ ...prev, accountStatus: "ACTIVATED" }));
                    handleModalMessage("success", "Account activated successfully!");
                  } catch (error) {
                    console.error("Error activating account:", error);
                    handleModalMessage("error", "Error activating account.");
                  } finally {
                    setActivationLoading(false);
                  }
                }}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center"
                disabled={activationLoading}
              >
                {activationLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Activating...
                  </>
                ) : (
                  "Activate Account"
                )}
              </button>
            </div>
          )}
      </div>
    </div>
  );

  // LOAN HISTORY SECTION
  const LoanHistorySection = () => {
    const [filters, setFilters] = useState({
      voucherNumber: '',
      loanStatus: ''
    });
  
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const filteredLoans = useMemo(() => {
      if (!member.loan_history) return [];
      
      return member.loan_history.filter(loan => {
        const matchesVoucher = !filters.voucherNumber || 
          loan.client_voucher_number.toLowerCase().includes(filters.voucherNumber.toLowerCase());
        
        const matchesStatus = !filters.loanStatus || 
          loan.loan_status.toLowerCase() === filters.loanStatus.toLowerCase();
        
        return matchesVoucher && matchesStatus;
      });
    }, [member.loan_history, filters]);
  
    if (!member.loan_history || member.loan_history.length === 0) {
      return (
        <div className="p-6 text-center">
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">No loan history available.</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Loan History</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                name="voucherNumber"
                placeholder="Search voucher number"
                value={filters.voucherNumber}
                onChange={handleFilterChange}
                className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <select
              name="loanStatus"
              value={filters.loanStatus}
              onChange={handleFilterChange}
              className="w-full sm:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">All statuses</option>
              <option value="Paid Off">Paid Off</option>
              <option value="Active">Active</option>
            </select>
          </div>
        </div>
  
        {filteredLoans.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-xl text-center shadow-sm">
            <p className="text-gray-500 text-lg">No loans match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        loan.loan_status === "Paid Off"
                          ? "bg-green-100 text-green-800"
                          : loan.status === "Approved"
                          ? "bg-blue-100 text-blue-800"
                          : loan.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : loan.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {loan.loan_status}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ₱{parseFloat(loan.loan_amount).toLocaleString()}
                    </span>
                  </div>
  
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    {loan.loan_type}
                  </h4>
  
                  <div className="space-y-3 text-gray-600 mb-4">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Term:</span>
                      <span className="font-medium">{loan.terms} months</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Interest:</span>
                      <span className="font-medium">₱{parseFloat(loan.interest).toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Balance:</span>
                      <span className={`font-medium ${parseFloat(loan.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₱{parseFloat(loan.balance).toLocaleString()}
                      </span>
                    </p>
                    <p className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Voucher:</span>
                      <span className="font-medium text-gray-700">{loan.client_voucher_number}</span>
                    </p>
                  </div>
  
                  <div className="border-t pt-3 text-xs text-gray-500 flex justify-between items-center">
                    <span>Applied on:</span>
                    <span>{formatDate(loan.created_at)}</span>
                  </div>
                  <div className="border-t pt-3 text-xs text-gray-500 flex justify-between items-center">
                    <span>Disbursed Date:</span>
                    <span>{formatDate(loan.disbursed_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // INITIAL CONTRIBUTION SECTION
  const InitialContributionSection = () => {
    return (
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Current Contributions</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Share Capital */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Share Capital
            </h4>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Current Share Capital</span>
              <span className="text-xl font-bold text-blue-600">
                ₱{member.share_capital || 0}
              </span>
            </div>
          </div>

          {/* Fees */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Fees
            </h4>
            <div className="space-y-3">
              {[
                { label: "Initial Shared Capital", value: member.initial_shared_capital },
                { label: "Identification Card Fee", value: member.identification_card_fee },
                { label: "Membership Fee", value: member.membership_fee },
                { label: "Kalinga Fund Fee", value: member.kalinga_fund_fee },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-blue-600">₱{item.value || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Savings
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Initial Savings</span>
              <span className="text-xl font-bold text-blue-600">
                ₱{member.initial_savings || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // PURCHASE HISTORY SECTION
  const PurchaseHistorySection = () => {
    const purchaseHistory = member.purchase_history || [];

    // Calculate the total purchase amount
    const totalPurchase = purchaseHistory.reduce(
      (acc, transaction) => acc + parseFloat(transaction.amount),
      0
    );

    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Purchase History</h3>
            <p className="text-lg font-medium text-blue-600 mt-1">
              Total Purchase: ₱
              {totalPurchase.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Transaction
          </button>
        </div>

        {purchaseHistory.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-xl text-center">
            <p className="text-gray-500 text-lg">No purchase history available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-2">
            {purchaseHistory.map((transaction, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {transaction.service}
                  </span>
                  <span className="text-xl font-bold text-gray-800">
                    ₱{parseFloat(transaction.amount).toLocaleString()}
                  </span>
                </div>

                <div className="border-t pt-3 text-xs text-gray-500 text-right">
                  {formatDate(transaction.purchase_date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Define the available tabs for navigation
  const tabs = [
    "Documents",
    "Beneficiaries",
    "Account Info",
    "Loan History",
    "Initial Contributions",
    "Purchase History",
  ];

  // Render the content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Documents":
        return <DocumentsSection />;
      case "Beneficiaries":
        return <BeneficiariesSection />;
      case "Account Info":
        return <AccountInfoSection />;
      case "Loan History":
        return <LoanHistorySection />;
      case "Initial Contributions":
        return <InitialContributionSection />;
      case "Purchase History":
        return <PurchaseHistorySection />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Global Success/Error notification */}
      {showMessage && (
        <SuccessModal message={message} onClose={() => setShowMessage(false)} />
      )}

      {/* Modals */}
      {showAllInfoModal && (
        <EditProfileModal
          member={member}
          onClose={() => setShowAllInfoModal(false)}
          onUpdate={handleUpdateMember}
        />
      )}
      {showTransactionModal && (
        <AddTransactionModal
          memberId={member.memberId}
          onClose={() => setShowTransactionModal(false)}
          onAddTransaction={handleAddTransaction}
          onMessage={handleModalMessage}
        />
      )}

      <BasicInfoSection />

      <div className="mt-8">
        {/* Tabs Navigation */}
        <div className="flex space-x-4 border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`pb-2 ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Render active tab content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MemberProfilePage;
