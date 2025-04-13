import React, { useState } from "react";
import { Upload, X, CheckCircle, File, Plus } from "lucide-react";

const LegalAndDocuments = ({ handlePrevious, handleSave, formData, setFormData, isReadOnly }) => {
  const [dragActive, setDragActive] = useState(null);

  // Handler for Character References
  const handleCharacterChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedRefs = prev.legalBeneficiaries.characterReferences.map((ref, i) =>
        i === index ? { ...ref, [name]: value } : ref
      );
      return {
        ...prev,
        legalBeneficiaries: { ...prev.legalBeneficiaries, characterReferences: updatedRefs }
      };
    });
  };

  const handleAddCharacterReference = () => {
    setFormData(prev => ({
      ...prev,
      legalBeneficiaries: {
        ...prev.legalBeneficiaries,
        characterReferences: [
          ...prev.legalBeneficiaries.characterReferences,
          { fullName: "", position: "", contactNumber: "" }
        ]
      }
    }));
  };
  
  const handleRemoveCharacterReference = (index) => {
    setFormData(prev => {
      const newRefs = [...prev.legalBeneficiaries.characterReferences];
      newRefs.splice(index, 1);
      return {
        ...prev,
        legalBeneficiaries: {
          ...prev.legalBeneficiaries,
          characterReferences: newRefs
        }
      };
    });
  };

  // Handlers for documents (file uploads)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [name]: files[0] }
      }));
    }
  };

  const handleDragEnter = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isReadOnly) {
      setDragActive(name);
    }
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
    
    if (!isReadOnly && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [name]: e.dataTransfer.files[0] }
      }));
    }
  };

  const handleRemove = (name) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [name]: null }
    }));
  };

  // Document types with labels
  const documentTypes = [
    { name: "id_picture", label: "Profile Picture" },
    { name: "barangay_clearance", label: "Barangay Clearance" },
    { name: "tax_identification", label: "Tax Identification" },
    { name: "valid_id", label: "Valid ID" },
    { name: "membership_agreement", label: "Membership Agreement" }
  ];

  const getFileSize = (file) => {
    if (!file) return "";
    
    const bytes = file.size;
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Character References Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Character References</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please provide at least two character references
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {formData.legalBeneficiaries.characterReferences.map((ref, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      placeholder="Enter full name"
                      value={ref.fullName || ""}
                      onChange={(e) => handleCharacterChange(index, e)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      name="position"
                      placeholder="Enter position"
                      value={ref.position || ""}
                      onChange={(e) => handleCharacterChange(index, e)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      name="contactNumber"
                      placeholder="Enter contact number"
                      value={ref.contactNumber || ""}
                      onChange={(e) => handleCharacterChange(index, e)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
                
                {!isReadOnly && formData.legalBeneficiaries.characterReferences.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveCharacterReference(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    aria-label="Remove character reference"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleAddCharacterReference}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Character Reference
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Documents Upload Section */}
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
                
                {formData.documents[name] ? (
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

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handlePrevious}
          type="button"
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          disabled={isReadOnly}
        >
          Previous
        </button>
        <button
          onClick={handleSave}
          type="button"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          disabled={isReadOnly}
        >
          {isReadOnly ? 'Close' : 'Save and Submit'}
        </button>
      </div>
    </div>
  );
};

export default LegalAndDocuments;