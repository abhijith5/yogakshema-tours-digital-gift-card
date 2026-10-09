import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_config' },
  serialCounter: { type: Number, default: 1 },
  prefix: { type: String, default: 'YYT-D-' },
  adminPassword: { type: String, default: 'admin123' },
  seriesConfigs: {
    type: Array,
    default: [
      { key: 'digital', label: 'Digital Series', prefix: 'YYT-D-', val: '10000', counter: 1 },
      { key: 'A', label: 'Series A', prefix: 'YGT-26-A-', val: '1000', counter: 1 },
      { key: 'B', label: 'Series B', prefix: 'YGT-26-B-', val: '2000', counter: 1 },
      { key: 'C', label: 'Series C', prefix: 'YGT-26-C-', val: '5000', counter: 1 },
      { key: 'D', label: 'Series D', prefix: 'YGT-26-D-', val: '10000', counter: 1 }
    ]
  },
  seriesCounters: {
    type: Object,
    default: {
      'YYT-D-': 1,
      'YGT-26-A-': 1,
      'YGT-26-B-': 1,
      'YGT-26-C-': 1,
      'YGT-26-D-': 1
    }
  }
}, {
  timestamps: true
});

export const Config = mongoose.model('Config', configSchema);
