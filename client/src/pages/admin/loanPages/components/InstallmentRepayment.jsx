import React, { useState, useEffect } from "react";
import axios from "axios";
import { CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import SuccessComponent from "./SuccessModal";
import TransactionAuthenticate from "../../savingsPages/utils/TranscationAuthenticate";

const InstallmentRepayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [paymentState, setPaymentState] = useState({
    amountToPay: null,
    method: "Cash",
    authorized: "",
    loading: false,
    fetchingAmount: true,
    message: "",
    showModal: false,
    showAuth: false
  });

  const updateState = (updates) => {
    setPaymentState(prev => ({ ...prev, ...updates }));
  };

  // Fetch the amount to pay for the given installment
  useEffect(() => {
    const fetchAmountToPay = async () => {
      try {
        const { data } = await axios.get(
          ` http://192.168.254.114:3001/api/installment/${id}`
        );
        
        updateState({
          amountToPay: Array.isArray(data) && data.length > 0 ? data[0].amortization : 0,
          fetchingAmount: false
        });
      } catch (error) {
        console.error("Error fetching amount to pay:", error);
        updateState({ fetchingAmount: false });
      }
    };

    fetchAmountToPay();
  }, [id]);

  // Process repayment after successful authentication
  const processRepayment = async () => {
    updateState({ loading: true, message: "" });
    
    // Get authorized username from session storage
    const currentAuthorized = sessionStorage.getItem("username");
    
    try {
      await axios.post(` http://192.168.254.114:3001/api/installment/${id}/repay`, {
        amount_paid: parseFloat(paymentState.amountToPay),
        method: paymentState.method,
        authorized: currentAuthorized,
      });
      
      updateState({
        message: "Repayment successful!",
        showModal: true,
        method: "Cash",
        authorized: currentAuthorized,
        loading: false
      });
    } catch (error) {
      console.error("Error making repayment:", error);
      updateState({
        message: "Failed to process repayment.",
        loading: false
      });
    }
  };

  const handleRepayClick = () => updateState({ showAuth: true });
  
  const handleAuthentication = () => processRepayment();
  
  const closeAuthModal = () => updateState({ showAuth: false });
  
  const closeSuccessModal = () => {
    updateState({ showModal: false });
    navigate(-1);
  };

  const { 
    amountToPay, method, loading, fetchingAmount, 
    showModal, showAuth 
  } = paymentState;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3 mb-6">
        <CreditCard className="text-blue-600" size={22} /> 
        Amortization Repayment
      </h2>

      {/* Amount To Pay */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount To Pay
        </label>
        {fetchingAmount ? (
          <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        ) : (
          <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium">
            ₱
            {Number(amountToPay).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <select
          value={method}
          onChange={(e) => updateState({ method: e.target.value })}
          className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
        >
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Online Payment">Online Payment</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleRepayClick}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              <CheckCircle size={18} />
              Submit Payment
            </>
          )}
        </button>
        
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-lg text-center transition-colors font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Success Modal */}
      {showModal && (
        <SuccessComponent
          message={
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={24} className="text-green-500" />
              <span>Repayment successful!</span>
            </div>
          }
          onClose={closeSuccessModal}
        />
      )}

      {/* Authentication Modal */}
      {showAuth && (
        <TransactionAuthenticate
          onAuthenticate={handleAuthentication}
          onClose={closeAuthModal}
        />
      )}
    </div>
  );
};

export default InstallmentRepayment;