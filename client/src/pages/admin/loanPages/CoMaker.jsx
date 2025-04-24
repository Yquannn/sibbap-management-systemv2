import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CoMakerForm = ({ 
  handlePrevious, 
  handleSave, 
  formData, 
  setFormData 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoMaker, setSelectedCoMaker] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Update co-maker details in form data
  const updateCoMakerDetails = (coMaker) => {
    setFormData({
      ...formData,
      loanInfo: {
        ...formData.loanInfo,
        coMakerDetails: {
          memberId: coMaker.memberId,
          name: `${coMaker.first_name} ${coMaker.last_name}`,
          share_capital: coMaker.share_capital
        }
      }
    });
    setSelectedCoMaker(coMaker);
  };

  // Handle search for co-makers
 // Handle search for co-makers
const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      alert("Please enter a member ID, name, or code to search");
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Use the correct endpoint for member search by code
      const response = await axios.get(`http://localhost:3001/api/member-by-code/${searchTerm}`);
      console.log("API Response:", response.data);
      
      // Check the structure of the response
      if (response.data) {
        if (response.data.success && response.data.member) {
          // Response is an object with success and member properties
          setSearchResults([response.data.member]);
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          // Response is an array of objects
          setSearchResults(response.data);
        } else {
          setSearchResults([]);
          alert("No members found with that search term.");
        }
      } else {
        setSearchResults([]);
        alert("No members found with that search term.");
      }
      
    } catch (error) {
      console.error("Error searching for members:", error);
      alert("Error searching for members. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle form submission with co-maker validation
  const handleSubmitWithCoMaker = async () => {
    // Validate co-maker is selected
    if (!selectedCoMaker) {
      alert("Please select a co-maker before submitting the application.");
      return;
    }

    // Check if co-maker is the same as applicant
    if (selectedCoMaker.memberId === formData.memberInfo.memberId) {
      alert("You cannot select yourself as a co-maker. Please select another member.");
      return;
    }

    // Check co-maker share capital meets minimum requirement
    const minShareCapital = 5000; // Adjust as needed
    if (parseFloat(selectedCoMaker.share_capital) < minShareCapital) {
      alert(`Co-maker must have at least ₱${minShareCapital.toLocaleString()} share capital.`);
      return;
    }

    try {
      // Update formData with co-maker details before saving
      setFormData(prevFormData => ({
        ...prevFormData,
        loanInfo: {
          ...prevFormData.loanInfo,
          coMakerDetails: {
            memberId: selectedCoMaker.memberId,
            name: `${selectedCoMaker.first_name} ${selectedCoMaker.last_name}`,
            share_capital: selectedCoMaker.share_capital
          }
        }
      }));
      
      // Wait for state update to complete
      setTimeout(async () => {
        const result = await handleSave();
        if (result !== false) { // Assuming handleSave returns false on error
          setShowSuccessModal(true);
        }
      }, 100);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application. Please try again.");
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/loan-application"); // Redirect after successful submission
  };

  return (
    <div className="bg-white w-full p-4">
      <h2 className="text-2xl font-bold text-green-600 my-4">
        CO-MAKER INFORMATION
      </h2>
      
      <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="font-medium text-green-800 mb-2">Important Notes:</h3>
        <ul className="list-disc ml-5 text-sm text-green-700">
          <li>Co-makers must be active members with good standing.</li>
          <li>Co-makers must have at least ₱5,000 share capital.</li>
          <li>Co-makers cannot be the loan applicant themselves.</li>
          <li>Co-makers are financially responsible if the borrower defaults.</li>
        </ul>
      </div>

      {/* Co-maker search form */}
      <div className="mb-6">
        <label className="block font-medium text-gray-700 mb-2">
          Search for Co-Maker
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="border p-3 rounded-lg flex-grow"
            placeholder="Enter member ID, name, or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Search Results:</h3>
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Share Capital
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((member) => (
                  <tr key={member.memberId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {member.memberCode}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {`${member.first_name} ${member.last_name}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      ₱{parseFloat(member.share_capital).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => updateCoMakerDetails(member)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-all"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected co-maker display */}
      {selectedCoMaker && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Selected Co-Maker:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Member ID:</p>
              <p className="font-medium">{selectedCoMaker.memberId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name:</p>
              <p className="font-medium">{`${selectedCoMaker.first_name} ${selectedCoMaker.last_name}`}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Share Capital:</p>
              <p className="font-medium">₱{parseFloat(selectedCoMaker.share_capital).toLocaleString()}</p>
            </div>
            <div>
              <button
                onClick={() => setSelectedCoMaker(null)}
                className="text-red-600 underline hover:text-red-800"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Co-maker declaration */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-2">Co-Maker Declaration:</h3>
        <p className="text-sm text-gray-700 mb-2">
          By proceeding with this application, the selected co-maker agrees to the following:
        </p>
        <ul className="list-disc ml-5 text-sm text-gray-700">
          <li>To assume financial responsibility if the borrower fails to repay the loan.</li>
          <li>To acknowledge that their share capital may be used to offset any unpaid balance.</li>
          <li>To confirm they are freely consenting to be a co-maker for this loan application.</li>
        </ul>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-end mt-6 space-x-4">
        <button
          className="bg-red-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-red-800 transition-all"
          onClick={handlePrevious}
          type="button"
        >
          <span className="text-2xl">&#187;&#187;</span> Previous
        </button>
        <button
          className="bg-green-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-green-800 transition-all"
          onClick={handleSubmitWithCoMaker}
          type="button"
          disabled={!selectedCoMaker || isSearching}
        >
          <span className="text-2xl">&#187;&#187;</span> Submit Application
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Application Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your loan application has been submitted and is now pending review by our loan officers. You will be notified once it has been processed.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="inline-flex justify-center w-full py-3 rounded-md border border-transparent shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoMakerForm;