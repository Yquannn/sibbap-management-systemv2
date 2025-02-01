import React, { useState } from "react";

const TransactionAuthenticate = ({ onAuthenticate, onClose }) => {
  const [password, setPassword] = useState("test");
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate password input
    if (!password) {
      setError("Password is required.");
      return;
    }

    // Simulate authentication logic (replace with real API call)
    console.log(`Password entered: ${password}`);
    const isPasswordValid = true; // Replace with actual validation logic

    if (isPasswordValid) {
      setError(""); // Clear errors
      onAuthenticate(password); // Call parent function with the password
      onClose(); // Close the modal
    } else {
      setError("Invalid password. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Enter Your Password
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Password Input */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {/* Submit and Cancel Buttons */}
          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full px-4 py-2 text-white font-medium bg-green-600 hover:bg-green-700 rounded-md shadow-sm"
            >
              Authenticate
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionAuthenticate;
