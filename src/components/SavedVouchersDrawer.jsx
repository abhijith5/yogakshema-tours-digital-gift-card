import React, { useState } from 'react';
import { X, Search, Trash2, ExternalLink, Calendar, FileText, BookmarkCheck, Save, CheckCircle2 } from 'lucide-react';

export const SavedVouchersDrawer = ({ 
  isOpen, 
  onClose, 
  savedVouchers, 
  currentVoucher,
  onSaveCurrentVoucher,
  onLoadVoucher, 
  onDeleteVoucher, 
  onClearAll 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const currentNo = (currentVoucher?.voucherNo || '').trim().toUpperCase();
  const isAlreadySaved = currentNo && savedVouchers.some(
    v => (v.voucherNo || '').trim().toUpperCase() === currentNo
  );

  const filtered = savedVouchers.filter(v => 
    v.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.recipientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.voucherValue?.toString().includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full sm:max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl text-slate-800">
        
        {/* DRAWER HEADER */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Saved Vouchers Library</h3>
              <p className="text-[11px] sm:text-xs text-slate-300">{savedVouchers.length} vouchers stored in Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SAVE ACTIVE VOUCHER OPTION */}
        {currentVoucher && onSaveCurrentVoucher && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 flex-wrap">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 block">Active Voucher on Canvas:</span>
              <span className="font-mono font-black text-xs text-blue-900">{currentVoucher.voucherNo} (₹{Number(currentVoucher.voucherValue || 0).toLocaleString('en-IN')})</span>
            </div>
            {isAlreadySaved ? (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center gap-1 shadow-sm" title="Already present in database (Unique constraint)">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved in DB
              </span>
            ) : (
              <button
                onClick={() => onSaveCurrentVoucher(currentVoucher)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-lg shadow transition flex items-center gap-1.5"
                title="Save this unique voucher directly to MongoDB Database"
              >
                <Save className="w-3.5 h-3.5" /> Save to Database
              </button>
            )}
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 sm:top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search serial no, amount, or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* VOUCHERS LIST */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">No saved vouchers found</p>
              <p className="text-xs text-slate-400 mt-1">Vouchers saved in database will appear here</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSavedInDB = Boolean(item._id);
              return (
                <div 
                  key={item._id || item.id || item.voucherNo}
                  className="bg-white hover:bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 transition flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 shadow-sm group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-blue-900 text-xs sm:text-sm">{item.voucherNo}</span>
                      <span className="text-[11px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded border border-amber-300">
                        ₹{Number(item.voucherValue).toLocaleString('en-IN')}
                      </span>
                      {isSavedInDB && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DB
                        </span>
                      )}
                    </div>
                    
                    {(item.recipientName || item.recipientPhone) && (
                      <p className="text-[11px] sm:text-xs text-slate-600 font-medium italic truncate">
                        To: {item.recipientName || '-'} {item.recipientPhone ? `(${item.recipientPhone})` : ''}
                      </p>
                    )}

                    <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Valid: {item.validUntil}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end xs:self-center shrink-0">
                    <button
                      onClick={() => onSaveCurrentVoucher(item)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-extrabold transition flex items-center gap-1 shadow-sm ${
                        isSavedInDB 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400'
                      }`}
                      title={isSavedInDB ? 'Already saved in database' : 'Save to database'}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavedInDB ? 'Saved' : 'Save'}</span>
                    </button>

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
              );
            })
          )}
        </div>

        {/* DRAWER FOOTER */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
          {savedVouchers.length > 0 ? (
            <button
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition"
            >
              Clear All
            </button>
          ) : <div></div>}
          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Synced with MongoDB
          </span>
        </div>

      </div>
    </div>
  );
};
