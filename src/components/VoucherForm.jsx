import React, { useState } from 'react';
import { 
  FileText, 
  RotateCcw, 
  Sparkles, 
  Calendar, 
  IndianRupee, 
  PlusCircle, 
  SlidersHorizontal,
  User,
  Phone,
  Save
} from 'lucide-react';

export const VoucherForm = ({ 
  voucherData, 
  setVoucherData, 
  serialCounter, 
  setSerialCounter, 
  prefix,
  setPrefix,
  voucherMode = 'digital',
  onSelectPrintSeries,
  onNextSerial, 
  onResetCounter,
  onSaveToDatabase
}) => {
  const [activeAdjustField, setActiveAdjustField] = useState('f1');

  const handleChange = (field, value) => {
    setVoucherData(prev => ({ ...prev, [field]: value }));
  };

  const handleOverlayChange = (key, value) => {
    setVoucherData(prev => ({
      ...prev,
      overlayConfig: {
        ...prev.overlayConfig,
        [key]: value
      }
    }));
  };

  const resetAllOffsets = () => {
    setVoucherData(prev => ({
      ...prev,
      overlayConfig: {
        ...prev.overlayConfig,
        f1X: 0, f1Y: 0,
        f2X: 0, f2Y: 0,
        f3X: 0, f3Y: 0,
        f4X: 0, f4Y: 0,
        f5X: 0, f5Y: 0
      }
    }));
  };

  // Set issue date to today
  const setTodayIssueDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formatted = `${day}/${month}/${year}`;
    handleChange('issueDate', formatted);
    setValidityMonths(12, formatted);
  };

  // Calculate Expiry Date based on duration in months — snaps to the LAST DAY of the target month
  const setValidityMonths = (months, baseIssueDate = voucherData.issueDate) => {
    if (!baseIssueDate) return;
    const parts = baseIssueDate.split('/');
    if (parts.length < 3) return;
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (!month || !year) return;

    const totalMonths = (month - 1) + months;
    const targetYear = year + Math.floor(totalMonths / 12);
    const targetMonth = (totalMonths % 12) + 1;

    const lastDay = new Date(targetYear, targetMonth, 0).getDate();

    const formattedValidUntil = `${String(lastDay).padStart(2, '0')}/${String(targetMonth).padStart(2, '0')}/${targetYear}`;
    handleChange('validUntil', formattedValidUntil);
  };

  const overlayConfig = voucherData.overlayConfig || {
    fontSize: 18,
    fontColor: '#0a2c66',
    fontWeight: '800',
    fontFamily: 'Montserrat, sans-serif',
    f1X: 0, f1Y: 0,
    f2X: 0, f2Y: 0,
    f3X: 0, f3Y: 0,
    f4X: 0, f4Y: 0
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-full text-slate-800">
      
      {/* FORM HEADER */}
      <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide">Voucher Inputs</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300">
              {voucherMode === 'print' ? 'Print Mode: YGT-26-Series' : 'Digital Mode'}
            </p>
          </div>
        </div>
        {onSaveToDatabase && (
          <button
            type="button"
            onClick={() => onSaveToDatabase(voucherData)}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-black rounded-lg shadow flex items-center gap-1.5 transition shrink-0"
            title="Save current coupon directly to MongoDB Database"
          >
            <Save className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden xs:inline">Save Coupon</span>
          </button>
        )}
      </div>

      {/* FORM INPUTS */}
      <div className="p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
        
        {/* FIELD 1: VOUCHER NO (AUTO INCREMENTING) */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-amber-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" /> 1. Voucher Serial No.
            </label>
            <button
              type="button"
              onClick={onNextSerial}
              className="text-[11px] text-slate-950 font-bold bg-amber-500 hover:bg-amber-400 px-2.5 py-1 rounded flex items-center gap-1 transition shadow-sm"
            >
              <PlusCircle className="w-3 h-3" /> Next No.
            </button>
          </div>

          <input
            type="text"
            value={voucherData.voucherNo}
            onChange={(e) => handleChange('voucherNo', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-base text-blue-900 font-mono font-black focus:outline-none focus:border-amber-500"
            placeholder="YTT-D-0001"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Counter: #{serialCounter}</span>
            <button
              type="button"
              onClick={onResetCounter}
              className="text-amber-700 hover:text-amber-800 font-semibold underline"
            >
              Reset (#1)
            </button>
          </div>
        </div>

        {/* FIELD 2: VOUCHER VALUE */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-amber-600" /> 2. Voucher Value (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-black text-sm">₹</span>
            <input
              type="number"
              value={voucherData.voucherValue}
              onChange={(e) => handleChange('voucherValue', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-base text-slate-900 font-black focus:outline-none focus:border-amber-500"
              placeholder="10000"
            />
          </div>

          {/* PRINT MODE SERIES BUTTONS vs DIGITAL DENOMINATION BUTTONS */}
          {voucherMode === 'print' ? (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-amber-900 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Select Print Voucher Series (YGT-26-Series):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { letter: 'A', label: 'Series A', prefixStr: 'YGT-26-A-', val: '1000' },
                  { letter: 'B', label: 'Series B', prefixStr: 'YGT-26-B-', val: '2000' },
                  { letter: 'C', label: 'Series C', prefixStr: 'YGT-26-C-', val: '5000' },
                ].map(series => {
                  const isActive = prefix === series.prefixStr;
                  return (
                    <button
                      key={series.letter}
                      type="button"
                      onClick={() => onSelectPrintSeries && onSelectPrintSeries(series.letter, series.val)}
                      className={`p-1.5 sm:p-2 rounded-xl border text-center font-bold transition text-xs flex flex-col items-center justify-center gap-0.5 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow ring-2 ring-amber-400/50 font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs">{series.label}</span>
                      <span className="text-[9px] sm:text-[10px] font-mono opacity-80">₹{Number(series.val).toLocaleString('en-IN')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-slate-500 font-semibold block">Select Digital Denomination or Custom:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {['1000', '2000', '5000', '10000'].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleChange('voucherValue', amt)}
                    className={`text-[11px] sm:text-xs px-1.5 sm:px-2.5 py-1.5 rounded-lg border font-bold transition text-center truncate ${
                      voucherData.voucherValue === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ₹{Number(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FIELD 3: DATE OF ISSUE */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" /> 3. Date of Issue
            </label>
            <button
              type="button"
              onClick={setTodayIssueDate}
              className="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 transition font-bold"
            >
              Set Today
            </button>
          </div>
          <input
            type="text"
            value={voucherData.issueDate}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('issueDate', val);
              if (val && val.split('/').length === 3) {
                setValidityMonths(12, val);
              }
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-base sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500 font-mono"
            placeholder="DD/MM/YYYY"
          />
        </div>

        {/* FIELD 4: VALID UNTIL */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" /> 4. Valid Until
          </label>
          <input
            type="text"
            value={voucherData.validUntil}
            onChange={(e) => handleChange('validUntil', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-base sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500 font-mono"
            placeholder="DD/MM/YYYY"
          />

          {/* Quick Validity Duration Options */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            {[
              { label: '+3 Mos', m: 3 },
              { label: '+6 Mos', m: 6 },
              { label: '+1 Yr', m: 12 },
              { label: '+2 Yrs', m: 24 }
            ].map(item => (
              <button
                key={item.m}
                type="button"
                onClick={() => setValidityMonths(item.m)}
                className="py-1 text-[10px] sm:text-[11px] bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded text-slate-700 transition font-medium text-center truncate"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* FIELD 5: RECIPIENT NAME & CONTACT NUMBER */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" /> 5. Recipient Name (Optional)
            </label>
            <input
              type="text"
              value={voucherData.recipientName || ''}
              onChange={(e) => handleChange('recipientName', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-base sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" /> 6. Recipient Phone (Optional)
            </label>
            <input
              type="tel"
              value={voucherData.recipientPhone || ''}
              onChange={(e) => handleChange('recipientPhone', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-base sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500 font-mono"
              placeholder="e.g. +91 9876543210"
            />
          </div>
        </div>

        {/* INDIVIDUAL PER-FIELD SEPARATE POSITION ADJUSTMENTS */}
        <div className="pt-2 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" /> Separate Field Positions
            </h4>
          </div>

          {/* FIELD SELECTOR TABS */}
          <div className="grid grid-cols-4 gap-1 bg-slate-200 p-1 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveAdjustField('f1')}
              className={`py-1 rounded text-center transition truncate ${
                activeAdjustField === 'f1' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. No.
            </button>
            <button
              type="button"
              onClick={() => setActiveAdjustField('f2')}
              className={`py-1 rounded text-center transition truncate ${
                activeAdjustField === 'f2' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Val
            </button>
            <button
              type="button"
              onClick={() => setActiveAdjustField('f3')}
              className={`py-1 rounded text-center transition truncate ${
                activeAdjustField === 'f3' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Iss
            </button>
            <button
              type="button"
              onClick={() => setActiveAdjustField('f4')}
              className={`py-1 rounded text-center transition truncate ${
                activeAdjustField === 'f4' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4. Exp
            </button>
          </div>

          {/* ACTIVE FIELD X & Y SLIDERS */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-blue-900 border-b pb-1 truncate">
              Adjusting: {
                activeAdjustField === 'f1' ? 'Serial No.' :
                activeAdjustField === 'f2' ? 'Value (₹)' :
                activeAdjustField === 'f3' ? 'Issue Date' :
                'Valid Until'
              }
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-semibold">
                  Vertical (Y): {overlayConfig[`${activeAdjustField}Y`] || 0}px
                </label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={overlayConfig[`${activeAdjustField}Y`] || 0}
                  onChange={(e) => handleOverlayChange(`${activeAdjustField}Y`, Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1 font-semibold">
                  Horizontal (X): {overlayConfig[`${activeAdjustField}X`] || 0}px
                </label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={overlayConfig[`${activeAdjustField}X`] || 0}
                  onChange={(e) => handleOverlayChange(`${activeAdjustField}X`, Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* GLOBAL FONT & COLOR */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">
                Font Size ({overlayConfig.fontSize || 18}px)
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={overlayConfig.fontSize || 18}
                onChange={(e) => handleOverlayChange('fontSize', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={overlayConfig.fontColor || '#0a2c66'}
                  onChange={(e) => handleOverlayChange('fontColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-300 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-700">{overlayConfig.fontColor || '#0a2c66'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={resetAllOffsets}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded bg-white border border-slate-200 transition font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Positions
        </button>

        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Position Controls
        </span>
      </div>

    </div>
  );
};
