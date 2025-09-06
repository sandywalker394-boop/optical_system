const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'netbanking', 'cheque', 'other'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['full', 'partial', 'advance'],
    default: 'full'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  transactionId: String,
  reference: String,
  notes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ shopId: 1, customerId: 1 });
paymentSchema.index({ shopId: 1, paymentDate: -1 });
paymentSchema.index({ shopId: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
