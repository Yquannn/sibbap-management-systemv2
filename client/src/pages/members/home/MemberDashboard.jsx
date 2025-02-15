import React, { useEffect, useState, useRef  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ConciergeBell,  PiggyBank, Banknote, ArrowRight, Briefcase, DollarSign  } from "lucide-react";
import { motion } from "framer-motion";
import defaultPicture from "../assets/blankPicture.png";
import TimedepositCalculator from "./utils/TimedepositCalculator"

const Dashboard = () => {
  const [member, setMember] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex2, setActiveIndex2] = useState(0);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const scrollRef2 = useRef(null);
  // const [calculatorModalVisible, setCalculatorModalVisible] = useState(false);
  // const [selectedMember, setSelectedMember] = useState(null);
  // const [modalType, setModalType] = useState("calculate");
  
  


  const dummyMember = {
    announcements: [
      { title: "System Maintenance👨‍🔧", description: "Scheduled maintenance on Feb 20, 2025, from 2 AM to 4 AM." },
      { title: "New Feature Released!😲 ", description: "We've added a loan calculator for better financial planning." },
    ],
    badge: "Top Saver 🏆",
  };

  const handleScroll2 = () => {
    if (scrollRef2.current) {
      const scrollLeft = scrollRef2.current.scrollLeft;
      const cardWidth = 320; // Adjust based on actual card width + margin
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex2(index);
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = 220; // Adjust based on actual card width + margin
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(index);
    }
  };

  // const handleOpenAmountModal = (member) => {
  //   setSelectedMember(member);
  //   setModalType("calculate"); // Set modal type as "deposit"
  //   setCalculatorModalVisible(true);
  // };

  // const handleCloseAmountModal = () => {
  //   setSelectedMember(null);
  //   setCalculatorModalVisible(false);
  // };


  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          throw new Error("User email not found. Please log in again.");
        }

        const response = await axios.get(
          `http://192.168.254.103:3001/api/member/email/${email}`
        );

        if (response.data) {
          setMember(response.data);
        } else {
          throw new Error("No member data found.");
        }
      } catch (err) {
        setError(err.message || "Error fetching member data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
    
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
        <div className="flex items-center">
        <img
          src={member?.idPicture ? `http://192.168.254.103:3001/uploads/${member.idPicture}` : defaultPicture}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-green-500 cursor-pointer"
          onClick={() => navigate("/member-profile")}
        />
          <div className="ml-3">
            <p className="text-gray-500 text-sm">Welcome</p>
            <p className="text-lg font-semibold">
              {member?.FirstName} {member?.LastName}
            </p>
          </div>
        </div>
        <button className="text-green-600 p-2 rounded-full hover:bg-green-100">
          <ConciergeBell className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-full max-w-md mx-auto mt-4">
      <div 
        ref={scrollRef2} 
        onScroll={handleScroll2} 
        className="flex overflow-x-auto space-x-4 snap-x snap-mandatory pb-4 scrollbar-hide"
      >
        <motion.div className="snap-center shrink-0 w-[300px]">
          <div className="bg-green-600 text-white p-6 rounded-lg text-center w-full">
            <p className="text-sm">Regular Savings Balance</p>
            <p className="text-3xl font-bold">
              ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.savingsAmount || 0)}
            </p>
            <div className="mt-3 flex justify-center gap-4">
              <button className="bg-white text-sm text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition">
                View Transaction
              </button>
            </div>
          </div>
        </motion.div>

        {/* Monthly Dividend */}
        <motion.div className="snap-center shrink-0 w-[300px]">
          <div className="bg-cyan-600 text-white p-6 rounded-lg text-center w-full">
            <p className="text-sm">Monthly Dividend Collected</p>
            <p className="text-3xl font-bold">
              ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.dividend || 0)}
            </p>
            <div className="mt-3 flex justify-center gap-4">
              <button className="bg-white text-sm text-cyan-700 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-100 transition">
                View Transaction
              </button>
            </div>
          </div>
        </motion.div>

        {/* Time Deposit */}
        <motion.div className="snap-center shrink-0 w-[300px]">
          <div className="bg-green-600 text-white p-6 rounded-lg text-center w-full">
            <p className="text-sm">Time Deposit Balance</p>
            <p className="text-3xl font-bold">
              ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.timeDepositAmount || 0)}
            </p>
            <div className="mt-3 flex justify-center gap-4">
              <button className="bg-white text-sm text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition">
                View Transaction
              </button>
            </div>
          </div>
        </motion.div>

        {/* Share Capital */}
        <motion.div className="snap-center shrink-0 w-[300px]">
          <div className="bg-cyan-600 text-white p-6 rounded-lg text-center w-full">
            <p className="text-sm">Share Capital</p>
            <p className="text-3xl font-bold">
              ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.shareCapital || 0)}
            </p>
            <div className="mt-3 flex justify-center gap-4">
              <button className="bg-white text-sm text-cyan-700 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-100 transition">
                View Transaction
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center mt-[-3px] space-x-2">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              activeIndex2 === index ? "bg-gray-500 w-2.3 h-2.3" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
    </div>



      <div className="mt-4">
      <h2 className="text-lg font-semibold text-gray-700">Let’s Do Some Math!</h2>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto space-x-2 mt-4 pb-2 scrollbar-hide"
      >
        {/* Savings Card */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 text-center min-w-[220px]">
          <PiggyBank size={40} className="text-green-500 mx-auto" />
          <h3 className="text-md font-semibold mt-2">Savings</h3>
          <p className="text-gray-600 text-sm">Save money and earn interest.</p>
          <button className="mt-3 flex items-center justify-center w-full bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600"
            onClick={() => navigate("/regular-savings-calculator")}

          >
            Calculate <ArrowRight size={18} className="ml-2" />
          </button>
        </div>

        {/* Loan Card */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 text-center min-w-[220px]">
          <Banknote size={40} className="text-cyan-500 mx-auto" />
          <h3 className="text-md font-semibold mt-2">Loan</h3>
          <p className="text-gray-600 text-sm">Apply for a loan with low interest.</p>
          <button className="mt-3 flex items-center justify-center w-full bg-cyan-500 text-white py-2 px-4 rounded-lg shadow hover:bg-cyan-600">
            Calculate <ArrowRight size={18} className="ml-2" />
          </button>
        </div>

        {/* Time Deposit Card */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 text-center min-w-[220px]">
          <Briefcase size={40} className="text-green-500 mx-auto" />
          <h3 className="text-md font-semibold mt-2">Time Deposit</h3>
          <p className="text-gray-600 text-sm">Grow your money with fixed returns.</p>
          <button
            onClick={() => navigate("/timedeposit-calculator")}
            className="mt-3 flex items-center justify-center w-full bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600"
          >
            Calculate <ArrowRight size={18} className="ml-2" />
          </button>
        </div>

        {/* Share Capital*/}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 text-center min-w-[220px]">
          <DollarSign size={40} className="text-cyan-500 mx-auto" /> 
          <h3 className="text-md font-semibold mt-2">Share Capital</h3>
          <p className="text-gray-600 text-sm">Investing today secures tomorrow.</p>
          <button className="mt-3 flex items-center justify-center w-full bg-cyan-500 text-white py-2 px-4 rounded-lg shadow hover:bg-cyan-600">
            Calculate <ArrowRight size={18} className="ml-2" />
          </button>
        </div>

      </div>

      {/* Active Indicator Dots */}
      <div className="flex justify-center mt-1 space-x-2">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              activeIndex === index ? "bg-gray-500 w-2.3 h-2.3" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
    </div>


    <div className="mb-3">
      <div className="mt-3">
        <h2 className="text-lg font-semibold text-gray-700">Important Announcement!</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {(member?.announcements?.length ? member.announcements : dummyMember.announcements).map((announcement, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-md font-semibold">{announcement.title}</h3>
              <p className="text-gray-600 text-sm">{announcement.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-700 text-sm">Earned a Badge</p>
        <p className="text-lg font-bold">{member?.badge || dummyMember.badge}</p>
      </div>
    </div>

    {/* {calculatorModalVisible && (
          <TimedepositCalculator
            modalType={modalType}
            member={selectedMember}
            onClose={handleCloseAmountModal}
            // onDataUpdate={handleDataUpdate} // Pass the callback
          />
        )} */}
  </div>

  );
};

export default Dashboard;
