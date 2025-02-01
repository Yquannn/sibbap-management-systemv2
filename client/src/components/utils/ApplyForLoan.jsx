import { useState, useEffect } from "react";
import axios from "axios";

const LoanApplicationForm = ({ isOpen, setIsOpen, member }) => {
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loanType, setLoanType] = useState("feeds");
  const [sacks, setSacks] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [coMaker, setCoMaker] = useState(false);
  const [coMakerDetails, setCoMakerDetails] = useState({ name: "", memberId: "" });
  const [statementOfPurpose, setStatementOfPurpose] = useState("");
  const [proofOfBusiness, setProofOfBusiness] = useState(null);
  const [terms, setTerms] = useState(1);
  const [maxSacks, setMaxSacks] = useState(0); // Default sack limit will be 0 until rice loan is selected

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
      if (loanType === "rice") {
        setMaxSacks(getSackLimit(response.data.shareCapital));
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSackLimit = (shareCapital) => {
    if (shareCapital >= 20000) return 30;
    if (shareCapital >= 6000) return 4;
    return 2;
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
      <div className="relative max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
        {/* Close Button */}
        <button
          className="absolute top-2 right-3 text-gray-600 hover:text-red-500"
          onClick={() => setIsOpen(false)}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Loan Application</h2>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center my-4">
            <p className="text-center text-gray-500 animate-pulse">Fetching member details...</p>
          </div>
        ) : (
          memberInfo && (
            <div className="mb-4 p-5 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Member Information</h3>
              <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
                <p><strong className="text-gray-600">Code Number:</strong> {memberInfo.memberCode}</p>
                <p><strong className="text-gray-600">Name:</strong> {memberInfo.FirstName} {memberInfo.LastName}</p>
                <p><strong className="text-gray-600">Contact:</strong> {memberInfo.contactNumber}</p>
                <p><strong className="text-gray-600">Address:</strong> {memberInfo.barangay}</p>
                <p><strong className="text-gray-600">Share Capital:</strong> <span className="text-green-600 font-bold">₱{memberInfo.shareCapital}</span></p>
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
              if (e.target.value === "rice") {
                setMaxSacks(getSackLimit(memberInfo?.shareCapital)); // Update max sacks when rice loan is selected
              } else {
                setMaxSacks(0); // Reset max sacks for other loans
              }
            }}
          >
            <option value="feeds">Feeds Loan</option>
            <option value="rice">Rice Loan</option>
            <option value="marketing">Marketing/Merchandising Loan</option>
          </select>
        </div>

        {/* Statement of Purpose Selection */}
        {(loanType === "feeds" || loanType === "rice") && (
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
        )}

        {/* Business Proof Upload (Only if Business is Selected) */}
        {statementOfPurpose === "business" && (
          <div className="mb-4">
            <label className="block font-medium text-gray-700">Proof of Business Registration:</label>
            <input
              type="file"
              className="w-full p-2 border rounded-lg"
              onChange={(event) => setProofOfBusiness(event.target.files[0])}
            />
          </div>
        )}

        {/* Feeds & Rice Loan Inputs */}
        {(loanType === "feeds" || loanType === "rice") && (
          <div className="mb-4">
            <label className="block font-medium text-gray-700">Number of Sacks:</label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg"
              value={sacks}
              onChange={(e) => handleSacksChange(e.target.value)}
            />
            {loanType === "rice" && (
              <p className="text-gray-600 text-sm">
                You can loan up to <strong>{maxSacks} sacks</strong> based on your Share Capital.
              </p>
            )}
          </div>
        )}

        {/* Marketing Loan Inputs */}
        {loanType === "marketing" && (
          <>
            <div className="mb-4">
              <label className="block font-medium text-gray-700">Statement of Purpose:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="Enter Purpose"
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

        {/* Buttons */}
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
