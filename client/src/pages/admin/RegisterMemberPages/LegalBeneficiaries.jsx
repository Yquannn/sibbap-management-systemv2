import React, { useEffect } from "react";

const LegalAndDocuments = ({
  handlePrevious,
  handleNext,
  formData,
  setFormData,
  isReadOnly,
  fetchedData, // new prop to pass fetched legal beneficiaries and documents data
}) => {
  // ------------------ LEGAL BENEFICIARIES SETUP ------------------
  const defaultLegalBeneficiaries = {
    primary: { fullName: "", relationship: "", contactNumber: "" },
    secondary: { fullName: "", relationship: "", contactNumber: "" },
    additional: [],
    characterReferences: [
      { fullName: "", position: "", contactNumber: "" },
      { fullName: "", position: "", contactNumber: "" },
    ],
  };

  // ------------------ DOCUMENTS UPLOAD SETUP ------------------
  const defaultDocuments = {
    id_picture: null,
    barangay_clearance: null,
    tax_identification: null,
    valid_id: null,
    membership_agreement: null,
  };

  // When fetchedData is available, merge its legalBeneficiaries and documents into formData
  useEffect(() => {
    if (fetchedData) {
      if (fetchedData.legalBeneficiaries) {
        setFormData((prev) => ({
          ...prev,
          legalBeneficiaries: {
            ...defaultLegalBeneficiaries,
            ...fetchedData.legalBeneficiaries,
            primary: {
              ...defaultLegalBeneficiaries.primary,
              ...(fetchedData.legalBeneficiaries.primary || {}),
            },
            secondary: {
              ...defaultLegalBeneficiaries.secondary,
              ...(fetchedData.legalBeneficiaries.secondary || {}),
            },
            additional:
              fetchedData.legalBeneficiaries.additional ||
              defaultLegalBeneficiaries.additional,
            characterReferences:
              (fetchedData.legalBeneficiaries.characterReferences &&
                fetchedData.legalBeneficiaries.characterReferences.length > 0) ||
              defaultLegalBeneficiaries.characterReferences,
          },
        }));
      }
      if (fetchedData.documents) {
        setFormData((prev) => ({
          ...prev,
          documents: {
            ...defaultDocuments,
            ...fetchedData.documents,
          },
        }));
      }
    }
  }, [fetchedData, setFormData]);

  // Merge legal beneficiaries from formData with defaults
  const legalBeneficiaries = {
    ...defaultLegalBeneficiaries,
    ...formData.legalBeneficiaries,
    primary: {
      ...defaultLegalBeneficiaries.primary,
      ...(formData.legalBeneficiaries?.primary || {}),
    },
    secondary: {
      ...defaultLegalBeneficiaries.secondary,
      ...(formData.legalBeneficiaries?.secondary || {}),
    },
    additional: formData.legalBeneficiaries?.additional || [],
    characterReferences:
      formData.legalBeneficiaries?.characterReferences?.length > 0
        ? formData.legalBeneficiaries.characterReferences
        : defaultLegalBeneficiaries.characterReferences,
  };

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
    const updatedReferences = legalBeneficiaries.characterReferences.map(
      (ref, i) => (i === index ? { ...ref, [name]: value } : ref)
    );
    setFormData((prev) => ({
      ...prev,
      legalBeneficiaries: {
        ...legalBeneficiaries,
        characterReferences: updatedReferences,
      },
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

  // Merge documents from formData with defaults
  const documents = { ...defaultDocuments, ...formData.documents };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      documents: { ...documents, [name]: files[0] },
    }));
  };

  const handleRemove = (name) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...documents, [name]: null },
    }));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        LEGAL BENEFICIARIES & DOCUMENTS UPLOAD
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Legal Beneficiaries */}
        <div>
          <p className="font-semibold">Primary Beneficiary:</p>
          <input
            name="fullName"
            placeholder="Primary Full Name"
            value={legalBeneficiaries.primary.fullName}
            onChange={handlePrimaryChange}
            className="border p-2 rounded-lg w-full my-1"
          />
          <input
            name="relationship"
            placeholder="Primary Relationship"
            value={legalBeneficiaries.primary.relationship}
            onChange={handlePrimaryChange}
            className="border p-2 rounded-lg w-full my-1"
          />
          <input
            name="contactNumber"
            placeholder="Primary Contact Number"
            value={legalBeneficiaries.primary.contactNumber}
            onChange={handlePrimaryChange}
            className="border p-2 rounded-lg w-full my-1"
          />

          <p className="font-semibold mt-4">Secondary Beneficiary:</p>
          <input
            name="fullName"
            placeholder="Secondary Full Name"
            value={legalBeneficiaries.secondary.fullName}
            onChange={handleSecondaryChange}
            className="border p-2 rounded-lg w-full my-1"
          />
          <input
            name="relationship"
            placeholder="Secondary Relationship"
            value={legalBeneficiaries.secondary.relationship}
            onChange={handleSecondaryChange}
            className="border p-2 rounded-lg w-full my-1"
          />
          <input
            name="contactNumber"
            placeholder="Secondary Contact Number"
            value={legalBeneficiaries.secondary.contactNumber}
            onChange={handleSecondaryChange}
            className="border p-2 rounded-lg w-full my-1"
          />

          <p className="font-semibold mt-4">Additional Beneficiaries:</p>
          {legalBeneficiaries.additional.map((ben, index) => (
            <div key={index} className="my-1">
              <input
                name="fullName"
                placeholder="Additional Full Name"
                value={ben.fullName}
                onChange={(e) => handleAdditionalChange(index, e)}
                className="border p-2 rounded-lg w-full my-1"
              />
              <input
                name="relationship"
                placeholder="Additional Relationship"
                value={ben.relationship}
                onChange={(e) => handleAdditionalChange(index, e)}
                className="border p-2 rounded-lg w-full my-1"
              />
              <input
                name="contactNumber"
                placeholder="Additional Contact Number"
                value={ben.contactNumber}
                onChange={(e) => handleAdditionalChange(index, e)}
                className="border p-2 rounded-lg w-full my-1"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddAdditionalBeneficiary}
            className="text-blue-500 text-sm mt-2"
          >
            + Add Additional Beneficiary
          </button>

          <p className="font-semibold mt-4">Character References:</p>
          {legalBeneficiaries.characterReferences.map((ref, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 my-1">
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Full Name</label>
                <input
                  name="fullName"
                  placeholder="Reference Full Name"
                  value={ref.fullName}
                  onChange={(e) => handleCharacterChange(index, e)}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Position</label>
                <input
                  name="position"
                  placeholder="Position"
                  value={ref.position}
                  onChange={(e) => handleCharacterChange(index, e)}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Contact Number</label>
                <input
                  name="contactNumber"
                  placeholder="Reference Contact Number"
                  value={ref.contactNumber}
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
            />
            {documents.id_picture && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {documents.id_picture.name}
                </p>
                <button
                  onClick={() => handleRemove("id_picture")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
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
            />
            {documents.barangay_clearance && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {documents.barangay_clearance.name}
                </p>
                <button
                  onClick={() => handleRemove("barangay_clearance")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
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
            />
            {documents.tax_identification && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {documents.tax_identification.name}
                </p>
                <button
                  onClick={() => handleRemove("tax_identification")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
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
            />
            {documents.valid_id && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {documents.valid_id.name}
                </p>
                <button
                  onClick={() => handleRemove("valid_id")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
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
            />
            {documents.membership_agreement && (
              <>
                <p className="text-sm text-gray-700">
                  Uploaded: {documents.membership_agreement.name}
                </p>
                <button
                  onClick={() => handleRemove("membership_agreement")}
                  type="button"
                  className="text-red-500 text-sm mt-1"
                >
                  Remove
                </button>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handlePrevious}
          type="button"
          className="bg-red-700 text-white px-6 py-3 rounded-lg mr-4"
        >
          &#171;&#171; Previous
        </button>
        <button
          onClick={handleNext}
          type="button"
          className="bg-green-700 text-white px-8 py-3 rounded-lg"
        >
          Next &#187;&#187;
        </button>
      </div>
    </div>
  );
};

export default LegalAndDocuments;
