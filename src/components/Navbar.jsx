import React, { useState } from 'react';
import { 
  Compass, 
  ShieldCheck, 
  LayoutDashboard,
  LogOut,
  QrCode,
  BookmarkCheck,
  Save,
  Menu,
  X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navbar = ({ onLogout, onOpenScanModal, onOpenLibrary, onSaveToLibrary, savedCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname === '/admin';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 shadow-sm text-slate-800">
      <div className="flex items-center justify-between">
        
        {/* BRAND & ROUTE TABS */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-montserrat">
                  YOGAKSHEMA
                </h1>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 sm:px-2 py-0.5 rounded border border-amber-300">
                  Studio
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden xs:block">
                Digital & Print Voucher Application
              </p>
            </div>
          </div>

          {/* DESKTOP ROUTE NAVIGATION TABS */}
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

        {/* RIGHT ACTIONS FOR DESKTOP & TABLET */}
        <div className="hidden lg:flex items-center gap-2.5">
          {onSaveToLibrary && (
            <button
              onClick={onSaveToLibrary}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 flex items-center gap-1.5 transition"
              title="Save current voucher directly to database with unique serial check"
            >
              <Save className="w-4 h-4 text-amber-600" />
              <span>Save to DB</span>
            </button>
          )}

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
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-sm"
            title="Sign out of application"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" /> Sign Out
          </button>
        </div>

        {/* MOBILE / SMALL SCREEN ICON BUTTONS & HAMBURGER */}
        <div className="flex lg:hidden items-center gap-1.5">
          {onOpenLibrary && (
            <button
              onClick={onOpenLibrary}
              className="p-2 bg-slate-100 text-slate-800 rounded-lg border border-slate-250 relative"
              title="Saved Vouchers"
            >
              <BookmarkCheck className="w-4 h-4 text-amber-600" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center">
                {savedCount}
              </span>
            </button>
          )}

          {onOpenScanModal && (
            <button
              onClick={onOpenScanModal}
              className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold shadow-sm"
              title="Scan Printed Card"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 bg-slate-100 rounded-lg border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-2 animate-fadeIn">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                !isAdminPath 
                  ? 'bg-amber-500/15 text-amber-900 border border-amber-300' 
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-600" /> Designer Studio Canvas
            </button>

            <button
              onClick={() => {
                navigate('/admin');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                isAdminPath 
                  ? 'bg-amber-500/15 text-amber-900 border border-amber-300' 
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Portal (/admin)
            </button>

            {onSaveToLibrary && (
              <button
                onClick={() => {
                  onSaveToLibrary();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-amber-600" /> Save Active Voucher to DB
              </button>
            )}

            {onOpenScanModal && (
              <button
                onClick={() => {
                  onOpenScanModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-amber-600" /> Scan or Track Printed Card
              </button>
            )}

            <button
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-2.5 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-2 mt-1"
            >
              <LogOut className="w-4 h-4 text-red-500" /> Sign Out
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
