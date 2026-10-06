import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLogin = ({ onLoginSuccess, storedPassword }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const validPassword = storedPassword || 'admin123';

    if (username.trim() === 'admin' && password === validPassword) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Invalid username or password. Default is admin / admin123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-slate-800">
        
        {/* LOGIN HEADER */}
        <div className="bg-slate-900 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-3 font-black shadow-lg shadow-amber-500/30">
            <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h2 className="text-xl font-bold font-montserrat tracking-tight">Yogakshema Admin Portal</h2>
          <p className="text-xs text-slate-300 mt-1">Authorized personnel login required</p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <span>Log In to Admin Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-amber-500" /> Default credentials: Username: <code className="font-bold text-slate-700">admin</code> | Password: <code className="font-bold text-slate-700">admin123</code>
            </span>
          </div>

        </form>

      </div>
    </div>
  );
};
