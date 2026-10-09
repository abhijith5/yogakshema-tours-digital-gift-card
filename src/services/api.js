const RENDER_BACKEND_URL = 'https://yogakshema-tours-digital-gift-card.onrender.com';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : (import.meta.env.DEV ? '' : RENDER_BACKEND_URL);

const API_BASE = `${BASE_URL}/api`;

/**
 * Health check
 */
export async function checkHealthAPI() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok' && data.database === 'connected';
  } catch (err) {
    return false;
  }
}

/**
 * Fetch system config from MongoDB
 */
export async function fetchConfigAPI() {
  try {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return await res.json();
  } catch (err) {
    console.warn('API fetchConfig fallback to local:', err.message);
    return null;
  }
}

/**
 * Update system config in MongoDB
 */
export async function updateConfigAPI(configData) {
  try {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
    if (!res.ok) throw new Error('Failed to update config');
    return await res.json();
  } catch (err) {
    console.warn('API updateConfig error:', err.message);
    return null;
  }
}

/**
 * Verify admin password via API
 */
export async function verifyAdminPasswordAPI(password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    return null; // fallback to local check
  }
}

/**
 * Fetch all vouchers from MongoDB
 */
export async function fetchVouchersAPI() {
  try {
    const res = await fetch(`${API_BASE}/vouchers`);
    if (!res.ok) throw new Error('Failed to fetch vouchers');
    return await res.json();
  } catch (err) {
    console.warn('API fetchVouchers fallback to local:', err.message);
    return null;
  }
}

/**
 * Check if voucher number exists in MongoDB database
 */
export async function checkVoucherExistsAPI(voucherNo) {
  try {
    const cleanNo = (voucherNo || '').trim().toUpperCase();
    if (!cleanNo) return false;
    const res = await fetch(`${API_BASE}/vouchers/check/${encodeURIComponent(cleanNo)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.exists === true;
  } catch (err) {
    console.warn('API checkVoucherExists error:', err.message);
    return false;
  }
}

/**
 * Fetch next available serial number and counter for a specific prefix from MongoDB
 */
export async function fetchNextSerialAPI(prefix = 'YYT-D-') {
  try {
    const res = await fetch(`${API_BASE}/vouchers/next-serial?prefix=${encodeURIComponent(prefix)}`);
    if (!res.ok) throw new Error('Failed to fetch next serial');
    return await res.json();
  } catch (err) {
    console.warn('API fetchNextSerial fallback:', err.message);
    return null;
  }
}


/**
 * Save single or batch vouchers to MongoDB
 */
export async function saveVoucherAPI(voucherOrArray, checkUnique = false) {
  try {
    const url = checkUnique ? `${API_BASE}/vouchers?checkUnique=true` : `${API_BASE}/vouchers`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucherOrArray)
    });
    if (res.status === 409) {
      const errData = await res.json();
      return { success: false, isDuplicate: true, error: errData.error };
    }
    if (!res.ok) throw new Error('Failed to save voucher');
    return await res.json();
  } catch (err) {
    console.warn('API saveVoucher error:', err.message);
    return null;
  }
}

/**
 * Update voucher status (e.g. active -> redeemed or cancelled)
 */
export async function updateVoucherStatusAPI(id, status) {
  try {
    const redeemedAt = status === 'redeemed' ? new Date().toLocaleDateString('en-GB') : null;
    const res = await fetch(`${API_BASE}/vouchers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, redeemedAt })
    });
    if (!res.ok) throw new Error('Failed to update voucher status');
    return await res.json();
  } catch (err) {
    console.warn('API updateVoucherStatus error:', err.message);
    return null;
  }
}

/**
 * Delete a single voucher from MongoDB
 */
export async function deleteVoucherAPI(id) {
  try {
    const res = await fetch(`${API_BASE}/vouchers/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete voucher');
    return await res.json();
  } catch (err) {
    console.warn('API deleteVoucher error:', err.message);
    return null;
  }
}

/**
 * Clear all vouchers from MongoDB
 */
export async function clearAllVouchersAPI() {
  try {
    const res = await fetch(`${API_BASE}/vouchers`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to clear vouchers');
    return await res.json();
  } catch (err) {
    console.warn('API clearAllVouchers error:', err.message);
    return null;
  }
}
