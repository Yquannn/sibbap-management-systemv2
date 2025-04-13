import React, { useEffect, useState } from "react";

// Default values for legal beneficiaries and documents
const initialLegalBeneficiaries = {
  primary: { fullName: "", relationship: "", contactNumber: "" },
  secondary: { fullName: "", relationship: "", contactNumber: "" },
  additional: [],
  characterReferences: [
    { fullName: "", position: "", contactNumber: "" },
    { fullName: "", position: "", contactNumber: "" },
  ],
};

const initialDocuments = {
  id_picture: null,
  barangay_clearance: null,
  tax_identification: null,
  valid_id: null,
  membership_agreement: null,
};

const documentTypes = [
  { name: "id_picture", label: "Profile Picture" },
  { name: "barangay_clearance", label: "Barangay Clearance" },
  { name: "tax_identification", label: "Tax Identification" },
  { name: "valid_id", label: "Valid ID" },
  { name: "membership_agreement", label: "Membership Agreement" },
];

const LegalAndDocuments = ({
  handlePrevious,
  handleNext,
  formData,
  setFormData,
  isReadOnly,
  fetchedData, // optional fetched data if available
}) => {
  const [dragActive, setDragActive] = useState(null);

  // When fetchedData is provided, merge its legal beneficiaries and documents into the parent's formData
  useEffect(() => {
    if (fetchedData) {
      if (fetchedData.legalBeneficiaries) {
        setFormData((prev) => ({
          ...prev,
          legalBeneficiaries: {
            ...initialLegalBeneficiaries,
            ...fetchedData.legalBeneficiaries,
            primary: {
              ...initialLegalBeneficiaries.primary,
              ...(fetchedData.legalBeneficiaries.primary || {}),
            },
            secondary: {
              ...initialLegalBeneficiaries.secondary,
              ...(fetchedData.legalBeneficiaries.secondary || {}),
            },
            additional:
              fetchedData.legalBeneficiaries.additional ||
              initialLegalBeneficiaries.additional,
            characterReferences:
              fetchedData.legalBeneficiaries.characterReferences &&
              fetchedData.legalBeneficiaries.characterReferences.length > 0
                ? fetchedData.legalBeneficiaries.characterReferences
                : initialLegalBeneficiaries.characterReferences,
          },
        }));
      }
      if (fetchedData.documents) {
        setFormData((prev) => ({
          ...prev,
          documents: {
            ...initialDocuments,
            ...fetchedData.documents,
          },
        }));
      }
    }
  }, [fetchedData, setFormData]);

  // Merge existing legal beneficiaries from formData with defaults
  const legalBeneficiaries = {
    ...initialLegalBeneficiaries,
    ...formData.legalBeneficiaries,
    primary: {
      ...initialLegalBeneficiaries.primary,
      ...(formData.legalBeneficiaries?.primary || {}),
    },
    secondary: {
      ...initialLegalBeneficiaries.secondary,
      ...(formData.legalBeneficiaries?.secondary || {}),
    },
    additional: formData.legalBeneficiaries?.additional || [],
    characterReferences:
      formData.legalBeneficiaries?.characterReferences &&
      formData.legalBeneficiaries.characterReferences.length > 0
        ? formData.legalBeneficiaries.characterReferences
        : initialLegalBeneficiaries.characterReferences,
  };

  // Merge documents from formData with defaults
  const documents = { ...initialDocuments, ...formData.documents };

  // Handlers for legal beneficiaries
  const handlePrimaryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...legalBeneficiaries,
        primary: { ...legalBeneficiaries.primary, [name]: value },
      },
    }));
  };

  const handleSecondaryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...legalBeneficiaries,
        secondary: { ...legalBeneficiaries.secondary, [name]: value },
      },
    }));
  };

  const handleAdditionalChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAdditional = legalBeneficiaries.additional.map((ben, i) =>
      i === index ? { ...ben, [name]: value } : ben
    );
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: { ...legalBeneficiaries, additional: updatedAdditional },
    }));
  };

  const handleAddAdditionalBeneficiary = () => {
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...legalBeneficiaries,
        additional: [
          ...legalBeneficiaries.additional,
          { fullName: "", relationship: "", contactNumber: "" },
        ],
      },
    }));
  };

  const handleCharacterChange = (index, e) => {
    const { name, value } = e.target;
    const updatedReferences = legalBeneficiaries.characterReferences.map((ref, i) =>
      i === index ? { ...ref, [name]: value } : ref
    );
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: { ...legalBeneficiaries, characterReferences: updatedReferences },
    }));
  };

  const handleAddCharacterReference = () => {
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...legalBeneficiaries,
        characterReferences: [
          ...legalBeneficiaries.characterReferences,
          { fullName: "", position: "", contactNumber: "" },
        ],
      },
    }));
  };

  // Handlers for documents upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [name]: files[0] },
    }));
  };

  const handleRemove = (name) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [name]: null },
    }));
  };

  // Drag and drop handlers
  const handleDragEnter = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(name);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({
        ...prev,
        documents: { ...prev.documents, [name]: e.dataTransfer.files[0] },
      }));
    }
  };

  // Helper function to format file size
  const getFileSize = (file) => {
    if (!file) return "";
    
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB < 1024) {
      return `${fileSizeKB.toFixed(2)} KB`;
    } else {
      const fileSizeMB = fileSizeKB / 1024;
      return `${fileSizeMB.toFixed(2)} MB`;
    }
  };

  // Input field component with consistent styling
  const InputField = ({ label, name, value, onChange, placeholder, disabled }) => (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
        disabled={disabled}
      />
    </div>
  );

  // Section component for consistent styling
  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );

  // Icon components
  const File = ({ size, className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  const Upload = ({ className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );

  const X = ({ size }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* <h2 className="text-2xl font-bold text-green-600 mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        LEGAL BENEFICIARIES & DOCUMENTS
      </h2> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Legal Beneficiaries */}
        <div className="space-y-6">
          <Section title="Primary Beneficiary">
            <InputField
              name="fullName"
              placeholder="Full Name"
              value={legalBeneficiaries.primary.fullName}
              onChange={handlePrimaryChange}
              disabled={isReadOnly}
            />
            <InputField
              name="relationship"
              placeholder="Relationship"
              value={legalBeneficiaries.primary.relationship}
              onChange={handlePrimaryChange}
              disabled={isReadOnly}
            />
            <InputField
              name="contactNumber"
              placeholder="Contact Number"
              value={legalBeneficiaries.primary.contactNumber}
              onChange={handlePrimaryChange}
              disabled={isReadOnly}
            />
          </Section>

          <Section title="Secondary Beneficiary">
            <InputField
              name="fullName"
              placeholder="Full Name"
              value={legalBeneficiaries.secondary.fullName}
              onChange={handleSecondaryChange}
              disabled={isReadOnly}
            />
            <InputField
              name="relationship"
              placeholder="Relationship"
              value={legalBeneficiaries.secondary.relationship}
              onChange={handleSecondaryChange}
              disabled={isReadOnly}
            />
            <InputField
              name="contactNumber"
              placeholder="Contact Number"
              value={legalBeneficiaries.secondary.contactNumber}
              onChange={handleSecondaryChange}
              disabled={isReadOnly}
            />
          </Section>

          <Section title="Additional Beneficiaries">
            {legalBeneficiaries.additional.map((ben, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
                <InputField
                  name="fullName"
                  placeholder="Full Name"
                  value={ben.fullName}
                  onChange={(e) => handleAdditionalChange(index, e)}
                  disabled={isReadOnly}
                />
                <InputField
                  name="relationship"
                  placeholder="Relationship"
                  value={ben.relationship}
                  onChange={(e) => handleAdditionalChange(index, e)}
                  disabled={isReadOnly}
                />
                <InputField
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={ben.contactNumber}
                  onChange={(e) => handleAdditionalChange(index, e)}
                  disabled={isReadOnly}
                />
              </div>
            ))}
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleAddAdditionalBeneficiary}
                className="flex items-center text-green-600 hover:text-green-800 font-medium text-sm mt-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Beneficiary
              </button>
            )}
          </Section>

          <Section title="Character References">
            {legalBeneficiaries.characterReferences.map((ref, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Full Name"
                    name="fullName"
                    placeholder="Full Name"
                    value={ref.fullName}
                    onChange={(e) => handleCharacterChange(index, e)}
                    disabled={isReadOnly}
                  />
                  <InputField
                    label="Position"
                    name="position"
                    placeholder="Position"
                    value={ref.position}
                    onChange={(e) => handleCharacterChange(index, e)}
                    disabled={isReadOnly}
                  />
                  <InputField
                    label="Contact Number"
                    name="contactNumber"
                    placeholder="Contact Number"
                    value={ref.contactNumber}
                    onChange={(e) => handleCharacterChange(index, e)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            ))}
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleAddCharacterReference}
                className="flex items-center text-green-600 hover:text-green-800 font-medium text-sm mt-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Reference
              </button>
            )}
          </Section>
        </div>

        {/* Right Column: Documents Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Required Documents</h2>
            <p className="text-sm text-gray-500 mt-1">
              Please upload the following documents in JPG, PNG or PDF format
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentTypes.map(({ name, label }) => (
                <div key={name} className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  
                  {formData.documents && formData.documents[name] ? (
                    <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex-shrink-0 mr-3">
                        <File size={24} className="text-blue-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {formData.documents[name].name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getFileSize(formData.documents[name])}
                        </p>
                      </div>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemove(name)}
                          className="flex-shrink-0 ml-2 text-gray-400 hover:text-red-500"
                          aria-label="Remove file"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center
                        ${dragActive === name ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                      `}
                      onDragEnter={(e) => handleDragEnter(e, name)}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, name)}
                    >
                      <div className="text-center">
                        <Upload 
                          className="mx-auto h-10 w-10 text-gray-400" 
                          aria-hidden="true"
                        />
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Drag and drop your file here, or
                            <label 
                              htmlFor={`file-upload-${name}`} 
                              className="relative cursor-pointer ml-1 text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              browse
                              <input
                                id={`file-upload-${name}`}
                                name={name}
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                disabled={isReadOnly}
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          type="button"
          className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </button>
        <button
          onClick={() => handleNext(formData)}
          type="button"
          className="flex items-center px-8 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors shadow-sm"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LegalAndDocuments;