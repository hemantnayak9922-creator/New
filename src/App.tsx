/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import Activity from "./pages/Activity";
import Promotion from "./pages/Promotion";
import Wallet from "./pages/Wallet";
import Account from "./pages/Account";
import WinGo from "./pages/WinGo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-full flex justify-center items-center"><Loader2 className="animate-spin text-red-500" /></div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
        <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl flex flex-col">
          <div className="flex-1 overflow-y-auto pb-[72px] scrollbar-hide">
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} />
              <Route path="/promotion" element={<PrivateRoute><Promotion /></PrivateRoute>} />
              <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
              <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
              <Route path="/wingo" element={<PrivateRoute><WinGo /></PrivateRoute>} />
            </Routes>
          </div>
          {user && <BottomNav />}
        </div>
      </div>
    </BrowserRouter>
  );
}
