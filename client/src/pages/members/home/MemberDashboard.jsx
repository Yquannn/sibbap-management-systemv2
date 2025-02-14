import React from "react";
import { ConciergeBell  } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
        <div className="flex items-center ">
          <img
            src="/profile-placeholder.png"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <p className="text-gray-500 text-sm">Welcome</p>
            <p className="text-lg font-semibold">Mary rose Gawan</p>
          </div>
        </div>
        <button className="text-green-600 p-2 rounded-full hover:bg-green-100">
          <ConciergeBell  className="w-6 h-6" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="mt-6 bg-green-600 text-white p-6 rounded-lg text-center">
        <p className="text-sm">NGN Balance</p>
        <p className="text-3xl font-bold">137,485.22</p>
        <button className="mt-3 bg-white text-green-600 px-4 py-2 rounded-lg font-semibold">
          + Top up
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-700">Announcement</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { title: "Smart TV", desc: "Savings for 2023 Hisense smart TV", color: "bg-green-100" },
            { title: "Apartment Rent", desc: "Savings for apartment 3 bedroom in Ikeja", color: "bg-yellow-100" },
            { title: "Car savings", desc: "Savings for Lexus ES 350 2022 model", color: "bg-blue-100" },
            { title: "Wedding ring", desc: "Savings for original gold ring to propose", color: "bg-purple-100" },
          ].map((item, index) => (
            <div key={index} className={`${item.color} p-4 rounded-lg shadow-md`}>
              <h3 className="text-md font-semibold">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badge Section */}
      <div className="mt-6 bg-green-200 p-4 rounded-lg text-center">
        <p className="text-gray-700 text-sm">Earned a Badge</p>
        <p className="text-lg font-bold">Save King</p>
      </div>
    </div>
  );
};

export default Dashboard;
