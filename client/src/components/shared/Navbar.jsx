import { useState } from "react";
import { Link } from "react-router-dom";
import { HomeIcon, HeartIcon, BellIcon, UserIcon, BadgeRussianRuble, Mail } from "lucide-react";
import {count} from "../../pages/members/inbox/MemberInbox";

const Navbar = () => {
  const [active, setActive] = useState("home");
  let notificationCount = count; 

  
  return (
    <div className="fixed bottom-0 left-0 w-full px-4 mb-5">
      <nav className="rounded-[30px] bg-gray-200 shadow-lg p-2 flex justify-around items-center border-t">
      
        <Link to="/member-dashboard" onClick={() => setActive("home")} className={`flex flex-col items-center ${active === "home" ? "text-green-600" : "text-gray-500"}`}>
          <HomeIcon size={24} />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/member-transactions" onClick={() => setActive("transactions")} className={`flex flex-col items-center ${active === "transactions" ? "text-green-600" : "text-gray-500"}`}>
          <BadgeRussianRuble size={24} />
          <span className="text-xs">Transaction</span>
        </Link>
        <Link to="/member-inbox" onClick={() => setActive("notifications")} className={`relative flex flex-col items-center ${active === "notifications" ? "text-green-600" : "text-gray-500"}`}>
          <Mail size={24} />
          {notificationCount > 0 && (
            <span className="absolute top-[-7px] right-[-6px] bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{notificationCount}</span>
          )}
          <span className="text-xs">Inbox</span>
        </Link>
        <Link to="/member-profile" onClick={() => setActive("profile")} className={`flex flex-col items-center ${active === "profile" ? "text-green-600" : "text-gray-500"}`}>
          <UserIcon size={24} />
          <span className="text-xs">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;
