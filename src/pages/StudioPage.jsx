import React, { useState, useRef } from 'react';
import { VoucherCard } from '../components/VoucherCard';
import { VoucherForm } from '../components/VoucherForm';
import { BulkGeneratorModal } from '../components/BulkGeneratorModal';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { exportVoucherPNG, exportVoucherPDF } from '../utils/voucherExporter';
import confetti from 'canvas-confetti';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  FileText, 
  PlusCircle, 
  Smartphone, 
  Layers, 
  Loader2,
  QrCode
} from 'lucide-react';

export const StudioPage = ({ 
  voucherData, 
  setVoucherData, 
  serialCounter, 
  setSerialCounter, 
  prefix, 
  incrementToNextSerial, 
  handleResetCounter, 
  savedVouchers, 
  setSavedVouchers,
  onOpenScanModal
}) => {
  const [voucherMode, setVoucherMode] = useState('digital');
  const [zoomScale, setZoomScale] = useState(0.95);
  const [isExporting, setIsExporting] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const voucherRef = useRef(null);

  // Show toast notification
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Download PNG Image using HTML5 Canvas exporter with loading state
  const handleDownloadPNG = async () => {
    setIsExporting(true);
    const currentNo = voucherData.voucherNo;
    setLoadingText(`Generating High-Resolution PNG Image for ${currentNo}...`);

    try {
      await new Promise(r => setTimeout(r, 200)); // Allow UI to render loading state
      await exportVoucherPNG(voucherData);

      // Save to admin register
      const newEntry = {
        ...voucherData,
        id: `voucher-${Date.now()}`,
        status: 'active',
        mode: voucherMode,
        savedAt: new Date().toLocaleDateString('en-GB')
      };
      setSavedVouchers(prev => [newEntry, ...prev]);

      // AUTO INCREMENT TO NEXT SERIAL
      const nextNo = incrementToNextSerial();

      confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
      showToast(`Downloaded ${currentNo} PNG & advanced to next voucher: ${nextNo}!`);
    } catch (err) {
      console.error('Error generating PNG:', err);
      showToast('Failed to generate PNG image', 'error');
    } finally {
      setIsExporting(false);
      setLoadingText('');
    }
  };

  // Download PDF Document using HTML5 Canvas exporter with loading state
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    const currentNo = voucherData.voucherNo;
    setLoadingText(`Preparing Landscape PDF Document for ${currentNo}...`);

    try {
      await new Promise(r => setTimeout(r, 200)); // Allow UI to render loading state
      await exportVoucherPDF(voucherData);

      // Save to admin register
      const newEntry = {
        ...voucherData,
        id: `voucher-${Date.now()}`,
        status: 'active',
        mode: voucherMode,
        savedAt: new Date().toLocaleDateString('en-GB')
      };
      setSavedVouchers(prev => [newEntry, ...prev]);

      // AUTO INCREMENT TO NEXT SERIAL
      const nextNo = incrementToNextSerial();

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      showToast(`Downloaded ${currentNo} PDF & advanced to next voucher: ${nextNo}!`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Failed to generate PDF document', 'error');
    } finally {
      setIsExporting(false);
      setLoadingText('');
    }
  };

  // Print voucher
  const handlePrint = () => {
    window.print();
  };

  // Bulk generated handler
  const handleBulkGenerated = (list) => {
    setSavedVouchers(prev => [...list, ...prev]);
    setSerialCounter(prev => prev + list.length);
    showToast(`Generated ${list.length} vouchers in batch!`);
  };

  // Load selected voucher from batch list
  const handleLoadVoucher = (savedItem) => {
    setVoucherData(savedItem);
    showToast(`Loaded voucher ${savedItem.voucherNo}`);
  };

  return (
    <div className="flex-1 flex flex-col">
      
      {/* FULL SCREEN LOADING OVERLAY */}
      {isExporting && <LoadingOverlay message={loadingText} />}

      {/* TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
            toastMessage.type === 'error' 
              ? 'bg-red-900 text-red-100 border-red-700' 
              : 'bg-emerald-900 text-emerald-100 border-emerald-700'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* VOUCHER STUDIO VIEW */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 max-w-[1800px] mx-auto w-full overflow-hidden">
        
        {/* LEFT / CENTER: VOUCHER CANVAS PREVIEW & DOWNLOAD BAR */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 lg:p-6 flex flex-col items-center justify-between shadow-sm relative overflow-auto">
          
          {/* CANVAS PREVIEW HEADER WITH DIGITAL / PRINT MODE TOGGLE & ZOOM */}
          <div className="w-full flex items-center justify-between mb-4 no-print flex-wrap gap-3">
            
            {/* DIGITAL vs PRINT MODE SWITCH */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-250 shadow-inner">
                <button
                  onClick={() => setVoucherMode('digital')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    voucherMode === 'digital'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Digital Voucher
                </button>

                <button
                  onClick={() => setVoucherMode('print')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    voucherMode === 'print'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" /> Print Voucher
                </button>
              </div>

              <span className="text-xs font-mono font-extrabold bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full">
                Active: {voucherData.voucherNo}
              </span>
            </div>

            {/* ZOOM CONTROL BUTTONS */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-250 shadow-sm">
              <button
                onClick={() => setZoomScale(s => Math.max(0.4, s - 0.05))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-mono font-bold text-amber-700 min-w-[45px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                onClick={() => setZoomScale(s => Math.min(1.2, s + 0.05))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => setZoomScale(0.95)}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition ml-1"
                title="Reset Zoom Scale"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* GENERATED VOUCHER CARD CANVAS */}
          <div className="flex-1 flex items-center justify-center w-full min-h-[480px] overflow-auto py-2">
            <div 
              style={{ 
                transform: `scale(${zoomScale})`, 
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out'
              }}
              className="shadow-2xl rounded-lg border border-slate-200"
            >
              <VoucherCard ref={voucherRef} voucherData={voucherData} />
            </div>
          </div>

          {/* PROMINENT DOWNLOAD & ACTION BAR */}
          <div className="w-full mt-4 p-3.5 bg-slate-900 text-white rounded-2xl shadow-lg flex items-center justify-between flex-wrap gap-3 no-print">
            
            {/* LEFT ACTIONS: DOWNLOAD PNG & PDF */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleDownloadPNG}
                disabled={isExporting}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? 'Generating PNG...' : 'Download PNG Image'}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <FileText className="w-4 h-4 text-red-400" />}
                <span>{isExporting ? 'Preparing PDF...' : 'Download PDF'}</span>
              </button>

              {voucherMode === 'print' && (
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" /> Print Voucher
                </button>
              )}
            </div>

            {/* RIGHT ACTIONS: SCAN PRINTED, GENERATE NEXT & BATCH */}
            <div className="flex items-center gap-2">
              {onOpenScanModal && (
                <button
                  onClick={onOpenScanModal}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-4 h-4" /> Scan Printed Card
                </button>
              )}

              <button
                onClick={incrementToNextSerial}
                className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" /> Next Serial
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Layers className="w-4 h-4 text-amber-400" /> Batch Generator
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT: VOUCHER FORM CONTROLLER SIDEBAR */}
        <div className="w-full lg:w-[420px] shrink-0 no-print">
          <VoucherForm 
            voucherData={voucherData} 
            setVoucherData={setVoucherData} 
            serialCounter={serialCounter}
            setSerialCounter={setSerialCounter}
            onNextSerial={incrementToNextSerial}
            onResetCounter={handleResetCounter}
          />
        </div>

      </main>

      {/* BULK GENERATOR MODAL */}
      <BulkGeneratorModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        baseVoucherData={voucherData}
        onBulkGenerated={handleBulkGenerated}
        onLoadVoucher={handleLoadVoucher}
        currentCounter={serialCounter}
      />

    </div>
  );
};
