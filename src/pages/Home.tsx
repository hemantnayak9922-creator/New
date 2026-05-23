import { Bell, Download, HeadphonesIcon, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BettingModal from "../components/BettingModal";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { balance } = useAuth();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const userBalance = balance; // Dynamic balance

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-red-500 text-lg shadow-sm">
            J
          </div>
          <span className="font-bold text-lg tracking-wide">Jalwa Club</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex flex-col items-center">
            <Download size={20} />
          </button>
          <button className="flex flex-col items-center">
            <HeadphonesIcon size={20} />
          </button>
        </div>
      </div>

      {/* Banner / Slider Placeholder */}
      <div className="px-4 py-3">
        <div className="w-full h-40 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl overflow-hidden relative shadow-md">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xl opacity-90 drop-shadow-md">
              Welcome Bonus Package
            </span>
          </div>
          <div className="absolute bottom-2 right-2 space-x-1 flex">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Notice / Marquee */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-full px-4 py-2 flex items-center gap-3 shadow-sm border border-gray-100">
          <Bell size={18} className="text-red-500 shrink-0" />
          <div className="overflow-hidden w-full relative h-5 flex items-center">
             <div className="text-xs text-gray-600 font-medium whitespace-nowrap animate-[marquee_10s_linear_infinite]">
                Congratulations User ***8893 for winning ₹5000 in Win Go! &nbsp;&nbsp;&nbsp;&nbsp; 
             </div>
          </div>
        </div>
      </div>

      {/* Quick Action / Mini grid */}
      <div className="px-4 mb-4 grid grid-cols-4 gap-3">
         <ActionIcon icon="🎁" label="Activity" />
         <ActionIcon icon="🏆" label="VIP" />
         <ActionIcon icon="💰" label="Withdraw" />
         <ActionIcon icon="🏦" label="Recharge" />
      </div>

      {/* Main Game Categories Tabs */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <TabItem active title="Lottery" icon="🎯" />
          <TabItem title="Slots" icon="🎰" />
          <TabItem title="Sports" icon="⚽" />
          <TabItem title="Casino" icon="🎲" />
        </div>
      </div>

      {/* Game Cards (Lottery Category Active) */}
      <div className="px-4 grid grid-cols-1 gap-3 mb-6">
        <GameCard 
          title="Win Go" 
          desc="Guess Number/Color" 
          imgColor="from-red-400 to-red-600"
          time="30s, 1M, 3M, 5M" 
          onClick={() => navigate("/wingo")}
        />
      </div>
      
      {/* Winning list preview */}
      <div className="px-4">
        <h3 className="font-bold text-gray-800 mb-3 border-l-4 border-red-500 pl-2 text-sm">Winning Information</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 space-y-3">
            <WinningRow user="User ***9932" amount="₹14,500.00" game="Win Go 3Min" />
            <WinningRow user="User ***1045" amount="₹2,100.00" game="Win Go 1Min" />
        </div>
      </div>

      <BettingModal 
        isOpen={isBetModalOpen} 
        onClose={() => setIsBetModalOpen(false)} 
        userBalance={userBalance} 
        gameTitle={selectedGame} 
      />

    </div>
  );
}

function ActionIcon({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center text-xl">
        {icon}
      </div>
      <span className="text-[11px] font-medium text-gray-600">{label}</span>
    </div>
  );
}

function TabItem({ active, title, icon }: { active?: boolean; title: string, icon: string }) {
  return (
    <div className={`flex flex-col items-center justify-center min-w-[70px] py-2 px-3 rounded-lg flex-shrink-0 transition-colors ${active ? "bg-red-500 text-white shadow-md" : "bg-white text-gray-500 border border-gray-100"}`}>
      <span className="text-xl mb-1">{icon}</span>
      <span className={`text-[11px] font-bold ${active ? "text-white" : "text-gray-600"}`}>{title}</span>
    </div>
  )
}

function GameCard({ title, desc, imgColor, time, onClick }: { title: string, desc: string, imgColor: string, time: string, onClick?: () => void }) {
  return (
    <div 
        className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-start active:scale-95 transition-transform cursor-pointer relative overflow-hidden"
        onClick={onClick}
    >
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${imgColor} flex items-center justify-center text-white font-bold text-lg mb-2 shadow-inner`}>
            {title.substring(0,2)}
        </div>
        <h4 className="font-bold text-gray-800 text-sm mb-0.5">{title}</h4>
        <span className="text-[10px] text-gray-400 mb-2 truncate w-full">{desc}</span>
        <div className="bg-gray-50 text-gray-500 text-[9px] px-2 py-1 rounded w-full font-medium truncate text-center border border-gray-100">
            {time}
        </div>
    </div>
  )
}

function WinningRow({ user, amount, game }: { user: string, amount: string, game: string }) {
    return (
        <div className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-xs">
                    👤
                </div>
                <div>
                   <div className="text-xs font-bold text-gray-700">{user}</div>
                   <div className="text-[10px] text-gray-400">Received</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-green-600 font-bold">{amount}</div>
                <div className="text-[10px] text-gray-400">{game}</div>
            </div>
        </div>
    )
}
