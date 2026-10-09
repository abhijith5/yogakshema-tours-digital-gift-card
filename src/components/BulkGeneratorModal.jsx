import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Sparkles, 
  CheckCircle, 
  FileSpreadsheet, 
  Download, 
  FileText, 
  Package, 
  ExternalLink, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  exportVoucherPNG, 
  exportVoucherPDF, 
  exportBatchVouchersPDF, 
  exportBatchVouchersZIP 
} from '../utils/voucherExporter';
import { saveVoucherAPI } from '../services/api';

export const BulkGeneratorModal = ({ 
  isOpen, 
  onClose, 
  baseVoucherData, 
  onBulkGenerated, 
  onLoadVoucher,
  currentCounter = 1 
}) => {
  const [prefix, setPrefix] = useState('YTT-D-');
  const [startNum, setStartNum] = useState(currentCounter);
  const [count, setCount] = useState(10);
  const [voucherValue, setVoucherValue] = useState(baseVoucherData.voucherValue);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingBatch, setIsExportingBatch] = useState(false);
  const [exportingMessage, setExportingMessage] = useState('');
  const [generatedList, setGeneratedList] = useState([]);
  const [activeItemAction, setActiveItemAction] = useState(null);

  if (!isOpen) return null;

  const handleGenerateBatch = async () => {
    setIsGenerating(true);
    setExportingMessage(`Generating ${count} vouchers in sequence...`);
    
    await new Promise(r => setTimeout(r, 200));

    const list = [];
    const numCount = parseInt(count, 10) || 1;
    const start = parseInt(startNum, 10) || 1;

    for (let i = 0; i < numCount; i++) {
      const numStr = String(start + i).padStart(4, '0');
      const serialNo = `${prefix}${numStr}`;
      list.push({
        ...baseVoucherData,
        id: `voucher-${Date.now()}-${i}`,
        voucherNo: serialNo,
        voucherValue: voucherValue,
        createdAt: new Date().toISOString()
      });
    }

    setGeneratedList(list);
    await saveVoucherAPI(list);
    setIsGenerating(false);
    setExportingMessage('');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handleDownloadSinglePNG = async (item, index) => {
    setActiveItemAction(`png-${index}`);
    try {
      await saveVoucherAPI(item);
      await exportVoucherPNG(item);
    } catch (e) {
      console.error(e);
    } finally {
      setActiveItemAction(null);
    }
  };

  const handleDownloadSinglePDF = async (item, index) => {
    setActiveItemAction(`pdf-${index}`);
    try {
      await saveVoucherAPI(item);
      await exportVoucherPDF(item);
    } catch (e) {
      console.error(e);
    } finally {
      setActiveItemAction(null);
    }
  };

  const handleRemoveItem = (index) => {
    setGeneratedList(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadBatchPDF = async () => {
    if (generatedList.length === 0) return;
    setIsExportingBatch(true);
    setExportingMessage(`Rendering ${generatedList.length} pages into multi-page PDF... Please wait`);

    try {
      await new Promise(r => setTimeout(r, 200));
      await exportBatchVouchersPDF(generatedList);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
    } catch (e) {
      console.error(e);
      alert('Failed to generate batch PDF');
    } finally {
      setIsExportingBatch(false);
      setExportingMessage('');
    }
  };

  const handleDownloadBatchZIP = async () => {
    if (generatedList.length === 0) return;
    setIsExportingBatch(true);
    setExportingMessage(`Compressing ${generatedList.length} PNG vouchers into ZIP archive... Please wait`);

    try {
      await new Promise(r => setTimeout(r, 200));
      await exportBatchVouchersZIP(generatedList);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
    } catch (e) {
      console.error(e);
      alert('Failed to generate batch ZIP');
    } finally {
      setIsExportingBatch(false);
      setExportingMessage('');
    }
  };

  const handleSaveAllToRegister = () => {
    onBulkGenerated(generatedList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] text-slate-200">
        
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Batch Voucher Generator</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Generate & batch export vouchers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Serial Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Start Counter Number</label>
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Voucher Amount (INR ₹)</label>
            <input
              type="number"
              value={voucherValue}
              onChange={(e) => setVoucherValue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base text-amber-400 font-black focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* QUICK PRINT & DIGITAL SERIES SELECTION */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-300 block">Quick Series Presets:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Series A-1000', pfx: 'YGT-26-A-', val: '1000' },
                { name: 'Series B-2000', pfx: 'YGT-26-B-', val: '2000' },
                { name: 'Series C-5000', pfx: 'YGT-26-C-', val: '5000' },
                { name: 'Digital YTT-D', pfx: 'YTT-D-', val: voucherValue || '10000' },
              ].map(item => (
                <button
                  key={item.pfx}
                  type="button"
                  onClick={() => {
                    setPrefix(item.pfx);
                    setVoucherValue(item.val);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                    prefix === item.pfx
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-[10px] font-mono opacity-80">{item.pfx}</span>
                </button>
              ))}
            </div>
          </div>

          {/* GENERATE ACTION BUTTON */}
          <button
            onClick={handleGenerateBatch}
            disabled={isGenerating || isExportingBatch}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGenerating ? 'Generating Vouchers...' : `Generate ${count} Vouchers Now`}</span>
          </button>

          {/* EXPORT STATUS MESSAGE */}
          {isExportingBatch && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{exportingMessage}</span>
            </div>
          )}

          {/* PREVIEW GENERATED LIST & BATCH DOWNLOAD BUTTONS */}
          {generatedList.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-1">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> {generatedList.length} Vouchers Ready
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {generatedList[0]?.voucherNo} → {generatedList[generatedList.length - 1]?.voucherNo}
                </span>
              </div>

              {/* BATCH DOWNLOAD BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  onClick={handleDownloadBatchPDF}
                  disabled={isExportingBatch || isGenerating}
                  className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isExportingBatch ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <FileText className="w-4 h-4 text-red-400" />}
                  <span>Batch PDF ({generatedList.length} Pages)</span>
                </button>

                <button
                  onClick={handleDownloadBatchZIP}
                  disabled={isExportingBatch || isGenerating}
                  className="py-2.5 px-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isExportingBatch ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Package className="w-4 h-4" />}
                  <span>Batch ZIP ({generatedList.length} PNGs)</span>
                </button>
              </div>

              {/* INTERACTIVE GENERATED VOUCHERS LIST */}
              <div className="max-h-48 overflow-y-auto bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                {generatedList.map((item, index) => (
                  <div key={index} className="flex flex-col xs:flex-row items-start xs:items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 transition gap-2">
                    
                    <div className="flex items-center gap-2.5">
                      <span className="text-amber-300 font-mono font-bold">{item.voucherNo}</span>
                      <span className="text-slate-200 font-extrabold">₹{Number(item.voucherValue).toLocaleString('en-IN')}</span>
                      <span className="text-slate-400 font-mono text-[10px] hidden xs:inline">{item.validUntil}</span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end xs:self-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadSinglePNG(item, index)}
                        disabled={activeItemAction === `png-${index}`}
                        className="px-2 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded font-bold text-[11px] flex items-center gap-1 transition disabled:opacity-50"
                        title="Download PNG"
                      >
                        {activeItemAction === `png-${index}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        <span>PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSinglePDF(item, index)}
                        disabled={activeItemAction === `pdf-${index}`}
                        className="px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded font-bold text-[11px] flex items-center gap-1 transition disabled:opacity-50"
                        title="Download PDF"
                      >
                        {activeItemAction === `pdf-${index}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                        <span>PDF</span>
                      </button>

                      {onLoadVoucher && (
                        <button
                          type="button"
                          onClick={() => {
                            onLoadVoucher(item);
                            onClose();
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                          title="Load onto Studio Canvas"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition"
                        title="Remove from batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        {generatedList.length > 0 && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-850 border-t border-slate-800 flex justify-between items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={handleSaveAllToRegister}
              className="px-4 sm:px-5 py-2 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> Save All {generatedList.length} to Register
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
