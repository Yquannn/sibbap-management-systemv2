import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  tax_identification_id: null,
  valid_id: null,
  membership_agreement: null,
};

const documentTypes = [
  { name: "id_picture", label: "Profile Picture" },
  { name: "barangay_clearance", label: "Barangay Clearance" },
  { name: "tax_identification_id", label: "Tax Identification" },
  { name: "valid_id", label: "Valid ID" },
  { name: "membership_agreement", label: "Membership Agreement" },
];

const LegalAndDocuments = ({
  handlePrevious,
  handleNext,
  formData,
  setFormData,
  isReadOnly,
  fetchedData,
}) => {
  const [dragActive, setDragActive] = useState(null);
  const [displayDocuments, setDisplayDocuments] = useState({});

  // Helper function to get file type from name
  const getFileTypeFromName = (filename) => {
    if (!filename) return "application/octet-stream";
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  };

  // Initialize form data with fetched data
  useEffect(() => {
    if (fetchedData) {
      // Map primary beneficiary from fetched data
      const primaryFromFetch = fetchedData.beneficiaryName
        ? {
            fullName: fetchedData.beneficiaryName || "",
            relationship: fetchedData.relationship || "",
            contactNumber: fetchedData.beneficiaryContactNumber || "",
          }
        : {};

      // Map character reference from fetched data
      const referenceFromFetch = fetchedData.referenceName
        ? [
            {
              fullName: fetchedData.referenceName || "",
              position: fetchedData.position || "",
              contactNumber: fetchedData.referenceContactNumber || "",
            },
          ]
        : [];

      // Process document filenames into display objects
      const documentDisplayInfo = {};
      
      const documentMappings = {
        id_picture: fetchedData.id_picture,
        barangay_clearance: fetchedData.barangay_clearance,
        tax_identification_id: fetchedData.tax_identification_id,
        valid_id: fetchedData.valid_id,
        membership_agreement: fetchedData.membership_agreement
      };

      // Create display info for each document
      Object.entries(documentMappings).forEach(([key, filename]) => {
        if (filename) {
          documentDisplayInfo[key] = {
            name: filename,
            type: getFileTypeFromName(filename),
            size: 0, // Size unknown from filename alone
            isExistingFile: true
          };
        }
      });
      
      // Update display documents state
      setDisplayDocuments(documentDisplayInfo);

      // Update form data with fetched data
      setFormData((prev) => {
        // Create a deep copy of previous form data to avoid mutation issues
        const updatedFormData = { ...prev };
        
        // Initialize or update legalBeneficiaries
        if (!updatedFormData.legalBeneficiaries) {
          updatedFormData.legalBeneficiaries = { ...initialLegalBeneficiaries };
        }
        
        // Update primary beneficiary
        updatedFormData.legalBeneficiaries.primary = {
          ...initialLegalBeneficiaries.primary,
          ...primaryFromFetch,
          ...(prev.legalBeneficiaries?.primary || {})
        };
        
        // Update secondary beneficiary (preserve existing data)
        updatedFormData.legalBeneficiaries.secondary = {
          ...initialLegalBeneficiaries.secondary,
          ...(prev.legalBeneficiaries?.secondary || {})
        };
        
        // Preserve additional beneficiaries
        updatedFormData.legalBeneficiaries.additional = 
          prev.legalBeneficiaries?.additional || [];
        
        // Update character references
        updatedFormData.legalBeneficiaries.characterReferences = 
          referenceFromFetch.length > 0
            ? [
                ...referenceFromFetch,
                ...(initialLegalBeneficiaries.characterReferences.slice(1))
              ]
            : prev.legalBeneficiaries?.characterReferences || 
              initialLegalBeneficiaries.characterReferences;
        
        // Initialize or update documents
        if (!updatedFormData.documents) {
          updatedFormData.documents = { ...initialDocuments };
        }
        
        // Only preserve actual File objects, not overwrite with string filenames
        // This prevents losing uploaded files when fetched data arrives
        return updatedFormData;
      });
    }
  }, [fetchedData, setFormData]);

  // Extract or create the legalBeneficiaries object from formData
  const legalBeneficiaries = {
    ...initialLegalBeneficiaries,
    ...(formData.legalBeneficiaries || {}),
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

  // Extract or create the documents object from formData
  const documents = { ...initialDocuments, ...(formData.documents || {}) };

  // Handlers for legal beneficiaries
  const handlePrimaryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...(prev.legalBeneficiaries || initialLegalBeneficiaries),
        primary: { 
          ...(prev.legalBeneficiaries?.primary || initialLegalBeneficiaries.primary),
          [name]: value 
        },
      },
    }));
  };

  const handleSecondaryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...(prev.legalBeneficiaries || initialLegalBeneficiaries),
        secondary: { 
          ...(prev.legalBeneficiaries?.secondary || initialLegalBeneficiaries.secondary),
          [name]: value 
        },
      },
    }));
  };

  const handleAdditionalChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const additional = prev.legalBeneficiaries?.additional || [];
      const updatedAdditional = [...additional];
      
      // Update the specific beneficiary at index
      if (updatedAdditional[index]) {
        updatedAdditional[index] = { ...updatedAdditional[index], [name]: value };
      }
      
      return {
        ...prev,
        legalBeneficiaries: {
          ...(prev.legalBeneficiaries || initialLegalBeneficiaries),
          additional: updatedAdditional
        }
      };
    });
  };

  const handleAddAdditionalBeneficiary = () => {
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...(prev.legalBeneficiaries || initialLegalBeneficiaries),
        additional: [
          ...(prev.legalBeneficiaries?.additional || []),
          { fullName: "", relationship: "", contactNumber: "" },
        ],
      },
    }));
  };

  const handleCharacterChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const refs = prev.legalBeneficiaries?.characterReferences || 
                  initialLegalBeneficiaries.characterReferences;
      const updatedRefs = [...refs];
      
      // Update the specific reference at index
      if (updatedRefs[index]) {
        updatedRefs[index] = { ...updatedRefs[index], [name]: value };
      }
      
      return {
        ...prev,
        legalBeneficiaries: {
          ...(prev.legalBeneficiaries || initialLegalBeneficiaries),
          characterReferences: updatedRefs
        }
      };
    });
  };

  const handleAddCharacterReference = () => {
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...(prev.legalBeneficiaries || initialLegalBeneficiaries),
        characterReferences: [
          ...(prev.legalBeneficiaries?.characterReferences || 
             initialLegalBeneficiaries.characterReferences),
          { fullName: "", position: "", contactNumber: "" },
        ],
      },
    }));
  };

  // Handlers for documents upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Update form data with file
      setFormData((prev) => ({
        ...prev,
        documents: { ...(prev.documents || {}), [name]: file },
      }));
      
      // Update display documents
      setDisplayDocuments(prev => ({
        ...prev,
        [name]: {
          name: file.name,
          type: file.type,
          size: file.size,
          isExistingFile: false
        }
      }));
    }
  };

  const handleRemove = (name) => {
    // Remove file from form data
    setFormData((prev) => ({
      ...prev,
      documents: { ...(prev.documents || {}), [name]: null },
    }));
    
    // Remove from display documents
    setDisplayDocuments(prev => {
      const newDisplay = { ...prev };
      delete newDisplay[name];
      return newDisplay;
    });
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
      const file = e.dataTransfer.files[0];
      
      // Update form data with file
      setFormData((prev) => ({
        ...prev,
        documents: { ...(prev.documents || {}), [name]: file },
      }));
      
      // Update display documents
      setDisplayDocuments(prev => ({
        ...prev,
        [name]: {
          name: file.name,
          type: file.type,
          size: file.size,
          isExistingFile: false
        }
      }));
    }
  };

  // Helper function to format file size
  const getFileSize = (file) => {
    if (!file) return "";
    if (file.isExistingFile) return "Saved file";

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
        value={value || ""}
        onChange={onChange}
        className={`w-full px-4 py-2 ${
          disabled ? 'bg-gray-100' : 'bg-gray-50'
        } border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors`}
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
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  const Upload = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );

  const X = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  // Check if a document is available (either in form data or display documents)
  const isDocumentAvailable = (name) => {
    return (
      (formData.documents && formData.documents[name]) ||
      (displayDocuments && displayDocuments[name])
    );
  };

  // Get document display info for rendering
  const getDocumentDisplayInfo = (name) => {
    return displayDocuments[name] || 
           (formData.documents && formData.documents[name] ? {
             name: formData.documents[name].name,
             size: formData.documents[name].size,
             isExistingFile: false
           } : null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Legal Beneficiaries */}
        <div className="space-y-6">
          <Section title="Primary Beneficiary">
            <div className={`p-4 ${legalBeneficiaries.primary.fullName ? 'bg-green-50 border border-green-100' : 'bg-gray-50'} rounded-lg mb-3`}>
              <InputField
                label="Full Name"
                name="fullName"
                placeholder="Full Name"
                value={legalBeneficiaries.primary.fullName}
                onChange={handlePrimaryChange}
                disabled={isReadOnly}
              />
              <InputField
                label="Relationship"
                name="relationship"
                placeholder="Relationship"
                value={legalBeneficiaries.primary.relationship}
                onChange={handlePrimaryChange}
                disabled={isReadOnly}
              />
              <InputField
                label="Contact Number"
                name="contactNumber"
                placeholder="Contact Number"
                value={legalBeneficiaries.primary.contactNumber}
                onChange={handlePrimaryChange}
                disabled={isReadOnly}
              />
              {legalBeneficiaries.primary.fullName && fetchedData?.beneficiaryName && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-md inline-block">
                  ✓ Existing beneficiary from records
                </div>
              )}
            </div>
          </Section>

          <Section title="Secondary Beneficiary">
            <div className={`p-4 ${legalBeneficiaries.secondary.fullName ? 'bg-green-50 border border-green-100' : 'bg-gray-50'} rounded-lg mb-3`}>
              <InputField
                label="Full Name"
                name="fullName"
                placeholder="Full Name"
                value={legalBeneficiaries.secondary.fullName}
                onChange={handleSecondaryChange}
                disabled={isReadOnly}
              />
              <InputField
                label="Relationship"
                name="relationship"
                placeholder="Relationship"
                value={legalBeneficiaries.secondary.relationship}
                onChange={handleSecondaryChange}
                disabled={isReadOnly}
              />
              <InputField
                label="Contact Number"
                name="contactNumber"
                placeholder="Contact Number"
                value={legalBeneficiaries.secondary.contactNumber}
                onChange={handleSecondaryChange}
                disabled={isReadOnly}
              />
              {legalBeneficiaries.secondary.fullName && fetchedData?.secondaryBeneficiaryName && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-md inline-block">
                  ✓ Existing beneficiary from records
                </div>
              )}
            </div>
          </Section>

          <Section title="Additional Beneficiaries">
            {legalBeneficiaries.additional.map((ben, index) => (
              <div key={index} className={`p-4 ${ben.fullName ? 'bg-green-50 border border-green-100' : 'bg-gray-50'} rounded-lg mb-3`}>
                <InputField
                  label="Full Name"
                  name="fullName"
                  placeholder="Full Name"
                  value={ben.fullName}
                  onChange={(e) => handleAdditionalChange(index, e)}
                  disabled={isReadOnly}
                />
                <InputField
                  label="Relationship"
                  name="relationship"
                  placeholder="Relationship"
                  value={ben.relationship}
                  onChange={(e) => handleAdditionalChange(index, e)}
                  disabled={isReadOnly}
                />
                <InputField
                  label="Contact Number"
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={ben.contactNumber}
                  onChange={(e) => handleAdditionalChange(index, e)}
                  disabled={isReadOnly}
                />
                {ben.fullName && fetchedData?.additionalBeneficiaries && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-md inline-block">
                    ✓ Existing beneficiary from records
                  </div>
                )}
              </div>
            ))}
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleAddAdditionalBeneficiary}
                className="flex items-center text-green-600 hover:text-green-800 font-medium text-sm mt-2 transition-colors"
              >
                + Add Another Beneficiary
              </button>
            )}
          </Section>

          <Section title="Character References">
            {legalBeneficiaries.characterReferences.map((ref, index) => (
              <div key={index} className={`p-4 ${ref.fullName ? 'bg-green-50 border border-green-100' : 'bg-gray-50'} rounded-lg mb-3`}>
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
                {ref.fullName && index === 0 && fetchedData?.referenceName && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-md inline-block">
                    ✓ Existing reference from records
                  </div>
                )}
              </div>
            ))}
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleAddCharacterReference}
                className="flex items-center text-green-600 hover:text-green-800 font-medium text-sm mt-2 transition-colors"
              >
                + Add Another Reference
              </button>
            )}
          </Section>
        </div>

        {/* Right Column: Documents Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Required Documents</h2>
            <p className="text-sm text-gray-500 mt-1">Please upload the following documents in JPG, PNG or PDF format</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentTypes.map(({ name, label }) => (
                <div key={name} className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  {isDocumentAvailable(name) ? (
                    <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <File size={24} className="text-blue-500 mr-3" />
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {getDocumentDisplayInfo(name)?.name || 
                           (formData.documents && formData.documents[name]?.name)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getFileSize(getDocumentDisplayInfo(name) || formData.documents?.[name])}
                          {getDocumentDisplayInfo(name)?.isExistingFile && " • Already uploaded"}
                        </p>
                      </div>
                      {!isReadOnly && (
                        <button 
                          type="button" 
                          onClick={() => handleRemove(name)} 
                          className="ml-2 text-gray-400 hover:text-red-500"
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
                      onDragEnter={(e) => !isReadOnly && handleDragEnter(e, name)}
                      onDragLeave={(e) => !isReadOnly && handleDragLeave(e)}
                      onDragOver={(e) => !isReadOnly && handleDragOver(e)}
                      onDrop={(e) => !isReadOnly && handleDrop(e, name)}
                    >
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        {!isReadOnly ? (
                          <>
                            Drag & drop or <label htmlFor={`file-upload-${name}`} className="text-blue-600 cursor-pointer">browse</label>
                            <input 
                              id={`file-upload-${name}`} 
                              name={name} 
                              type="file" 
                              className="sr-only" 
                              onChange={handleFileChange} 
                              disabled={isReadOnly}
                              accept=".jpg,.jpeg,.png,.pdf"
                            />
                          </>
                        ) : (
                          "No file uploaded"
                        )}
                      </p>
                      {!isReadOnly && <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF • 10MB max</p>}
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
          type="button"
          onClick={handlePrevious}
          className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => handleNext(formData)}
          className="flex items-center px-8 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors shadow-sm"
        >
          {isReadOnly ? "Continue" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default LegalAndDocuments;