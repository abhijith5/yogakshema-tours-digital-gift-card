import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Voucher } from './models/Voucher.js';
import { Config } from './models/Config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_URL = process.env.CLIENT_URL;

// Middleware
app.use(cors({
  origin: CLIENT_URL ? (CLIENT_URL.includes(',') ? CLIENT_URL.split(',').map(url => url.trim()) : CLIENT_URL) : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Helper to ensure initial config document exists in MongoDB
async function getOrCreateConfig() {
  let config = await Config.findOne({ key: 'global_config' });
  if (!config) {
    config = await Config.create({
      key: 'global_config',
      serialCounter: 1,
      prefix: 'YTT-D-',
      adminPassword: 'admin123'
    });
  }
  return config;
}

// Connect to MongoDB
if (!MONGODB_URI) {
  console.error('⚠️ WARNING: MONGODB_URI environment variable is not defined!');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('⚡ Successfully connected to MongoDB Atlas database!');
      getOrCreateConfig();
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });
}

// --- REST API ENDPOINTS ---

// 1. Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date()
  });
});

// 2. Get system config
app.get('/api/config', async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({
      serialCounter: config.serialCounter,
      prefix: config.prefix,
      adminPassword: config.adminPassword
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config', message: err.message });
  }
});

// 3. Update system config
app.post('/api/config', async (req, res) => {
  try {
    const { serialCounter, prefix, adminPassword } = req.body;
    const config = await getOrCreateConfig();
    
    if (serialCounter !== undefined) config.serialCounter = serialCounter;
    if (prefix !== undefined) config.prefix = prefix;
    if (adminPassword !== undefined) config.adminPassword = adminPassword;

    await config.save();
    res.json({
      success: true,
      serialCounter: config.serialCounter,
      prefix: config.prefix,
      adminPassword: config.adminPassword
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update config', message: err.message });
  }
});

// 4. Admin Auth Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { password } = req.body;
    const config = await getOrCreateConfig();
    const valid = config.adminPassword || 'admin123';
    
    if (password === valid) {
      res.json({ success: true, token: 'authenticated' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Auth failed', message: err.message });
  }
});

// 5. Get all vouchers
app.get('/api/vouchers', async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vouchers', message: err.message });
  }
});

// 5b. Check if voucher number already exists in database
app.get('/api/vouchers/check/:voucherNo', async (req, res) => {
  try {
    const cleanNo = req.params.voucherNo.trim().toUpperCase();
    const existing = await Voucher.findOne({ voucherNo: cleanNo });
    if (existing) {
      return res.json({ exists: true, voucher: existing });
    }
    return res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check voucher number', message: err.message });
  }
});

// 6. Save or Batch Save Vouchers (Create / Upsert)
app.post('/api/vouchers', async (req, res) => {
  try {
    const payload = req.body;
    const checkUnique = req.query.checkUnique === 'true';

    if (Array.isArray(payload)) {
      // Batch save array of vouchers
      const results = [];
      for (const item of payload) {
        const cleanNo = (item.voucherNo || '').trim().toUpperCase();
        if (!cleanNo) continue;
        const filter = item.id ? { id: item.id } : { voucherNo: cleanNo };
        const updated = await Voucher.findOneAndUpdate(
          filter,
          { ...item, voucherNo: cleanNo },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        results.push(updated);
      }
      return res.json({ success: true, count: results.length, data: results });
    } else {
      // Single voucher
      const cleanNo = (payload.voucherNo || '').trim().toUpperCase();
      if (!cleanNo) {
        return res.status(400).json({ error: 'Serial number (voucherNo) is required' });
      }

      if (checkUnique) {
        const existing = await Voucher.findOne({ voucherNo: cleanNo });
        if (existing && existing.id !== payload.id) {
          return res.status(409).json({ 
            success: false, 
            error: `Voucher number '${cleanNo}' already exists in database!`, 
            isDuplicate: true,
            existing 
          });
        }
      }

      const filter = payload.id ? { id: payload.id } : { voucherNo: cleanNo };
      const updated = await Voucher.findOneAndUpdate(
        filter,
        { ...payload, voucherNo: cleanNo },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.json({ success: true, data: updated });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to save voucher(s)', message: err.message });
  }
});

// 7. Update voucher status or fields
app.put('/api/vouchers/:id', async (req, res) => {
  try {
    const target = req.params.id;
    const updates = req.body;
    
    const updated = await Voucher.findOneAndUpdate(
      { $or: [{ id: target }, { voucherNo: target }] },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update voucher', message: err.message });
  }
});

// 8. Delete a single voucher
app.delete('/api/vouchers/:id', async (req, res) => {
  try {
    const target = req.params.id;
    await Voucher.deleteOne({ $or: [{ id: target }, { voucherNo: target }] });
    res.json({ success: true, message: 'Voucher deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete voucher', message: err.message });
  }
});

// 9. Clear all vouchers
app.delete('/api/vouchers', async (req, res) => {
  try {
    await Voucher.deleteMany({});
    res.json({ success: true, message: 'All vouchers cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear vouchers', message: err.message });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Yogakshema Backend Server running on http://localhost:${PORT}`);
});
