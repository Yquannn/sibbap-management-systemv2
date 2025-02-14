import { useState } from "react";
import { Link } from "react-router-dom";
import { HomeIcon, HeartIcon, BellIcon, UserIcon, BadgeRussianRuble  } from "lucide-react";

const Navbar = () => {
  const [active, setActive] = useState("home");

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 flex justify-around items-center border-t">
      <Link to="/member-dashboard" onClick={() => setActive("home")} className={`flex flex-col items-center ${active === "home" ? "text-blue-600" : "text-gray-500"}`}>
        <HomeIcon size={24} />
        <span className="text-xs">Home</span>
      </Link>
      <Link to="/member-transactions" onClick={() => setActive("transactions")} className={`flex flex-col items-center ${active === "transactions" ? "text-blue-600" : "text-gray-500"}`}>
        <BadgeRussianRuble  size={24} />
        <span className="text-xs">Transaction</span>
      </Link>
      <Link to="/member-notifications" onClick={() => setActive("notifications")} className={`flex flex-col items-center ${active === "notifications" ? "text-blue-600" : "text-gray-500"}`}>
        <BellIcon size={24} />
        <span className="text-xs">Notifications</span>
      </Link>
      <Link to="/member-profile" onClick={() => setActive("profile")} className={`flex flex-col items-center ${active === "profile" ? "text-blue-600" : "text-gray-500"}`}>
        <UserIcon size={24} />
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
};

export default Navbar;
