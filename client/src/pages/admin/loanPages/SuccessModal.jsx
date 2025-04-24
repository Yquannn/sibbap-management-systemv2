import React from "react";

const SuccessModal = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg text-center">
        <h3 className="text-xl font-bold mb-4">Success</h3>
        <p>Member has been successfully applied!</p>
        <button
          className="mt-4 bg-green-700 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;