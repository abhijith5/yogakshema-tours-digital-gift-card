import React, { useState, useRef, useEffect } from 'react';
import { VoucherCard } from '../components/VoucherCard';
import { VoucherForm } from '../components/VoucherForm';
import { BulkGeneratorModal } from '../components/BulkGeneratorModal';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { exportVoucherPNG, exportVoucherPDF } from '../utils/voucherExporter';
import { saveVoucherAPI } from '../services/api';
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
  QrCode,
  Save
} from 'lucide-react';

export const StudioPage = ({ 
  voucherData, 
  setVoucherData, 
  serialCounter, 
  setSerialCounter, 
  prefix, 
  setPrefix,
  seriesConfigs = [],
  seriesCounters = {},
  onSelectSeriesConfig,
  incrementToNextSerial, 
  handleResetCounter, 
  savedVouchers, 
  setSavedVouchers,
  onSaveToDatabase,
  onOpenScanModal,
  onOpenMobileModal
}) => {
  const [voucherMode, setVoucherMode] = useState('digital');
  const [zoomScale, setZoomScale] = useState(0.95);
  const [isExporting, setIsExporting] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const voucherRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Auto-fit zoom level for mobile screens
  const updateAutoZoom = () => {
    if (canvasContainerRef.current) {
      const containerWidth = canvasContainerRef.current.clientWidth - 24;
      if (containerWidth > 0 && containerWidth < 1050) {
        const fitScale = Math.min(0.95, Math.max(0.20, containerWidth / 1050));
        setZoomScale(Number(fitScale.toFixed(2)));
      } else if (containerWidth >= 1050) {
        setZoomScale(0.95);
      }
    }
  };

  useEffect(() => {
    updateAutoZoom();
    const timer = setTimeout(updateAutoZoom, 100);
    window.addEventListener('resize', updateAutoZoom);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateAutoZoom);
    };
  }, []);

  // Print Series Selector Handler (loads series config & counter directly from DB)
  const handleSelectPrintSeries = (seriesLetter, value, customPrefix) => {
    const seriesPrefix = customPrefix || `YGT-26-${seriesLetter.toUpperCase()}-`;
    if (onSelectSeriesConfig) {
      onSelectSeriesConfig(seriesPrefix, value);
    } else {
      if (setPrefix) setPrefix(seriesPrefix);
      setVoucherData(prev => ({
        ...prev,
        voucherValue: String(value)
      }));
    }
  };

  // Mode Change Handler (Digital vs Print)
  const handleModeChange = (mode) => {
    setVoucherMode(mode);
    if (mode === 'digital') {
      if (onSelectSeriesConfig) {
        onSelectSeriesConfig('YTT-D-', '10000');
      } else if (setPrefix) {
        setPrefix('YTT-D-');
      }
    } else if (mode === 'print') {
      if (!prefix || !prefix.startsWith('YGT-26-')) {
        handleSelectPrintSeries('A', '1000');
      }
    }
  };

  // Show toast notification
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Download PNG Image using HTML5 Canvas exporter with loading state
  const handleDownloadPNG = async () => {
    setIsExporting(true);
    const currentNo = voucherData.voucherNo;
    setLoadingText(`Generating High-Resolution PNG Image & Saving ${currentNo} to Database...`);

    try {
      await new Promise(r => setTimeout(r, 200));

      const newEntry = {
        ...voucherData,
        id: `voucher-${Date.now()}`,
        status: 'active',
        mode: voucherMode,
        savedAt: new Date().toLocaleDateString('en-GB')
      };
      const res = await saveVoucherAPI(newEntry);
      const savedItem = (res && res.success && res.data) ? res.data : newEntry;
      setSavedVouchers(prev => [
        savedItem,
        ...prev.filter(v => (v.voucherNo || '').trim().toUpperCase() !== (savedItem.voucherNo || '').trim().toUpperCase())
      ]);

      await exportVoucherPNG(voucherData);

      const nextNo = incrementToNextSerial();

      confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
      showToast(`Downloaded ${currentNo} PNG & saved to database (${nextNo})!`);
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
    setLoadingText(`Preparing Landscape PDF & Saving ${currentNo} to Database...`);

    try {
      await new Promise(r => setTimeout(r, 200));

      const newEntry = {
        ...voucherData,
        id: `voucher-${Date.now()}`,
        status: 'active',
        mode: voucherMode,
        savedAt: new Date().toLocaleDateString('en-GB')
      };
      const res = await saveVoucherAPI(newEntry);
      const savedItem = (res && res.success && res.data) ? res.data : newEntry;
      setSavedVouchers(prev => [
        savedItem,
        ...prev.filter(v => (v.voucherNo || '').trim().toUpperCase() !== (savedItem.voucherNo || '').trim().toUpperCase())
      ]);

      await exportVoucherPDF(voucherData);

      const nextNo = incrementToNextSerial();

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      showToast(`Downloaded ${currentNo} PDF & saved to database (${nextNo})!`);
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
  const handleBulkGenerated = async (list) => {
    const res = await saveVoucherAPI(list);
    const savedList = (res && res.success && Array.isArray(res.data)) ? res.data : list;
    setSavedVouchers(prev => [...savedList, ...prev]);
    setSerialCounter(prev => prev + list.length);
    showToast(`Generated & stored ${list.length} vouchers in database!`);
  };

  // Load selected voucher from batch list
  const handleLoadVoucher = (savedItem) => {
    setVoucherData(savedItem);
    showToast(`Loaded voucher ${savedItem.voucherNo}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      {/* FULL SCREEN LOADING OVERLAY */}
      {isExporting && <LoadingOverlay message={loadingText} />}

      {/* TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-bounce max-w-[90vw]">
          <div className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
            toastMessage.type === 'error' 
              ? 'bg-red-900 text-red-100 border-red-700' 
              : 'bg-emerald-900 text-emerald-100 border-emerald-700'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            )}
            <span className="truncate">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* VOUCHER STUDIO VIEW */}
      <main className="flex-1 flex flex-col lg:flex-row p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 max-w-[1800px] mx-auto w-full overflow-y-auto lg:overflow-hidden">
        
        {/* LEFT / CENTER: VOUCHER CANVAS PREVIEW & DOWNLOAD BAR */}
        <div 
          ref={canvasContainerRef}
          className="flex-1 bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-between shadow-sm relative overflow-x-auto min-h-0"
        >
          
          {/* CANVAS PREVIEW HEADER WITH DIGITAL / PRINT MODE TOGGLE & ZOOM */}
          <div className="w-full flex items-center justify-between mb-3 sm:mb-4 no-print flex-col sm:flex-row gap-3">
            
            {/* DIGITAL vs PRINT MODE SWITCH */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-250 shadow-inner">
                <button
                  onClick={() => handleModeChange('digital')}
                  className={`px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    voucherMode === 'digital'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Digital
                </button>

                <button
                  onClick={() => handleModeChange('print')}
                  className={`px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    voucherMode === 'print'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>

              <span className="text-[11px] sm:text-xs font-mono font-extrabold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-full truncate">
                {voucherData.voucherNo}
              </span>
            </div>

            {/* ZOOM CONTROL BUTTONS */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 sm:p-1.5 rounded-xl border border-slate-250 shadow-sm self-end sm:self-auto">
              <button
                onClick={() => setZoomScale(s => Math.max(0.25, s - 0.05))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-mono font-bold text-amber-700 min-w-[42px] text-center">
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
                onClick={updateAutoZoom}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition ml-0.5"
                title="Auto-Fit Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PRINT VOUCHER SERIES SELECTOR BAR */}
          {voucherMode === 'print' && (
            <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4 no-print flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900 self-start sm:self-auto">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>PRINT VOUCHER SERIES:</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2.5 w-full sm:w-auto sm:flex-1">
                {((seriesConfigs && seriesConfigs.filter(s => s.key !== 'digital' && s.prefix !== 'YTT-D-')) || []).length > 0 
                  ? seriesConfigs.filter(s => s.key !== 'digital' && s.prefix !== 'YTT-D-').map(s => {
                      const isActive = prefix === s.prefix;
                      const sVal = s.val || s.value || '1000';
                      return (
                        <button
                          key={s.key || s.prefix}
                          type="button"
                          onClick={() => handleSelectPrintSeries(s.key || 'A', sVal, s.prefix)}
                          className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-black transition border flex flex-col sm:flex-row items-center justify-center sm:justify-between ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                          }`}
                        >
                          <span>{s.label || `Series ${s.key}`}</span>
                          <span className="font-mono text-[10px] sm:text-[11px] opacity-90">(₹{Number(sVal).toLocaleString('en-IN')})</span>
                        </button>
                      );
                    })
                  : [
                      { letter: 'A', name: 'Series A-1000', prefixStr: 'YGT-26-A-', value: '1000' },
                      { letter: 'B', name: 'Series B-2000', prefixStr: 'YGT-26-B-', value: '2000' },
                      { letter: 'C', name: 'Series C-5000', prefixStr: 'YGT-26-C-', value: '5000' },
                    ].map(s => {
                      const isActive = prefix === s.prefixStr;
                      return (
                        <button
                          key={s.letter}
                          type="button"
                          onClick={() => handleSelectPrintSeries(s.letter, s.value, s.prefixStr)}
                          className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3.5 rounded-xl text-[11px] sm:text-xs font-black transition border flex flex-col sm:flex-row items-center justify-center sm:justify-between ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                          }`}
                        >
                          <span>{s.name}</span>
                          <span className="font-mono text-[10px] sm:text-[11px] opacity-90">(₹{Number(s.value).toLocaleString('en-IN')})</span>
                        </button>
                      );
                    })}
              </div>
            </div>
          )}

          {/* GENERATED VOUCHER CARD CANVAS */}
          <div className="flex-1 flex items-center justify-center w-full min-h-[240px] sm:min-h-[440px] overflow-x-auto py-2">
            <div 
              style={{ 
                width: `${1050 * zoomScale}px`,
                height: `${680 * zoomScale}px`,
              }}
              className="relative shrink-0 flex items-center justify-center shadow-2xl rounded-lg border border-slate-200 overflow-hidden"
            >
              <div 
                style={{ 
                  width: '1050px',
                  height: '680px',
                  transform: `scale(${zoomScale})`, 
                  transformOrigin: 'top left',
                  transition: 'transform 0.15s ease-out'
                }}
                className="absolute top-0 left-0"
              >
                <VoucherCard ref={voucherRef} voucherData={voucherData} />
              </div>
            </div>
          </div>

          {/* PROMINENT DOWNLOAD & ACTION BAR */}
          <div className="w-full mt-3 sm:mt-4 p-3 sm:p-3.5 bg-slate-900 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            
            {/* LEFT ACTIONS: DOWNLOAD PNG & PDF */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <button
                onClick={handleDownloadPNG}
                disabled={isExporting}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? 'Generating...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <FileText className="w-4 h-4 text-red-400" />}
                <span>{isExporting ? 'Preparing...' : 'Download PDF'}</span>
              </button>

              {onSaveToDatabase && (
                <button
                  onClick={() => onSaveToDatabase(voucherData)}
                  disabled={isExporting}
                  className="px-3.5 sm:px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  title="Save current voucher to database with unique serial check"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span className="hidden xs:inline">Save DB</span>
                </button>
              )}

              {onOpenMobileModal && (
                <button
                  onClick={() => onOpenMobileModal(voucherData)}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                  title="Add or share voucher directly to mobile phone"
                >
                  <Smartphone className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Add to Mobile</span>
                </button>
              )}

              {voucherMode === 'print' && (
                <button
                  onClick={handlePrint}
                  className="px-3.5 sm:px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" /> <span className="hidden xs:inline">Print</span>
                </button>
              )}
            </div>

            {/* RIGHT ACTIONS: SCAN PRINTED, GENERATE NEXT & BATCH */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              {onOpenScanModal && (
                <button
                  onClick={onOpenScanModal}
                  className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
                >
                  <QrCode className="w-4 h-4" /> <span>Scan Printed</span>
                </button>
              )}

              <button
                onClick={incrementToNextSerial}
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 flex items-center justify-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" /> <span>Next Serial</span>
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <Layers className="w-4 h-4 text-amber-400" /> <span>Batch</span>
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
            prefix={prefix}
            setPrefix={setPrefix}
            seriesConfigs={seriesConfigs}
            onSelectSeriesConfig={onSelectSeriesConfig}
            voucherMode={voucherMode}
            onSelectPrintSeries={handleSelectPrintSeries}
            onNextSerial={incrementToNextSerial}
            onResetCounter={handleResetCounter}
            onSaveToDatabase={onSaveToDatabase}
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
        savedVouchers={savedVouchers}
      />


    </div>
  );
};
