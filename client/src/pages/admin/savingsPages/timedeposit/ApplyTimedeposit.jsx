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
    accountType: "",
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
    coLastName: "",
    coMiddleName: "",
    coFirstName: "",
    coExtension: "",
    coDOB: "",
    coPlaceOfBirth: "",
    coAge: "",
    coGender: "",
    coCivilStatus: "",
    coContactNumber: "",
    coRelationship: "",
    coCompleteAddress: "",
    coUploadPicture: null
  });

  // Change handlers for text/select fields and file uploads.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, coUploadPicture: file }));
  };

  // State to control display of the TimedepositAmountModal.
  const [showAmountModal, setShowAmountModal] = useState(false);

  // When the Next button is clicked, show the modal.
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Parent Form Data:", formData);
    setShowAmountModal(true);
  };

  // Common input style classes
  const inputClass = "border border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full transition-all duration-200";
  const selectClass = "border border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMMTAgMTIuNUwxNSA3LjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-no-repeat bg-right-4 bg-center-y";
  const labelClass = "text-sm font-medium text-gray-700 mb-1";
  const readOnlyClass = "bg-gray-100 cursor-not-allowed";

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
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select an item</option>
                <option value="Savings">Individual</option>
                <option value="Time Deposit">Joint Account</option>
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
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">
            CO‑ACCOUNT HOLDER PERSONAL INFORMATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                name="coLastName"
                value={formData.coLastName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Last Name"
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Middle Name</label>
              <input
                type="text"
                name="coMiddleName"
                value={formData.coMiddleName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Middle Name"
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                name="coFirstName"
                value={formData.coFirstName}
                onChange={handleChange}
                className={inputClass}
                placeholder="First Name"
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Extension Name</label>
              <input
                type="text"
                name="coExtension"
                value={formData.coExtension}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Jr, Sr"
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                name="coDOB"
                value={formData.coDOB}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Place of Birth</label>
              <input
                type="text"
                name="coPlaceOfBirth"
                value={formData.coPlaceOfBirth}
                onChange={handleChange}
                className={inputClass}
                placeholder="Place of Birth"
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Age</label>
              <input
                type="number"
                name="coAge"
                value={formData.coAge}
                onChange={handleChange}
                className={inputClass}
                placeholder="Age"
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Gender</label>
              <select
                name="coGender"
                value={formData.coGender}
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
                name="coCivilStatus"
                value={formData.coCivilStatus}
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
                name="coContactNumber"
                value={formData.coContactNumber}
                onChange={handleChange}
                className={inputClass}
                placeholder="Contact Number"
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Relationship to Primary</label>
              <select
                name="coRelationship"
                value={formData.coRelationship}
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
              </select>
            </div>
            <div className="flex flex-col lg:col-span-2">
              <label className={labelClass}>Complete Address</label>
              <input
                type="text"
                name="coCompleteAddress"
                value={formData.coCompleteAddress}
                onChange={handleChange}
                className={inputClass}
                placeholder="Complete Address"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={handleSubmit}
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