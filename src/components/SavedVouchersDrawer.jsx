import React, { useState } from 'react';
import { X, Search, Trash2, ExternalLink, Calendar, FileText, BookmarkCheck } from 'lucide-react';

export const SavedVouchersDrawer = ({ isOpen, onClose, savedVouchers, onLoadVoucher, onDeleteVoucher, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = savedVouchers.filter(v => 
    v.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.recipientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.voucherValue?.toString().includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl text-slate-800">
        
        {/* DRAWER HEADER */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Saved Vouchers Library</h3>
              <p className="text-xs text-slate-300">{savedVouchers.length} vouchers stored</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search serial no, amount, or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* VOUCHERS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">No saved vouchers found</p>
              <p className="text-xs text-slate-400 mt-1">Generated vouchers will appear here automatically</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div 
                key={item.id || item.voucherNo}
                className="bg-white hover:bg-slate-50 p-3.5 rounded-xl border border-slate-200 transition flex items-center justify-between shadow-sm group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900 text-sm">{item.voucherNo}</span>
                    <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded border border-amber-300">
                      ₹{Number(item.voucherValue).toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  {(item.recipientName || item.recipientPhone) && (
                    <p className="text-xs text-slate-600 font-medium italic">
                      To: {item.recipientName || '-'} {item.recipientPhone ? `(${item.recipientPhone})` : ''}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Valid: {item.validUntil}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onLoadVoucher(item);
                      onClose();
                    }}
                    className="p-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg transition"
                    title="Load onto canvas"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteVoucher(item.id || item.voucherNo)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DRAWER FOOTER */}
        {savedVouchers.length > 0 && (
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition"
            >
              Clear All Stored Vouchers
            </button>
            <span className="text-xs text-slate-500">Auto-saved in local browser</span>
          </div>
        )}

      </div>
    </div>
  );
};
