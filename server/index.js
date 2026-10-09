import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { Voucher } from './models/Voucher.js';
import { Config } from './models/Config.js';

dotenv.config();

// Load file-based series configuration
let fileSeriesConfig = null;
try {
  const configFileContent = fs.readFileSync(new URL('./config/seriesConfig.json', import.meta.url), 'utf8');
  fileSeriesConfig = JSON.parse(configFileContent);
} catch (err) {
  console.warn('Warning: Could not read server/config/seriesConfig.json:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_URL = process.env.CLIENT_URL;

// Universal CORS Middleware for Netlify, Render, and Localhost
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://yyt-gift-card.netlify.app',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:3000'
  ];

  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach(u => {
      const trimmed = u.trim();
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept, Origin');

  // Handle preflight OPTIONS request directly
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});
app.use(express.json({ limit: '10mb' }));

// Helper to ensure initial config document exists in MongoDB
async function getOrCreateConfig() {
  let config = await Config.findOne({ key: 'global_config' });
  const defaultSeriesConfigs = (fileSeriesConfig && Array.isArray(fileSeriesConfig.series))
    ? fileSeriesConfig.series.map(s => ({
        key: s.key,
        label: s.label,
        prefix: s.prefix,
        val: String(s.value || s.val || '1000'),
        counter: s.counter || 1
      }))
    : [
        { key: 'digital', label: 'Digital Series', prefix: 'YTT-D-', val: '10000', counter: 1 },
        { key: 'A', label: 'Series A', prefix: 'YGT-26-A-', val: '1000', counter: 1 },
        { key: 'B', label: 'Series B', prefix: 'YGT-26-B-', val: '2000', counter: 1 },
        { key: 'C', label: 'Series C', prefix: 'YGT-26-C-', val: '5000', counter: 1 },
        { key: 'D', label: 'Series D', prefix: 'YGT-26-D-', val: '10000', counter: 1 }
      ];

  const defaultSeriesCounters = {};
  defaultSeriesConfigs.forEach(s => {
    defaultSeriesCounters[s.prefix] = s.counter || 1;
  });

  if (!config) {
    config = await Config.create({
      key: 'global_config',
      serialCounter: 1,
      prefix: 'YTT-D-',
      adminPassword: 'admin123',
      seriesConfigs: defaultSeriesConfigs,
      seriesCounters: defaultSeriesCounters
    });
  } else {
    let updated = false;
    if (!config.seriesConfigs || config.seriesConfigs.length === 0) {
      config.seriesConfigs = defaultSeriesConfigs;
      updated = true;
    } else {
      const existingKeys = new Set((config.seriesConfigs || []).map(s => s.key));
      for (const defS of defaultSeriesConfigs) {
        if (!existingKeys.has(defS.key)) {
          config.seriesConfigs.push(defS);
          updated = true;
        }
      }
    }
    if (!config.seriesCounters) {
      config.seriesCounters = defaultSeriesCounters;
      updated = true;
    } else {
      for (const s of (config.seriesConfigs || [])) {
        if (s && s.prefix && config.seriesCounters[s.prefix] === undefined) {
          config.seriesCounters[s.prefix] = s.counter || 1;
          updated = true;
        }
      }
    }
    if (updated) {
      config.markModified('seriesConfigs');
      config.markModified('seriesCounters');
      await config.save();
    }
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
      adminPassword: config.adminPassword,
      seriesConfigs: config.seriesConfigs || [],
      seriesCounters: config.seriesCounters || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config', message: err.message });
  }
});

// 3. Update system config
app.post('/api/config', async (req, res) => {
  try {
    const { serialCounter, prefix, adminPassword, seriesConfigs, seriesCounters } = req.body;
    const config = await getOrCreateConfig();
    
    if (serialCounter !== undefined) config.serialCounter = serialCounter;
    if (prefix !== undefined) config.prefix = prefix;
    if (adminPassword !== undefined) config.adminPassword = adminPassword;
    if (seriesConfigs !== undefined) config.seriesConfigs = seriesConfigs;
    if (seriesCounters !== undefined) config.seriesCounters = seriesCounters;

    config.markModified('seriesConfigs');
    config.markModified('seriesCounters');
    await config.save();

    res.json({
      success: true,
      serialCounter: config.serialCounter,
      prefix: config.prefix,
      adminPassword: config.adminPassword,
      seriesConfigs: config.seriesConfigs,
      seriesCounters: config.seriesCounters
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

// 5c. Get next available serial number & counter for a specific prefix from DB
app.get('/api/vouchers/next-serial', async (req, res) => {
  try {
    const requestedPrefix = (req.query.prefix || 'YTT-D-').trim();
    const lowerPrefix = requestedPrefix.toLowerCase();
    const config = await getOrCreateConfig();

    const safeRegex = requestedPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const vouchers = await Voucher.find({
      voucherNo: { $regex: '^' + safeRegex, $options: 'i' }
    });

    let maxNum = 0;
    let maxPadLength = 4;
    let foundAny = false;

    for (const v of vouchers) {
      const vNo = (v.voucherNo || '').trim();
      if (vNo.toLowerCase().startsWith(lowerPrefix)) {
        const suffix = vNo.substring(requestedPrefix.length);
        const match = suffix.match(/^(\d+)/);
        if (match) {
          const numStr = match[1];
          const numVal = parseInt(numStr, 10);
          if (!isNaN(numVal) && numVal > maxNum) {
            maxNum = numVal;
            maxPadLength = Math.max(numStr.length, 3);
            foundAny = true;
          }
        }
      }
    }

    let nextCounter = 1;
    if (foundAny) {
      nextCounter = maxNum + 1;
    } else {
      if (lowerPrefix === (config.prefix || '').toLowerCase()) {
        nextCounter = config.serialCounter || 1;
      } else {
        nextCounter = 1;
      }
    }

    const paddedNum = String(nextCounter).padStart(maxPadLength, '0');
    const nextVoucherNo = `${requestedPrefix}${paddedNum}`;

    res.json({
      prefix: requestedPrefix,
      nextCounter,
      nextVoucherNo,
      padLength: maxPadLength
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate next serial number', message: err.message });
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
