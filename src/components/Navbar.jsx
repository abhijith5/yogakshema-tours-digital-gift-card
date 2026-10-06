import React from 'react';
import { 
  Compass, 
  ShieldCheck, 
  LayoutDashboard,
  LogOut,
  QrCode,
  BookmarkCheck
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navbar = ({ onLogout, onOpenScanModal, onOpenLibrary, savedCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname === '/admin';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm text-slate-800">
      
      {/* BRAND & ROUTE TABS */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 font-montserrat">
                YOGAKSHEMA
              </h1>
              <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                Voucher Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Digital & Print Voucher Application
            </p>
          </div>
        </div>

        {/* ROUTE NAVIGATION TABS */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-250">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              !isAdminPath 
                ? 'bg-white text-blue-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" /> Designer Studio
          </button>

          <button
            onClick={() => navigate('/admin')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              isAdminPath 
                ? 'bg-white text-blue-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Admin Portal (/admin)
          </button>
        </div>
      </div>

      {/* RIGHT ACTIONS: SAVED LIBRARY, SCAN & SIGN OUT */}
      <div className="flex items-center gap-3">
        {onOpenLibrary && (
          <button
            onClick={onOpenLibrary}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-250 flex items-center gap-1.5 transition"
            title="View all saved vouchers in database"
          >
            <BookmarkCheck className="w-4 h-4 text-amber-600" />
            <span>Saved Vouchers</span>
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-black">
              {savedCount}
            </span>
          </button>
        )}

        {onOpenScanModal && (
          <button
            onClick={onOpenScanModal}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
            title="Scan or enter pre-printed gift card serial numbers"
          >
            <QrCode className="w-4 h-4" /> Scan Printed Card
          </button>
        )}

        <button
          onClick={onLogout}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-sm"
          title="Sign out of application"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" /> Sign Out
        </button>
      </div>

    </header>
  );
};
