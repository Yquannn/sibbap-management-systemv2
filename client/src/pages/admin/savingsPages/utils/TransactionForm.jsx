// import React, { useState } from "react";
// import axios from "axios";
// import { useLocation, useNavigate } from "react-router-dom";
// import { CreditCard, CheckCircle } from "lucide-react";
// import TransactionAuthenticate from "./TranscationAuthenticate";
// import SuccessComponent from "./Success";

// const BASE_URL = "http://localhost:3001/api";

// const TransactionForm = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   // Retrieve transaction type and member from location state; default to "deposit" if not provided
//   const modalType = state?.modalType || "deposit";
//   const member = state?.member;

//   const [amount, setAmount] = useState("");
//   const [balance, setBalance] = useState(parseFloat(member.amount) || 0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleTransaction = async () => {
//     const currentAuthorized = sessionStorage.getItem("username") || "";
//     const currentUserType = sessionStorage.getItem("usertype");
//     const amountValue = parseFloat(amount);

//     try {
//       setLoading(true);
//       setError(null);

//       const payload = {
//         memberId: member.memberId,
//         authorized: currentAuthorized,
//         user_type: currentUserType,
//         transaction_type: modalType === "withdrawal" ? "Withdrawal" : "Deposit",
//         amount: modalType === "withdrawal" ? Math.abs(amountValue) : amountValue,
//       };

//       const endpoint = `${BASE_URL}/${modalType === "withdrawal" ? "withdraw" : "deposit"}`;
//       const response = await axios.put(endpoint, payload);

//       if (response.data.success) {
//         const updatedBalance =
//           modalType === "withdrawal" ? balance - amountValue : balance + amountValue;
//         if (!isNaN(updatedBalance)) {
//           setBalance(updatedBalance);
//         }
//         setShowSuccess(true);
//         setAmount("");
//       } else {
//         alert("Transaction failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Transaction failed:", error);
//       setError(
//         error.response?.data?.error ||
//           "An error occurred while processing the transaction."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTransactionClick = () => {
//     const amountValue = parseFloat(amount);
//     if (isNaN(amountValue) || amountValue <= 0) {
//       alert("Amount must be greater than 0");
//       return;
//     }
//     if (modalType === "withdrawal" && (balance === 100 || balance - amountValue < 100)) {
//       alert("Withdrawal denied: balance must remain at least 100.");
//       return;
//     }
//     if (!isAuthenticated) {
//       setShowAuthModal(true);
//       return;
//     }
//     handleTransaction();
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white shadow-md rounded-2xl">
//       <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl">
//         <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
//           <CreditCard size={20} />
//           {modalType === "withdrawal" ? "Withdraw Funds" : "Deposit Funds"}
//         </h2>

//         {/* Current Balance Display */}
//         <div className="mt-4">
//           <label className="block text-sm text-gray-600">Current Balance</label>
//           <div className="w-full mt-1 p-2 border rounded-2xl bg-gray-100 text-gray-700">
//             {balance.toLocaleString("en-PH", {
//               style: "currency",
//               currency: "PHP",
//             })}
//           </div>
//         </div>

//         {/* Transaction Amount Input */}
//         <div className="mt-4">
//           <label className="block text-sm text-gray-600">Amount</label>
//           <input
//             id="amount"
//             type="number"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             className="w-full mt-1 p-2 border rounded-2xl"
//             placeholder="Enter amount"
//           />
//         </div>

//         {error && (
//           <p className="text-red-500 text-sm text-center mt-4">{error}</p>
//         )}

//         <button
//           onClick={handleTransactionClick}
//           disabled={loading}
//           className={`w-full mt-4 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition ${
//             modalType === "withdrawal"
//               ? "bg-red-500 hover:bg-red-600"
//               : "bg-green-500 hover:bg-green-600"
//           }`}
//         >
//           {loading ? (
//             "Processing..."
//           ) : (
//             <>
//               <CheckCircle size={18} />
//               {modalType === "withdrawal" ? "Withdraw" : "Deposit"}
//             </>
//           )}
//         </button>

//         <button
//           onClick={() => navigate(-1)}
//           className="w-full mt-2 bg-gray-300 text-gray-700 py-2 rounded-lg text-center hover:bg-gray-400 transition"
//         >
//           Back
//         </button>

//         {showSuccess && (
//           <SuccessComponent
//             message={
//               <div className="flex items-center justify-center gap-2">
//                 <CheckCircle size={24} className="text-green-500" />
//                 <span>Transaction successful!</span>
//               </div>
//             }
//             onClose={() => {
//               setShowSuccess(false);
//               navigate(-1);
//             }}
//           />
//         )}
//       </div>

//       {showAuthModal && (
//         <TransactionAuthenticate
//           onAuthenticate={() => {
//             setIsAuthenticated(true);
//             setShowAuthModal(false);
//             handleTransaction();
//           }}
//           onClose={() => setShowAuthModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default TransactionForm;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, AlertCircle, User } from "lucide-react";
import TransactionAuthenticate from "./TranscationAuthenticate";
import { FaExchangeAlt } from "react-icons/fa";
import SuccessComponent from "./Success";
import { toast } from "react-toastify"; // Import for notifications

