import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TimedepositAmountModal from "../../childModal/TimedepositAmountModal";

const MemberAndCoAccountForm = () => {
  // Retrieve selectedMember from React Router's state and memberId from URL params.
  const location = useLocation();
  const { memberId } = useParams();
  const { selectedMember } = location.state || {};

  // If data was fetched, set a flag so fields are read-only.
  const isFetchedData = Boolean(selectedMember);

  // Initialize form data with fetched member data where applicable.
  const [formData, setFormData] = useState({
    // MEMBER'S PERSONAL INFORMATION
    account_type: "", // Changed accountType to account_type to match API
    memberCode: selectedMember?.memberCode || "",
    memberLastName: selectedMember?.last_name || "",
    memberMiddleName: selectedMember?.middle_name || "",
    memberFirstName: selectedMember?.first_name || "",
    memberExtension: "",
    memberDOB: "",
    memberPlaceOfBirth: "",
    memberAge: "",
    memberGender: "",
    memberCivilStatus: "",
    memberContactNumber: selectedMember?.contact_number || "",
    memberCompleteAddress: selectedMember?.barangay || "",
    // CO‑ACCOUNT HOLDER PERSONAL INFORMATION
    has_co_maker: false, // Add flag to track if co-maker exists
    co_last_name: "", 
    co_middle_name: "",
    co_first_name: "",
    co_extension_name: "",
    co_date_of_birth: "",
    co_place_of_birth: "",
    co_age: "",
    co_gender: "",
    co_civil_status: "",
    co_contact_number: "",
    co_relationship_primary: "",
    co_complete_address: "",
    coUploadPicture: null
  });

  // Change handlers for text/select fields and file uploads.
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If any co-maker field is filled, set has_co_maker to true
    if (name.startsWith('co_') && value && !formData.has_co_maker) {
      setFormData(prev => ({ ...prev, [name]: value, has_co_maker: true }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // If account type changes to INDIVIDUAL, clear co-maker fields
    if (name === 'account_type' && value === 'INDIVIDUAL') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        has_co_maker: false,
        co_last_name: "",
        co_middle_name: "",
        co_first_name: "",
        co_extension_name: "",
        co_date_of_birth: "",
        co_place_of_birth: "",
        co_age: "",
        co_gender: "",
        co_civil_status: "",
        co_contact_number: "",
        co_relationship_primary: "",
        co_complete_address: "",
        coUploadPicture: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ 
      ...prev, 
      coUploadPicture: file,
      has_co_maker: prev.has_co_maker || !!file
    }));
  };

  // State to control display of the TimedepositAmountModal.
  const [showAmountModal, setShowAmountModal] = useState(false);

  // When the Next button is clicked, show the modal.
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for backend
    const dataForBackend = { ...formData };
    
    // If no co-maker info is provided, set co-maker fields to null
    if (!formData.has_co_maker || formData.account_type === 'INDIVIDUAL') {
      dataForBackend.co_last_name = null;
      dataForBackend.co_middle_name = null;
      dataForBackend.co_first_name = null;
      dataForBackend.co_extension_name = null;
      dataForBackend.co_date_of_birth = null;
      dataForBackend.co_place_of_birth = null;
      dataForBackend.co_age = null;
      dataForBackend.co_gender = null;
      dataForBackend.co_civil_status = null;
      dataForBackend.co_contact_number = null;
      dataForBackend.co_relationship_primary = null;
      dataForBackend.co_complete_address = null;
      dataForBackend.co_UploadPicture = null;
    }
    
    console.log("Parent Form Data:", dataForBackend);
    setShowAmountModal(true);
  };

  // Common input style classes
  const inputClass = "border border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full transition-all duration-200";
  const selectClass = "border border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMMTAgMTIuNUwxNSA3LjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-right-4 bg-center-y";
  const labelClass = "text-sm font-medium text-gray-700 mb-1";
  const readOnlyClass = "bg-gray-100 cursor-not-allowed";

  // Hide co-maker fields if account type is INDIVIDUAL
  const showCoMakerSection = formData.account_type !== 'INDIVIDUAL';

  return (
    <div className="">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* MEMBERS' PERSONAL INFORMATION */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">
            MEMBERS' PERSONAL INFORMATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Account Type */}
            <div className="flex flex-col">
              <label className={labelClass}>Account Type</label>
              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select an item</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="JOINT">Joint Account</option>
                <option value="FIXED">Fixed</option>
              </select>
            </div>
            {/* Member Code */}
            <div className="flex flex-col">
              <label className={labelClass}>Member Code</label>
              <input
                type="text"
                name="memberCode"
                value={formData.memberCode}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="Member Code"
                readOnly={isFetchedData}
              />
            </div>
            {/* Last Name */}
            <div className="flex flex-col">
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                name="memberLastName"
                value={formData.memberLastName}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="Last Name"
                readOnly={isFetchedData}
              />
            </div>
            {/* Middle Name */}
            <div className="flex flex-col">
              <label className={labelClass}>Middle Name</label>
              <input
                type="text"
                name="memberMiddleName"
                value={formData.memberMiddleName}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="Middle Name"
                readOnly={isFetchedData}
              />
            </div>
            {/* First Name */}
            <div className="flex flex-col">
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                name="memberFirstName"
                value={formData.memberFirstName}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="First Name"
                readOnly={isFetchedData}
              />
            </div>
            {/* Extension Name */}
            <div className="flex flex-col">
              <label className={labelClass}>Extension Name</label>
              <input
                type="text"
                name="memberExtension"
                value={formData.memberExtension}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="e.g. Jr, Sr"
                readOnly={isFetchedData}
              />
            </div>
            {/* Date of Birth */}
            <div className="flex flex-col">
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                name="memberDOB"
                value={formData.memberDOB}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                readOnly={isFetchedData}
              />
            </div>
            {/* Place of Birth */}
            <div className="flex flex-col">
              <label className={labelClass}>Place of Birth</label>
              <input
                type="text"
                name="memberPlaceOfBirth"
                value={formData.memberPlaceOfBirth}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="Place of Birth"
                readOnly={isFetchedData}
              />
            </div>
            {/* Age */}
            <div className="flex flex-col">
              <label className={labelClass}>Age</label>
              <input
                type="number"
                name="memberAge"
                value={formData.memberAge}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="Age"
                readOnly={isFetchedData}
              />
            </div>
            {/* Gender */}
            <div className="flex flex-col">
              <label className={labelClass}>Gender</label>
              <select
                name="memberGender"
                value={formData.memberGender}
                onChange={handleChange}
                className={`${selectClass} ${isFetchedData ? readOnlyClass : ""}`}
                disabled={isFetchedData}
              >
                <option value="">Select an item</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            {/* Civil Status */}
            <div className="flex flex-col">
              <label className={labelClass}>Civil Status</label>
              <select
                name="memberCivilStatus"
                value={formData.memberCivilStatus}
                onChange={handleChange}
                className={`${selectClass} ${isFetchedData ? readOnlyClass : ""}`}
                disabled={isFetchedData}
              >
                <option value="">Select an item</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
            {/* Contact Number */}
            <div className="flex flex-col">
              <label className={labelClass}>Contact Number</label>
              <input
                type="text"
                name="memberContactNumber"
                value={formData.memberContactNumber}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="Contact Number"
                readOnly={isFetchedData}
              />
            </div>
            {/* Complete Address */}
            <div className="flex flex-col lg:col-span-2">
              <label className={labelClass}>Complete Address</label>
              <input
                type="text"
                name="memberCompleteAddress"
                value={formData.memberCompleteAddress}
                onChange={handleChange}
                className={`${inputClass} ${isFetchedData ? readOnlyClass : ""}`}
                placeholder="Complete Address"
                readOnly={isFetchedData}
              />
            </div>
          </div>
        </section>

        {/* CO‑ACCOUNT HOLDER PERSONAL INFORMATION */}
        {showCoMakerSection && (
          <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">
              CO‑ACCOUNT HOLDER PERSONAL INFORMATION
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  name="co_last_name"
                  value={formData.co_last_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Last Name"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Middle Name</label>
                <input
                  type="text"
                  name="co_middle_name"
                  value={formData.co_middle_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Middle Name"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  name="co_first_name"
                  value={formData.co_first_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="First Name"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Extension Name</label>
                <input
                  type="text"
                  name="co_extension_name"
                  value={formData.co_extension_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Jr, Sr"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  name="co_date_of_birth"
                  value={formData.co_date_of_birth}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Place of Birth</label>
                <input
                  type="text"
                  name="co_place_of_birth"
                  value={formData.co_place_of_birth}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Place of Birth"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Age</label>
                <input
                  type="number"
                  name="co_age"
                  value={formData.co_age}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Age"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Gender</label>
                <select
                  name="co_gender"
                  value={formData.co_gender}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Select an item</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Civil Status</label>
                <select
                  name="co_civil_status"
                  value={formData.co_civil_status}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Select an item</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Contact Number</label>
                <input
                  type="text"
                  name="co_contact_number"
                  value={formData.co_contact_number}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Contact Number"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Relationship to Primary</label>
                <select
                  name="co_relationship_primary"
                  value={formData.co_relationship_primary}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Select an item</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Parent">Parent</option>
                  <option value="Relative">Relative</option>
                  <option value="Friend">Friend</option>
                  <option value="Brother">Brother</option>
                </select>
              </div>
              <div className="flex flex-col lg:col-span-2">
                <label className={labelClass}>Complete Address</label>
                <input
                  type="text"
                  name="co_complete_address"
                  value={formData.co_complete_address}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Complete Address"
                />
              </div>
            </div>
          </section>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
          >
            Next <span className="text-xl">→</span>
          </button>
        </div>
      </form>

      {showAmountModal && (
        <TimedepositAmountModal
          onClose={() => setShowAmountModal(false)}
          formData={formData}
          member={selectedMember || { memberId }}
        />
      )}
    </div>
  );
};

export default MemberAndCoAccountForm;