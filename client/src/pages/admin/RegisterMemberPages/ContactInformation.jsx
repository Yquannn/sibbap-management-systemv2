import React from "react";

const ContactInformation = ({ handleNext, handlePrevious, formData, setFormData }) => {
  // Retrieve existing contactInfo data from parent's state, or initialize with defaults using snake_case keys.
  const contactInfo = formData.contactInfo || {
    house_no_street: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    contact_number: "",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      contactInfo: {
        ...contactInfo,
        [name]: value,
      },
    }));
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="bg-white w-full h-full max-w-none rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-600 mb-4">CONTACT INFORMATION</h2>

        {/* Contact Information Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <label className="block">
            House Blk/Lot No.
            <input
              name="house_no_street"
              className="border p-3 rounded-lg w-full"
              placeholder="House Blk/Lot No."
              value={contactInfo.house_no_street}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            Street
            <input
              name="street"
              className="border p-3 rounded-lg w-full"
              placeholder="Street"
              value={contactInfo.street}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            Barangay
            <input
              name="barangay"
              className="border p-3 rounded-lg w-full"
              placeholder="Barangay"
              value={contactInfo.barangay}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            City
            <input
              name="city"
              className="border p-3 rounded-lg w-full"
              placeholder="City"
              value={contactInfo.city}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            Province
            <input
              name="province"
              className="border p-3 rounded-lg w-full"
              placeholder="Province"
              value={contactInfo.province}
              onChange={handleChange}
            />
          </label>
        </div>

        <label className="block mt-4">
          Contact Number
          <input
            name="contact_number"
            className="border p-3 rounded-lg w-full"
            placeholder="Contact Number"
            value={contactInfo.contact_number}
            onChange={handleChange}
          />
        </label>

        {/* Navigation Buttons */}
        <div className="flex justify-end mt-6">
          <button
            className="bg-red-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-red-800 transition-all mr-4"
            onClick={handlePrevious}
            type="button"
          >
            <span className="text-2xl">&#187;&#187;</span> Previous
          </button>
          <button
            className="bg-green-700 text-white text-lg px-8 py-3 rounded-lg flex items-center gap-3 shadow-md hover:bg-green-800 transition-all"
            onClick={handleNext}
            type="button"
          >
            <span className="text-2xl">&#187;&#187;</span> Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
