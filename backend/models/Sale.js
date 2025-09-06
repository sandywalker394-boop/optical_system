const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const saleSchema = new mongoose.Schema({
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
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  notes: String,
  saleDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
saleSchema.index({ shopId: 1, customerId: 1 });
saleSchema.index({ shopId: 1, saleDate: -1 });
saleSchema.index({ shopId: 1, status: 1 });
saleSchema.index({ invoiceNumber: 1 });

// Calculate totals before saving
saleSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = (itemTotal * item.discount) / 100;
      return sum + (itemTotal - discountAmount);
    }, 0);
    
    this.totalAmount = this.subtotal + this.tax - this.discount;
    this.balanceAmount = this.totalAmount - this.paidAmount;
    
    // Update payment status
    if (this.balanceAmount <= 0) {
      this.paymentStatus = 'paid';
    } else if (this.paidAmount > 0) {
      this.paymentStatus = 'partial';
    } else {
      this.paymentStatus = 'pending';
    }
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
