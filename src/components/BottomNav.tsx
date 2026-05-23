import { Link, useLocation } from "react-router-dom";
import { Copy, Compass, Gift, Wallet, User } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Compass },
    { name: "Activity", path: "/activity", icon: Gift },
    { name: "Promotion", path: "/promotion", icon: Copy },
    { name: "Wallet", path: "/wallet", icon: Wallet },
    { name: "Account", path: "/account", icon: User },
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-between items-center px-2 py-2 z-50 rounded-t-xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center w-16 h-14 ${
              isActive ? "text-red-500" : "text-gray-400"
            }`}
          >
            <div
              className={`p-1 rounded-full mb-1 transition-all duration-300 ${
                isActive ? "bg-red-50 translate-y-[-2px]" : ""
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-red-500 font-bold" : ""}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
