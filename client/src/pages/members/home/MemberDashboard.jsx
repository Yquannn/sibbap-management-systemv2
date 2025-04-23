import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { 
  ConciergeBell, 
  PiggyBank, 
  Banknote, 
  ArrowRight, 
  Briefcase, 
  DollarSign, 
  CircleAlert 
} from "lucide-react";
import { motion } from "framer-motion";
import defaultPicture from "../assets/blankPicture.png";
import ShareCapitalCalculator from "./utils/ShareCapitalCalculator";
import { count } from "../notification/NotificationPage";

export let memberId = "";

// Skeleton component to mimic the dashboard UI
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen p-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between bg-gray-200 p-3 rounded-lg animate-pulse">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="ml-3">
            <div className="w-32 h-5 bg-gray-300 rounded"></div>
            <div className="w-24 h-4 bg-gray-300 rounded mt-2"></div>
          </div>
        </div>
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Balance Cards Skeleton */}
      <div className="mt-6 space-y-6">
        <div className="flex space-x-4 overflow-x-auto">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="w-full min-w-[280px] h-40 bg-gray-300 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        {/* Math Tools Skeleton */}
        <div className="mt-6">
          <div className="w-40 h-6 bg-gray-300 rounded mb-3"></div>
          <div className="flex space-x-3 overflow-x-auto">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="w-[220px] h-36 bg-gray-300 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Announcements Skeleton */}
        <div className="mt-6">
          <div className="w-48 h-6 bg-gray-300 rounded mb-3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-300 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [member, setMember] = useState({});
  const [loading, setLoading] = useState(true); // for initial load
  const [refreshing, setRefreshing] = useState(false); // for refresh on scroll up
  const [error, setError] = useState("");
  const [activeIndex2, setActiveIndex2] = useState(0);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const scrollRef2 = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Refs for pull-to-refresh functionality
  const pullStartY = useRef(0);
  const pullMoveY = useRef(0);
  const refreshDistance = 100; // Distance required to trigger refresh in pixels
  const isDragging = useRef(false);

  let notificationCount = count;

  const dummyMember = {
    announcements: [
      { title: "System Maintenance👨‍🔧", description: "Scheduled maintenance on Feb 20, 2025, from 2 AM to 4 AM." },
      { title: "New Feature Released!😲", description: "We've added a loan calculator for better financial planning." },
    ],
    badge: "Top Saver 🏆",
  };

  const handleScroll2 = () => {
    if (scrollRef2.current) {
      const scrollLeft = scrollRef2.current.scrollLeft;
      const cardWidth = scrollRef2.current.clientWidth; // Responsive width
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex2(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = 220; // Width of cards
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(index);
    }
  };

  memberId = member.memberId;

  // Function to fetch/reload member data.
  const fetchMemberData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      setLoading(true);
    }
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        throw new Error("User email not found. Please log in again.");
      }
      const response = await axios.get(
        ` http://192.168.254.114:3001/api/member/email/${email}`
      );
      if (response.data) {
        setMember(response.data);
      } else {
        throw new Error("No member data found.");
      }
    } catch (err) {
      setError(err.message || "Error fetching member data.");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, []);

  // Improved pull-to-refresh functionality
  useEffect(() => {
    // Touch start event - record the starting position
    const handleTouchStart = (e) => {
      // Only enable pull to refresh at the top of the page
      if (window.scrollY <= 5) {
        pullStartY.current = e.touches[0].clientY;
        isDragging.current = true;
      }
    };

    // Touch move event - calculate the pull distance
    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      
      pullMoveY.current = e.touches[0].clientY;
      const pullDistance = pullMoveY.current - pullStartY.current;
      
      // Only consider downward pulls (positive distance)
      if (pullDistance > 0 && window.scrollY <= 0) {
        // Prevent default to disable browser's native pull-to-refresh
        e.preventDefault();
        
        // Visual feedback could be added here
        if (pullDistance > refreshDistance && !refreshing && !loading) {
          // Show a visual indicator that release will trigger refresh
        }
      }
    };

    // Touch end event - trigger refresh if pulled enough
    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      
      const pullDistance = pullMoveY.current - pullStartY.current;
      
      if (pullDistance > refreshDistance && !refreshing && !loading && window.scrollY <= 0) {
        fetchMemberData(true);
      }
      
      isDragging.current = false;
      pullStartY.current = 0;
      pullMoveY.current = 0;
    };

    // For desktop - using mouse events to simulate pull-to-refresh
    const handleMouseDown = (e) => {
      if (window.scrollY <= 5) {
        pullStartY.current = e.clientY;
        isDragging.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      
      pullMoveY.current = e.clientY;
      const pullDistance = pullMoveY.current - pullStartY.current;
      
      if (pullDistance > 0 && window.scrollY <= 0) {
        // Visual feedback could be added here
      }
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      
      const pullDistance = pullMoveY.current - pullStartY.current;
      
      if (pullDistance > refreshDistance && !refreshing && !loading && window.scrollY <= 0) {
        fetchMemberData(true);
      }
      
      isDragging.current = false;
      pullStartY.current = 0;
      pullMoveY.current = 0;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mousedown', handleMouseDown);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [refreshing, loading]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <p className="text-center p-4 text-red-500 font-medium">{error}</p>;

  // Compute member initials
  const initials = `${member?.first_name?.charAt(0) || ""}${member?.last_name?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="">
      {/* Refreshing Indicator */}
      {refreshing && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
    <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-blue-500 rounded-full backdrop-blur-sm bg-white/50 p-px" />
  </div>
)}

      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center">
          {member?.id_picture ? (
            <img
              src={` http://192.168.254.114:3001/uploads/${member.id_picture}`}
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-green-500 object-cover shadow-sm cursor-pointer"
              onClick={() => navigate("/member-profile")}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm cursor-pointer"
              onClick={() => navigate("/member-profile")}
            >
              {initials || "NA"}
            </div>
          )}
          <div className="ml-3">
            <p className="text-lg font-semibold text-gray-800">
              {member?.first_name} {member?.last_name}
            </p>
            <p className="text-sm text-gray-500">
              Code No. <span className="font-medium">{member.memberCode}</span>
            </p>
          </div>
        </div>

        {/* Notification Button with Count Badge */}
        <div className="relative">
          <button
            className="text-green-600 p-2 rounded-full bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-center shadow-sm"
            onClick={() => navigate("/member-notification")}
          >
            <ConciergeBell className="w-6 h-6" />
            {count > 0 && (
              <span
                className={`absolute -top-1 -right-1 bg-red-500 text-white font-bold rounded-full flex items-center justify-center 
                  px-2 py-0.5 ${count >= 100 ? "text-[10px] min-w-[28px]" : "text-xs min-w-[20px]"} shadow-sm`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pull to refresh indicator */}
      <div className="text-center pt-1 pb-1 text-xs text-gray-500">
        Pull down to refresh
      </div>

      {/* Balance Cards Section */}
      <div className="relative mt-2">
        <div
          ref={scrollRef2}
          onScroll={handleScroll2}
          className="flex overflow-x-auto space-x-4 snap-x snap-mandatory pb-6 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Regular Savings */}
          <motion.div
            className="snap-center shrink-0 w-full min-w-[280px] max-w-sm"
            onClick={() => navigate("/member-regular-savings-analytics")}
          >
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl w-full shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-100 font-medium">Regular Savings</p>
                  <p className="text-4xl font-bold mt-1">
                    ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.savingsAmount || 0)}
                  </p>
                </div>
                <PiggyBank className="w-8 h-8 text-green-300" />
              </div>

              <p className="text-sm text-gray-100 mt-2">
                Account No.: {member?.account_number 
                  ? member.account_number.replace(/(\d{4})/g, '$1-').replace(/-$/, '') 
                  : "N/A"}
              </p>

              <hr className="my-4 border-t border-white/30" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Total Earnings</p>
                  <p className="text-xl font-bold">
                    ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.totalEarnings || 0.0)}
                  </p>
                </div>
                <button
                  className="text-white text-sm font-semibold bg-white/20 py-1.5 px-3 rounded-lg hover:bg-white/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents triggering the card click
                    navigate("/member-regular-savings-transaction");
                  }}
                >
                  View history
                </button>
              </div>
            </div>
          </motion.div>


          {/* Share Capital */}
          <motion.div className="snap-center shrink-0 w-full min-w-[280px] max-w-sm">
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 text-white p-6 rounded-xl w-full shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-100 font-medium">Share Capital</p>
                  <p className="text-4xl font-bold mt-1">
                    ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.shareCapital || 0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-cyan-300" />
              </div>

              <hr className="my-4 border-t border-white/30" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Collected Dividends</p>
                  <p className="text-xl font-bold">
                    ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.totalEarnings || 0.0)}
                  </p>
                </div>
                <button
                  className="text-white text-sm font-semibold bg-white/20 py-1.5 px-3 rounded-lg hover:bg-white/30 transition-colors"
                  onClick={() => navigate("/member-regular-savings-transaction")}
                >
                  View history
                </button>
              </div>
            </div>
          </motion.div>

          {/* Time Deposit */}
          <motion.div className="snap-center shrink-0 w-full min-w-[280px] max-w-sm">
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl w-full shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-100 font-medium">Time Deposit</p>
                  <p className="text-4xl font-bold mt-1">
                    ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.timeDepositAmount || 0)}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-green-300" />
              </div>

              <hr className="my-4 border-t border-white/30" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-100">Total Earnings</p>
                  <p className="text-xl font-bold">
                    ₱{new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(member?.totalEarnings || 0.0)}
                  </p>
                </div>
                <button
                  className="text-white text-sm font-semibold bg-white/20 py-1.5 px-3 rounded-lg hover:bg-white/30 transition-colors"
                  onClick={() => navigate("/member-regular-savings-transaction")}
                >
                  View history
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center mt-2 space-x-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef2.current) {
                  const cardWidth = scrollRef2.current.clientWidth;
                  scrollRef2.current.scrollTo({
                    left: index * cardWidth,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeIndex2 === index ? "bg-green-600 w-6" : "bg-gray-300"
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* Math Tools Section */}
      <div className="mt-8">
        <div className="mb-3">
          <div className="text-lg font-semibold text-gray-800">Let's Do Some Math!</div>
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto space-x-3 pb-4 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Savings Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center min-w-[220px] transition-transform hover:transform hover:scale-105">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
              <PiggyBank size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mt-3 text-gray-800">Savings</h3>
            <p className="text-gray-600 text-sm">Save money and earn interest.</p>
            <button
              className="mt-4 flex items-center justify-center w-full bg-green-600 text-white py-2.5 px-4 rounded-lg shadow-sm hover:bg-green-700 transition-colors"
              onClick={() => navigate("/regular-savings-calculator")}
            >
              Calculate <ArrowRight size={18} className="ml-2" />
            </button>
          </div>

          {/* Loan Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center min-w-[220px] transition-transform hover:transform hover:scale-105">
            <div className="bg-cyan-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
              <Banknote size={32} className="text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold mt-3 text-gray-800">Loan</h3>
            <p className="text-gray-600 text-sm">Apply for a loan with low interest.</p>
            <button className="mt-4 flex items-center justify-center w-full bg-cyan-600 text-white py-2.5 px-4 rounded-lg shadow-sm hover:bg-cyan-700 transition-colors">
              Calculate <ArrowRight size={18} className="ml-2" />
            </button>
          </div>

          {/* Time Deposit Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center min-w-[220px] transition-transform hover:transform hover:scale-105">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
              <Briefcase size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mt-3 text-gray-800">Time Deposit</h3>
            <p className="text-gray-600 text-sm">Grow your money with fixed returns.</p>
            <button
              onClick={() => navigate("/timedeposit-calculator")}
              className="mt-4 flex items-center justify-center w-full bg-green-600 text-white py-2.5 px-4 rounded-lg shadow-sm hover:bg-green-700 transition-colors"
            >
              Calculate <ArrowRight size={18} className="ml-2" />
            </button>
          </div>

          {/* Share Capital Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center min-w-[220px] transition-transform hover:transform hover:scale-105">
            <div className="bg-cyan-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
              <DollarSign size={32} className="text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold mt-3 text-gray-800">Share Capital</h3>
            <p className="text-gray-600 text-sm">Investing today secures tomorrow.</p>
            <button
              className="mt-4 flex items-center justify-center w-full bg-cyan-600 text-white py-2.5 px-4 rounded-lg shadow-sm hover:bg-cyan-700 transition-colors"
              onClick={() => setModalOpen(true)}
            >
              Calculate <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Active Indicator Dots */}
        <div className="flex justify-center mt-2 space-x-2">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = 220;
                  scrollRef.current.scrollTo({
                    left: index * cardWidth,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeIndex === index ? "bg-cyan-600 w-6" : "bg-gray-300"
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Announcements & Analytics Section */}
      <div className="mt-8 mb-6">
        <div className="mb-3">
          <div className="text-lg font-semibold text-gray-800">Important Announcement!</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {(member?.announcements?.length ? member.announcements : dummyMember.announcements).map(
            (announcement, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <CircleAlert className="w-5 h-5 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">{announcement.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{announcement.description}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
        
        {/* Analytics and Badge Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-gray-700 text-md font-medium mt-3">Earned a Badge</p>
            <p className="text-lg font-bold text-amber-600 mt-1">{member?.badge || dummyMember.badge}</p>
          </div>
        </div>
      </div>

      {/* Share Capital Calculator Modal */}
      <ShareCapitalCalculator isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      
      {/* Custom CSS for hiding scrollbars */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;  
        }
      `}</style>
    </div>
  );
};

export default Dashboard;