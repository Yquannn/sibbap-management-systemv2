import React from "react";

const ErrorModal = ({ visible, errorMessage, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg text-center max-w-md">
        <h3 className="text-xl font-bold mb-4 text-red-600">Loan Application Error</h3>
        <p>{errorMessage}</p>
        <button
          className="mt-4 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;