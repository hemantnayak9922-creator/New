import { useState } from "react";
import { X, ChevronRight, ArrowLeft, QrCode, Library, Smartphone, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const methods = [
  { id: "upi", name: "UPI Pay", icon: QrCode, color: "text-green-500", bg: "bg-green-50" },
  { id: "bank", name: "Bank Transfer", icon: Library, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "wallet", name: "E-Wallet", icon: Smartphone, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function RechargeModal({ isOpen, onClose }: RechargeModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('500');
  const { user } = useAuth();

  const handleClose = () => {
    setSelectedMethod(null);
    setAmount('500');
    onClose();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };
  
  const handlePaid = async () => {
    if (user && amount && Number(amount) > 0) {
      try {
        await updateDoc(doc(db, "users", user.uid), { balance: increment(Number(amount)) });
      } catch (err) {
        console.error("Failed to recharge", err);
      }
    }
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                {selectedMethod && (
                  <button onClick={() => setSelectedMethod(null)} className="p-1 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} className="text-gray-600" />
                  </button>
                )}
                <h3 className="font-bold text-lg text-gray-800">
                  {selectedMethod ? "Payment Details" : "Recharge"}
                </h3>
              </div>
              <button onClick={handleClose} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 overflow-y-auto flex-1">
              {!selectedMethod ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Recharge Amount (₹)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-bold text-gray-800 text-lg"
                      min="100"
                    />
                    <div className="flex gap-2 mt-2 py-2 overflow-x-auto no-scrollbar">
                      {['500', '1000', '2000', '5000'].map(val => (
                        <button 
                          key={val} 
                          onClick={() => setAmount(val)}
                          className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100 shrink-0"
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">Select Payment Method</p>
                    {methods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethod(m.id)}
                        disabled={!amount || Number(amount) < 100}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 active:scale-[0.98] transition-all bg-white shadow-sm disabled:opacity-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${m.bg} ${m.color}`}>
                            <m.icon size={24} />
                          </div>
                          <span className="font-bold text-gray-700">{m.name}</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* Mock QR */}
                  <div className="w-48 h-48 bg-white border-2 border-gray-100 rounded-2xl shadow-sm p-2 mb-6 flex flex-col items-center justify-center">
                    <div className="w-full h-full border-4 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
                      <QrCode size={64} className="text-gray-300" />
                      <span className="absolute text-xs font-bold text-gray-400 mt-20">Mock QR</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                    {selectedMethod === "upi" && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">UPI ID</p>
                          <p className="font-bold text-gray-800">pay@jalwaclub</p>
                        </div>
                        <button onClick={() => handleCopy("pay@jalwaclub")} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Copy size={18} />
                        </button>
                      </div>
                    )}
                    {selectedMethod === "bank" && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Account Number</p>
                            <p className="font-bold text-gray-800">2938 4920 1928</p>
                          </div>
                          <button onClick={() => handleCopy("293849201928")} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Copy size={18} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">IFSC Code</p>
                            <p className="font-bold text-gray-800">HDFC0001234</p>
                          </div>
                           <button onClick={() => handleCopy("HDFC0001234")} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Copy size={18} />
                          </button>
                        </div>
                      </>
                    )}
                    {selectedMethod === "wallet" && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Wallet Number</p>
                          <p className="font-bold text-gray-800">+91 98765 43210</p>
                        </div>
                        <button onClick={() => handleCopy("+919876543210")} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Copy size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 text-center px-4">
                    <p className="text-xs text-gray-500">
                      Please send the exact amount and save your reference number (UTR).
                      After payment, submit the UTR to complete the recharge.
                    </p>
                  </div>
                  
                  <button onClick={handlePaid} className="w-full bg-red-500 text-white font-bold py-3.5 rounded-xl shadow-md mt-6 active:scale-[0.98] transition-transform">
                    I Have Paid
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