const BASE_URL = "http://localhost:3001/api";

const TransactionForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Retrieve transaction type and member from location state; default to "deposit" if not provided
  const modalType = state?.modalType || "deposit";
  const member = state?.member;
  const isShareCapital = state?.isShareCapital || false;

  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(
    parseFloat(isShareCapital ? member.share_capital : member.amount) || 0
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFullTransfer, setIsFullTransfer] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  
  // For transfer only
  const [targetMemberCode, setTargetMemberCode] = useState("");
  const [targetMember, setTargetMember] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [description, setDescription] = useState("");

  // Get transaction type title
  const getTransactionTitle = () => {
    switch (modalType) {
      case "withdrawal":
        return "Withdraw";
      case "transfer":
        return "Transfer";
      default:
        return "Deposit";
    }
  };

  // Handle full transfer toggle for share capital
  useEffect(() => {
    if (isFullTransfer && isShareCapital && modalType === "transfer") {
      setAmount(balance.toString());
    }
  }, [isFullTransfer, balance, isShareCapital, modalType]);

  const searchMember = async () => {
    if (!targetMemberCode) {
      setSearchError("Please enter a member code");
      return;
    }
    
    setSearching(true);
    setSearchError("");
    
    try {
      const response = await axios.get(`${BASE_URL}/member-by-code/${targetMemberCode}`);
      if (response.data && response.data.success) {
        setTargetMember(response.data.member);
        toast.success("Member found successfully!");
      } else {
        setSearchError("Member not found");
        setTargetMember(null);
        toast.error("Member not found");
      }
    } catch (err) {
      console.error("Error searching for member:", err);
      setSearchError("Failed to find member: " + (err.response?.data?.message || err.message));
      setTargetMember(null);
      toast.error("Failed to find member");
    } finally {
      setSearching(false);
    }
  };

  const handleTransaction = async () => {
    const currentAuthorized = sessionStorage.getItem("username") || "";
    const currentUserType = sessionStorage.getItem("usertype");
    const amountValue = parseFloat(amount);
  
    try {
      setLoading(true);
      setError(null);
  
      let endpoint, payload, method;
  
      // Different handling based on transaction type and whether it's share capital
      if (isShareCapital) {
        // Share capital transactions - keep using POST
        method = "patch";
        switch (modalType) {
          case "withdrawal":
            endpoint = `${BASE_URL}/member/share-capital/withdraw`;
            payload = {
              memberCode: member.memberCode,
              amount: amountValue,
              description: description || "Share capital withdrawal",
              authorized_by: authorizedBy || currentAuthorized
            };
            break;
          case "transfer":
            endpoint = `${BASE_URL}/member/share-capital/transfer`;
            payload = {
              sourceMemberCode: member.memberCode,
              targetMemberCode: targetMemberCode,
              amount: amountValue,
              description: description || `Share capital transfer to member ${targetMemberCode}`,
              isFullTransfer: isFullTransfer,
              authorized_by: authorizedBy || currentAuthorized
            };
            break;
          default: // deposit
            endpoint = `${BASE_URL}/member/share-capital/deposit`;
            payload = {
              memberCode: member.memberCode,
              amount: amountValue,
              description: description || "Share capital deposit",
              authorized_by: authorizedBy || currentAuthorized
            };
        }
      } else {
        // Regular savings transactions - use PUT and match backend function parameters exactly
        method = "patch";
        endpoint = `${BASE_URL}/${modalType === "withdrawal" ? "withdraw" : "deposit"}`;
        payload = {
          memberCode: member.memberCode, // Changed from memberId to memberCode
          amount: amountValue,
          authorized: authorizedBy || currentAuthorized,
          user_type: currentUserType,
          transaction_type: modalType === "withdrawal" ? "Withdrawal" : "Deposit"
        };
      }
  
      // Use the appropriate HTTP method
      const response = await axios[method](endpoint, payload);
  
      if (response.data && response.data.success) {
        // Update balance differently based on transaction type
        let updatedBalance;
        switch (modalType) {
          case "withdrawal":
            updatedBalance = balance - amountValue;
            break;
          case "transfer":
            updatedBalance = isFullTransfer ? 0 : balance - amountValue;
            break;
          default: // deposit
            updatedBalance = balance + amountValue;
        }
        
        if (!isNaN(updatedBalance)) {
          setBalance(updatedBalance);
        }
        
        // Set custom success message for full transfer
        if (isShareCapital && modalType === "transfer" && isFullTransfer) {
          setSuccessMessage(`Full share capital transferred.`);
        } else {
          setSuccessMessage("Transaction successful!");
        }
        
        setShowSuccess(true);
        toast.success(isFullTransfer ? "Full share capital transfer completed!" : "Transaction completed successfully!");
        
        setAmount("");
        setDescription("");
        setTargetMemberCode("");
        setTargetMember(null);
        setIsFullTransfer(false);
        setAuthorizedBy("");
      } else {
        toast.error("Transaction failed. Please try again.");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "An error occurred while processing the transaction."
      );
      toast.error(error.response?.data?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionClick = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.warning("Amount must be greater than 0");
      return;
    }
    
    // Different validations based on transaction type
    if (modalType === "withdrawal" && (balance === 100 || balance - amountValue < 100) && !isShareCapital) {
      toast.warning("Withdrawal denied: balance must remain at least 100.");
      return;
    }
    
    if (modalType === "withdrawal" && balance < amountValue) {
      toast.error("Insufficient balance for withdrawal");
      return;
    }
    
    if (modalType === "transfer") {
      if (!targetMember) {
        toast.warning("Please search and select a valid target member");
        return;
      }
      
      if (targetMemberCode === member.memberCode) {
        toast.warning("Cannot transfer to the same member");
        return;
      }
      
      if (balance < amountValue) {
        toast.error("Insufficient balance for transfer");
        return;
      }
    }
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    handleTransaction();
  };

  const getButtonColor = () => {
    switch (modalType) {
      case "withdrawal":
        return "bg-red-500 hover:bg-red-600";
      case "transfer":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-green-500 hover:bg-green-600";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-2xl">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <CreditCard size={20} />
          {isShareCapital ? "Share Capital" : "Savings"} - {getTransactionTitle()} Funds
        </h2>

        {/* Member Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            Member: <span className="font-medium">{member.first_name} {member.last_name}</span>
          </p>
          <p className="text-sm text-gray-600">
            Code: <span className="font-medium">{member.memberCode}</span>
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="mt-4">
          <label className="block text-sm text-gray-600">Current Balance</label>
          <div className="w-full mt-1 p-2 border rounded-2xl bg-gray-100 text-gray-700">
            {balance.toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
            })}
          </div>
        </div>

        {/* Transfer-specific fields */}
        {modalType === "transfer" && (
          <>
            <div className="mt-4">
              <label className="block text-sm text-gray-600">To Member (Code)</label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 border rounded-l-2xl p-2"
                  value={targetMemberCode}
                  onChange={(e) => {
                    setTargetMemberCode(e.target.value);
                    setTargetMember(null);
                  }}
                  placeholder="Enter member code"
                />
                <button
                  onClick={searchMember}
                  disabled={searching}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-2xl hover:bg-blue-600"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
              {searchError && <p className="text-red-600 text-xs mt-1">{searchError}</p>}
            </div>
            
            {targetMember && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 font-medium text-sm">Member Found</p>
                <p className="text-sm text-green-700">
                  {targetMember.first_name} {targetMember.last_name} ({targetMember.memberCode})
                </p>
              </div>
            )}

            {/* Full transfer option for share capital */}
            {isShareCapital && (
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="fullTransfer"
                  checked={isFullTransfer}
                  onChange={(e) => setIsFullTransfer(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="fullTransfer" className="text-sm text-gray-700 flex items-center gap-1">
                  <AlertCircle size={16} className="text-amber-500" />
                  Full transfer (will set member to inactive)
                </label>
              </div>
            )}
          </>
        )}

        {/* Transaction Amount Input */}
        <div className="mt-4">
          <label className="block text-sm text-gray-600">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isFullTransfer && isShareCapital && modalType === "transfer"}
            className={`w-full mt-1 p-2 border rounded-2xl ${
              isFullTransfer && isShareCapital && modalType === "transfer" ? "bg-gray-100" : ""
            }`}
            placeholder="Enter amount"
          />
        </div>

        {/* Authorized By field */}
        {/* <div className="mt-4">
          <label className="block text-sm text-gray-600 flex items-center gap-1">
            <User size={16} />
            Authorized By
          </label>
          <input
            type="text"
            value={authorizedBy}
            onChange={(e) => setAuthorizedBy(e.target.value)}
            className="w-full mt-1 p-2 border rounded-2xl"
            placeholder="Enter name of authorizing person"
          />
        </div> */}

        {/* Description field - optional for all transaction types */}
        <div className="mt-4">
          <label className="block text-sm text-gray-600">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 p-2 border rounded-2xl"
            placeholder="Enter description"
            rows="2"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        <button
          onClick={handleTransactionClick}
          disabled={loading || (modalType === "transfer" && !targetMember)}
          className={`w-full mt-4 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition ${getButtonColor()} ${
            (loading || (modalType === "transfer" && !targetMember)) ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              {modalType === "transfer" ? (
                <FaExchangeAlt size={18} />
              ) : (
                <CheckCircle size={18} />
              )}
              {getTransactionTitle()}
            </>
          )}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-2 bg-gray-300 text-gray-700 py-2 rounded-lg text-center hover:bg-gray-400 transition"
        >
          Back
        </button>

        {showSuccess && (
          <SuccessComponent
            message={
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={24} className="text-green-500" />
                <span>{successMessage}</span>
              </div>
            }
            onClose={() => {
              setShowSuccess(false);
              navigate(-1);
            }}
          />
        )}
      </div>

      {showAuthModal && (
        <TransactionAuthenticate
          onAuthenticate={() => {
            setIsAuthenticated(true);
            setShowAuthModal(false);
            handleTransaction();
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default TransactionForm;