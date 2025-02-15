import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api'; // Base API URL

const TransactionForm = ({ member, modalType, onClose }) => {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(parseFloat(member.savingsAmount) || 0); // Ensure balance is a number
  const [loading, setLoading] = useState(false); // To handle loading state
  const [error, setError] = useState(null); // To display error messages

  const handleTransaction = async () => {
    const amountValue = parseFloat(amount);

    // Validate amount
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (modalType === 'withdraw' && amountValue > balance) {
      alert('Insufficient funds');
      return;
    }

    try {
      setLoading(true); // Start loading
      setError(null); // Clear any previous errors

      // API endpoint based on modalType
      const endpoint = `${BASE_URL}/${modalType}`;
      const payload = {
        memberId: member.memberId,
        amount: amountValue,
      };

      // Make API call
      const response = await axios.put(endpoint, payload);

      // Update balance and show success alert
      const { success, depositedAmount, newBalance } = response.data;
      setBalance(parseFloat(newBalance)); // Ensure newBalance is a number
      alert(`${success}. ${modalType === 'withdraw' ? 'Withdrew' : 'Deposited'} ${depositedAmount}. New Balance: ${newBalance}`);

      setAmount(''); // Reset input field
      onClose(); // Close modal
    } catch (error) {
      console.error('Transaction failed:', error);
      setError(error.response?.data?.error || 'An error occurred while processing the transaction.');
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div>
      {/* Transaction Form Modal */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-96 p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">
            {modalType === 'withdraw' ? 'Withdraw' : 'Deposit'} Funds
          </h2>

          <p className="text-center mb-4">
            Current Balance: <span className="font-bold">{balance.toFixed(2)}</span>
          </p>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 px-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter amount"
            />
          </div>

          <div className="flex justify-between space-x-3">
            <button
              onClick={handleTransaction}
              disabled={loading} // Disable button when loading
              className={`w-1/2 py-2 px-4 text-white font-semibold rounded-lg shadow hover:opacity-80 focus:outline-none 
                ${modalType === 'withdraw' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : modalType === 'withdraw' ? 'Withdraw' : 'Deposit'}
            </button>
            <button
              onClick={onClose}
              className="w-1/2 py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-400 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
