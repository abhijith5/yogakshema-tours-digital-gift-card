import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { StudioPage } from './pages/StudioPage';
import { AdminPage } from './pages/AdminPage';
import { ScanAndAddVoucherModal } from './components/ScanAndAddVoucherModal';
import { exportVoucherPNG, exportVoucherPDF } from './utils/voucherExporter';
import confetti from 'canvas-confetti';
import { 
  fetchConfigAPI, 
  updateConfigAPI, 
  fetchVouchersAPI, 
  saveVoucherAPI 
} from './services/api';

function AppContent() {
  const navigate = useNavigate();

  // Single Login authentication state for entire application
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('ytt_app_auth') === 'true';
  });

  // Stored password state
  const [storedPassword, setStoredPassword] = useState(() => {
    return localStorage.getItem('ytt_admin_password') || 'admin123';
  });

  // Modal state for Scanning / Tracking pre-printed cards
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Serial counter state
  const [serialCounter, setSerialCounter] = useState(() => {
    try {
      const stored = localStorage.getItem('ytt_serial_counter');
      return stored ? parseInt(stored, 10) : 1;
    } catch (e) {
      return 1;
    }
  });

  // Prefix format
  const [prefix, setPrefix] = useState(() => {
    return localStorage.getItem('ytt_serial_prefix') || 'YTT-D-';
  });

  // Initial Sync from MongoDB Atlas
  useEffect(() => {
    async function syncFromMongoDB() {
      try {
        const config = await fetchConfigAPI();
        if (config) {
          if (config.serialCounter) setSerialCounter(config.serialCounter);
          if (config.prefix) setPrefix(config.prefix);
          if (config.adminPassword) setStoredPassword(config.adminPassword);
        }
        const dbVouchers = await fetchVouchersAPI();
        if (dbVouchers && Array.isArray(dbVouchers)) {
          setSavedVouchers(dbVouchers);
        }
      } catch (err) {
        console.error('Initial MongoDB sync error:', err);
      }
    }
    syncFromMongoDB();
  }, []);

  useEffect(() => {
    localStorage.setItem('ytt_serial_prefix', prefix);
    updateConfigAPI({ prefix });
  }, [prefix]);

  useEffect(() => {
    localStorage.setItem('ytt_serial_counter', serialCounter.toString());
    updateConfigAPI({ serialCounter });
  }, [serialCounter]);

  useEffect(() => {
    localStorage.setItem('ytt_admin_password', storedPassword);
    updateConfigAPI({ adminPassword: storedPassword });
  }, [storedPassword]);

  const formatVoucherNo = (num) => {
    return `${prefix}${String(num).padStart(4, '0')}`;
  };

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

  // Sync voucherNo when serialCounter or prefix changes
  useEffect(() => {
    setVoucherData(prev => ({
      ...prev,
      voucherNo: formatVoucherNo(serialCounter)
    }));
  }, [serialCounter, prefix]);

  // Saved vouchers library
  const [savedVouchers, setSavedVouchers] = useState(() => {
    try {
      const saved = localStorage.getItem('ytt_saved_vouchers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ytt_saved_vouchers', JSON.stringify(savedVouchers));
    } catch (e) {
      console.error('Failed to save vouchers library:', e);
    }
  }, [savedVouchers]);

  // Add / Update Scanned Pre-printed voucher
  const handleAddScannedVoucher = (newVoucher) => {
    saveVoucherAPI(newVoucher);
    setSavedVouchers(prev => {
      const index = prev.findIndex(
        v => (v.voucherNo || '').trim().toUpperCase() === (newVoucher.voucherNo || '').trim().toUpperCase()
      );
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...newVoucher };
        return updated;
      }
      return [newVoucher, ...prev];
    });
  };

  // Helper to advance serial
  const incrementToNextSerial = () => {
    const nextNum = serialCounter + 1;
    setSerialCounter(nextNum);
    return formatVoucherNo(nextNum);
  };

  // Reset counter
  const handleResetCounter = () => {
    setSerialCounter(1);
  };

  // Global Download PNG handler
  const handleDownloadPNG = async () => {
    try {
      await exportVoucherPNG(voucherData);
      const newEntry = {
        ...voucherData,
        id: `voucher-${Date.now()}`,
        status: 'active',
        savedAt: new Date().toLocaleDateString('en-GB')
      };
      saveVoucherAPI(newEntry);
      setSavedVouchers(prev => [newEntry, ...prev]);
      incrementToNextSerial();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
    } catch (e) {
      console.error(e);
    }
  };

  // Global Download PDF handler
  const handleDownloadPDF = async () => {
    try {
      await exportVoucherPDF(voucherData);
      const newEntry = {
        ...voucherData,
        id: `voucher-${Date.now()}`,
        status: 'active',
        savedAt: new Date().toLocaleDateString('en-GB')
      };
      saveVoucherAPI(newEntry);
      setSavedVouchers(prev => [newEntry, ...prev]);
      incrementToNextSerial();
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
          savedCount={savedVouchers.length}
          onDownloadPNG={handleDownloadPNG}
          onDownloadPDF={handleDownloadPDF}
          onPrint={() => window.print()}
          onSaveToLibrary={() => {
            const newEntry = {
              ...voucherData,
              id: `voucher-${Date.now()}`,
              status: 'active',
              savedAt: new Date().toLocaleDateString('en-GB')
            };
            saveVoucherAPI(newEntry);
            setSavedVouchers(prev => [newEntry, ...prev]);
            incrementToNextSerial();
            confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
          }}
        />
      )}

      {/* SCAN & TRACK MODAL */}
      <ScanAndAddVoucherModal 
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        savedVouchers={savedVouchers}
        onAddVoucher={handleAddScannedVoucher}
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
                incrementToNextSerial={incrementToNextSerial}
                handleResetCounter={handleResetCounter}
                savedVouchers={savedVouchers}
                setSavedVouchers={setSavedVouchers}
                onOpenScanModal={() => setIsScanModalOpen(true)}
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
                onLogout={handleLogout}
                storedPassword={storedPassword}
                setStoredPassword={setStoredPassword}
                onOpenScanModal={() => setIsScanModalOpen(true)}
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
