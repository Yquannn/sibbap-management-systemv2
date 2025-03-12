import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../../../assets/logosibbap.png';
import blankPicture from './blankPicture.png'
import { ArrowLeft } from "lucide-react";

const TransactionInfo = () => {
  const params = useParams();
  const transactionNumber = params.transactionNumber || params.id;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const imageUrl = (filename) =>
    filename ? `http://192.168.254.103:3001/uploads/${filename}` : "";

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(
          `http://192.168.254.103:3001/api/transactions/${transactionNumber}`
        );
        setTransaction(response.data);
      } catch (err) {
        console.error("Error fetching transaction data:", err);
        setError("Error fetching transaction data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionNumber]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="flex justify-center items-center h-screen">
        No transaction data available.
      </div>
    );
  }

  return (
    <div className="">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <button
            className="flex items-center text-gray-700 hover:text-black mb-24"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>
          <h2 className="text-lg font-semibold text-gray-700 text-center">Transaction Details</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2 text-center">
  PHP {Number(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                
                {/* From Section */}
                <div className="flex justify-between gap-2">
                    <span className="text-gray-700 text-xs">From:</span>
                    <div className="flex items-center gap-2">
                        <img
                        src={logo || "default-avatar.png"}
                        alt="Receiver"
                        className="w-6 h-6 rounded-full border"
                        />
                        <span className="text-gray-600 text-sm">Sibbap Coop</span>
                    </div>
                </div>
                {/* <hr className="my-2 border-gray-150" /> */}


                <div className="flex justify-between items-center mt-6  ">
                    <span className="text-gray-700 text-xs">To:</span>
                    <div className="flex items-center gap-2">
                        <img
                        src={imageUrl(transaction.id_picture) || "default-avatar.png"}
                        alt="Receiver"
                        className="w-8 h-8 rounded-full border"
                        />
                        <span className="text-gray-800 text-sm ">{transaction.first_name} {transaction.last_name}</span>
                    </div>
                </div>
                {/* <hr className="my-2 border-gray-150" /> */}



                {/* Authorized By Section - Properly Aligned
                <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-700 text-xs">Authorized by:</span>
                    <div className="flex items-center gap-2">
                        <img
                        src={logo || "default-avatar.png"}
                        alt="Receiver"
                        className="w-5 h-5 rounded-full border"
                        />
                        <span className="text-gray-600 text-xs">{transaction.authorized || "Sibbap"}</span>
                    </div>
                </div> */}

            </div>
            
          {transaction.transaction_type === "Savings Interest" && (
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <div className="mt-2">
                <p className="text-gray-600 flex justify-between">
                  <span className="text-gray-700 text-xs">Interest Amount:</span>
                  <span className="text-gray-800 text-sm font-semibold">PHP {transaction.amount}</span>
                </p>
                {/* <p className="text-gray-600 flex justify-between">
                  <span>Withholding Tax</span>
                  <span className="text-red-500">- PHP {transaction.taxAmount}</span>
                </p> */}
              </div>
            </div>
          )}

          <div className="mt-2 p-4 bg-gray-50 rounded-lg">

          <div className="mt-1">
  {/* First Row - Transaction No. */}
                <div className="flex justify-between items-center w-full">
                    <span className="text-gray-700 text-xs">Transaction No:</span>
                    <span className="text-gray-800 text-xs">{transaction.transaction_number}</span>
                </div>

                {/* Horizontal Line for Separation */}
                <hr className="my-2 border-gray-150" />

                {/* Second Row - Transaction Date & Time */}
                <div className="flex justify-between items-center w-full">
                    <span className="text-gray-700 text-xs">Transaction Date/Time:</span>
                    <span className="text-gray-800 text-xs">{formatDate(transaction.transaction_date_time)}</span>
                </div>
                </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfo;
