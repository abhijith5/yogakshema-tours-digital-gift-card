import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  id: { type: String },
  voucherNo: { type: String, required: true, unique: true, index: true },
  voucherValue: { type: String, default: '15000' },
  issueDate: { type: String },
  validUntil: { type: String },
  recipientName: { type: String, default: '' },
  recipientPhone: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['active', 'redeemed', 'cancelled'], default: 'active' },
  isPrePrinted: { type: Boolean, default: false },
  source: { type: String, default: 'Digital Studio' },
  redeemedAt: { type: String, default: null },
  savedAt: { type: String },
  overlayConfig: { type: Object }
}, {
  timestamps: true
});

export const Voucher = mongoose.model('Voucher', voucherSchema);
