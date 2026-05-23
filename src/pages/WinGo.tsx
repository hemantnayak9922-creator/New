import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, History, Volume2, VolumeX, Wallet, RefreshCw, Loader2, Trophy, XCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BettingModal from "../components/BettingModal";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, increment, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function WinGo() {
  const navigate = useNavigate();
  const { isMuted, toggleMute, playWinSound } = useSettings();
  const { user, balance } = useAuth();
  const [activeTime, setActiveTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [fullPeriod, setFullPeriod] = useState("");
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState("Green");
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingBets, setPendingBets] = useState<{ id?: string, period: string, selection: string, amount: number }[]>([]);
  const [betResult, setBetResult] = useState<{ type: 'win' | 'loss' | 'mixed', won: number, loss: number, period: string } | null>(null);
  const [historyTab, setHistoryTab] = useState<'game' | 'my'>('game');
  const [myBets, setMyBets] = useState<any[]>([]);

  const userBalance = balance;

  useEffect(() => {
    if (!user) {
      setMyBets([]);
      return;
    }
    const q = query(
      collection(db, "users", user.uid, "bets"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bets: any[] = [];
      snapshot.forEach((doc) => {
        bets.push({ id: doc.id, ...doc.data() });
      });
      setMyBets(bets);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (gameHistory.length > 0 && pendingBets.length > 0) {
      const latestPeriod = gameHistory[0];
      const hasActionableBets = pendingBets.some(b => b.period <= String(latestPeriod.p));
      if (!hasActionableBets) return;

      const matchingBets = pendingBets.filter(b => String(b.period) === String(latestPeriod.p));
      
      let wonAmount = 0;
      let lossAmount = 0;
      matchingBets.forEach(bet => {
        const resultNum = latestPeriod.n;
        const resultColor = latestPeriod.c;
        const resultSize = latestPeriod.r;
        
        let isWin = false;
        if (bet.selection === String(resultNum)) isWin = true;
        else if (bet.selection === 'Green' && (resultColor.includes('green') || (resultColor.includes('purple') && resultNum === 5))) isWin = true; 
        else if (bet.selection === 'Red' && (resultColor.includes('red') || (resultColor.includes('purple') && resultNum === 0))) isWin = true;
        else if (bet.selection === 'Violet' && resultColor.includes('purple')) isWin = true;
        else if (bet.selection === resultSize) isWin = true;
        
        if (isWin) {
           wonAmount += bet.amount;
           if (user && bet.id) updateDoc(doc(db, "users", user.uid, "bets", bet.id), { status: "win", resultAmount: bet.amount * 2 }).catch(console.error);
        } else {
           lossAmount += bet.amount;
           if (user && bet.id) updateDoc(doc(db, "users", user.uid, "bets", bet.id), { status: "loss", resultAmount: 0 }).catch(console.error);
        }
      });

      if (wonAmount > 0 && lossAmount === 0) {
        setBetResult({ type: 'win', won: wonAmount * 2, loss: 0, period: latestPeriod.p });
        setTimeout(() => setBetResult(null), 3500);
        playWinSound();
        if (user) updateDoc(doc(db, "users", user.uid), { balance: increment(wonAmount * 2) }).catch(console.error);
      } else if (wonAmount === 0 && lossAmount > 0) {
        setBetResult({ type: 'loss', won: 0, loss: lossAmount, period: latestPeriod.p });
        setTimeout(() => setBetResult(null), 3500);
      } else if (wonAmount > 0 && lossAmount > 0) {
        setBetResult({ type: 'mixed', won: wonAmount * 2, loss: lossAmount, period: latestPeriod.p });
        setTimeout(() => setBetResult(null), 3500);
        playWinSound();
        if (user) updateDoc(doc(db, "users", user.uid), { balance: increment(wonAmount * 2) }).catch(console.error);
      }

      setPendingBets(prev => prev.filter(b => b.period > String(latestPeriod.p)));
    }
  }, [gameHistory, pendingBets, playWinSound, user]);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "";
      if (activeTime === 30) url = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json";
      else if (activeTime === 60) url = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
      else if (activeTime === 180) url = "https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json";
      else url = "https://draw.ar-lottery01.com/WinGo/WinGo_5M/GetHistoryIssuePage.json";

      const res = await fetch(`${url}?ts=${Date.now()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const list = data?.data?.list || data?.data || data?.list || [];
      
      if (Array.isArray(list) && list.length > 0) {
        setGameHistory(list.map((item: any, idx: number) => {
            const n = parseInt(item.openNumber || item.number || Math.floor(Math.random() * 10), 10);
            return {
                p: item.issueNumber || item.issue || item.period || `2024000${idx}`,
                n: n,
                r: item.size || item.type || (n < 5 ? "Small" : "Big"),
                c: (n === 0 || n === 5) ? "bg-purple-500" : (n % 2 === 0 ? "bg-red-500" : "bg-green-500"),
                tc: (n === 0 || n === 5) ? "text-purple-500" : (n % 2 === 0 ? "text-red-500" : "text-green-500")
            };
        }).slice(0, 10));
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.log("Using fallback history data", err);
      const currentPeriodNum = fullPeriod ? parseInt(fullPeriod.slice(-4)) : 100;
      const mapped = Array.from({ length: 10 }).map((_, i) => {
        const n = Math.floor(Math.random() * 10);
        return {
           p: currentPeriodNum > i ? (currentPeriodNum - i - 1) : 100 - i,
           n: n,
           r: n < 5 ? "Small" : "Big",
           c: (n === 0 || n === 5) ? "bg-purple-500" : (n % 2 === 0 ? "bg-red-500" : "bg-green-500"),
           tc: (n === 0 || n === 5) ? "text-purple-500" : (n % 2 === 0 ? "text-red-500" : "text-green-500")
        };
      });
      setGameHistory(mapped);
    } finally {
      setIsLoading(false);
    }
  }, [activeTime, fullPeriod]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const updatePeriodAndTimer = () => {
      const now = new Date();

      const current_hour = now.getUTCHours();
      const current_minute = now.getUTCMinutes();
      const current_second = now.getUTCSeconds();

      const elapsed_seconds = current_hour * 3600 + current_minute * 60 + current_second;

      // Live betting period is completed periods + 1
      const elapsedPeriods = Math.floor(elapsed_seconds / activeTime) + 1;
      const remainingSeconds = activeTime - (elapsed_seconds % activeTime);

      const yyyy = now.getUTCFullYear();
      const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(now.getUTCDate()).padStart(2, '0');
      const formatted_date = `${yyyy}${mm}${dd}`;

      // API Period Suffix calculation
      let typePrefix = 1;
      if (activeTime === 30) typePrefix = 5;
      else if (activeTime === 60) typePrefix = 1;
      else if (activeTime === 180) typePrefix = 2;
      else if (activeTime === 300) typePrefix = 3;

      const paddedPeriods = String(elapsedPeriods).padStart(4, "0");
      const currentFullPeriod = `${formatted_date}1000${typePrefix}${paddedPeriods}`;

      setTimeLeft(remainingSeconds);
      setFullPeriod(currentFullPeriod);
    };

    updatePeriodAndTimer();
    const timer = setInterval(updatePeriodAndTimer, 1000);
    return () => clearInterval(timer);
  }, [activeTime]);

  const timeTabs = [
    { label: "Win Go 30s", val: 30, icon: "⚡" },
    { label: "Win Go 1Min", val: 60, icon: "🕐" },
    { label: "Win Go 3Min", val: 180, icon: "🕒" },
    { label: "Win Go 5Min", val: 300, icon: "🕔" }
  ];

  const handleBet = (choice: string) => {
    if (timeLeft <= 5) {
        alert("Timeout! Betting is closed for this period.");
        return;
    }
    setSelectedChoice(choice);
    setIsBetModalOpen(true);
  };

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const m1 = Math.floor(m / 10);
  const m2 = m % 10;
  const s1 = Math.floor(s / 10);
  const s2 = s % 10;

  const numColors: Record<number, string> = {
      0: "from-purple-500 to-red-500",
      1: "from-green-400 to-green-600",
      2: "from-red-400 to-red-600",
      3: "from-green-400 to-green-600",
      4: "from-red-400 to-red-600",
      5: "from-purple-500 to-green-500",
      6: "from-red-400 to-red-600",
      7: "from-green-400 to-green-600",
      8: "from-red-400 to-red-600",
      9: "from-green-400 to-green-600"
  };

  const handleBetConfirm = async (amount: number) => {
    if (user && balance >= amount) {
      try {
        await updateDoc(doc(db, "users", user.uid), { balance: increment(-amount) });
        const betDoc = await addDoc(collection(db, "users", user.uid, "bets"), {
          period: fullPeriod,
          selection: selectedChoice,
          amount,
          timer: activeTime,
          timestamp: Date.now(),
          status: "pending"
        });
        setPendingBets(prev => [...prev, { id: betDoc.id, period: fullPeriod, selection: selectedChoice, amount }]);
      } catch (err) {
        console.error("Failed to place bet", err);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 relative overflow-hidden">
      <AnimatePresence>
        {betResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className={`bg-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center border-4 w-full max-w-sm ${
                betResult.type === 'win' ? 'border-yellow-400' :
                betResult.type === 'loss' ? 'border-gray-200' : 'border-emerald-400'
              }`}
            >
              {betResult.type === 'win' && (
                <>
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Trophy size={80} className="text-yellow-500 mb-4 drop-shadow-md" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-600 mb-2">YOU WON!</h2>
                  <p className="text-sm text-gray-500 mb-2 font-medium">Period: {betResult.period}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    +₹{betResult.won.toFixed(2)}
                  </p>
                </>
              )}
              {betResult.type === 'loss' && (
                <>
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <XCircle size={80} className="text-gray-300 mb-4 drop-shadow-sm" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold text-gray-600 mb-2">BET LOST</h2>
                  <p className="text-sm text-gray-500 mb-2 font-medium">Period: {betResult.period}</p>
                  <p className="text-xl font-bold text-red-500">
                    -₹{betResult.loss.toFixed(2)}
                  </p>
                </>
              )}
              {betResult.type === 'mixed' && (
                <>
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <AlertCircle size={70} className="text-emerald-500 mb-4 drop-shadow-md" />
                  </motion.div>
                  <h2 className="text-xl font-extrabold text-emerald-600 mb-2">RESULTS IN!</h2>
                  <p className="text-sm text-gray-500 mb-4 font-medium">Period: {betResult.period}</p>
                  <div className="flex w-full justify-between gap-4 border-t border-gray-100 pt-4">
                     <div className="text-center flex-1">
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Won</div>
                        <div className="text-lg font-bold text-emerald-600">+₹{betResult.won.toFixed(2)}</div>
                     </div>
                     <div className="w-px bg-gray-100"></div>
                     <div className="text-center flex-1">
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Lost</div>
                        <div className="text-lg font-bold text-red-500">-₹{betResult.loss.toFixed(2)}</div>
                     </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-red-500 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform p-1">
            <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg tracking-wide">Win Go</h1>
        <button onClick={toggleMute} className="active:scale-90 transition-transform p-1">
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="px-4 py-4 bg-red-500 rounded-b-3xl shadow-md">
        <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
           <div>
             <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1">
                <Wallet size={14} /> Available balance
             </div>
             <div className="text-2xl font-bold text-gray-800">₹{userBalance.toFixed(2)}</div>
           </div>
           <button onClick={() => navigate("/wallet")} className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center gap-2">
             Recharge
           </button>
        </div>
      </div>

      {/* Time Tabs */}
      <div className="px-4 py-3">
         <div className="bg-white rounded-xl shadow-sm grid grid-cols-4 p-1">
            {timeTabs.map(t => (
               <button
                 key={t.val}
                 onClick={() => setActiveTime(t.val)}
                 className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                     activeTime === t.val ? 'bg-gradient-to-b from-red-400 to-red-600 text-white shadow-md transform scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'
                 }`}
               >
                  <span className="text-xl mb-1">{t.icon}</span>
                  <span className={`text-[10px] font-bold ${activeTime === t.val ? 'text-white' : 'text-gray-400'}`}>{t.label.replace('Win Go', '')}</span>
               </button>
            ))}
         </div>
      </div>

      {/* Game Board */}
      <div className="px-4 mb-4">
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
            {timeLeft <= 5 && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 flex items-center justify-center text-white text-7xl font-bold font-mono tracking-widest transition-opacity duration-300">
                   {timeLeft}
                </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
                <div>
                   <div className="text-xs font-bold text-gray-500 mb-1 border-l-2 border-red-500 pl-2">Period</div>
                   <div className="text-sm font-bold text-gray-800 font-mono">{fullPeriod}</div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-xs font-bold text-gray-500 mb-1">Time remaining</div>
                   <div className="flex gap-1 items-center">
                       <span className="bg-gray-100 text-red-500 font-bold text-lg px-2 py-1 rounded shadow-inner font-mono">{m1}</span>
                       <span className="bg-gray-100 text-red-500 font-bold text-lg px-2 py-1 rounded shadow-inner font-mono">{m2}</span>
                       <span className="text-red-500 font-bold text-lg">:</span>
                       <span className="bg-gray-100 text-red-500 font-bold text-lg px-2 py-1 rounded shadow-inner font-mono">{s1}</span>
                       <span className="bg-gray-100 text-red-500 font-bold text-lg px-2 py-1 rounded shadow-inner font-mono">{s2}</span>
                   </div>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <button onClick={() => handleBet("Green")} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg shadow-sm shadow-green-500/30 active:scale-95 transition-transform text-sm">Green</button>
                <button onClick={() => handleBet("Violet")} className="flex-1 bg-purple-500 text-white font-bold py-3 rounded-lg shadow-sm shadow-purple-500/30 active:scale-95 transition-transform text-sm">Violet</button>
                <button onClick={() => handleBet("Red")} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg shadow-sm shadow-red-500/30 active:scale-95 transition-transform text-sm">Red</button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                <div className="grid grid-cols-5 gap-y-3 gap-x-2">
                    {[0,1,2,3,4,5,6,7,8,9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleBet(num.toString())}
                            className={`w-12 h-12 mx-auto rounded-full text-white font-bold text-xl shadow-md flex items-center justify-center active:scale-90 transition-transform bg-gradient-to-br ${numColors[num]}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
                <button onClick={() => handleBet("Big")} className="flex-1 border-2 border-yellow-400 text-yellow-600 bg-yellow-50 font-bold py-3 rounded-lg active:scale-95 transition-transform shadow-sm">Big</button>
                <button onClick={() => handleBet("Small")} className="flex-1 border-2 border-blue-400 text-blue-600 bg-blue-50 font-bold py-3 rounded-lg active:scale-95 transition-transform shadow-sm">Small</button>
            </div>
         </div>
      </div>

      {/* History Sections */}
      <div className="px-4 mt-6 mb-4">
          <div className="flex bg-white rounded-xl shadow-sm p-1 mb-4 border border-gray-100">
             <button
                onClick={() => setHistoryTab('game')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${historyTab === 'game' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
             >
                Game History
             </button>
             <button
                onClick={() => setHistoryTab('my')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${historyTab === 'my' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
             >
                My History
             </button>
          </div>

          {historyTab === 'game' ? (
             <>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 text-sm">Latest Results</h3>
                    <button onClick={fetchHistory} disabled={isLoading} className="text-xs font-bold text-gray-400 flex items-center gap-1 active:scale-95 transition-transform hover:text-gray-600 disabled:opacity-50">
                      <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-center text-xs">
                   <div className="flex bg-gray-50 font-bold text-gray-500 py-2 border-b border-gray-100">
                       <div className="flex-1">Period</div>
                       <div className="flex-1">Number</div>
                       <div className="flex-1">Size</div>
                       <div className="flex-1">Color</div>
                   </div>
                   {isLoading && gameHistory.length === 0 ? (
                      <div className="py-8 flex justify-center items-center text-gray-400">
                         <Loader2 size={24} className="animate-spin" />
                      </div>
                   ) : (
                      gameHistory.map((item, idx) => {
                          const displayPeriod = String(item.p);
                          return (
                              <div key={idx} className="flex py-3 border-b border-gray-50 text-gray-700 font-medium font-mono items-center last:border-0 hover:bg-gray-50 transition-colors">
                                  <div className="flex-1">{displayPeriod}</div>
                                  <div className={`flex-1 text-base font-bold ${item.tc}`}>{item.n}</div>
                                  <div className="flex-1 text-gray-600">{item.r}</div>
                                  <div className="flex-1 flex justify-center">
                                      <span className={`w-3 h-3 rounded-full shadow-sm ${item.c}`}></span>
                                  </div>
                              </div>
                          );
                      })
                   )}
                </div>
             </>
          ) : (
             <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-center text-xs">
                   <div className="flex bg-gray-50 font-bold text-gray-500 py-2 border-b border-gray-100 px-2">
                       <div className="flex-1 text-left">Period</div>
                       <div className="flex-1">Select</div>
                       <div className="flex-1">Amount</div>
                       <div className="flex-1 text-right">Result</div>
                   </div>
                   {myBets.length === 0 ? (
                      <div className="py-8 text-gray-400 flex flex-col items-center">
                         <History size={24} className="mb-2 opacity-30" />
                         No bets found
                      </div>
                   ) : (
                      myBets.map((item, idx) => (
                          <div key={idx} className="flex py-3 border-b border-gray-50 text-gray-700 font-medium items-center last:border-0 hover:bg-gray-50 px-2">
                              <div className="flex-1 font-mono text-left">{item.period}</div>
                              <div className="flex-1">
                                 <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-600">{item.selection}</span>
                              </div>
                              <div className="flex-1 font-bold">₹{item.amount}</div>
                              <div className="flex-1 text-right">
                                  {item.status === 'win' ? (
                                      <span className="text-emerald-500 font-bold">+₹{item.resultAmount}</span>
                                  ) : item.status === 'loss' ? (
                                      <span className="text-red-500 font-bold">-₹{item.amount}</span>
                                  ) : (
                                      <span className="text-orange-500 font-bold">Pending</span>
                                  )}
                              </div>
                          </div>
                      ))
                   )}
                </div>
             </>
          )}
      </div>

      <BettingModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        onConfirm={handleBetConfirm}
        userBalance={userBalance}
        gameTitle={`Win Go ${activeTime}s`}
        selection={selectedChoice}
      />
    </div>
  );
}
