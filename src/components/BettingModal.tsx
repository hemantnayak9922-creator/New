import { useState, useEffect } from "react";
import { X, Minus, Plus, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (amount: number) => void;
  userBalance: number;
  gameTitle?: string;
  selection?: string;
}

const getColorThemeBg = (sel: string) => {
   if (["Green", "1", "3", "7", "9"].includes(sel)) return "bg-green-500";
   if (["Red", "2", "4", "6", "8"].includes(sel)) return "bg-red-500";
   if (["Violet", "0", "5"].includes(sel)) return "bg-purple-500";
   if (["Big"].includes(sel)) return "bg-yellow-500";
   if (["Small"].includes(sel)) return "bg-blue-500";
   return "bg-gray-800";
};

const getColorThemeText = (sel: string) => {
   if (["Green", "1", "3", "7", "9"].includes(sel)) return "text-green-500";
   if (["Red", "2", "4", "6", "8"].includes(sel)) return "text-red-500";
   if (["Violet", "0", "5"].includes(sel)) return "text-purple-500";
   if (["Big"].includes(sel)) return "text-yellow-600";
   if (["Small"].includes(sel)) return "text-blue-600";
   return "text-gray-800";
};

export default function BettingModal({ isOpen, onClose, onConfirm, userBalance, gameTitle = "Game", selection }: BettingModalProps) {
  const [betType, setBetType] = useState<string>("Green");
  const [baseAmount, setBaseAmount] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const totalBet = baseAmount * quantity;

  useEffect(() => {
    if (isOpen) {
      setError("");
      setQuantity(1);
      setBaseAmount(10);
      setBetType(selection || "Green");
      setShowFinalConfirm(false);
    }
  }, [isOpen, selection]);

  const handleInitialConfirm = () => {
    if (totalBet > userBalance) {
      setError(`Insufficient balance. You need ₹${(totalBet - userBalance).toFixed(2)} more.`);
      return;
    }
    setShowFinalConfirm(true);
  };

  const handleFinalConfirm = () => {
    if (onConfirm) {
      onConfirm(totalBet);
    } else {
      alert(`Bet placed successfully!\nGame: ${gameTitle}\nSelection: ${betType}\nAmount: ₹${totalBet.toFixed(2)}`);
    }
    setShowFinalConfirm(false);
    onClose();
  };

  const amounts = [10, 100, 1000, 10000];
  const headerColor = getColorThemeBg(betType);
  const textColor = getColorThemeText(betType);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className={`${headerColor} text-white px-4 py-3 flex justify-between items-center transition-colors duration-300`}>
              <div>
                <h3 className="font-bold text-lg">{gameTitle}</h3>
                <p className="text-xs opacity-90">Select combination to bet</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-5">
              {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-100"><AlertCircle size={16} />{error}</div>}

              {!selection ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Select Color</label>
                  <div className="flex gap-2">
                    {["Green", "Violet", "Red"].map((c) => (
                      <button key={c} onClick={() => setBetType(c)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${betType === c ? `${getColorThemeBg(c)} text-white border-transparent shadow-md scale-[1.02]` : `border-gray-100 bg-white ${getColorThemeText(c)} hover:bg-gray-50`}`}>{c}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                  <span className="text-sm font-bold text-gray-500">Selected Option:</span>
                  <span className={`text-sm font-bold px-4 py-1.5 rounded-lg text-white shadow-sm ${headerColor}`}>{selection}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Base Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {amounts.map((amt) => (
                    <button key={amt} onClick={() => setBaseAmount(amt)} className={`py-2 rounded-lg font-bold text-sm transition-all border ${baseAmount === amt ? `${headerColor} text-white border-transparent shadow-sm` : "bg-gray-50 text-gray-600 border-gray-200"}`}>{amt}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-white border border-gray-100 p-2 rounded-xl">
                <label className="text-xs font-bold text-gray-500 pl-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white transition-colors ${headerColor}`}><Minus size={16} /></button>
                  <span className="font-bold text-gray-800 w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white transition-colors ${headerColor}`}><Plus size={16} /></button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Total Bet</span>
                  <span className={`text-xl font-bold ${textColor}`}>₹{totalBet.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400">Available Balance</span>
                  <span className={`text-xs font-bold ${userBalance >= totalBet ? "text-gray-700" : "text-red-500"}`}>₹{userBalance.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleInitialConfirm} className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] ${headerColor}`}>
                Confirm Bet
              </button>
            </div>

            <AnimatePresence>
              {showFinalConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 bg-white z-10 flex flex-col p-6 items-center justify-center text-center space-y-4 rounded-t-2xl sm:rounded-2xl"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${headerColor} shadow-lg mb-2`}>
                     <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Confirm Your Bet</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to place a bet of <span className="font-bold text-gray-900">₹{totalBet.toFixed(2)}</span> on <span className="font-bold text-gray-900">{betType}</span>?
                  </p>
                  <div className="flex gap-3 w-full mt-4">
                     <button onClick={() => setShowFinalConfirm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-bold active:scale-95 transition-all hover:bg-gray-50">Cancel</button>
                     <button onClick={handleFinalConfirm} className={`flex-1 py-3 rounded-xl text-white font-bold shadow-md active:scale-95 transition-all ${headerColor}`}>Place Bet</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
