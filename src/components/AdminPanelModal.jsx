import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileSpreadsheet, 
  Search, 
  Download, 
  Settings2
} from 'lucide-react';

export const AdminPanelModal = ({ 
  isOpen, 
  onClose, 
  savedVouchers, 
  setSavedVouchers, 
  serialCounter, 
  setSerialCounter, 
  prefix, 
  setPrefix
}) => {
  const [activeTab, setActiveTab] = useState('register');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!isOpen) return null;

  const filteredVouchers = savedVouchers.filter(v => {
    const matchesSearch = 
      v.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.voucherValue?.toString().includes(searchTerm) ||
      v.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.recipientPhone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (v.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleExportCSV = () => {
    if (savedVouchers.length === 0) {
      alert('No vouchers available to export.');
      return;
    }

    const headers = ['Voucher No', 'Amount (INR)', 'Issue Date', 'Valid Until', 'Status', 'Recipient Name', 'Contact Number', 'Redeemed Date'];
    const rows = savedVouchers.map(v => [
      `"${v.voucherNo || ''}"`,
      `"${v.voucherValue || ''}"`,
      `"${v.issueDate || ''}"`,
      `"${v.validUntil || ''}"`,
      `"${v.status || 'Active'}"`,
      `"${v.recipientName || ''}"`,
      `"${v.recipientPhone || ''}"`,
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] shadow-2xl flex flex-col overflow-hidden text-slate-800">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Admin Management Panel</h3>
              <p className="text-[11px] sm:text-xs text-slate-300">Voucher register & sequence settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ADMIN TABS HEADER */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 sm:px-6 gap-2 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('register')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-lg transition flex items-center gap-2 shrink-0 ${
              activeTab === 'register' 
                ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" /> Voucher Register ({savedVouchers.length})
          </button>

          <button
            onClick={() => setActiveTab('sequence')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-lg transition flex items-center gap-2 shrink-0 ${
              activeTab === 'sequence' 
                ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-4 h-4 text-amber-500" /> Serial Counter Settings
          </button>
        </div>

        {/* TAB 1: VOUCHER REGISTER / LOGS */}
        {activeTab === 'register' && (
          <div className="flex-1 p-3.5 sm:p-6 flex flex-col overflow-hidden space-y-4">
            
            {/* SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search serial number, amount or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none flex-1 sm:flex-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="redeemed">Redeemed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Export Excel</span>
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Serial No</th>
                    <th className="p-3">Value (INR)</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Valid Until</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        No vouchers recorded in register yet.
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((v) => (
                      <tr key={v.id || v.voucherNo} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-bold text-blue-900">{v.voucherNo}</td>
                        <td className="p-3 font-extrabold text-slate-900">
                          ₹{Number(v.voucherValue).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-slate-600">{v.issueDate}</td>
                        <td className="p-3 text-slate-600">{v.validUntil}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            v.status === 'redeemed' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : v.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {v.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {v.status !== 'redeemed' && (
                            <button
                              onClick={() => updateVoucherStatus(v.id || v.voucherNo, 'redeemed')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded border border-emerald-200"
                              title="Mark as Redeemed"
                            >
                              Mark Redeemed
                            </button>
                          )}
                          {v.status !== 'cancelled' && (
                            <button
                              onClick={() => updateVoucherStatus(v.id || v.voucherNo, 'cancelled')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] rounded border border-red-200"
                              title="Cancel Voucher"
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

        {/* TAB 2: SERIAL COUNTER & PREFIX CONFIG */}
        {activeTab === 'sequence' && (
          <div className="p-4 sm:p-6 space-y-6 max-w-xl mx-auto w-full overflow-y-auto">
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-500" /> Serial Prefix & Auto-Counter Settings
              </h4>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Serial Prefix Format
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base sm:text-sm text-blue-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                  placeholder="YTT-D-"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Example: <code className="font-mono text-amber-600">{prefix}0001</code>
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Next Serial Counter Number
                </label>
                <input
                  type="number"
                  value={serialCounter}
                  onChange={(e) => setSerialCounter(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base sm:text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">Reset to #1:</span>
                <button
                  onClick={() => setSerialCounter(1)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
                >
                  Reset Counter to 1
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-4 sm:px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">Yogakshema Tours & Travels Pvt Ltd</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition shrink-0"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
