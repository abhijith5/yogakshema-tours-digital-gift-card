import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  Settings2, 
  Search, 
  Download, 
  LogOut, 
  ArrowLeft, 
  Key, 
  CheckCircle2, 
  Ban, 
  IndianRupee, 
  Layers, 
  TrendingUp, 
  RefreshCw 
} from 'lucide-react';

export const AdminPage = ({ 
  savedVouchers, 
  setSavedVouchers, 
  serialCounter, 
  setSerialCounter, 
  prefix, 
  setPrefix, 
  onLogout, 
  onReturnToStudio,
  storedPassword,
  setStoredPassword
}) => {
  const [activeTab, setActiveTab] = useState('register');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Change password form state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // Stats calculation
  const totalCount = savedVouchers.length;
  const activeCount = savedVouchers.filter(v => (v.status || 'active') === 'active').length;
  const redeemedCount = savedVouchers.filter(v => v.status === 'redeemed').length;
  const totalValue = savedVouchers.reduce((acc, v) => acc + (Number(v.voucherValue) || 0), 0);

  // Filter vouchers
  const filteredVouchers = savedVouchers.filter(v => {
    const matchesSearch = 
      v.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.voucherValue?.toString().includes(searchTerm) ||
      v.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (v.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mark voucher status
  const updateVoucherStatus = (id, newStatus) => {
    setSavedVouchers(prev => prev.map(item => {
      if ((item.id || item.voucherNo) === id) {
        return {
          ...item,
          status: newStatus,
          redeemedAt: newStatus === 'redeemed' ? new Date().toLocaleDateString('en-GB') : null
        };
      }
      return item;
    }));
  };

  // Export full voucher register to CSV
  const handleExportCSV = () => {
    if (savedVouchers.length === 0) {
      alert('No vouchers available to export.');
      return;
    }

    const headers = ['Voucher No', 'Amount (INR)', 'Issue Date', 'Valid Until', 'Status', 'Recipient', 'Redeemed Date'];
    const rows = savedVouchers.map(v => [
      `"${v.voucherNo || ''}"`,
      `"${v.voucherValue || ''}"`,
      `"${v.issueDate || ''}"`,
      `"${v.validUntil || ''}"`,
      `"${v.status || 'Active'}"`,
      `"${v.recipientName || ''}"`,
      `"${v.redeemedAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yogakshema_Vouchers_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle password change
  const handleChangePassword = (e) => {
    e.preventDefault();
    const currentValid = storedPassword || 'admin123';
    
    if (currentPass !== currentValid) {
      setPassMsg('Current password is incorrect.');
      return;
    }
    if (newPass.length < 4) {
      setPassMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg('New passwords do not match.');
      return;
    }

    setStoredPassword(newPass);
    localStorage.setItem('ytt_admin_password', newPass);
    setPassMsg('Password updated successfully!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* ADMIN TOP NAVBAR */}
      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-montserrat tracking-tight">
              Yogakshema Admin Portal
            </h1>
            <p className="text-xs text-slate-300">Voucher Register & System Configuration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToStudio}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Voucher Studio
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow"
          >
            <LogOut className="w-4 h-4" /> Logout Admin
          </button>
        </div>
      </header>

      {/* STATS OVERVIEW CARDS */}
      <div className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Total Issued */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Issued</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Active Vouchers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Vouchers</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{activeCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Redeemed Vouchers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Redeemed</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{redeemedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Total Value */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Value Issued</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalValue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* MAIN ADMIN DASHBOARD CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* TABS */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className={`py-3 px-5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
                activeTab === 'register' 
                  ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-500" /> Voucher Register Log ({savedVouchers.length})
            </button>

            <button
              onClick={() => setActiveTab('sequence')}
              className={`py-3 px-5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
                activeTab === 'sequence' 
                  ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings2 className="w-4 h-4 text-amber-500" /> Serial Counter Config
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
                activeTab === 'security' 
                  ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-4 h-4 text-amber-500" /> Admin Security
            </button>
          </div>

          {/* TAB 1: REGISTER */}
          {activeTab === 'register' && (
            <div className="p-6 space-y-4">
              
              {/* SEARCH & FILTERS */}
              <div className="flex items-center justify-between gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search serial number, amount or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
                  >
                    <Download className="w-4 h-4" /> Export Excel/CSV
                  </button>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900 text-white text-xs font-bold uppercase">
                    <tr>
                      <th className="p-3.5">Serial No</th>
                      <th className="p-3.5">Amount (INR)</th>
                      <th className="p-3.5">Issue Date</th>
                      <th className="p-3.5">Valid Until</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Redeemed Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredVouchers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                          No vouchers recorded in register yet.
                        </td>
                      </tr>
                    ) : (
                      filteredVouchers.map((v) => (
                        <tr key={v.id || v.voucherNo} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 font-mono font-bold text-blue-900">{v.voucherNo}</td>
                          <td className="p-3.5 font-extrabold text-slate-900">
                            ₹{Number(v.voucherValue).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-slate-600">{v.issueDate}</td>
                          <td className="p-3.5 text-slate-600">{v.validUntil}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              v.status === 'redeemed' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : v.status === 'cancelled'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {v.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500">{v.redeemedAt || '-'}</td>
                          <td className="p-3.5 text-right space-x-1.5">
                            {v.status !== 'redeemed' && (
                              <button
                                onClick={() => updateVoucherStatus(v.id || v.voucherNo, 'redeemed')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg border border-emerald-200 transition"
                              >
                                Mark Redeemed
                              </button>
                            )}
                            {v.status !== 'cancelled' && (
                              <button
                                onClick={() => updateVoucherStatus(v.id || v.voucherNo, 'cancelled')}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] rounded-lg border border-red-200 transition"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: SEQUENCE CONFIG */}
          {activeTab === 'sequence' && (
            <div className="p-8 max-w-xl mx-auto w-full space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-amber-500" /> Serial Counter Configuration
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Serial Prefix
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-blue-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                    placeholder="YTT-D-"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Format preview: <code className="font-mono text-amber-600 font-bold">{prefix}0001</code>
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Next Counter Number
                  </label>
                  <input
                    type="number"
                    value={serialCounter}
                    onChange={(e) => setSerialCounter(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Reset sequence back to #1:</span>
                  <button
                    onClick={() => setSerialCounter(1)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
                  >
                    Reset Counter to 1
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN SECURITY */}
          {activeTab === 'security' && (
            <div className="p-8 max-w-md mx-auto w-full">
              <form onSubmit={handleChangePassword} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" /> Change Admin Password
                </h4>

                {passMsg && (
                  <div className="p-3 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {passMsg}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Update Admin Password
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
