import { useState, useEffect } from "react";
import axios from "axios";

const LoanApplicationForm = ({ isOpen, setIsOpen, member }) => {
  // Common states
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loanType, setLoanType] = useState("feeds");
  const [sacks, setSacks] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [statementOfPurpose, setStatementOfPurpose] = useState("");
  const [proofOfBusiness, setProofOfBusiness] = useState(null);
  const [terms, setTerms] = useState(1);
  const [maxSacks, setMaxSacks] = useState(0);

  // Used for Marketing, Regular, and Livelihood loans
  const [coMakerDetails, setCoMakerDetails] = useState({ name: "", memberId: "" });

  // Back to Back Loan – Co‑Borrower (Immediate Family)
  const [backToBackCoBorrower, setBackToBackCoBorrower] = useState({
    memberId: "",
    relationship: "",
    name: "",
    contactNumber: "",
    address: "",
  });
  const [motercycleComaker, setMotercycleComaker] = useState("");
  const [motercycleCoBorrower, setMotercycleCoBorrower] = useState("");

  // Regular Loan – Memorandum of Agreement (if applicable)
  const [regularMOADocument, setRegularMOADocument] = useState(null);

  // Educational Loan – Immediate Relative and document
  const [educationalRelative, setEducationalRelative] = useState({
    relationship: "",
    studentName: "",
    institution: "",
    course: "",
    yearLevel: "",
  });
  const [educationalDocument, setEducationalDocument] = useState(null);

  // Emergency/Calamity Loan – For “Other Natural Calamities”
  const [emergencyOtherPurpose, setEmergencyOtherPurpose] = useState("");
  const [emergencyDocument, setEmergencyDocument] = useState(null);

  // Car Loan – Vehicle Type, Co‑Maker, Co‑Borrower, and Documents
  const [carVehicleType, setCarVehicleType] = useState("");
  const [carCoMaker, setCarCoMaker] = useState({ name: "", memberId: "" });
  const [carCoBorrower, setCarCoBorrower] = useState({
    memberId: "",
    relationship: "",
    name: "",
    contactNumber: "",
    address: "",
  });
  const [carDocuments, setCarDocuments] = useState(null);
  const [carLoanAmount, setCarLoanAmount] = useState("");

  // Housing Loan – Co‑Maker, Co‑Borrower, and Documents
  const [housingCoMaker, setHousingCoMaker] = useState({ name: "", memberId: "" });
  const [housingCoBorrower, setHousingCoBorrower] = useState({
    memberId: "",
    relationship: "",
    name: "",
    contactNumber: "",
    address: "",
  });
  const [housingDocuments, setHousingDocuments] = useState(null);

  // Motorcycle Loan – Placeholder states
  const [motorcycleStatement, setMotorcycleStatement] = useState("");
  const [motorcycleLoanAmount, setMotorcycleLoanAmount] = useState("");

  // New States for Additional Loan Types

  // Memorial Lot
  const [memorialCoBorrower, setMemorialCoBorrower] = useState({
    memberId: "",
    name: "",
    relationship: "",
    contactNumber: "",
    address: "",
  });

  // Interment Plan Lot
  const [intermentCoBorrower, setIntermentCoBorrower] = useState({
    memberId: "",
    name: "",
    relationship: "",
    contactNumber: "",
    address: "",
  });
  const [intermentInterest, setIntermentInterest] = useState("");

  // Travel Loan
  const [travelCoMaker, setTravelCoMaker] = useState({ name: "", memberId: "" });
  const [travelDocument, setTravelDocument] = useState(null);

  // OFW Assistance Loan
  const [ofwCoMaker, setOfwCoMaker] = useState({ name: "", memberId: "" });
  const [ofwCoBorrower, setOfwCoBorrower] = useState({
    memberId: "",
    name: "",
    relationship: "",
    contactNumber: "",
    address: "",
  });
  const [ofwDocument, setOfwDocument] = useState(null);

  // Savings Loan
  const [savingsDocument, setSavingsDocument] = useState(null);

  // Health Insurance Loan
  const [healthDocument, setHealthDocument] = useState(null);

  // Special Loan
  const [specialCoMaker, setSpecialCoMaker] = useState({ name: "", memberId: "" });
  const [specialDocument, setSpecialDocument] = useState(null);

  // Reconstruction
  const [reconstructionScheduled, setReconstructionScheduled] = useState("");
  const [reconstructionCoMaker, setReconstructionCoMaker] = useState({ name: "", memberId: "" });
  const [reconstructionDocument, setReconstructionDocument] = useState(null);

  // Fetch member details when form opens.
  useEffect(() => {
    if (isOpen && member?.memberId) {
      fetchMemberDetails(member.memberId);
    }
  }, [isOpen, member]);

  const fetchMemberDetails = async (memberId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/members/${memberId}`);
      setMemberInfo(response.data);
    } catch (error) {
      console.error("Error fetching member details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine maximum sacks for FEEDS and RICE loans.
  const getSackLimit = (shareCapital, loanType, statementOfPurpose) => {
    if (loanType === "feeds") {
      if (shareCapital === 20000) return 15;
      if (shareCapital > 20000) return 30;
      return 0;
    } else if (loanType === "rice") {
      if (statementOfPurpose === "business") {
        if (shareCapital === 20000) return 30;
        if (shareCapital > 20000) return 50;
        return 0;
      } else if (statementOfPurpose === "personal") {
        if (shareCapital >= 6000) return 4;
        return 2;
      }
    }
    return 0;
  };

  // Update maxSacks whenever loanType, memberInfo, or statementOfPurpose changes.
  useEffect(() => {
    if ((loanType === "rice" || loanType === "feeds") && memberInfo) {
      setMaxSacks(getSackLimit(memberInfo.shareCapital, loanType, statementOfPurpose));
    }
  }, [loanType, memberInfo, statementOfPurpose]);

  // Compute variable terms for Back-to-Back & Regular loans.
  const computeVariableTerms = (amount) => {
    const amt = Number(amount);
    if (amt >= 6000 && amt <= 10000) return 6;
    if (amt >= 10001 && amt <= 50000) return 12;
    if (amt >= 50001 && amt <= 100000) return 24;
    if (amt >= 100001) return 36;
    return "";
  };

  const handleSacksChange = (value) => {
    const sacksValue = parseInt(value, 10) || 0;
    if (sacksValue > maxSacks) {
      alert(`You can only loan up to ${maxSacks} sacks based on your Share Capital.`);
      setSacks(maxSacks);
    } else {
      setSacks(sacksValue);
    }
  };

  // ***********************
  // ADD: Submit handler to connect to backend
  // ***********************
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build the details object based on the selected loan type.
    // (Only a few cases are shown; add the remaining ones as needed.)
    let details = {};
    if (loanType === "feeds" || loanType === "rice") {
      details = {
        statement_of_purpose: statementOfPurpose,
        sacks: sacks,
        max_sacks: maxSacks,
        proof_of_business: proofOfBusiness, // you might need to handle file uploads separately
      };
    } else if (loanType === "marketing") {
      details = {
        statement_of_purpose: statementOfPurpose,
        comaker_name: coMakerDetails.name,
        comaker_member_id: coMakerDetails.memberId,
      };
    } else if (loanType === "backToBack") {
      details = {
        statement_of_purpose: statementOfPurpose,
        coborrower_member_id: backToBackCoBorrower.memberId,
        coborrower_relationship: backToBackCoBorrower.relationship,
        coborrower_name: backToBackCoBorrower.name,
        coborrower_contact: backToBackCoBorrower.contactNumber,
        coborrower_address: backToBackCoBorrower.address,
      };
    }
    // (Add additional cases for the other loan types as needed.)

    const payload = {
      memberId: member.memberId,
      loan_type: loanType,
      loan_amount: loanAmount,
      terms: terms,
      details: details,
    };

    try {
      // Send the POST request to your backend endpoint.
      const response = await axios.post("http://localhost:3001/api/loan-application", payload);
      console.log("Loan application submitted successfully:", response.data);
      alert("Application submitted successfully!");

      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting loan application:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
      <div className="relative max-w-3xl w-full p-6 bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
        {/* Close Button */}
        <button
          className="absolute top-2 right-3 text-gray-600 hover:text-red-500"
          onClick={() => setIsOpen(false)}
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Loan Application</h2>
        
        {/* Wrap the form content with a form tag */}
        <form onSubmit={handleSubmit}>
          {/* Member Information */}
          {loading ? (
            <div className="flex justify-center items-center my-4">
              <p className="text-center text-gray-500 animate-pulse">Fetching member details...</p>
            </div>
          ) : (
            memberInfo && (
              <div className="mb-4 p-5 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Borrower Information</h3>
                <div className="grid grid-cols-2 gap-3 text-gray-700 text-sm">
                  <p>
                    <strong className="text-gray-600">Code Number:</strong> {memberInfo.memberCode}
                  </p>
                  <p>
                    <strong className="text-gray-600">Full name:</strong> {memberInfo.FirstName} {memberInfo.MiddleName} {memberInfo.LastName}
                  </p>
                  <p>
                    <strong className="text-gray-600">Share Capital:</strong>{" "}
                    <span className="text-green-600 font-bold">₱{memberInfo.shareCapital}</span>
                  </p>
                  <p>
                    <strong className="text-gray-600">Tax Identification Number:</strong> {memberInfo.tinNumber}
                  </p>
                  <p>
                    <strong className="text-gray-600">Civil Status:</strong> {memberInfo.civilStatus}
                  </p>
                  <p>
                    <strong className="text-gray-600">Sex:</strong> {memberInfo.sex}
                  </p>
                  <p>
                    <strong className="text-gray-600">Date of birth:</strong> {memberInfo.dateOfBirth}
                  </p>
                  <p>
                    <strong className="text-gray-600">Age:</strong> {memberInfo.age}
                  </p>
                  <p>
                    <strong className="text-gray-600">Occupation Source of Income:</strong> {memberInfo.occupationSourceOfIncome}
                  </p>
                  <p>
                    <strong className="text-gray-600">Contact:</strong> {memberInfo.contactNumber}
                  </p>
                  <p>
                    <strong className="text-gray-600">Address:</strong> {memberInfo.houseNoStreet} {memberInfo.barangay} {memberInfo.city}
                  </p>
                </div>
              </div>
            )
          )}
          <div className="mb-4">
            <label className="block font-medium text-gray-700">Loan Type:</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={loanType}
              onChange={(e) => {
                setLoanType(e.target.value);
                if (e.target.value === "rice" || e.target.value === "feeds") {
                  setMaxSacks(getSackLimit(memberInfo?.shareCapital, e.target.value, statementOfPurpose));
                } else {
                  setMaxSacks(0);
                }
              }}
            >
              <option value="feeds">Feeds Loan</option>
              <option value="rice">Rice Loan</option>
              <option value="marketing">Marketing/Merchandising Loan</option>
              <option value="backToBack">Back to Back Loan</option>
              <option value="regular">Regular Loan</option>
              <option value="livelihood">Livelihood Assistance Loan</option>
              <option value="educational">Educational Loan</option>
              <option value="emergency">Emergency/Calamity Loan</option>
              <option value="quickCash">Quick Cash Loan</option>
              <option value="car">Car Loan</option>
              <option value="housing">House and Lot/Housing/ Lot Loan</option>
              <option value="motorcycle">Motorcycle Loan</option>
              <option value="memorialLot">Memorial Lot</option>
              <option value="intermentLot">Interment Plan Lot</option>
              <option value="travel">Travel Loan</option>
              <option value="ofw">OFW Assistance Loan</option>
              <option value="savings">Savings Loan</option>
              <option value="health">Health Insurance Loan</option>
              <option value="special">Special Loan</option>
              <option value="reconstruction">Reconstruction</option>
            </select>
          </div>

          {/* ================== FEEDS & RICE Loan Section ================== */}
          {(loanType === "feeds" || loanType === "rice") && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                >
                  {loanType === "feeds" && (
                    <>
                      <option value="personal">Personal Livestock & Poultry</option>
                      <option value="business">Business Livestock & Poultry</option>
                    </>
                  )}
                  {loanType === "rice" && (
                    <>
                      <option value="personal">Personal Consumption</option>
                      <option value="business">Business Consumption</option>
                    </>
                  )}
                </select>
              </div>

              {statementOfPurpose === "business" && (
                <div className="mb-4">
                  <label className="block font-medium text-gray-700">
                    Proof of Business Registration:
                  </label>
                  <input
                    type="file"
                    className="w-full p-2 border rounded-lg"
                    onChange={(event) => setProofOfBusiness(event.target.files[0])}
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block font-medium text-gray-700">Number of Sacks (50kg/Sack):</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={sacks}
                  onChange={(e) => handleSacksChange(e.target.value)}
                />
                <p className="text-gray-600 text-sm">
                  You can loan up to <strong>{maxSacks}</strong> sacks based on your Share Capital.
                </p>
              </div>

              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <p className="p-2 border rounded-lg bg-gray-100">30 Days</p>
              </div>
            </>
          )}

          {/* ================== Marketing Loan Section ================== */}
          {loanType === "marketing" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
                <p className="text-gray-600">Max: 75,000 pesos</p>
              </div>
              {Number(loanAmount) >= 40000 && (
                <div className="mb-4">
                  <label className="block font-medium text-gray-700">
                    Co‑Maker Details (Required for loans above ₱40,000):
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Co‑Maker Name"
                      value={coMakerDetails.name}
                      onChange={(e) =>
                        setCoMakerDetails({ ...coMakerDetails, name: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Co‑Maker Member ID"
                      value={coMakerDetails.memberId}
                      onChange={(e) =>
                        setCoMakerDetails({ ...coMakerDetails, memberId: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {[...Array(10).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>{`${i + 1} Month`}</option>
                  ))}
                </select>
                <p className="text-gray-600">Interest Rate: 3.5% (Auto Generated)</p>
                <p className="text-gray-600">Service Fee: 5% (Auto Generated)</p>
              </div>
            </>
          )}

          {/* ================== Back to Back Loan Section ================== */}
          {loanType === "backToBack" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder={memberInfo ? `Max: ₱${memberInfo.shareCapital}` : "Enter Amount"}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
                <p className="text-gray-600 text-sm">You can loan up to your paid‑up Share Capital.</p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms of Payment:</label>
                <p className="p-2 border rounded-lg bg-gray-100">
                  {loanAmount ? `${computeVariableTerms(loanAmount)} Months` : "Auto Generated"}
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Borrower (Immediate Family):</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Member ID"
                    value={backToBackCoBorrower.memberId}
                    onChange={(e) =>
                      setBackToBackCoBorrower({
                        ...backToBackCoBorrower,
                        memberId: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Relationship"
                    value={backToBackCoBorrower.relationship}
                    onChange={(e) =>
                      setBackToBackCoBorrower({
                        ...backToBackCoBorrower,
                        relationship: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Name"
                    value={backToBackCoBorrower.name}
                    onChange={(e) =>
                      setBackToBackCoBorrower({
                        ...backToBackCoBorrower,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Contact Number"
                    value={backToBackCoBorrower.contactNumber}
                    onChange={(e) =>
                      setBackToBackCoBorrower({
                        ...backToBackCoBorrower,
                        contactNumber: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Address"
                    value={backToBackCoBorrower.address}
                    onChange={(e) =>
                      setBackToBackCoBorrower({
                        ...backToBackCoBorrower,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2% Auto Generated</p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">3% Auto Generated</p>
              </div>
            </>
          )}

          {/* ================== Regular Loan Section ================== */}
          {loanType === "regular" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
                <p className="text-gray-600 text-sm">
                  Based on CI/BI Report, you can loan double to triple your Share Capital.
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms of Payment:</label>
                <p className="p-2 border rounded-lg bg-gray-100">
                  {loanAmount ? `${computeVariableTerms(loanAmount)} Months` : "Auto Generated"}
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Maker Information:</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={coMakerDetails.name}
                    onChange={(e) =>
                      setCoMakerDetails({ ...coMakerDetails, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={coMakerDetails.memberId}
                    onChange={(e) =>
                      setCoMakerDetails({ ...coMakerDetails, memberId: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2% Auto Generated</p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">3% Auto Generated</p>
              </div>
            </>
          )}

          {/* ================== Livelihood Assistance Loan Section ================== */}
          {loanType === "livelihood" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                >
                  <option value="workingCapital">Working Capital</option>
                  <option value="additionalCapital">Additional Capital</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Max ₱100,000)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              {Number(loanAmount) >= 50000 && (
                <div className="mb-4">
                  <label className="block font-medium text-gray-700">
                    Co‑Maker Details (Required for loans ₱50,000 and above):
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Co‑Maker Name"
                      value={coMakerDetails.name}
                      onChange={(e) =>
                        setCoMakerDetails({ ...coMakerDetails, name: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Co‑Maker Member ID"
                      value={coMakerDetails.memberId}
                      onChange={(e) =>
                        setCoMakerDetails({ ...coMakerDetails, memberId: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2%</p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">3%</p>
              </div>
            </>
          )}

          {/* ================== Educational Loan Section ================== */}
          {loanType === "educational" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700">Immediate Relative Details:</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={educationalRelative.relationship}
                    onChange={(e) =>
                      setEducationalRelative({ ...educationalRelative, relationship: e.target.value })
                    }
                  >
                    <option value="">Select Relationship</option>
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Student’s Full Name"
                    value={educationalRelative.studentName}
                    onChange={(e) =>
                      setEducationalRelative({ ...educationalRelative, studentName: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Educational Institution"
                    value={educationalRelative.institution}
                    onChange={(e) =>
                      setEducationalRelative({ ...educationalRelative, institution: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Course"
                    value={educationalRelative.course}
                    onChange={(e) =>
                      setEducationalRelative({ ...educationalRelative, course: e.target.value })
                    }
                  />
                  <select
                    className="w-full p-2 border rounded-lg col-span-2"
                    value={educationalRelative.yearLevel}
                    onChange={(e) =>
                      setEducationalRelative({ ...educationalRelative, yearLevel: e.target.value })
                    }
                  >
                    <option value="">Select Year Level</option>
                    <option value="Tertiary">College Level</option>
                    <option value="Elementary">Elementary Level</option>
                    <option value="Secondary">Secondary Level</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Upload Expense Documents (Assessment Form):
                </label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setEducationalDocument(e.target.files[0])}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <p className="p-2 border rounded-lg bg-gray-100">
                  {educationalRelative.yearLevel === "Tertiary" ? "5 Months" : "10 Months"}
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.75%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">5%</p>
              </div>
            </>
          )}

          {/* ================== Emergency/Calamity Loan Section ================== */}
          {loanType === "emergency" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                >
                  <option value="medical">Medical Emergency Loan</option>
                  <option value="funeral">Funeral Assistance</option>
                  <option value="fire">Fire Victim</option>
                  <option value="other">Other Calamities</option>
                </select>
              </div>
              {statementOfPurpose === "other" && (
                <div className="mb-4">
                  <label className="block font-medium text-gray-700">Please specify:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Specify Calamity"
                    value={emergencyOtherPurpose}
                    onChange={(e) => setEmergencyOtherPurpose(e.target.value)}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Max ₱30,000)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.75%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">5%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Upload Supporting Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setEmergencyDocument(e.target.files[0])}
                />
              </div>
            </>
          )}

          {/* ================== Quick Cash Loan Section ================== */}
          {loanType === "quickCash" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Max ₱12,000)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1%  </p>
              </div>
            </>
          )}

          {/* ================== Car Loan Section ================== */}
          {loanType === "car" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg bg-gray-100"
                  value={carLoanAmount}
                  onChange={(e) => setCarLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Vehicle Type:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={carVehicleType}
                  onChange={(e) => setCarVehicleType(e.target.value)}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="brandNew">Brand New Vehicle - Up to 80% of Actual Value</option>
                  <option value="secondHand">Second-Hand Vehicle - Up to 60% of Appraised Value</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Maker Information:</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={carCoMaker.name}
                    onChange={(e) => setCarCoMaker({ ...carCoMaker, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={carCoMaker.memberId}
                    onChange={(e) => setCarCoMaker({ ...carCoMaker, memberId: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Borrower (Immediate Family):</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Member ID"
                    value={carCoBorrower.memberId}
                    onChange={(e) => setCarCoBorrower({ ...carCoBorrower, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Relationship"
                    value={carCoBorrower.relationship}
                    onChange={(e) => setCarCoBorrower({ ...carCoBorrower, relationship: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Name"
                    value={carCoBorrower.name}
                    onChange={(e) => setCarCoBorrower({ ...carCoBorrower, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Contact Number"
                    value={carCoBorrower.contactNumber}
                    onChange={(e) => setCarCoBorrower({ ...carCoBorrower, contactNumber: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Address"
                    value={carCoBorrower.address}
                    onChange={(e) => setCarCoBorrower({ ...carCoBorrower, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Upload Required Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setCarDocuments(e.target.files[0])}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.75%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.2%  </p>
              </div>
            </>
          )}

          {/* ================== House and Lot/Housing/ Lot Loan Section ================== */}
          {loanType === "housing" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                >
                  <option value="houseAndLot">House and Lot</option>
                  <option value="lotLoan">Lot Loan</option>
                  <option value="housingLoan">Housing Loan</option>
                  <option value="renovation">Renovation Loan</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Max depends on loan type)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
                <p className="text-gray-600">
                  House and Lot: up to ₱1,500,000 | Lot Loan: up to ₱1,200,000 | Housing Loan: up to ₱1,000,000 | Renovation Loan: up to ₱500,000
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 84 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Maker Information:</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={housingCoMaker.name}
                    onChange={(e) => setHousingCoMaker({ ...housingCoMaker, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={housingCoMaker.memberId}
                    onChange={(e) => setHousingCoMaker({ ...housingCoMaker, memberId: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Borrower (Immediate Family):</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Member ID"
                    value={housingCoBorrower.memberId}
                    onChange={(e) => setHousingCoBorrower({ ...housingCoBorrower, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Relationship"
                    value={housingCoBorrower.relationship}
                    onChange={(e) => setHousingCoBorrower({ ...housingCoBorrower, relationship: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Name"
                    value={housingCoBorrower.name}
                    onChange={(e) => setHousingCoBorrower({ ...housingCoBorrower, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Contact Number"
                    value={housingCoBorrower.contactNumber}
                    onChange={(e) => setHousingCoBorrower({ ...housingCoBorrower, contactNumber: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Address"
                    value={housingCoBorrower.address}
                    onChange={(e) => setHousingCoBorrower({ ...housingCoBorrower, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Upload Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setHousingDocuments(e.target.files[0])}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.75%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.2%  </p>
              </div>
            </>
          )}

          {/* ================== Motorcycle Loan Section ================== */}
          {loanType === "motorcycle" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={motorcycleStatement}
                  onChange={(e) => setMotorcycleStatement(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Max ₱120,000)"
                  value={motorcycleLoanAmount}
                  onChange={(e) => setMotorcycleLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 36 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Maker Information:</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={motercycleComaker.name}
                    onChange={(e) => setMotercycleComaker(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={motercycleComaker.memberId}
                    onChange={(e) => setMotercycleComaker(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Borrower (Immediate Family):</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Member ID"
                    value={motercycleCoBorrower.memberId}
                    onChange={(e) => setMotercycleCoBorrower({ ...motercycleCoBorrower, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Relationship"
                    value={motercycleCoBorrower.relationship}
                    onChange={(e) => setMotercycleCoBorrower({ ...motercycleCoBorrower, relationship: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Name"
                    value={motercycleCoBorrower.name}
                    onChange={(e) => setMotercycleCoBorrower({ ...motercycleCoBorrower, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Contact Number"
                    value={motercycleCoBorrower.contactNumber}
                    onChange={(e) => setMotercycleCoBorrower({ ...motercycleCoBorrower, contactNumber: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Address"
                    value={motercycleCoBorrower.address}
                    onChange={(e) => setMotercycleCoBorrower({ ...motercycleCoBorrower, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Upload Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setHousingDocuments(e.target.files[0])}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2% </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">5%  </p>
              </div>
            </>
          )}

          {/* ================== Memorial Lot Section ================== */}
          {loanType === "memorialLot" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                >
                  <option value="memorial">Memorial Lot</option>
                  <option value="interment">Interment</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Based on partner's contract price)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Borrower:</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Borrower Member ID"
                    value={memorialCoBorrower.memberId}
                    onChange={(e) =>
                      setMemorialCoBorrower({ ...memorialCoBorrower, memberId: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Borrower Name"
                    value={memorialCoBorrower.name}
                    onChange={(e) =>
                      setMemorialCoBorrower({ ...memorialCoBorrower, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.25%</p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2%</p>
              </div>
            </>
          )}

          {/* ================== Interment Plan Lot Section ================== */}
          {loanType === "intermentLot" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <p className="p-2 border rounded-lg bg-gray-100">Memorial lot</p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Based on partner's contract price)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Borrower:</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Borrower Member ID"
                    value={intermentCoBorrower.memberId}
                    onChange={(e) =>
                      setIntermentCoBorrower({ ...intermentCoBorrower, memberId: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Borrower Name"
                    value={intermentCoBorrower.name}
                    onChange={(e) =>
                      setIntermentCoBorrower({ ...intermentCoBorrower, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Interest Rate"
                  value={intermentInterest}
                  onChange={(e) => setIntermentInterest(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2%  </p>
              </div>
            </>
          )}

          {/* ================== Travel Loan Section ================== */}
          {loanType === "travel" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                >
                  <option value="local">Local Travel</option>
                  <option value="international">International Travel</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Maker:</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={travelCoMaker.memberId}
                    onChange={(e) => setTravelCoMaker({ ...travelCoMaker, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={travelCoMaker.name}
                    onChange={(e) => setTravelCoMaker({ ...travelCoMaker, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setTravelDocument(e.target.files[0])}
                />
                <p className="text-gray-600 text-sm">
                  Upload Post-dated check if loan is ₱150,000 and above.
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">5%  </p>
              </div>
            </>
          )}

          {/* ================== OFW Assistance Loan Section ================== */}
          {loanType === "ofw" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Maker:</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={ofwCoMaker.memberId}
                    onChange={(e) => setOfwCoMaker({ ...ofwCoMaker, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={ofwCoMaker.name}
                    onChange={(e) => setOfwCoMaker({ ...ofwCoMaker, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Borrower:</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Borrower Member ID"
                    value={ofwCoBorrower.memberId}
                    onChange={(e) => setOfwCoBorrower({ ...ofwCoBorrower, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Borrower Name"
                    value={ofwCoBorrower.name}
                    onChange={(e) => setOfwCoBorrower({ ...ofwCoBorrower, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setOfwDocument(e.target.files[0])}
                />
                <p className="text-gray-600 text-sm">
                  Upload certificate of pre-departure orientation or employment contract.
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">5%  </p>
              </div>
            </>
          )}

          {/* ================== Savings Loan Section ================== */}
          {loanType === "savings" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Based on your savings and time deposit)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setSavingsDocument(e.target.files[0])}
                />
                <p className="text-gray-600 text-sm">Upload Savings and Time Deposit documents</p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.5%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2%  </p>
              </div>
            </>
          )}

          {/* ================== Health Insurance Loan Section ================== */}
          {loanType === "health" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setHealthDocument(e.target.files[0])}
                />
                <p className="text-gray-600 text-sm">
                  Upload Valid ID and 2 pcs 2x2 ID picture
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.5%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">1.2%  </p>
              </div>
            </>
          )}

          {/* ================== Special Loan Section ================== */}
          {loanType === "special" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (Min ₱50,000 to Max ₱300,000)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Month{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Maker:</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={specialCoMaker.memberId}
                    onChange={(e) => setSpecialCoMaker({ ...specialCoMaker, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={specialCoMaker.name}
                    onChange={(e) => setSpecialCoMaker({ ...specialCoMaker, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setSpecialDocument(e.target.files[0])}
                />
                <p className="text-gray-600 text-sm">Upload Post-dated check</p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2.5%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">3%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Gift Check:</label>
                <p className="p-2 border rounded-lg bg-gray-100">
                  {loanAmount >= 50000 && loanAmount <= 100000
                    ? "₱500"
                    : loanAmount > 100000
                    ? "₱1,000"
                    : "N/A"}
                </p>
              </div>
            </>
          )}

          {/* ================== Reconstruction Section ================== */}
          {loanType === "reconstruction" && (
            <>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Statement of Purpose:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Purpose"
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Loan Amount:</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter Amount (₱6,000 to above ₱100,001)"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Terms:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                >
                  {loanAmount >= 6000 && loanAmount <= 50000 && <option value="12">12 Months</option>}
                  {loanAmount >= 50001 && loanAmount <= 100000 && <option value="24">24 Months</option>}
                  {loanAmount >= 100001 && <option value="36">36 Months</option>}
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Scheduled Payment:</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={reconstructionScheduled}
                  onChange={(e) => setReconstructionScheduled(e.target.value)}
                >
                  <option value="">Select Payment Schedule</option>
                  <option value="first">First Loan (after reconstruction) — Back-to-Back Loan</option>
                  <option value="second">Second Loan (after reconstruction) — Double the capital</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Co‑Maker 1:</label>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={reconstructionCoMaker.memberId}
                    onChange={(e) => setReconstructionCoMaker({ ...reconstructionCoMaker, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={reconstructionCoMaker.name}
                    onChange={(e) => setReconstructionCoMaker({ ...reconstructionCoMaker, name: e.target.value })}
                  />
                  <label className="block font-medium text-gray-700">Co‑Maker 2:</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Member ID"
                    value={reconstructionCoMaker.memberId}
                    onChange={(e) => setReconstructionCoMaker({ ...reconstructionCoMaker, memberId: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Co‑Maker Name"
                    value={reconstructionCoMaker.name}
                    onChange={(e) => setReconstructionCoMaker({ ...reconstructionCoMaker, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Documents:</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setReconstructionDocument(e.target.files[0])}
                />
                <p className="text-gray-600 text-sm">
                  Upload Post-dated check if loan is ₱150,000 and above.
                </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Interest Rate:</label>
                <p className="p-2 border rounded-lg bg-gray-100">2%  </p>
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Service Fee:</label>
                <p className="p-2 border rounded-lg bg-gray-100">3%  </p>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanApplicationForm;
