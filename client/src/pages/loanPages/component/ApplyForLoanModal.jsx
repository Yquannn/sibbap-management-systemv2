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



  // (Optional) Car Loan extra states if needed
  const [carLoanStatement, setCarLoanStatement] = useState("");
  const [carLoanAmount, setCarLoanAmount] = useState("");

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
      // Update sack limit for both "feeds" and "rice" loans.
      if (loanType === "rice" || loanType === "feeds") {
        setMaxSacks(getSackLimit(response.data.shareCapital));
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine maximum sacks for feeds or rice loans.
  // If share capital is ₱20,000 or above, the member can avail up to 15 sacks.
  const getSackLimit = (shareCapital) => {
    if (shareCapital >= 20000) return 15;
    if (shareCapital >= 6000) return 4;
    return 2;
  };

  // Compute terms for loans with variable term schedules (Back to Back, Regular)
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

        {/* Member Information */}
        {loading ? (
          <div className="flex justify-center items-center my-4">
            <p className="text-center text-gray-500 animate-pulse">Fetching member details...</p>
          </div>
        ) : (
          memberInfo && (
            <div className="mb-4 p-5 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Member Information</h3>
              <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
                <p>
                  <strong className="text-gray-600">Code Number:</strong> {memberInfo.memberCode}
                </p>
                <p>
                  <strong className="text-gray-600">Name:</strong> {memberInfo.FirstName} {memberInfo.LastName}
                </p>
                <p>
                  <strong className="text-gray-600">Contact:</strong> {memberInfo.contactNumber}
                </p>
                <p>
                  <strong className="text-gray-600">Address:</strong> {memberInfo.barangay}
                </p>
                <p>
                  <strong className="text-gray-600">Share Capital:</strong>{" "}
                  <span className="text-green-600 font-bold">₱{memberInfo.shareCapital}</span>
                </p>
              </div>
            </div>
          )
        )}

        {/* Loan Type Selection */}
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Loan Type:</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={loanType}
            onChange={(e) => {
              setLoanType(e.target.value);
              // For feeds and rice loans, update maxSacks based on member's share capital.
              if (e.target.value === "rice" || e.target.value === "feeds") {
                setMaxSacks(getSackLimit(memberInfo?.shareCapital));
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
          </select>
        </div>

        {/* ================== Feeds & Rice Loan Section ================== */}
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
              <label className="block font-medium text-gray-700">Number of Sacks:</label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={sacks}
                onChange={(e) => handleSacksChange(e.target.value)}
              />
              {(loanType === "rice" || loanType === "feeds") && (
                <p className="text-gray-600 text-sm">
                  You can loan up to <strong>{maxSacks} sacks</strong> based on your Share Capital.
                </p>
              )}
            </div>
          </>
        )}

        {/* ================== Marketing/Merchandising Loan Section ================== */}
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
            {Number(loanAmount) > 150000 && (
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Memorandum of Agreement (MOA):</label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => setRegularMOADocument(e.target.files[0])}
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block font-medium text-gray-700">Interest Rate:</label>
              <p className="p-2 border rounded-lg bg-gray-100">2% Auto Generated</p>
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
              <p className="p-2 border rounded-lg bg-gray-100">12 Months</p>
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
              <p className="p-2 border rounded-lg bg-gray-100">2% Auto Generated</p>
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
                  <option value="Elementary">Elementary</option>
                  <option value="Secondary">Secondary Level</option>
                  <option value="Tertiary">Tertiary/College Level</option>
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
                Upload Expense Documents (Sales Invoice or Official Receipts):
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
              <p className="p-2 border rounded-lg bg-gray-100">1.75% Auto Generated</p>
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
                <option value="medical">Medical Hospitalization</option>
                <option value="specialProcedures">Special Medical Procedures</option>
                <option value="funeral">Funeral Assistance</option>
                <option value="fireDamage">Fire Damage Assistance</option>
                <option value="other">Other Natural Calamities</option>
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
              <p className="p-2 border rounded-lg bg-gray-100">12 Months</p>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-gray-700">Interest Rate:</label>
              <p className="p-2 border rounded-lg bg-gray-100">2% Auto Generated</p>
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
              <p className="p-2 border rounded-lg bg-gray-100">5 Months</p>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-gray-700">Interest Rate:</label>
              <p className="p-2 border rounded-lg bg-gray-100">2% Auto Generated</p>
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
              <label className="block font-medium text-gray-700">Term:</label>
              <p className="p-2 border rounded-lg bg-gray-100">5 Years</p>
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
              <p className="p-2 border rounded-lg bg-gray-100">1.75% Auto Generated</p>
            </div>
          </>
        )}

        {/* ================== House and Lot/Housing/ Lot Loan Section ================== */}
        {loanType === "housing" && (
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
                placeholder="Enter Amount (Max depends on loan type)"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
              <p className="text-gray-600">
                House and Lot: up to ₱1,500,000 | Lot Loan: up to ₱1,200,000 | Housing Loan: up to ₱1,000,000 | Renovation Loan: up to ₱500,000
              </p>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-gray-700">Term:</label>
              <p className="p-2 border rounded-lg bg-gray-100">7 Years</p>
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
              <p className="p-2 border rounded-lg bg-gray-100">1.75% Auto Generated</p>
            </div>
          </>
        )}

        {/* ================== Motorcycle Loan Section (Placeholder) ================== */}
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
                placeholder="Enter Amount"
                value={motorcycleLoanAmount}
                onChange={(e) => setMotorcycleLoanAmount(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium text-gray-700">Terms:</label>
              <p className="p-2 border rounded-lg bg-gray-100">Auto Generated</p>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-gray-700">Interest Rate:</label>
              <p className="p-2 border rounded-lg bg-gray-100">Auto Generated</p>
            </div>
          </>
        )}

        {/* ================== Form Buttons ================== */}
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
      </div>
    </div>
  );
};

export default LoanApplicationForm;
