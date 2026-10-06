import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_config' },
  serialCounter: { type: Number, default: 1 },
  prefix: { type: String, default: 'YTT-D-' },
  adminPassword: { type: String, default: 'admin123' }
}, {
  timestamps: true
});

export const Config = mongoose.model('Config', configSchema);
