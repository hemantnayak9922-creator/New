import React, { useState } from 'react';
import { X, CheckCircle2, ChevronDown, BadgeIndianRupee, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
}

export default function WithdrawModal({ isOpen, onClose, balance }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank'>('upi');
  const { user } = useAuth();
  
  // UPI fields
  const [upiId, setUpiId] = useState('');
  
  // Bank fields
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100 || Number(amount) > balance) return;
    
    if (withdrawMethod === 'upi' && !upiId) return;
    if (withdrawMethod === 'bank' && (!accountNumber || !ifscCode)) return;

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), { balance: increment(-Number(amount)) });
      } catch (err) {
        console.error("Failed to withdraw", err);
      }
    }

    // Process withdrawal
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setAmount('');
      setUpiId('');
      setAccountNumber('');
      setIfscCode('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-800">Withdraw Funds</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 active:scale-95 transition-transform">
             <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto w-full no-scrollbar">
          {isSuccess ? (
             <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
               <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
               <h3 className="text-xl font-bold text-gray-800 mb-1">Withdrawal Requested</h3>
               <p className="text-gray-500 text-sm">Your request is being processed.</p>
             </div>
          ) : (
             <form onSubmit={handleWithdraw} className="space-y-5">
                <div className="bg-red-50 p-4 rounded-2xl flex justify-between items-center border border-red-100">
                  <span className="text-red-800 font-medium text-sm">Available Balance</span>
                  <span className="font-bold text-lg text-red-600">₹{balance.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Withdrawal Amount</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-bold">₹</span>
                        </div>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount (Min ₹100)"
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-bold text-gray-800"
                            min="100"
                            max={balance}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Withdrawal Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button"
                            onClick={() => setWithdrawMethod('upi')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${withdrawMethod === 'upi' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                            <BadgeIndianRupee size={24} className="mb-1" />
                            <span className="font-bold text-xs">UPI</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setWithdrawMethod('bank')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${withdrawMethod === 'bank' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                            <CreditCard size={24} className="mb-1" />
                            <span className="font-bold text-xs">Bank Transfer</span>
                        </button>
                    </div>
                </div>

                {withdrawMethod === 'upi' ? (
                    <div className="space-y-2 animate-in slide-in-from-right-4 fade-in duration-300">
                        <label className="text-sm font-bold text-gray-700">UPI ID</label>
                        <input 
                            type="text" 
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. user@okhdfcbank"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            required={withdrawMethod === 'upi'}
                        />
                    </div>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Account Number</label>
                            <input 
                                type="text" 
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="Enter Bank Account Number"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                required={withdrawMethod === 'bank'}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">IFSC Code</label>
                            <input 
                                type="text" 
                                value={ifscCode}
                                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                placeholder="Enter IFSC Code"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all uppercase"
                                required={withdrawMethod === 'bank'}
                            />
                        </div>
                    </div>
                )}

                <button 
                  type="submit"
                  disabled={!amount || Number(amount) < 100 || Number(amount) > balance || (withdrawMethod === 'upi' ? !upiId : (!accountNumber || !ifscCode))}
                  className="w-full bg-red-500 text-white rounded-xl py-3.5 font-bold shadow-md shadow-red-500/30 hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none mt-2"
                >
                  Withdraw ₹{amount || '0'}
                </button>
             </form>
          )}
        </div>
      </div>
    </div>
  );
}
