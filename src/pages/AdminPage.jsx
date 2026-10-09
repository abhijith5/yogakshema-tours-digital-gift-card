import React, { useState, useEffect } from 'react';
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
  Layers, 
  TrendingUp, 
  IndianRupee,
  QrCode,
  Tag,
  Loader2,
  Save,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateVoucherStatusAPI, updateConfigAPI, fetchVouchersAPI } from '../services/api';

export const AdminPage = ({ 
  savedVouchers, 
  setSavedVouchers, 
  serialCounter, 
  setSerialCounter, 
  prefix, 
  setPrefix, 
  onLogout,
  storedPassword,
  setStoredPassword,
  onOpenScanModal,
  onOpenMobileModal
}) => {
  const [activeTab, setActiveTab] = useState('register');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Auto-sync latest vouchers from MongoDB Atlas database on page load
  const refreshVouchersFromDB = async () => {
    setIsRefreshing(true);
    try {
      const dbVouchers = await fetchVouchersAPI();
      if (dbVouchers && Array.isArray(dbVouchers)) {
        setSavedVouchers(dbVouchers);
      }
    } catch (err) {
      console.error('Failed to sync vouchers from MongoDB:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshVouchersFromDB();
  }, []);

  // Change password form state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // Stats calculation
  const totalCount = savedVouchers.length;
  const activeCount = savedVouchers.filter(v => (v.status || 'active') === 'active').length;
  const preprintedCount = savedVouchers.filter(v => v.isPrePrinted).length;
  const totalValue = savedVouchers.reduce((acc, v) => acc + (Number(v.voucherValue) || 0), 0);

  // Filter vouchers
  const filteredVouchers = savedVouchers.filter(v => {
    const matchesSearch = 
      v.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.voucherValue?.toString().includes(searchTerm) ||
      v.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.recipientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (v.status || 'active') === statusFilter;
    const matchesSource = sourceFilter === 'all' || 
      (sourceFilter === 'preprinted' && v.isPrePrinted) ||
      (sourceFilter === 'digital' && !v.isPrePrinted);

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Mark voucher status
  const updateVoucherStatus = (id, newStatus) => {
    updateVoucherStatusAPI(id, newStatus);
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

    const headers = ['Voucher No', 'Amount (INR)', 'Issue Date', 'Valid Until', 'Status', 'Type', 'Recipient Name', 'Contact Number', 'Remarks/Notes', 'Redeemed Date'];
    const rows = savedVouchers.map(v => [
      `"${v.voucherNo || ''}"`,
      `"${v.voucherValue || ''}"`,
      `"${v.issueDate || ''}"`,
      `"${v.validUntil || ''}"`,
      `"${v.status || 'Active'}"`,
      `"${v.isPrePrinted ? 'Pre-printed Card' : 'Digital Studio'}"`,
      `"${v.recipientName || ''}"`,
      `"${v.recipientPhone || ''}"`,
      `"${v.notes || ''}"`,
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

  // Sequence config loading states & handlers
  const [isSavingSeq, setIsSavingSeq] = useState(false);
  const [isResettingSeq, setIsResettingSeq] = useState(false);
  const [seqMsg, setSeqMsg] = useState(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const handleSaveSequenceConfig = async (e) => {
    if (e) e.preventDefault();
    setIsSavingSeq(true);
    setSeqMsg(null);
    try {
      await new Promise(r => setTimeout(r, 200));
      setPrefix(prefix);
      setSerialCounter(serialCounter);
      await updateConfigAPI({ serialCounter, prefix });
      setSeqMsg({ type: 'success', text: 'Serial Counter Configuration saved & synced to MongoDB database!' });
    } catch (err) {
      setSeqMsg({ type: 'error', text: 'Failed to update configuration' });
    } finally {
      setIsSavingSeq(false);
      setTimeout(() => setSeqMsg(null), 4000);
    }
  };

  const handleResetCounterClick = async () => {
    setIsResettingSeq(true);
    setSeqMsg(null);
    try {
      await new Promise(r => setTimeout(r, 250));
      setSerialCounter(1);
      await updateConfigAPI({ serialCounter: 1, prefix });
      setSeqMsg({ type: 'success', text: 'Counter reset to #1 (0001) and saved to MongoDB!' });
    } catch (err) {
      setSeqMsg({ type: 'error', text: 'Failed to reset counter' });
    } finally {
      setIsResettingSeq(false);
      setTimeout(() => setSeqMsg(null), 4000);
    }
  };

  // Handle password change with click loading action
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const currentValid = storedPassword || 'admin123';
    
    if (currentPass !== currentValid) {
      setPassMsg({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }
    if (newPass.length < 4) {
      setPassMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsUpdatingPass(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      setStoredPassword(newPass);
      await updateConfigAPI({ adminPassword: newPass });
      setPassMsg({ type: 'success', text: 'Admin password updated & synced to MongoDB database!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      setPassMsg({ type: 'error', text: 'Failed to update password' });
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* ADMIN TOP NAVBAR */}
      <header className="bg-slate-900 text-white px-3 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-md gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-montserrat tracking-tight">
              Yogakshema Admin Portal <span className="text-xs text-amber-400 font-mono font-normal hidden xs:inline">(/admin)</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300">Voucher Register & System Configuration</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {onOpenScanModal && (
            <button
              onClick={onOpenScanModal}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-lg shadow flex items-center justify-center gap-1.5 transition"
            >
              <QrCode className="w-4 h-4" /> <span>Scan Printed</span>
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Studio</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition shadow shrink-0"
          >
            <LogOut className="w-4 h-4" /> <span>Logout</span>
          </button>
        </div>
      </header>

      {/* STATS OVERVIEW CARDS */}
      <div className="p-3 sm:p-6 max-w-[1600px] mx-auto w-full space-y-4 sm:space-y-6">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Total Registered</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Active Cards</p>
              <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{activeCount}</h3>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Printed Tracked</p>
              <h3 className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">{preprintedCount}</h3>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Total Value</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">₹{totalValue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* MAIN ADMIN DASHBOARD CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* TABS - SCROLLABLE ON MOBILE */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2 sm:pt-3 gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActiveTab('register')}
              className={`py-2.5 sm:py-3 px-3.5 sm:px-5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                activeTab === 'register' 
                  ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-500" /> Voucher Register ({savedVouchers.length})
            </button>

            <button
              onClick={() => setActiveTab('sequence')}
              className={`py-2.5 sm:py-3 px-3.5 sm:px-5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                activeTab === 'sequence' 
                  ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings2 className="w-4 h-4 text-amber-500" /> Counter Config
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-2.5 sm:py-3 px-3.5 sm:px-5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                activeTab === 'security' 
                  ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-4 h-4 text-amber-500" /> Security
            </button>
          </div>

          {/* TAB 1: REGISTER */}
          {activeTab === 'register' && (
            <div className="p-3.5 sm:p-6 space-y-4">
              
              {/* SEARCH & FILTERS */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 sm:top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search serial no, amount or recipient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-2.5 sm:px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none flex-1 sm:flex-none"
                  >
                    <option value="all">All Sources</option>
                    <option value="preprinted">Printed Cards</option>
                    <option value="digital">Digital Studio</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-2.5 sm:px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none flex-1 sm:flex-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={refreshVouchersFromDB}
                    disabled={isRefreshing}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow shrink-0 disabled:opacity-50"
                    title="Refresh and sync latest data from MongoDB Database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Syncing...' : 'Refresh DB'}</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow shrink-0"
                  >
                    <Download className="w-4 h-4" /> <span className="hidden xs:inline">Export Excel</span>
                  </button>
                </div>
              </div>

              {/* TABLE WITH HORIZONTAL SCROLL */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="bg-slate-900 text-white text-xs font-bold uppercase">
                    <tr>
                      <th className="p-3 sm:p-3.5">Serial No</th>
                      <th className="p-3 sm:p-3.5">Type / Source</th>
                      <th className="p-3 sm:p-3.5">Amount (INR)</th>
                      <th className="p-3 sm:p-3.5">Issue Date</th>
                      <th className="p-3 sm:p-3.5">Valid Until</th>
                      <th className="p-3 sm:p-3.5">Status</th>
                      <th className="p-3 sm:p-3.5">Redeemed</th>
                      <th className="p-3 sm:p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredVouchers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                          <p className="text-sm font-bold text-slate-700">No vouchers recorded in register yet.</p>
                          <p className="text-xs text-slate-500 mt-1">Create or save vouchers in Designer Studio to populate the admin panel register.</p>
                          <button
                            onClick={refreshVouchersFromDB}
                            className="mt-3 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow inline-flex items-center gap-1.5 transition"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Reload Database Records</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredVouchers.map((v) => (
                        <tr key={v.id || v.voucherNo} className="hover:bg-slate-50 transition">
                          <td className="p-3 sm:p-3.5 font-mono font-bold text-blue-900">
                            {v.voucherNo}
                            {(v.recipientName || v.recipientPhone) && (
                              <div className="text-[11px] text-slate-500 font-normal italic">
                                {v.recipientName || '-'} {v.recipientPhone ? `(${v.recipientPhone})` : ''}
                              </div>
                            )}
                          </td>
                          <td className="p-3 sm:p-3.5">
                            {v.isPrePrinted ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1 w-fit">
                                <Tag className="w-3 h-3 text-purple-600" /> Printed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 w-fit block">
                                Digital Studio
                              </span>
                            )}
                          </td>
                          <td className="p-3 sm:p-3.5 font-extrabold text-slate-900">
                            ₹{Number(v.voucherValue).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 sm:p-3.5 text-slate-600">{v.issueDate}</td>
                          <td className="p-3 sm:p-3.5 text-slate-600">{v.validUntil}</td>
                          <td className="p-3 sm:p-3.5">
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
                          <td className="p-3 sm:p-3.5 text-slate-500">{v.redeemedAt || '-'}</td>
                          <td className="p-3 sm:p-3.5 text-right space-x-1">
                            {onOpenMobileModal && (
                              <button
                                onClick={() => onOpenMobileModal(v)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg border border-amber-300 transition inline-flex items-center gap-1"
                                title="Add / Share to Mobile Phone via WhatsApp or Web Share"
                              >
                                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                                <span>Mobile</span>
                              </button>
                            )}
                            {v.status !== 'redeemed' && (
                              <button
                                onClick={() => updateVoucherStatus(v.id || v.voucherNo, 'redeemed')}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg border border-emerald-200 transition"
                              >
                                Mark Redeemed
                              </button>
                            )}
                            {v.status !== 'cancelled' && (
                              <button
                                onClick={() => updateVoucherStatus(v.id || v.voucherNo, 'cancelled')}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] rounded-lg border border-red-200 transition"
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
            <div className="p-4 sm:p-8 max-w-xl mx-auto w-full space-y-6">
              <form onSubmit={handleSaveSequenceConfig} className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-5">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-amber-500" /> Serial Counter Configuration
                </h4>

                {seqMsg && (
                  <div className={`p-3.5 rounded-xl text-xs font-bold border ${
                    seqMsg.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-2' 
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {seqMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {seqMsg.text}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Serial Prefix
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-blue-900 font-mono font-bold focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    type="button"
                    onClick={handleResetCounterClick}
                    disabled={isResettingSeq || isSavingSeq}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    {isResettingSeq ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Reset Counter to 1
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingSeq || isResettingSeq}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    {isSavingSeq ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        Saving Configuration...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-amber-400" />
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ADMIN SECURITY */}
          {activeTab === 'security' && (
            <div className="p-4 sm:p-8 max-w-md mx-auto w-full">
              <form onSubmit={handleChangePassword} className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" /> Change Admin Password
                </h4>

                {passMsg && (
                  <div className={`p-3.5 rounded-xl text-xs font-bold border ${
                    passMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-2'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {passMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {passMsg.text || passMsg}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPass}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  {isUpdatingPass ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Admin Password'
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
