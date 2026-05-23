import { Copy } from "lucide-react";

export default function Promotion() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-8">
      <div className="bg-red-500 pt-6 pb-20 px-5 text-white">
        <h1 className="text-center font-bold text-xl mb-4">Agency Promotion</h1>
        <div className="text-center font-medium opacity-90 text-sm">Total Bonus</div>
        <div className="text-center text-4xl font-bold mt-1">₹0.00</div>
      </div>

      <div className="px-4 -mt-10 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100 flex gap-4 divide-x divide-gray-100">
           <div className="flex-1">
               <div className="text-[11px] text-gray-500 font-medium mb-1">Direct Subordinates</div>
               <div className="font-bold text-gray-800 text-lg">0</div>
           </div>
           <div className="flex-1">
               <div className="text-[11px] text-gray-500 font-medium mb-1">Team Subordinates</div>
               <div className="font-bold text-gray-800 text-lg">0</div>
           </div>
        </div>
      </div>

      <div className="px-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
              <div className="text-sm font-bold text-gray-800 mb-2">Invitation Link</div>
              <div className="flex gap-2">
                 <input type="text" value="https://jalwaclub4.com/#/register?invite=XYZ123" readOnly className="flex-1 bg-gray-50 border border-gray-200 rounded-lg text-xs px-3 focus:outline-none text-gray-500" />
                 <button className="bg-red-500 text-white p-2.5 rounded-lg active:scale-95 transition-transform flex items-center justify-center shadow-sm">
                    <Copy size={16} />
                 </button>
              </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl opacity-50">📊</span>
              </div>
              <span className="font-medium text-gray-400 text-sm">No subordinate data</span>
          </div>
      </div>
    </div>
  );
}
