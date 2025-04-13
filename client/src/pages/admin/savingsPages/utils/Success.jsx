import React from "react";
import { X, Check } from "lucide-react";

/**
 * A success modal styled with modern UI elements:
 * - Large green circle with a white check icon
 * - "Success" heading
 * - Descriptive text
 * - OK button
 * - Backdrop blur effect for a modern look
 */
const SuccessModal = ({
  title = "Success",
  message = "Check your email for a booking confirmation. We'll see you soon!",
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-80 max-w-md mx-auto overflow-hidden relative">
        {/* Close button in top-right corner */}
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Content Container */}
        <div className="flex flex-col items-center text-center p-6 pt-8">
          {/* Big green circle with white check icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-md">
            <Check size={32} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>

          {/* Subtext */}
          <p className="text-gray-600 mb-8 px-4">{message}</p>

          {/* OK button */}
          <button 
            className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;