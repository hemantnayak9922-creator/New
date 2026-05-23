import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import RechargeModal from "../components/RechargeModal";
import WithdrawModal from "../components/WithdrawModal";
import { useAuth } from "../context/AuthContext";

export default function Wallet() {
  const { balance } = useAuth();
  const [activeTab, setActiveTab] = useState<"transactions" | "betHistory">("transactions");
  const [betHistoryFilter, setBetHistoryFilter] = useState<"All" | "Win Go">("All");
  const [expandedBetId, setExpandedBetId] = useState<string | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const betHistory = [
    { id: "TX1092", game: "Win Go 3Min", amount: 50.00, result: "Win", profit: 98.00, time: "2023-10-25 14:32:01", selection: "Green", period: "2023102510002" },
    { id: "TX1093", game: "Win Go 1Min", amount: 100.00, result: "Loss", profit: -100.00, time: "2023-10-25 14:28:15", selection: "Big", period: "2023102510003" },
  ];

  const filteredHistory = betHistoryFilter === "All" ? betHistory : betHistory.filter(b => b.game.startsWith(betHistoryFilter));
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 py-3 flex items-center justify-center sticky top-0 z-40 border-b border-gray-100">
        <span className="font-bold text-lg text-gray-800">Wallet</span>
      </div>

      <div className="px-4 py-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg shadow-red-500/20 mb-6">
            <div className="flex items-center gap-2 mb-2">
                <WalletIcon size={20} className="opacity-80" />
                <span className="text-sm font-medium opacity-90">Total Balance</span>
            </div>
            <div className="text-3xl font-bold mb-4 tracking-tight">₹{(balance || 0).toFixed(2)}</div>
            
            <div className="flex gap-3">
                <button 
                  onClick={() => setIsRechargeOpen(true)}
                  className="flex-1 bg-white text-red-600 font-bold py-2.5 rounded-xl shadow-sm text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <ArrowDownCircle size={18} />
                    Recharge
                </button>
                <button 
                  onClick={() => setIsWithdrawOpen(true)}
                  className="flex-1 bg-white/20 text-white border border-white/30 font-bold py-2.5 rounded-xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <ArrowUpCircle size={18} />
                    Withdraw
                </button>
            </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
            <div className="flex flex-col items-center flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <span className="text-[10px] text-gray-500 mb-1">Total Recharge</span>
                <span className="font-bold text-gray-800 text-sm">₹0.00</span>
            </div>
             <div className="flex flex-col items-center flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <span className="text-[10px] text-gray-500 mb-1">Total Withdraw</span>
                <span className="font-bold text-gray-800 text-sm">₹0.00</span>
            </div>
        </div>

        {/* Toggle Tabs */}
        <div className="flex gap-2 mb-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button 
                onClick={() => setActiveTab("transactions")}
                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'transactions' ? 'bg-red-50 text-red-600 shadow-sm' : 'bg-transparent text-gray-500'}`}
            >
                Transactions
            </button>
            <button 
                onClick={() => setActiveTab("betHistory")}
                className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'betHistory' ? 'bg-red-50 text-red-600 shadow-sm' : 'bg-transparent text-gray-500'}`}
            >
                Bet History
            </button>
        </div>
        
        {activeTab === 'transactions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-2">
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Clock size={40} className="mb-2 opacity-50 text-gray-300" strokeWidth={1.5} />
                    <span className="text-sm font-medium">No Data Available</span>
                    <span className="text-xs text-gray-400">Transactions will appear here</span>
                </div>
            </div>
        )}

        {activeTab === 'betHistory' && (
            <div className="mt-2">
                <div className="flex gap-2 mb-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                    {['All', 'Win Go'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setBetHistoryFilter(filter as any)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${betHistoryFilter === filter ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-50 text-gray-500'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((bet) => (
                            <div key={bet.id} className="p-3">
                                <div 
                                    className="flex justify-between items-center mb-1 cursor-pointer active:scale-[0.99] transition-transform" 
                                    onClick={() => setExpandedBetId(expandedBetId === bet.id ? null : bet.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-gray-800">{bet.game}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">#{bet.period}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${bet.result === 'Win' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                        {bet.result}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                    <span>{bet.time}</span>
                                    <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono">ID: {bet.id}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-medium">Bet Amount</span>
                                        <span className="text-xs font-bold text-gray-700">₹{bet.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 font-medium">{bet.result === 'Win' ? 'Profit' : 'Loss'}</span>
                                        <span className={`text-xs font-bold ${bet.result === 'Win' ? 'text-green-600' : 'text-red-500'}`}>
                                            {bet.profit > 0 ? '+' : ''}{bet.profit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {expandedBetId === bet.id && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Selection</span>
                                        <span className="font-bold text-gray-800 px-2 py-1 bg-white rounded shadow-sm">{bet.selection}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <Clock size={40} className="mb-2 opacity-50 text-gray-300" strokeWidth={1.5} />
                            <span className="text-sm font-medium">No Bets Found</span>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      <RechargeModal isOpen={isRechargeOpen} onClose={() => setIsRechargeOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} balance={balance} />
    </div>
  );
}
