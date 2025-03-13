import React, { useState } from "react";
import RegularSavings from "./savingsPages/RegularSavings";
import TimeDeposit from "./savingsPages/TimeDeposit";
import ShareCapital from "./savingsPages/SharedCapital";

const Savings = () => {
  const [activeTab, setActiveTab] = useState("RegularSavings"); // State to track the active tab

  return (
    <div className="">
      <div className="p-4 bg-white shadow-lg rounded-lg mb-6">
        <button
          onClick={() => setActiveTab("RegularSavings")}
          className={`px-4 py-2 font-medium rounded-lg ${
            activeTab === "RegularSavings" ? "bg-blue-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-white-100"
          }`}
        >
          Regular Savings
        </button>
        <button
          onClick={() => setActiveTab("TimeDeposit")}
          className={`px-4 py-2 font-medium rounded-lg ${
            activeTab === "TimeDeposit" ? "bg-blue-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-white-100"
          }`}
        >
          Time Deposit
        </button>
        <button
          onClick={() => setActiveTab("ShareCapital")}
          className={`px-4 py-2 font-medium rounded-lg ${
            activeTab === "ShareCapital" ? "bg-blue-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-white-100"
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
