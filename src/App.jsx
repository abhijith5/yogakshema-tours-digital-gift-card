import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { StudioPage } from './pages/StudioPage';
import { AdminPage } from './pages/AdminPage';
import { ScanAndAddVoucherModal } from './components/ScanAndAddVoucherModal';
import { SavedVouchersDrawer } from './components/SavedVouchersDrawer';
import { AddToMobileModal } from './components/AddToMobileModal';
import { exportVoucherPNG, exportVoucherPDF } from './utils/voucherExporter';
import { getNextSerialForPrefix } from './utils/serialUtils';
import { getFileSeriesList } from './config/seriesConfig';
import confetti from 'canvas-confetti';
import { 
  fetchConfigAPI, 
  updateConfigAPI, 
  fetchVouchersAPI, 
  saveVoucherAPI,
  checkVoucherExistsAPI,
  deleteVoucherAPI,
  clearAllVouchersAPI
} from './services/api';

function AppContent() {
  const navigate = useNavigate();

  // Single Login authentication state for entire application
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('ytt_app_auth') === 'true';
  });

  // Stored password state
  const [storedPassword, setStoredPassword] = useState('admin123');

  // Modal & Drawer states
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [mobileModalVoucherData, setMobileModalVoucherData] = useState(null);

  // Saved vouchers library (stored directly in MongoDB Database)
  const [savedVouchers, setSavedVouchers] = useState([]);

  // Delete single voucher from state & MongoDB
  const handleDeleteVoucher = (id) => {
    deleteVoucherAPI(id);
    setSavedVouchers(prev => prev.filter(v => (v.id || v.voucherNo) !== id));
  };

  // Clear all vouchers from state & MongoDB
  const handleClearAllVouchers = () => {
    if (window.confirm('Are you sure you want to clear all vouchers from MongoDB database?')) {
      clearAllVouchersAPI();
      setSavedVouchers([]);
    }
  };

  // Serial counter state
  const [serialCounter, setSerialCounter] = useState(1);

  // Prefix format
  const [prefix, setPrefix] = useState('YYT-D-');

  // Stored series configurations from seriesConfig.json & MongoDB Atlas
  const [seriesConfigs, setSeriesConfigs] = useState(() => getFileSeriesList());

  // Stored per-series counters from MongoDB Atlas
  const [seriesCounters, setSeriesCounters] = useState(() => {
    const map = {};
    const fileList = getFileSeriesList();
    fileList.forEach(s => {
      map[s.prefix] = s.counter || 1;
    });
    return map;
  });

  // Format voucher number helper
  const formatVoucherNo = (num, currentPrefix = prefix) => {
    return `${currentPrefix}${String(num).padStart(4, '0')}`;
  };

  // Initial Sync from MongoDB Atlas
  useEffect(() => {
    async function syncFromMongoDB() {
      try {
        const config = await fetchConfigAPI();
        let loadedSeriesCounters = {};
        if (config) {
          if (config.adminPassword) setStoredPassword(config.adminPassword);
          if (config.seriesConfigs && Array.isArray(config.seriesConfigs)) {
            const normalizedConfigs = config.seriesConfigs.map(s => {
              if (s.key === 'digital' && s.prefix === 'YTT-D-') {
                return { ...s, prefix: 'YYT-D-' };
              }
              return s;
            });
            setSeriesConfigs(normalizedConfigs);
          }
          if (config.seriesCounters && typeof config.seriesCounters === 'object') {
            const normalizedCounters = { ...config.seriesCounters };
            if (normalizedCounters['YTT-D-'] !== undefined && normalizedCounters['YYT-D-'] === undefined) {
              normalizedCounters['YYT-D-'] = normalizedCounters['YTT-D-'];
              delete normalizedCounters['YTT-D-'];
            }
            setSeriesCounters(normalizedCounters);
            loadedSeriesCounters = normalizedCounters;
          }
        }

        // Digital mode is default on startup -> digital prefix is ALWAYS YYT-D-
        const digitalPrefix = 'YYT-D-';
        setPrefix(digitalPrefix);

        const dbVouchers = await fetchVouchersAPI();
        if (dbVouchers && Array.isArray(dbVouchers)) {
          setSavedVouchers(dbVouchers);
          const { nextCounter, nextVoucherNo } = getNextSerialForPrefix(
            digitalPrefix, 
            dbVouchers, 
            loadedSeriesCounters[digitalPrefix] || config?.serialCounter || 1,
            loadedSeriesCounters
          );
          setSerialCounter(nextCounter);
          setVoucherData(prev => ({ ...prev, voucherNo: nextVoucherNo }));
        }
      } catch (err) {
        console.error('Initial MongoDB sync error:', err);
      }
    }
    syncFromMongoDB();
  }, []);

  // Multi-device Window Focus Sync - automatically pick up vouchers generated by other devices
  useEffect(() => {
    const syncLatestVouchers = async () => {
      try {
        const dbVouchers = await fetchVouchersAPI();
        if (dbVouchers && Array.isArray(dbVouchers)) {
          setSavedVouchers(dbVouchers);
        }
      } catch (e) {
        console.warn('Window focus sync error:', e);
      }
    };

    window.addEventListener('focus', syncLatestVouchers);
    return () => window.removeEventListener('focus', syncLatestVouchers);
  }, []);

  useEffect(() => {
    updateConfigAPI({ prefix, seriesCounters, seriesConfigs });
  }, [prefix, seriesCounters, seriesConfigs]);

  useEffect(() => {
    updateConfigAPI({ serialCounter });
  }, [serialCounter]);

  useEffect(() => {
    updateConfigAPI({ adminPassword: storedPassword });
  }, [storedPassword]);

  // Initial voucher data
  const [voucherData, setVoucherData] = useState(() => ({
    voucherNo: formatVoucherNo(serialCounter),
    voucherValue: '10000',
    issueDate: new Date().toLocaleDateString('en-GB'),
    validUntil: (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const lastDay = new Date(y, m, 0).getDate();
      return `${String(lastDay).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    })(),
    recipientName: '',
    recipientPhone: '',
    overlayConfig: {
      fontSize: 18,
      fontColor: '#0a2c66',
      fontWeight: '800',
      fontFamily: 'Montserrat, sans-serif',
      f1X: 0, f1Y: 0,
      f2X: 0, f2Y: 0,
      f3X: 0, f3Y: 0,
      f4X: 0, f4Y: 0,
      f5X: 0, f5Y: 0
    }
  }));

  // Sync voucherNo when prefix, savedVouchers list or seriesCounters change
  useEffect(() => {
    const { nextCounter, nextVoucherNo } = getNextSerialForPrefix(prefix, savedVouchers, serialCounter, seriesCounters);
    setSerialCounter(nextCounter);
    setVoucherData(prev => ({
      ...prev,
      voucherNo: nextVoucherNo
    }));
  }, [prefix, savedVouchers, seriesCounters]);

  // Select Series helper: loads series config & counter directly from DB into voucher form
  const handleSelectSeriesConfig = (targetPrefix, value) => {
    setPrefix(targetPrefix);
    const { nextCounter, nextVoucherNo } = getNextSerialForPrefix(
      targetPrefix, 
      savedVouchers, 
      seriesCounters[targetPrefix] || 1,
      seriesCounters
    );
    setSerialCounter(nextCounter);
    setVoucherData(prev => ({
      ...prev,
      voucherNo: nextVoucherNo,
      voucherValue: value !== undefined ? String(value) : prev.voucherValue
    }));
  };

  // Helper to advance serial
  const incrementToNextSerial = (targetPrefix = prefix) => {
    const { nextCounter, nextVoucherNo } = getNextSerialForPrefix(targetPrefix, savedVouchers, serialCounter + 1, seriesCounters);
    setSerialCounter(nextCounter);
    setVoucherData(prev => ({
      ...prev,
      voucherNo: nextVoucherNo
    }));
    return nextVoucherNo;
  };

  // Reset counter
  const handleResetCounter = () => {
    setSerialCounter(1);
    const updatedCounters = { ...seriesCounters, [prefix]: 1 };
    setSeriesCounters(updatedCounters);
    setVoucherData(prev => ({
      ...prev,
      voucherNo: `${prefix}0001`
    }));
  };

  // Helper after saving vouchers to refresh DB vouchers & update next serial for multi-device sync
  const refreshDBAndAdvanceSerial = async () => {
    try {
      const dbVouchers = await fetchVouchersAPI();
      if (dbVouchers && Array.isArray(dbVouchers)) {
        setSavedVouchers(dbVouchers);
        const { nextCounter, nextVoucherNo } = getNextSerialForPrefix(prefix, dbVouchers, serialCounter + 1, seriesCounters);
        setSerialCounter(nextCounter);
        setVoucherData(prev => ({ ...prev, voucherNo: nextVoucherNo }));
        const updatedCounters = { ...seriesCounters, [prefix]: nextCounter };
        setSeriesCounters(updatedCounters);
        updateConfigAPI({ seriesCounters: updatedCounters, prefix, serialCounter: nextCounter });
        return nextVoucherNo;
      }
    } catch (e) {
      console.warn('Failed to refresh DB vouchers after save:', e);
    }
    return incrementToNextSerial();
  };

  // Save current voucher directly to MongoDB database with uniqueness check
  const handleSaveCurrentVoucherToDatabase = async (targetVoucher = voucherData) => {
    const cleanNo = (targetVoucher.voucherNo || '').trim().toUpperCase();
    if (!cleanNo) {
      alert('Voucher serial number is required.');
      return { success: false, message: 'Voucher serial number is required.' };
    }

    // Check if voucher number is already present in state or database
    const existsInState = savedVouchers.some(
      v => (v.voucherNo || '').trim().toUpperCase() === cleanNo
    );
    const existsInDB = await checkVoucherExistsAPI(cleanNo);

    if (existsInState || existsInDB) {
      alert(`Voucher No "${cleanNo}" is already present in the database! It will not be saved again because serial numbers must be unique.`);
      return { success: false, isDuplicate: true, message: `Voucher "${cleanNo}" is already present in database.` };
    }

    const newEntry = {
      ...targetVoucher,
      voucherNo: cleanNo,
      id: `voucher-${Date.now()}`,
      status: targetVoucher.status || 'active',
      savedAt: new Date().toLocaleDateString('en-GB')
    };

    const res = await saveVoucherAPI(newEntry, true);
    if (res && res.success) {
      const savedItem = res.data || newEntry;
      setSavedVouchers(prev => [savedItem, ...prev.filter(v => (v.voucherNo || '').trim().toUpperCase() !== cleanNo)]);
      await refreshDBAndAdvanceSerial();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
      alert(`Voucher "${cleanNo}" saved successfully to database!`);
      return { success: true, data: savedItem };
    } else if (res && res.isDuplicate) {
      alert(`Voucher No "${cleanNo}" is already present in the database! Cannot save duplicate serial number.`);
      return { success: false, isDuplicate: true };
    } else {
      alert('Failed to save voucher to database. Please check your server connection.');
      return { success: false };
    }
  };

  // Save voucher directly to database upon Add to Mobile / WhatsApp share
  const handleSaveVoucherFromMobileModal = async (voucherToSave) => {
    try {
      const cleanNo = (voucherToSave.voucherNo || '').trim().toUpperCase();
      if (!cleanNo) return { success: false };
      
      const newEntry = {
        ...voucherToSave,
        voucherNo: cleanNo,
        id: voucherToSave.id || `voucher-${Date.now()}`,
        status: voucherToSave.status || 'active',
        savedAt: voucherToSave.savedAt || new Date().toLocaleDateString('en-GB')
      };

      const res = await saveVoucherAPI(newEntry);
      const savedItem = (res && res.success && res.data) ? res.data : newEntry;
      
      setSavedVouchers(prev => [
        savedItem,
        ...prev.filter(v => (v.voucherNo || '').trim().toUpperCase() !== cleanNo)
      ]);
      
      await refreshDBAndAdvanceSerial();
      return { success: true, data: savedItem };
    } catch (err) {
      console.error('Failed to save voucher from mobile modal:', err);
      return { success: false };
    }
  };

  // Add / Update Scanned Pre-printed voucher
  const handleAddScannedVoucher = async (newVoucher) => {
    const res = await saveVoucherAPI(newVoucher);
    const savedItem = (res && res.success && res.data) ? res.data : newVoucher;
    await refreshDBAndAdvanceSerial();
  };

  // Global Download PNG handler
  const handleDownloadPNG = async () => {
    try {
      const cleanNo = (voucherData.voucherNo || '').trim().toUpperCase();
      const newEntry = {
        ...voucherData,
        voucherNo: cleanNo,
        id: `voucher-${Date.now()}`,
        status: 'active',
        savedAt: new Date().toLocaleDateString('en-GB')
      };
      const res = await saveVoucherAPI(newEntry);
      const savedItem = (res && res.success && res.data) ? res.data : newEntry;
      setSavedVouchers(prev => [
        savedItem,
        ...prev.filter(v => (v.voucherNo || '').trim().toUpperCase() !== cleanNo)
      ]);

      await exportVoucherPNG(voucherData);
      await refreshDBAndAdvanceSerial();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
    } catch (e) {
      console.error(e);
    }
  };

  // Global Download PDF handler
  const handleDownloadPDF = async () => {
    try {
      const cleanNo = (voucherData.voucherNo || '').trim().toUpperCase();
      const newEntry = {
        ...voucherData,
        voucherNo: cleanNo,
        id: `voucher-${Date.now()}`,
        status: 'active',
        savedAt: new Date().toLocaleDateString('en-GB')
      };
      const res = await saveVoucherAPI(newEntry);
      const savedItem = (res && res.success && res.data) ? res.data : newEntry;
      setSavedVouchers(prev => [
        savedItem,
        ...prev.filter(v => (v.voucherNo || '').trim().toUpperCase() !== cleanNo)
      ]);

      await exportVoucherPDF(voucherData);
      await refreshDBAndAdvanceSerial();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (e) {
      console.error(e);
    }
  };


  // Login handler
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('ytt_app_auth', 'true');
  };

  // Open Mobile Share / Add to Mobile modal
  const handleOpenMobileModal = (targetVoucher = null) => {
    setMobileModalVoucherData(targetVoucher || voucherData);
    setIsMobileModalOpen(true);
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ytt_app_auth');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* NAVBAR (Visible when authenticated) */}
      {isAuthenticated && (
        <Navbar 
          currentSerial={voucherData.voucherNo}
          onNextSerial={incrementToNextSerial}
          onLogout={handleLogout}
          onOpenScanModal={() => setIsScanModalOpen(true)}
          onOpenLibrary={() => setIsDrawerOpen(true)}
          onOpenMobileModal={() => handleOpenMobileModal(voucherData)}
          savedCount={savedVouchers.length}
          onDownloadPNG={handleDownloadPNG}
          onDownloadPDF={handleDownloadPDF}
          onPrint={() => window.print()}
          onSaveToLibrary={() => handleSaveCurrentVoucherToDatabase(voucherData)}
        />
      )}

      {/* SCAN & TRACK MODAL */}
      <ScanAndAddVoucherModal 
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        savedVouchers={savedVouchers}
        onAddVoucher={handleAddScannedVoucher}
      />

      {/* ADD TO MOBILE PHONE MODAL */}
      <AddToMobileModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        voucherData={mobileModalVoucherData || voucherData}
        onSaveToDatabase={handleSaveVoucherFromMobileModal}
      />

      {/* SAVED VOUCHERS DRAWER */}
      <SavedVouchersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        savedVouchers={savedVouchers}
        currentVoucher={voucherData}
        onSaveCurrentVoucher={handleSaveCurrentVoucherToDatabase}
        onLoadVoucher={(item) => {
          setVoucherData(item);
        }}
        onDeleteVoucher={handleDeleteVoucher}
        onClearAll={handleClearAllVouchers}
        onOpenMobileModal={handleOpenMobileModal}
      />

      {/* ROUTE DEFINITIONS */}
      <Routes>
        {/* LOGIN ROUTE */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage 
                onLoginSuccess={handleLoginSuccess}
                storedPassword={storedPassword}
              />
            )
          } 
        />

        {/* PROTECTED STUDIO ROUTE (/) */}
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <StudioPage 
                voucherData={voucherData}
                setVoucherData={setVoucherData}
                serialCounter={serialCounter}
                setSerialCounter={setSerialCounter}
                prefix={prefix}
                setPrefix={setPrefix}
                seriesConfigs={seriesConfigs}
                seriesCounters={seriesCounters}
                onSelectSeriesConfig={handleSelectSeriesConfig}
                incrementToNextSerial={incrementToNextSerial}
                handleResetCounter={handleResetCounter}
                savedVouchers={savedVouchers}
                setSavedVouchers={setSavedVouchers}
                onSaveToDatabase={handleSaveCurrentVoucherToDatabase}
                onOpenScanModal={() => setIsScanModalOpen(true)}
                onOpenMobileModal={handleOpenMobileModal}
              />
            )
          } 
        />

        {/* PROTECTED ADMIN ROUTE (/admin) */}
        <Route 
          path="/admin" 
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <AdminPage 
                savedVouchers={savedVouchers}
                setSavedVouchers={setSavedVouchers}
                serialCounter={serialCounter}
                setSerialCounter={setSerialCounter}
                prefix={prefix}
                setPrefix={setPrefix}
                seriesConfigs={seriesConfigs}
                setSeriesConfigs={setSeriesConfigs}
                seriesCounters={seriesCounters}
                setSeriesCounters={setSeriesCounters}
                onLogout={handleLogout}
                storedPassword={storedPassword}
                setStoredPassword={setStoredPassword}
                onOpenScanModal={() => setIsScanModalOpen(true)}
                onOpenMobileModal={handleOpenMobileModal}
              />
            )
          } 
        />

        {/* FALLBACK REDIRECT */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
