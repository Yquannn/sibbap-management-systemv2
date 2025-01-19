import React, { useState } from "react";
import RegularSavings from "./childPages/RegularSavings";
import TimeDeposit from "./childPages/TimeDeposit";
import ShareCapital from "./childPages/SharedCapital";

const Savings = () => {
  const [activeTab, setActiveTab] = useState("RegularSavings"); // State to track the active tab

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Savings</h2>
      <div className="tabs flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("RegularSavings")}
          className={`px-4 py-2 rounded ${
            activeTab === "RegularSavings" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Regular Savings
        </button>
        <button
          onClick={() => setActiveTab("TimeDeposit")}
          className={`px-4 py-2 rounded ${
            activeTab === "TimeDeposit" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Time Deposit
        </button>
        <button
          onClick={() => setActiveTab("ShareCapital")}
          className={`px-4 py-2 rounded ${
            activeTab === "ShareCapital" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Share Capital 
        </button>
      </div>
      <div className="content">
        {activeTab === "RegularSavings" && <RegularSavings />}
        {activeTab === "TimeDeposit" && <TimeDeposit />}
        {activeTab === "ShareCapital" && <ShareCapital />}

      </div>
    </div>
  );
};

export default Savings;
