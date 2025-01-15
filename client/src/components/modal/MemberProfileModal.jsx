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

    if (!memberState) return null;

    const memberSinceDate = new Date(memberState.registrationDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = memberSinceDate.toLocaleDateString('en-US', options);

    const dateOfBirth = new Date(memberState.dateOfBirth);
    const options2 = { year: 'numeric', month: 'long', day: 'numeric' };
    const formDate = dateOfBirth.toLocaleDateString('en-US', options2);

    const idPictureUrl = memberState.idPicture ? `http://localhost:3001/uploads/${memberState.idPicture}` : pic;

    // Function to handle close of success/error modal
    const handleCloseMessage = () => {
        setShowMessage(false);
        setMessage("");
        setMessageType("");
    };

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
                        <h5 className="text-sm mt-2"> {memberState.memberType}</h5>
                        <h3 className="text-3xl font-bold mt-1"> {memberState.fullNameLastName + ', ' + memberState.fullNameFirstName + ', ' + memberState.fullNameMiddleName}</h3>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4">Member Information</h2>
                        <div className="grid grid-cols-3">
                            <div className="mr-4">
                                <p className="text-gray-700">
                                    <span className="font-bold">Membership ID:</span> {memberState.memberCode}
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
                                    <span className="font-bold">Contact No:</span> {memberState.contactNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-700">
                                    <span className="font-bold">TIN:</span> {memberState.tinNumber}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-bold">Address:</span> {memberState.houseNoStreet + ', ' + memberState.barangay + ', ' + memberState.city}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-bold">Date of birth:</span> {formDate}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-bold">Place of birth:</span> {memberState.birthplaceProvince}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-bold">Civil status:</span> {memberState.civilStatus}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-700">
                                    <span className="font-bold">Highest Education:</span> {memberState.highestEducationalAttainment}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-bold">Occupation Source Of Income:</span> {memberState.occupationSourceOfIncome}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-bold">Spouse Name:</span> {memberState.spouseName}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-bold">Occupation Source Of Income:</span> {memberState.spouseOccupationSourceOfIncome}
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
                                <span className="font-bold">Beneficiary name:</span> {memberState.beneficiaryName}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-bold">Relationship:</span> {memberState.relationship}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-bold">Contact Number:</span> {memberState.beneficiaryContactNumber}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold mb-2">Character reference</h3>
                            <p className="text-gray-700">
                                <span className="font-bold">Beneficiary name:</span> {memberState.referenceName}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-bold">Relationship:</span> {memberState.position}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-bold">Contact Number:</span> {memberState.referenceContactNumber}
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
                            <p>{memberState.accountStatus}</p>
                        </div>
                    </div>

                    {memberState.accountStatus !== 'Active' && (
                        <button
                            onClick={async () => {
                                try {
                                    console.log(`Activating account with ID: ${memberState.memberId}`);
                                    const response = await axios.put(
                                        `http://localhost:3001/api/activate/${memberState.memberId}`
                                    );
                                    console.log("Activation response:", response.data);

                                    // Update the member state with new values if activation is successful
                                    setMemberState((prevState) => ({
                                        ...prevState,
                                        accountStatus: 'Active',
                                        email: member.memberCode,
                                        password: member.memberCode,
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
