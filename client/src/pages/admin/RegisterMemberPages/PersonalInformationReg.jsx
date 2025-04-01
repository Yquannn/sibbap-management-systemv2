import React, { useEffect } from "react";

const PersonalInformation = ({
  handleNext,
  formData,
  setFormData,
  fetchedData,
  mode = "application"
}) => {
  const [errors, setErrors] = React.useState({});

  // If fetchedData is provided, merge it into personalInfo.
  useEffect(() => {
    if (fetchedData && Object.keys(fetchedData).length > 0) {
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...fetchedData }
      }));
    }
  }, [fetchedData, setFormData]);

  // onChange handler updates state
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
    }
  };

  // Validate age and clear maiden_name if civil_status is "Single"
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
    if (current.civil_status === "Single") {
      setFormData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, maiden_name: "" }
      }));
    }
  }, [formData.personalInfo.age, formData.personalInfo.civil_status, setFormData]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    const current = formData.personalInfo || {};
    const ageValue = parseInt(current.age || "", 10);
    if (!current.age) {
      newErrors.age = "Age is required";
      isValid = false;
    } else if (isNaN(ageValue) || ageValue < 18) {
      newErrors.age = "Member is not eligible (must be at least 18 years old)";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleNext();
    }
  };

  const textInputs = [
    { label: "Last Name", name: "last_name", type: "text", required: true },
    { label: "Middle Name", name: "middle_name", type: "text" },
    { label: "First Name", name: "first_name", type: "text", required: true },
    { label: "Maiden Name", name: "maiden_name", type: "text" },
    { label: "Date of Birth", name: "date_of_birth", type: "date", required: true },
    { label: "Age", name: "age", type: "number", required: true },
    { label: "Birthplace Province", name: "birthplace_province", type: "text" },
    { label: "Religion", name: "religion", type: "text" },
    mode === "loan"
      ? { label: "Monthly Income (PHP)", name: "monthly_income", type: "number" }
      : { label: "Annual Income (PHP)", name: "annual_income", type: "number" },
    { label: "TIN Number", name: "tin_number", type: "text" },
    { label: "Number of Dependents", name: "number_of_dependents", type: "number" },
    { label: "Name of Spouse", name: "spouse_name", type: "text" }
  ];

  const dropdowns = [
    { label: "Extension Name", name: "extension_name", options: ["Jr", "Sr"] },
    { label: "Civil Status", name: "civil_status", options: ["Single", "Married", "Widowed", "Divorced"], required: true },
    { label: "Sex", name: "sex", options: ["Male", "Female", "Other"], required: true },
    { label: "Highest Educational Attainment", name: "highest_educational_attainment", options: ["Elementary", "High School", "College", "Post Graduate"] },
    { label: "Occupation Source Of Income", name: "occupation_source_of_income", options: ["Employed", "Self-Employed", "Business Owner", "Freelancer"] },
    { label: "Spouse Occupation Source Of Income", name: "spouse_occupation_source_of_income", options: ["Employed", "Self-Employed", "Business Owner", "Freelancer"] }
  ];

  return (
    <form className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Personal & Contact Information</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {textInputs.map((input, index) => (
            <label key={index} className="block">
              {input.label} {input.required && <span className="text-red-500">*</span>}
              <input
                className={`border p-3 rounded-lg w-full ${errors[input.name] ? "border-red-500" : ""}`}
                name={input.name}
                type={input.type}
                value={formData.personalInfo[input.name] || ""}
                onChange={handleChange}
                placeholder={input.label}
              />
              {errors[input.name] && <p className="text-red-500 text-sm">{errors[input.name]}</p>}
            </label>
          ))}
          {dropdowns.map((dropdown, index) => (
            <label key={index} className="block">
              {dropdown.label} {dropdown.required && <span className="text-red-500">*</span>}
              <select
                name={dropdown.name}
                className={`border p-3 rounded-lg w-full ${errors[dropdown.name] ? "border-red-500" : ""}`}
                value={formData.personalInfo[dropdown.name] || ""}
                onChange={handleChange}
              >
                <option value="">Select {dropdown.label}</option>
                {dropdown.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors[dropdown.name] && <p className="text-red-500 text-sm">{errors[dropdown.name]}</p>}
            </label>
          ))}
          {["house_no_street", "barangay", "city", "province", "contact_number"].map((key, index) => (
            <label key={index} className="block">
              <span className="block mb-1 font-medium capitalize">{key.replace(/_/g, " ")}</span>
              <input
                className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                name={key}
                type="text"
                value={formData.contactInfo[key] || ""}
                onChange={handleChange}
                placeholder={`Enter ${key.replace(/_/g, " ")}`}
              />
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-4 mb-6">
        <button
          type="button"
          onClick={handleNextClick}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default PersonalInformation;
