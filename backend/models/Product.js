const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['frames', 'lenses', 'sunglasses', 'contact_lenses', 'accessories'],
    required: true
  },
  brand: String,
  model: String,
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  description: String,
  specifications: {
    // Frame specifications
    frameType: String,
    frameMaterial: String,
    frameColor: String,
    frameSize: String,
    bridgeWidth: Number,
    templeLength: Number,
    
    // Lens specifications
    lensType: String,
    lensMaterial: String,
    lensColor: String,
    lensCoating: String,
    lensThickness: Number,
    
    // Sunglasses specifications
    uvProtection: String,
    polarization: Boolean,
    lensShape: String,
    
    // Contact lens specifications
    power: String,
    diameter: Number,
    baseCurve: Number,
    waterContent: Number,
    replacementSchedule: String
  },
  inventory: {
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    minStockLevel: {
      type: Number,
      default: 5
    },
    maxStockLevel: {
      type: Number,
      default: 100
    },
    reorderPoint: {
      type: Number,
      default: 10
    }
  },
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    margin: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String,
    address: String
  },
  images: [String],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
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
productSchema.index({ shopId: 1, name: 1 });
productSchema.index({ shopId: 1, category: 1 });
productSchema.index({ shopId: 1, sku: 1 });

// Calculate margin before saving
productSchema.pre('save', function(next) {
  if (this.pricing.costPrice && this.pricing.sellingPrice) {
    this.pricing.margin = ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.costPrice) * 100;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
