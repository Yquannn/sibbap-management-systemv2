import React, { useEffect, useState } from "react";

const PersonalInformation = ({
  handleNext,
  formData,
  setFormData,
  fetchedData,
  mode = "application"
}) => {
  const [errors, setErrors] = useState({});
  const [showMaidenName, setShowMaidenName] = useState(formData.personalInfo?.civil_status !== "Single");

  // Merge fetchedData into personalInfo when available
  useEffect(() => {
    if (fetchedData && Object.keys(fetchedData).length > 0) {
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...fetchedData }
      }));
    }
  }, [fetchedData, setFormData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const contactKeys = ["house_no_street", "barangay", "city", "province", "contact_number"];
    
    if (contactKeys.includes(name)) {
      setFormData(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [name]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [name]: value }
      }));
      
      // Handle civil status change
      if (name === "civil_status") {
        setShowMaidenName(value !== "Single");
        if (value === "Single") {
          setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, maiden_name: "" }
          }));
        }
      }
    }
  };

  // Validate age
  useEffect(() => {
    const current = formData.personalInfo || {};
    const ageValue = parseInt(current.age || "", 10);
    
    if (current.age && (isNaN(ageValue) || ageValue < 18)) {
      setErrors(prev => ({ ...prev, age: "Member is not eligible (must be at least 18 years old)" }));
    } else {
      setErrors(prev => {
        const { age, ...others } = prev;
        return others;
      });
    }
  }, [formData.personalInfo?.age]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    const current = formData.personalInfo || {};
    const required = ["last_name", "first_name", "date_of_birth", "age", "civil_status", "sex"];
    
    required.forEach(field => {
      if (!current[field]) {
        newErrors[field] = `${field.replace(/_/g, " ")} is required`;
        isValid = false;
      }
    });
    
    const ageValue = parseInt(current.age || "", 10);
    if (current.age && (isNaN(ageValue) || ageValue < 18)) {
      newErrors.age = "Member is not eligible (must be at least 18 years old)";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare the combined data
      const combinedData = {
        personalInfo: formData.personalInfo,
        contactInfo: formData.contactInfo
      };
      
      // Call handleNext with the combined data
      handleNext(combinedData);
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector(".error-field");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Form field definitions
  const personalFields = [
    // Basic personal information
    { label: "First Name", name: "first_name", type: "text", required: true, gridSpan: "col-span-1" },
    { label: "Middle Name", name: "middle_name", type: "text", gridSpan: "col-span-1" },
    { label: "Last Name", name: "last_name", type: "text", required: true, gridSpan: "col-span-1" },
    { 
      label: "Extension Name", 
      name: "extension_name", 
      type: "select", 
      options: ["", "Jr", "Sr", "III", "IV"], 
      gridSpan: "col-span-1"
    },
    { 
      label: "Sex", 
      name: "sex", 
      type: "select", 
      options: ["", "Male", "Female", "Other"], 
      required: true,
      gridSpan: "col-span-1" 
    },
    { 
      label: "Civil Status", 
      name: "civil_status", 
      type: "select", 
      options: ["", "Single", "Married", "Widowed", "Divorced"], 
      required: true,
      gridSpan: "col-span-1" 
    },
    showMaidenName ? { label: "Maiden Name", name: "maiden_name", type: "text", gridSpan: "col-span-1" } : null,
    { label: "Date of Birth", name: "date_of_birth", type: "date", required: true, gridSpan: "col-span-1" },
    { label: "Age", name: "age", type: "number", required: true, gridSpan: "col-span-1" },
    { label: "Birthplace Province", name: "birthplace_province", type: "text", gridSpan: "col-span-1" },
    { label: "Religion", name: "religion", type: "text", gridSpan: "col-span-1" },
  ].filter(Boolean);

  const educationOccupationFields = [
    { 
      label: "Highest Educational Attainment", 
      name: "highest_educational_attainment", 
      type: "select", 
      options: ["", "Elementary", "High School", "College", "Post Graduate"],
      gridSpan: "col-span-1" 
    },
    { 
      label: "Occupation Source Of Income", 
      name: "occupation_source_of_income", 
      type: "select", 
      options: ["", "Employed", "Self-Employed", "Business Owner", "Freelancer"],
      gridSpan: "col-span-1" 
    },
    mode === "loan"
      ? { label: "Monthly Income (PHP)", name: "monthly_income", type: "number", gridSpan: "col-span-1" }
      : { label: "Annual Income (PHP)", name: "annual_income", type: "number", gridSpan: "col-span-1" },
    { label: "TIN Number", name: "tin_number", type: "text", gridSpan: "col-span-1" },
    { label: "Number of Dependents", name: "number_of_dependents", type: "number", gridSpan: "col-span-1" },
  ];

  const spouseFields = formData.personalInfo?.civil_status === "Married" ? [
    { label: "Name of Spouse", name: "spouse_name", type: "text", gridSpan: "col-span-1" },
    { 
      label: "Spouse Occupation Source Of Income", 
      name: "spouse_occupation_source_of_income", 
      type: "select", 
      options: ["", "Employed", "Self-Employed", "Business Owner", "Freelancer"],
      gridSpan: "col-span-1" 
    },
  ] : [];

  const contactFields = [
    { label: "House No. & Street", name: "house_no_street", type: "text", gridSpan: "col-span-2" },
    { label: "Barangay", name: "barangay", type: "text", gridSpan: "col-span-1" },
    { label: "City", name: "city", type: "text", gridSpan: "col-span-1" },
    { label: "Province", name: "province", type: "text", gridSpan: "col-span-1" },
    { label: "Contact Number", name: "contact_number", type: "tel", gridSpan: "col-span-1" },
  ];

  // Render form field
  const renderField = (field) => {
    const isContactField = ["house_no_street", "barangay", "city", "province", "contact_number"].includes(field.name);
    const value = isContactField 
      ? formData.contactInfo?.[field.name] || "" 
      : formData.personalInfo?.[field.name] || "";
    
    const fieldClass = `${field.gridSpan} ${errors[field.name] ? "error-field" : ""}`;
    
    return (
      <div key={field.name} className={fieldClass}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        
        {field.type === "select" ? (
          <select
            name={field.name}
            className={`w-full px-4 py-2 border ${errors[field.name] ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            value={value}
            onChange={handleChange}
          >
            <option value="">{`Select ${field.label}`}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            name={field.name}
            value={value}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors[field.name] ? "border-red-500" : "border-gray-300"} rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder={`Enter ${field.label}`}
          />
        )}
        
        {errors[field.name] && (
          <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalFields.map(renderField)}
          </div>
        </div>
      </div>

      {/* Education & Income Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Education & Income</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationOccupationFields.map(renderField)}
            {spouseFields.map(renderField)}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Contact Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactFields.map(renderField)}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-end py-4">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default PersonalInformation;