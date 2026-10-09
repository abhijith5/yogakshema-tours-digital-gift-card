import React, { useState } from 'react';
import { Compass, Lock, User, Key, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { verifyAdminPasswordAPI } from '../services/api';

export const LoginPage = ({ onLoginSuccess, storedPassword }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const validPassword = storedPassword || 'admin123';
      const apiResult = await verifyAdminPasswordAPI(password);

      if (username.trim() === 'admin' && (password === validPassword || apiResult === true)) {
        onLoginSuccess();
        navigate('/');
      } else {
        setError('Invalid credentials. Default: admin / admin123');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
        
        {/* LOGIN HEADER */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-3 sm:mb-4 font-black shadow-lg shadow-amber-500/30">
            <Compass className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black font-montserrat tracking-tight">YOGAKSHEMA</h1>
          <p className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-widest mt-1">Travel Voucher Application</p>
          <p className="text-xs text-slate-400 mt-2">Sign in to access Designer Studio & Admin Portal</p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4 bg-white">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 sm:top-3 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-base sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3.5 sm:top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-base sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-amber-400/70 disabled:to-amber-500/70 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1 flex-wrap">
              <Lock className="w-3 h-3 text-amber-600 shrink-0" /> Default: Username: <code className="font-bold text-slate-800">admin</code> | Password: <code className="font-bold text-slate-800">admin123</code>
            </span>
          </div>

        </form>

      </div>
    </div>
  );
};
