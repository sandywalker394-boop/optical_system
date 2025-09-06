const express = require('express');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Sale = require('../models/Sale');
const { auth, requireSuperAdmin, requireSameShop } = require('../middleware/auth');

const router = express.Router();

// Get all shops (super admin only)
router.get('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const shops = await Shop.find().populate('adminId', 'name email');
    res.json(shops);
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shop by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('adminId', 'name email');
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Check access permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(shop);
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new shop (super admin only)
router.post('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { name, address, gst, phone, email, adminId } = req.body;

    if (!name || !phone || !email || !adminId) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if admin exists
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(400).json({ message: 'Admin user not found' });
    }

    const shop = new Shop({
      name,
      address,
      gst,
      phone,
      email,
      adminId
    });

    await shop.save();
    await shop.populate('adminId', 'name email');

    res.status(201).json(shop);
  } catch (error) {
    console.error('Create shop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update shop
router.put('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('adminId', 'name email');

    res.json(updatedShop);
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete shop (super admin only)
router.delete('/:id', auth, requireSuperAdmin, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    await Shop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Delete shop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shop statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const shopId = req.params.id;
    
    // Check access permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== shopId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Overview stats
    const totalCustomers = await Customer.countDocuments({ shopId, isActive: true });
    const totalProducts = await Product.countDocuments({ shopId, isActive: true });
    const totalSales = await Sale.countDocuments({ shopId });
    
    // Monthly stats
    const monthlySales = await Sale.aggregate([
      { $match: { shopId: shopId, saleDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const monthlyRevenue = monthlySales.length > 0 ? monthlySales[0].total : 0;
    const monthlySalesCount = monthlySales.length > 0 ? monthlySales[0].count : 0;

    // Inventory stats
    const lowStockProducts = await Product.countDocuments({
      shopId,
      'inventory.quantity': { $lte: '$inventory.minStockLevel' },
      isActive: true
    });

    const outOfStockProducts = await Product.countDocuments({
      shopId,
      'inventory.quantity': 0,
      isActive: true
    });

    // Performance stats
    const avgOrderValue = monthlySalesCount > 0 ? monthlyRevenue / monthlySalesCount : 0;

    const stats = {
      overview: {
        totalCustomers,
        totalProducts,
        totalSales,
        monthlyRevenue
      },
      monthly: {
        revenue: monthlyRevenue,
        salesCount: monthlySalesCount,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100
      },
      inventory: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      performance: {
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        monthlyGrowth: 0 // You can calculate this based on previous month
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get shop stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overview stats for super admin
router.get('/stats/overview', auth, requireSuperAdmin, async (req, res) => {
  try {
    const totalShops = await Shop.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCustomers = await Customer.countDocuments({ isActive: true });
    const totalProducts = await Product.countDocuments({ isActive: true });

    const stats = {
      totalShops,
      totalUsers,
      totalCustomers,
      totalProducts
    };

    res.json(stats);
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
