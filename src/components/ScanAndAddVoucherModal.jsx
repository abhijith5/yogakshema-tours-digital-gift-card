import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Keyboard, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Upload, 
  Tag, 
  IndianRupee, 
  Calendar, 
  User, 
  Phone,
  Info
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';

export const ScanAndAddVoucherModal = ({
  isOpen,
  onClose,
  savedVouchers,
  onAddVoucher
}) => {
  const [activeTab, setActiveTab] = useState('scan');
  const [scannedSerial, setScannedSerial] = useState('');
  const [voucherValue, setVoucherValue] = useState('10000');
  const [issueDate, setIssueDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const lastDay = new Date(y, m, 0).getDate();
    return `${String(lastDay).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  });
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('Pre-printed physical card');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  
  const html5QrcodeRef = useRef(null);
  const fileInputRef = useRef(null);

  const extractSerialNumber = (rawText) => {
    if (!rawText) return '';
    let text = rawText.trim();
    if (text.startsWith('http://') || text.startsWith('https://')) {
      try {
        const url = new URL(text);
        if (url.searchParams.has('sn')) return url.searchParams.get('sn');
        if (url.searchParams.has('serial')) return url.searchParams.get('serial');
        if (url.searchParams.has('v')) return url.searchParams.get('v');
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0) return parts[parts.length - 1];
      } catch (e) {}
    }
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const obj = JSON.parse(text);
        if (obj.serial) return obj.serial;
        if (obj.voucherNo) return obj.voucherNo;
      } catch (e) {}
    }
    return text;
  };

  useEffect(() => {
    if (!scannedSerial) {
      setDuplicateWarning(null);
      return;
    }
    const cleanSerial = scannedSerial.trim().toUpperCase();
    const existing = savedVouchers.find(
      v => (v.voucherNo || '').trim().toUpperCase() === cleanSerial
    );
    if (existing) {
      setDuplicateWarning(`Serial "${existing.voucherNo}" is already registered (${existing.status || 'Active'}). Saving will update item.`);
    } else {
      setDuplicateWarning(null);
    }
  }, [scannedSerial, savedVouchers]);

  const startCameraScanner = async () => {
    setScanError(null);
    setIsScanning(true);

    try {
      if (html5QrcodeRef.current) {
        try {
          await html5QrcodeRef.current.stop();
          html5QrcodeRef.current.clear();
        } catch (e) {}
      }

      const container = document.getElementById('qr-reader-container');
      if (!container) return;

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrcodeRef.current = html5QrCode;

      const qrCodeSuccessCallback = (decodedText) => {
        const serial = extractSerialNumber(decodedText);
        setScannedSerial(serial);
        
        try {
          if (navigator.vibrate) navigator.vibrate(100);
        } catch (e) {}

        setSuccessMessage(`Scanned: ${serial}`);
        html5QrCode.stop().then(() => {
          setIsScanning(false);
        }).catch(() => {
          setIsScanning(false);
        });
      };

      const config = { 
        fps: 10, 
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        () => {}
      );
    } catch (err) {
      console.error('Camera access error:', err);
      setIsScanning(false);
      setScanError('Camera access failed or permission denied. Please allow camera access in your browser or upload an image file.');
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch (e) {
      } finally {
        setIsScanning(false);
        html5QrcodeRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'scan') {
      const timer = setTimeout(() => {
        startCameraScanner();
      }, 350);
      return () => {
        clearTimeout(timer);
        stopCameraScanner();
      };
    } else {
      stopCameraScanner();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen) {
      stopCameraScanner();
      setScannedSerial('');
      setRecipientName('');
      setRecipientPhone('');
      setSuccessMessage(null);
      setDuplicateWarning(null);
    }
  }, [isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      const decodedText = await html5QrCode.scanFile(file, true);
      const serial = extractSerialNumber(decodedText);
      setScannedSerial(serial);
      setSuccessMessage(`Scanned from photo: ${serial}`);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      console.error('File scan error:', err);
      setScanError('Could not read a valid QR Code or Barcode from this photo. Please try a clearer image or type serial manually.');
    }
  };

  const handleSave = (keepOpen = false) => {
    if (!scannedSerial.trim()) {
      alert('Please enter or scan a serial number.');
      return;
    }

    const cleanSerial = scannedSerial.trim().toUpperCase();

    const newVoucher = {
      id: `pre-printed-${cleanSerial}-${Date.now()}`,
      voucherNo: cleanSerial,
      voucherValue: voucherValue || '15000',
      issueDate: issueDate,
      validUntil: validUntil,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      notes: notes.trim(),
      status: status,
      isPrePrinted: true,
      source: 'Pre-printed Physical Card',
      savedAt: new Date().toLocaleDateString('en-GB')
    };

    onAddVoucher(newVoucher);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });

    if (keepOpen) {
      setSuccessMessage(`Registered serial ${cleanSerial} successfully! Ready for next card.`);
      setScannedSerial('');
      setRecipientName('');
      setRecipientPhone('');
      setDuplicateWarning(null);
      if (activeTab === 'scan') {
        setTimeout(() => startCameraScanner(), 500);
      }
    } else {
      stopCameraScanner();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* MODAL HEADER */}
        <div className="p-3.5 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-montserrat tracking-tight">
                Track Printed Gift Cards
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300">Scan via Mobile Camera or Manually Add Serial</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE SELECTION TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-5 pt-2 sm:pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scan')}
            className={`py-2.5 sm:py-3 px-3.5 sm:px-5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeTab === 'scan'
                ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-500" /> Camera Scanner
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2.5 sm:py-3 px-3.5 sm:px-5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeTab === 'manual'
                ? 'bg-white text-blue-900 border-t-2 border-amber-500 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4 text-amber-500" /> Manual Entry
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* CAMERA SCANNER TAB CONTENT */}
          {activeTab === 'scan' && (
            <div className="space-y-3 sm:space-y-4">
              
              {/* SCANNER CAMERA BOX */}
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center">
                
                <div id="qr-reader-container" className="w-full h-full max-h-[280px]"></div>

                {!isScanning && !scanError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white space-y-2.5 bg-slate-900/90">
                    <Camera className="w-10 h-10 text-amber-400 animate-pulse" />
                    <p className="text-xs text-slate-300">Point phone camera at printed card QR / Barcode</p>
                    <button
                      onClick={startCameraScanner}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow"
                    >
                      Start Camera Scanner
                    </button>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400"></div>
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* SCANNER CONTROLS & PHOTO UPLOAD */}
              <div className="flex items-center justify-between gap-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  {isScanning ? (
                    <button
                      onClick={stopCameraScanner}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition"
                    >
                      Pause Camera
                    </button>
                  ) : (
                    <button
                      onClick={startCameraScanner}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Restart Camera
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg border border-amber-300 transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-700" /> Upload Photo
                  </button>
                </div>
              </div>

              {scanError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>
          )}

          {/* SUCCESS OR DUPLICATE ALERTS */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs font-medium border border-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* VOUCHER FORM FIELDS */}
          <div className="space-y-3.5 sm:space-y-4 pt-1">
            
            {/* SERIAL NUMBER FIELD */}
            <div>
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block mb-1">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. YTT-D-0042 or EXT-9910"
                  value={scannedSerial}
                  onChange={(e) => setScannedSerial(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-sm font-mono font-bold text-blue-900 focus:outline-none focus:border-amber-500 uppercase tracking-wider"
                  required
                />
              </div>
            </div>

            {/* VALUE & STATUS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Voucher Amount (INR)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="number"
                    value={voucherValue}
                    onChange={(e) => setVoucherValue(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-base sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 pt-1.5">
                  {['1000', '2000', '5000', '10000'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setVoucherValue(amt)}
                      className={`text-[10px] sm:text-[11px] py-1 rounded-lg border font-bold transition text-center truncate ${
                        voucherValue === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ₹{Number(amt).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Card Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="active">Active (Available)</option>
                  <option value="redeemed">Redeemed (Used)</option>
                  <option value="cancelled">Cancelled / Void</option>
                </select>
              </div>
            </div>

            {/* DATES ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Issue Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-base sm:text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Valid Until</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-base sm:text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* RECIPIENT ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Recipient Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Recipient Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* REMARKS ROW */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tag / Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Pre-printed Physical Card"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-800">
          <button
            onClick={() => handleSave(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Add & Scan Next Card
          </button>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                stopCameraScanner();
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Card
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
