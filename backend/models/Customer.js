const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  rightEye: {
    sphere: Number,
    cylinder: Number,
    axis: Number,
    add: Number
  },
  leftEye: {
    sphere: Number,
    cylinder: Number,
    axis: Number,
    add: Number
  },
  pupillaryDistance: Number,
  notes: String,
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const customerSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  prescriptions: [prescriptionSchema],
  currentPrescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastVisit: Date,
  nextVisitReminder: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better search performance
customerSchema.index({ shopId: 1, name: 1 });
customerSchema.index({ shopId: 1, phone: 1 });
customerSchema.index({ shopId: 1, email: 1 });

module.exports = mongoose.model('Customer', customerSchema);
