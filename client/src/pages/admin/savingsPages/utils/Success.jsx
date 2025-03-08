import React from "react";
import { FaCheckCircle } from "react-icons/fa"; // Import check icon

const SuccessComponent = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center  bg-opacity-80">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" /> {/* Check icon */}
        <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
        <p className="text-green-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessComponent;
