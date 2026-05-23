import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Activity() {
  const [activeTab, setActiveTab] = useState<"promotions" | "analytics">("promotions");

  const analyticsData = [
    { name: 'Wins', value: 45, color: '#10B981' }, // emerald-500
    { name: 'Losses', value: 30, color: '#EF4444' } // red-500
  ];

  const totalBets = analyticsData.reduce((acc, curr) => acc + curr.value, 0);
  const winRate = totalBets > 0 ? ((analyticsData[0].value / totalBets) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 py-3 flex items-center justify-center sticky top-0 z-40 border-b border-gray-100 flex-col">
        <span className="font-bold text-lg text-gray-800 mb-3">Activity Center</span>
        
        {/* Tabs */}
        <div className="w-full flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('promotions')}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'promotions' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}
          >
            Promotions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {activeTab === 'promotions' && (
          <>
            <ActivityCard 
                title="First Deposit Bonus" 
                desc="Deposit for the first time and get up to ₹1,000 extra bonus instantly!" 
                color="bg-gradient-to-br from-orange-400 to-red-500" 
                icon="🎁"
            />
            <ActivityCard 
                title="Daily Check-in" 
                desc="Sign in daily to claim your free cash rewards. Don't break the streak!" 
                color="bg-gradient-to-br from-blue-400 to-indigo-500" 
                icon="📅"
            />
            <ActivityCard 
                title="VIP Rewards" 
                desc="Level up your VIP status for weekly salaries and exclusive perks." 
                color="bg-gradient-to-br from-yellow-400 to-amber-500" 
                icon="👑"
            />
             <ActivityCard 
                title="Rebate Event" 
                desc="Earn up to 1.5% fixed rebates on every single bet you place." 
                color="bg-gradient-to-br from-emerald-400 to-teal-500" 
                icon="💸"
            />
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-full">
            <h3 className="font-bold text-gray-800 text-base mb-4 border-l-4 border-red-500 pl-2">Game Analytics</h3>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">Total Bets</div>
                <div className="text-lg font-bold text-gray-800">{totalBets}</div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">Win Rate</div>
                <div className="text-lg font-bold text-emerald-500">{winRate}%</div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {analyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Data shown represents your all-time betting activity.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityCard({ title, desc, color, icon }: { title: string, desc: string, color: string, icon: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer">
            <div className={`w-16 h-16 shrink-0 rounded-xl ${color} flex items-center justify-center text-3xl shadow-inner`}>
                {icon}
            </div>
            <div className="flex flex-col justify-center">
                <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
                <p className="text-[11px] text-gray-500 leading-tight">{desc}</p>
            </div>
        </div>
    )
}
