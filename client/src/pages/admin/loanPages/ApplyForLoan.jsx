import React, { useState, useEffect, createContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import PersonalInformation from "./components/PersonalInformation";
import ContactInformation from "../RegisterMemberPages/ContactInformation";
import LoanInformation from "./LoanInformation";
import AccountInformation from "./AccountInformation";

export const FormDataContext = createContext();

const ApplyForLoan = () => {
  const location = useLocation();
  const { selectedMember, members } = location.state || {};

  // Derive memberId from selectedMember (if available)
  const memberId = selectedMember ? selectedMember.memberId : null;

  // Track the active tab (step)
  const [activeTab, setActiveTab] = useState(0);

  // Shared state for the multi-step form data
  const [formData, setFormData] = useState({
    personalInfo: {},
    contactInfo: {},
    legalBeneficiaries: {},
    initialContribution: {},
    AccountInformation: {},
    documents: {},
    mobilePortal: {},
  });

  // State for storing fetched data from the API
  const [fetchedData, setFetchedData] = useState(null);

  // Titles for each step
  const tabs = [
    "PERSONAL INFORMATION",
    "CONTACT INFORMATION",
    "LOAN INFORMATION",
    "ACCOUNT INFORMATION",
    "CO‑MAKER/CO‑BORROWER"
  ];

  // Fetch data from the API when memberId is available
  useEffect(() => {
    if (memberId) {
      axios
        .get(`http://localhost:3001/api/member/${memberId}`)
        .then((response) => {
          console.log("Fetched data:", response.data);
          setFetchedData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [memberId]);

  // Navigation functions
  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleNext = () => {
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  // Function to save form data (if needed)
  const handleSave = async () => {
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([section, sectionData]) => {
        Object.entries(sectionData).forEach(([key, value]) => {
          if (value instanceof File) {
            formDataObj.append(key, value);
          } else {
            formDataObj.append(key, value !== undefined && value !== null ? value : "");
          }
        });
      });

      const response = await axios.post("http://localhost:3001/api/register-member", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Registration successful", response.data);
      alert(response.data.message || "Member added successfully!");
    } catch (error) {
      console.error("Error during registration:", error);
      const errorMessage =
        error.response?.data?.message || "Registration error! Please try again later.";
      alert(`Error adding member: ${errorMessage}`);
    }
  };

  return (
    <FormDataContext.Provider value={{ formData, setFormData, fetchedData, selectedMember, members }}>
      <div className="flex items-center justify-center w-full h-full">
        <div className="bg-white w-full h-full max-w-none rounded-lg p-2">
          <h1 className="text-4xl font-extrabold text-center mb-4 text-green-700">
            LOAN APPLICATION
          </h1>

          {/* Step Tabs */}
          <div className="flex border-b-2 mb-4 overflow-x-auto">
            {tabs.map((tab, index) => (
              <div
                key={index}
                onClick={() => setActiveTab(index)}
                className={`py-4 px-6 text-lg font-bold cursor-pointer border-b-4 transition-all duration-300 ${
                  index === activeTab
                    ? "border-green-600 text-green-700"
                    : "border-gray-300 text-gray-600 hover:text-green-700 hover:border-green-500"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mt-4">
            {activeTab === 0 && (
              <PersonalInformation
                mode="loan"
                handleNext={handleNext}
                formData={formData}
                setFormData={setFormData}
                fetchedData={fetchedData}
              />
            )}

            {activeTab === 1 && (
              <ContactInformation 
                handleNext={handleNext} 
                handlePrevious={handlePrevious} 
                formData={formData} 
                setFormData={setFormData} 
                fetchedData={fetchedData} 
              />
            )}

            {activeTab === 2 && (
              <LoanInformation 
                handleNext={handleNext} 
                handlePrevious={handlePrevious} 
                formData={formData} 
                setFormData={setFormData} 
                fetchedData={fetchedData}
              />
            )}

            {activeTab === 3 && (
              <AccountInformation 
                handleNext={handleNext} 
                handlePrevious={handlePrevious} 
                formData={formData} 
                setFormData={setFormData} 
                fetchedData={fetchedData}
              />
            )}

            {activeTab === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Co‑Maker / Co‑Borrower Information</h2>
                {/* Placeholder: add your Co‑Maker/Co‑Borrower component or form fields here */}
                <p>Co‑Maker/Co‑Borrower form goes here.</p>
                <div className="flex justify-end mt-6 space-x-4">
                  <button
                    className="bg-red-700 text-white text-lg px-8 py-3 rounded-lg"
                    onClick={handlePrevious}
                    type="button"
                  >
                    <span className="text-2xl">&#187;&#187;</span> Previous
                  </button>
                  <button
                    className="bg-green-700 text-white text-lg px-8 py-3 rounded-lg"
                    onClick={handleSave}
                    type="button"
                  >
                    <span className="text-2xl">&#187;&#187;</span> Submit Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormDataContext.Provider>
  );
};

export default ApplyForLoan;
