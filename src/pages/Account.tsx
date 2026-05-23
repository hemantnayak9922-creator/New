import { Settings, Shield, Globe, HeadphonesIcon, Bell, ChevronRight, LogOut, Download } from "lucide-react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user } = useAuth();
  const vipData = {
    currentLevel: "VIP 1",
    nextLevel: "VIP 2",
    currentXp: 450,
    requiredXp: 1000
  };
  const xpPercentage = Math.min(100, Math.max(0, (vipData.currentXp / vipData.requiredXp) * 100));

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
      {/* Header Info */}
      <div className="bg-red-500 pt-6 pb-20 px-5 text-white">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-red-500/20">
                <span className="text-2xl">👤</span>
            </div>
            <div>
                <div className="font-bold text-lg leading-tight mb-1">{user?.email?.split('@')[0] || 'User'}</div>
                <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full inline-block backdrop-blur-sm">
                    {user?.email}
                </div>
            </div>
        </div>
      </div>

      {/* Overlapping Content Container */}
      <div className="px-4 -mt-10">
         {/* Balance Mini Card */}
         <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex justify-between items-center border border-gray-100">
            <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Total Balance</div>
                <div className="text-2xl font-bold text-gray-800">₹0.00</div>
            </div>
            <div className="bg-red-50 text-red-500 p-2 rounded-lg cursor-pointer">
                <Settings size={20} />
            </div>
         </div>

         {/* VIP Progress Card */}
         <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">👑</span>
                    <span className="text-xs font-bold text-gray-800 italic">{vipData.currentLevel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 italic">{vipData.nextLevel}</span>
                    <span className="text-sm grayscale opacity-50">👑</span>
                </div>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full shadow-inner overflow-hidden mb-2 relative">
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${xpPercentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                <span>{vipData.currentXp} / {vipData.requiredXp} XP</span>
                <span className="text-red-500">{vipData.requiredXp - vipData.currentXp} XP to Next Level</span>
            </div>
         </div>

         {/* Menu List */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <MenuItem icon={Bell} title="Notification" color="text-yellow-500" />
            <MenuItem icon={Shield} title="Security Center" color="text-green-500" />
            <MenuItem icon={Globe} title="Language" color="text-blue-500" value="English" />
            <MenuItem icon={HeadphonesIcon} title="Customer Service" color="text-purple-500" />
            <MenuItem icon={Download} title="Download App" color="text-indigo-500" />
         </div>

         <button onClick={handleLogout} className="w-full bg-white border border-gray-100 text-gray-600 font-bold justify-center py-3.5 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center gap-2 text-sm">
            <LogOut size={18} className="text-red-500" />
            Logout
         </button>
      </div>

    </div>
  );
}

function MenuItem({ icon: Icon, title, color, value }: { icon: any, title: string, color: string, value?: string }) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-gray-50 ${color} border border-gray-100`}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-gray-700 text-sm">{title}</span>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-xs text-gray-400 font-medium">{value}</span>}
                <ChevronRight size={16} className="text-gray-300" />
            </div>
        </div>
    )
}
