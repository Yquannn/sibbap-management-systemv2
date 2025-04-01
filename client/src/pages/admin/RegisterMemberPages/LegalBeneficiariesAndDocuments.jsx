import React, { useEffect } from "react";

const LegalAndDocuments = ({ handlePrevious, handleSave, formData, setFormData, isReadOnly }) => {
  // Removed all handlers and inputs for primary, secondary, and additional beneficiaries

  // Handler for Character References remains unchanged
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

  // Handlers for documents (file uploads)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [name]: files[0] }
    }));
  };

  const handleRemove = (name) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [name]: null }
    }));
  };

  useEffect(() => {
    console.log("LegalAndDocuments formData updated:", formData);
  }, [formData]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        LEGAL DOCUMENTS & CHARACTER REFERENCES
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Character References */}
        <div>
          <p className="font-semibold">Character References:</p>
          {formData.legalBeneficiaries.characterReferences.map((ref, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 my-1">
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Full Name</label>
                <input
                  name="fullName"
                  placeholder="Reference Full Name"
                  value={ref.fullName || ""}
                  onChange={(e) => handleCharacterChange(index, e)}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Position</label>
                <input
                  name="position"
                  placeholder="Position"
                  value={ref.position || ""}
                  onChange={(e) => handleCharacterChange(index, e)}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Contact Number</label>
                <input
                  name="contactNumber"
                  placeholder="Reference Contact Number"
                  value={ref.contactNumber || ""}
                  onChange={(e) => handleCharacterChange(index, e)}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddCharacterReference}
            className="text-blue-500 text-sm mt-2"
          >
            + Add Character Reference
          </button>
        </div>

        {/* Right Column: Documents Upload */}
        <div>
          <p className="font-semibold">Documents Upload:</p>
          <label className="block my-1">
            Profile Picture:
            <input
              type="file"
              name="id_picture"
              onChange={handleFileChange}
              className="border p-2 rounded-lg w-full"
              disabled={isReadOnly}
            />
            {formData.documents.id_picture && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {formData.documents.id_picture.name}
                </p>
                <button
                  onClick={() => handleRemove("id_picture")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
                  disabled={isReadOnly}
                >
                  Remove
                </button>
              </>
            )}
          </label>
          <label className="block my-1">
            Barangay Clearance:
            <input
              type="file"
              name="barangay_clearance"
              onChange={handleFileChange}
              className="border p-2 rounded-lg w-full"
              disabled={isReadOnly}
            />
            {formData.documents.barangay_clearance && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {formData.documents.barangay_clearance.name}
                </p>
                <button
                  onClick={() => handleRemove("barangay_clearance")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
                  disabled={isReadOnly}
                >
                  Remove
                </button>
              </>
            )}
          </label>
          <label className="block my-1">
            Tax Identification:
            <input
              type="file"
              name="tax_identification"
              onChange={handleFileChange}
              className="border p-2 rounded-lg w-full"
              disabled={isReadOnly}
            />
            {formData.documents.tax_identification && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {formData.documents.tax_identification.name}
                </p>
                <button
                  onClick={() => handleRemove("tax_identification")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
                  disabled={isReadOnly}
                >
                  Remove
                </button>
              </>
            )}
          </label>
          <label className="block my-1">
            Valid ID:
            <input
              type="file"
              name="valid_id"
              onChange={handleFileChange}
              className="border p-2 rounded-lg w-full"
              disabled={isReadOnly}
            />
            {formData.documents.valid_id && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {formData.documents.valid_id.name}
                </p>
                <button
                  onClick={() => handleRemove("valid_id")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
                  disabled={isReadOnly}
                >
                  Remove
                </button>
              </>
            )}
          </label>
          <label className="block my-1">
            Membership Agreement:
            <input
              type="file"
              name="membership_agreement"
              onChange={handleFileChange}
              className="border p-2 rounded-lg w-full"
              disabled={isReadOnly}
            />
            {formData.documents.membership_agreement && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {formData.documents.membership_agreement.name}
                </p>
                <button
                  onClick={() => handleRemove("membership_agreement")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
                  disabled={isReadOnly}
                >
                  Remove
                </button>
              </>
            )}
          </label>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={handlePrevious}
          type="button"
          className="bg-red-700 text-white px-6 py-3 rounded-lg mr-4"
          disabled={isReadOnly}
        >
          &#171;&#171; Previous
        </button>
        <button
          onClick={handleSave}
          type="button"
          className="bg-green-700 text-white px-8 py-3 rounded-lg"
          disabled={isReadOnly}
        >
          Save &#187;&#187;
        </button>
      </div>
    </div>
  );
};

export default LegalAndDocuments;
