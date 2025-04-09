import React, { useState } from 'react';

// The MemberApplication component with functional buttons (Edit, Add Information, Next, Submit)
const MemberApplication = () => {
  // Pre-populated form values (simulate initial data)
  const initialFormData = {
    lastName: 'Dela Cruz',
    firstName: 'Juan',
    middleName: 'Santos',
    maidenName: '',
    dateOfBirth: '1990-01-01',
    age: 30,
    birthplaceProvince: 'Cavite',
    religion: 'Catholic',
    annualIncome: 500000,
    tinNumber: '123456789',
    numberOfDependents: 2,
    nameOfSpouse: 'Maria Dela Cruz',
    extensionName: '',
    civilStatus: 'Married',
    sex: 'Male',
    highestEducationalAttainment: 'College',
    occupationSourceOfIncome: 'Employed',
    spouseOccupationSourceOfIncome: 'Business',
    houseNoStreet: '123 Main St',
    barangay: 'Barangay 1',
    city: 'Tagaytay',
    province: 'Cavite',
    contactNumber: '09171234567',
  };

  // Manage form data state and additional information state
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState([]);

  // Update formData for any input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update the dynamic additional information data
  const handleAdditionalInfoChange = (index, field, value) => {
    const newAdditionalInfo = [...additionalInfo];
    newAdditionalInfo[index] = { ...newAdditionalInfo[index], [field]: value };
    setAdditionalInfo(newAdditionalInfo);
  };

  // Toggle the edit mode; if turning off edit, simulate saving changes
  const toggleEdit = () => {
    if (isEditing) {
      // Simulate saving changes (e.g., by calling an API)
      console.log("Saved formData:", formData);
    }
    setIsEditing(!isEditing);
  };

  // Add a new blank additional information row
  const handleAddInformation = () => {
    setAdditionalInfo([...additionalInfo, { label: '', value: '' }]);
  };

  // Handle form submission with basic validation on required fields
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.lastName ||
      !formData.firstName ||
      !formData.dateOfBirth ||
      !formData.sex ||
      !formData.civilStatus
    ) {
      alert("Please fill all required fields marked with *.");
      return;
    }
    console.log("Submitting application", formData, additionalInfo);
    alert("Application submitted!");
  };

  // Simulate proceeding to the next step
  const handleNext = () => {
    alert("Proceeding to next step...");
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px' }}>Personal & Contact Information</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
        {/* Use grid layout to mimic the desired layout */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridGap: '20px'
          }}
        >
          {/* Row 1: Last Name, Middle Name, First Name */}
          <div>
            <label>
              Last Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Middle Name</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Middle Name"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>
              First Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          
          {/* Row 2: Maiden Name, Date of Birth, Age */}
          <div>
            <label>Maiden Name</label>
            <input
              type="text"
              name="maidenName"
              value={formData.maidenName}
              onChange={handleChange}
              placeholder="Maiden Name"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>
              Date of Birth <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          
          {/* Row 3: Birthplace Province, Religion, Annual Income */}
          <div>
            <label>Birthplace Province</label>
            <input
              type="text"
              name="birthplaceProvince"
              value={formData.birthplaceProvince}
              onChange={handleChange}
              placeholder="Birthplace Province"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Religion</label>
            <input
              type="text"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              placeholder="Religion"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Annual Income (PHP)</label>
            <input
              type="number"
              name="annualIncome"
              value={formData.annualIncome}
              onChange={handleChange}
              placeholder="Annual Income (PHP)"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          
          {/* Row 4: TIN Number, Number of Dependents, Name of Spouse */}
          <div>
            <label>TIN Number</label>
            <input
              type="text"
              name="tinNumber"
              value={formData.tinNumber}
              onChange={handleChange}
              placeholder="TIN Number"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Number of Dependents</label>
            <input
              type="number"
              name="numberOfDependents"
              value={formData.numberOfDependents}
              onChange={handleChange}
              placeholder="Number of Dependents"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Name of Spouse</label>
            <input
              type="text"
              name="nameOfSpouse"
              value={formData.nameOfSpouse}
              onChange={handleChange}
              placeholder="Name of Spouse"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          
          {/* Row 5: Extension Name, Civil Status, Sex */}
          <div>
            <label>Extension Name</label>
            <select
              name="extensionName"
              value={formData.extensionName}
              onChange={handleChange}
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            >
              <option value="">Select Extension Name</option>
              <option value="Jr">Jr.</option>
              <option value="Sr">Sr.</option>
              <option value="III">III</option>
            </select>
          </div>
          <div>
            <label>
              Civil Status <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              name="civilStatus"
              value={formData.civilStatus}
              onChange={handleChange}
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
          <div>
            <label>
              Sex <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          {/* Row 6: Highest Educational Attainment, Occupation Source of Income, Spouse Occupation Source of Income */}
          <div>
            <label>Highest Educational Attainment</label>
            <select
              name="highestEducationalAttainment"
              value={formData.highestEducationalAttainment}
              onChange={handleChange}
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            >
              <option value="">Select Highest Educational Attainment</option>
              <option value="Elementary">Elementary</option>
              <option value="High School">High School</option>
              <option value="Vocational">Vocational</option>
              <option value="College">College</option>
              <option value="Post Graduate">Post Graduate</option>
            </select>
          </div>
          <div>
            <label>Occupation Source of Income</label>
            <select
              name="occupationSourceOfIncome"
              value={formData.occupationSourceOfIncome}
              onChange={handleChange}
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            >
              <option value="">Select Occupation Source Of Income</option>
              <option value="Employed">Employed</option>
              <option value="Business">Business</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
          <div>
            <label>Spouse Occupation Source of Income</label>
            <select
              name="spouseOccupationSourceOfIncome"
              value={formData.spouseOccupationSourceOfIncome}
              onChange={handleChange}
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            >
              <option value="">Select Spouse Occupation Source Of Income</option>
              <option value="Employed">Employed</option>
              <option value="Business">Business</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
          
          {/* Row 7: House No Street, Barangay, City */}
          <div>
            <label>House No Street</label>
            <input
              type="text"
              name="houseNoStreet"
              value={formData.houseNoStreet}
              onChange={handleChange}
              placeholder="House no street"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Barangay</label>
            <input
              type="text"
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              placeholder="Enter barangay"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          
          {/* Row 8: Province, Contact Number, (empty column) */}
          <div>
            <label>Province</label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              placeholder="Enter province"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
              disabled={!isEditing}
              style={{ width: '100%', marginTop: '5px' }}
            />
          </div>
          <div></div>
        </div>

        {/* Additional Information Section */}
        <div style={{ marginTop: '30px' }}>
          <h4>Additional Information</h4>
          {additionalInfo.map((info, index) => (
            <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Label"
                value={info.label}
                onChange={(e) => handleAdditionalInfoChange(index, 'label', e.target.value)}
                disabled={!isEditing}
                style={{ flex: 1, padding: '8px' }}
              />
              <input
                type="text"
                placeholder="Value"
                value={info.value}
                onChange={(e) => handleAdditionalInfoChange(index, 'value', e.target.value)}
                disabled={!isEditing}
                style={{ flex: 2, padding: '8px' }}
              />
            </div>
          ))}
        </div>

        {/* Bottom Buttons */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button type="button" onClick={toggleEdit} style={{ marginRight: '10px', padding: '8px 16px' }}>
              {isEditing ? 'Save' : 'Edit'}
            </button>
            <button 
              type="button" 
              onClick={handleAddInformation} 
              style={{ padding: '8px 16px' }}
              disabled={!isEditing}
            >
              Add Information
            </button>
          </div>
          <div>
            <button type="button" onClick={handleNext} style={{ padding: '8px 16px', marginRight: '10px' }}>
              Next
            </button>
            <button type="submit" style={{ padding: '8px 16px' }}>
              Submit Application
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Dummy components for the remaining tabs
const MemberRegistration = () => {
  return (
    <div>
      <h2>Member Registration</h2>
      <p>This is the member registration tab content.</p>
    </div>
  );
};

const MemberList = () => {
  return (
    <div>
      <h2>Member List</h2>
      <p>This is the member list tab content.</p>
    </div>
  );
};

// Main Module with Tabs Navigation
const MembersModule = () => {
  const [activeTab, setActiveTab] = useState('application');

  const baseTabStyle = {
    padding: '10px 20px',
    margin: '0 40px',
    border: 'none',
    borderBottom: '2px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    outline: 'none',
  };

  const activeTabStyle = {
    ...baseTabStyle,
    borderBottom: '2px solid #007bff',
    fontWeight: 'bold',
  };

  const tabContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const dividerStyle = {
    width: '60%',
    margin: '0 auto 20px auto',
    borderBottom: '1px solid #aaa',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={tabContainerStyle}>
        <button
          style={activeTab === 'application' ? activeTabStyle : baseTabStyle}
          onClick={() => setActiveTab('application')}
        >
          Member Application
        </button>
        <button
          style={activeTab === 'registration' ? activeTabStyle : baseTabStyle}
          onClick={() => setActiveTab('registration')}
        >
          Member Registration
        </button>
        <button
          style={activeTab === 'list' ? activeTabStyle : baseTabStyle}
          onClick={() => setActiveTab('list')}
        >
          Member List
        </button>
      </div>

      <div style={dividerStyle}></div>

      <div>
        {activeTab === 'application' && <MemberApplication />}
        {activeTab === 'registration' && <MemberRegistration />}
        {activeTab === 'list' && <MemberList />}
      </div>
    </div>
  );
};

export default MembersModule;
