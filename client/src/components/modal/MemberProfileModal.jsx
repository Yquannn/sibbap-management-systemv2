import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pic from "../blankPicture.png"; // Fallback placeholder image
import Success from '../Success'; // Import Success component

const MembershipInformationModal = ({ member, onClose }) => {
  const [memberState, setMemberState] = useState(member);  // Initialize memberState
  const [showMessage, setShowMessage] = useState(false); // For showing the success/error modal
  const [messageType, setMessageType] = useState(""); // success or error
  const [message, setMessage] = useState(""); // Message to display

  useEffect(() => {
    setMemberState(member);
  }, [member]);

  const handleCloseMessage = () => {
    setShowMessage(false);
    setMessage("");
    setMessageType("");
  };

  if (!memberState) return null;

  // Use snake_case property names from API
  const memberSinceDate = new Date(memberState.registration_date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = memberSinceDate.toLocaleDateString('en-US', options);

  const dateOfBirth = new Date(memberState.date_of_birth);
  const options2 = { year: 'numeric', month: 'long', day: 'numeric' };
  const formDate = dateOfBirth.toLocaleDateString('en-US', options2);

  const idPictureUrl = memberState.id_picture ? `http://localhost:3001/uploads/${memberState.id_picture}` : pic;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-7xl">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-red-500 text-2xl font-bold">
            &times;
          </button>
        </div>
        <div className="flex items-start space-x-10">
          <div className="text-center">
            <img
              src={idPictureUrl}
              alt="ID Picture"
              className="w-32 h-32 rounded-full object-cover mx-auto"
            />
            <h5 className="text-sm mt-2">{memberState.member_type}</h5>
            <h3 className="text-3xl font-bold mt-1">
              {memberState.last_name + ', ' + memberState.first_name + ', ' + memberState.middle_name}
            </h3>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Member Information</h2>
            <div className="grid grid-cols-3">
              <div className="mr-4">
                <p className="text-gray-700">
                  <span className="font-bold">Code Number:</span> {memberState.memberCode}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Member since:</span> {formattedDate}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Age:</span> {memberState.age}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Sex:</span> {memberState.sex}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Contact No:</span> {memberState.contact_number}
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-bold">TIN:</span> {memberState.tin_number}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Address:</span> {memberState.house_no_street + ', ' + memberState.barangay + ', ' + memberState.city}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Date of birth:</span> {formDate}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Place of birth:</span> {memberState.birthplace_province}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Civil status:</span> {memberState.civil_status}
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-bold">Highest Education:</span> {memberState.highest_educational_attainment}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Occupation Source Of Income:</span> {memberState.occupation_source_of_income}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Spouse Name:</span> {memberState.spouse_name}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Spouse Occupation Source Of Income:</span> {memberState.spouse_occupation_source_of_income}
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-t border-solid border-gray-400 my-2" />
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Beneficiaries</h3>
              <p className="text-gray-700">
                <span className="font-bold">Beneficiary name:</span> {memberState.beneficiary_name}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Relationship:</span> {memberState.relationship}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Contact Number:</span> {memberState.beneficiary_contact_number}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Character reference</h3>
              <p className="text-gray-700">
                <span className="font-bold">Reference name:</span> {memberState.reference_name}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Position:</span> {memberState.position}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Contact Number:</span> {memberState.reference_contact_number}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-t border-solid border-gray-400 my-4" />
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold">Email:</p>
              <p>{memberState.email}</p>
            </div>
            <div>
              <p className="font-bold">Password:</p>
              <p>{memberState.password}</p>
            </div>
            <div>
              <p className="font-bold">Account status:</p>
              <p>{memberState.account_status}</p>
            </div>
          </div>

          {memberState.account_status !== 'ACTIVATED' && (
            <button
              onClick={async () => {
                try {
                  console.log(`Activating account with ID: ${memberState.member_id}`);
                  const response = await axios.put(
                    `http://localhost:3001/api/activate/${memberState.member_id}`
                  );
                  console.log("Activation response:", response.data);

                  // Update the member state with new values if activation is successful
                  setMemberState((prevState) => ({
                    ...prevState,
                    account_status: 'ACTIVATED',
                    email: memberState.memberCode,
                    password: memberState.memberCode,
                  }));

                  // Show success message
                  setMessageType("success");
                  setMessage("Account activated successfully!");
                  setShowMessage(true);
                } catch (error) {
                  console.error("Error activating account:", error);
                  setMessageType("error");
                  setMessage("Error activating account.");
                  setShowMessage(true);
                }
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Activate Account
            </button>
          )}
        </div>
      </div>

      {/* Show Success or Error Message */}
      {showMessage && (
        <Success
          type={messageType}
          message={message}
          onClose={handleCloseMessage}
        />
      )}
    </div>
  );
};

export default MembershipInformationModal;
