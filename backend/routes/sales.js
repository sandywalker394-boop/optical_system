const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { auth, requireSameShop } = require('../middleware/auth');

const router = express.Router();

// Get all sales
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Super admin can see all sales, others only their shop's sales
    if (req.user.role !== 'super_admin') {
      query.shopId = req.user.shopId;
    }

    const sales = await Sale.find(query)
      .populate('shopId', 'name')
      .populate('customerId', 'name phone')
      .populate('createdBy', 'name')
      .sort({ saleDate: -1 });

    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sale by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('shopId', 'name')
      .populate('customerId', 'name phone')
      .populate('createdBy', 'name')
      .populate('items.productId', 'name category brand');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== sale.shopId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new sale
router.post('/', auth, async (req, res) => {
  try {
    const saleData = {
      ...req.body,
      shopId: req.user.role === 'super_admin' ? req.body.shopId : req.user.shopId,
      createdBy: req.user._id
    };

    // Generate invoice number if not provided
    if (!saleData.invoiceNumber) {
      const count = await Sale.countDocuments();
      saleData.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
    }

    const sale = new Sale(saleData);
    await sale.save();
    
    // Update product inventory
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { 'inventory.quantity': -item.quantity } }
      );
    }
    
    await sale.populate('shopId', 'name');
    await sale.populate('customerId', 'name phone');
    await sale.populate('createdBy', 'name');
    await sale.populate('items.productId', 'name category brand');

    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update sale
router.put('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== sale.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Restore inventory for old items
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { 'inventory.quantity': item.quantity } }
      );
    }

    const updatedSale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('shopId', 'name')
     .populate('customerId', 'name phone')
     .populate('createdBy', 'name')
     .populate('items.productId', 'name category brand');

    // Update inventory for new items
    for (const item of updatedSale.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { 'inventory.quantity': -item.quantity } }
      );
    }

    res.json(updatedSale);
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete sale
router.delete('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== sale.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Restore inventory
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { 'inventory.quantity': item.quantity } }
      );
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales by customer
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const { customerId } = req.params;
    
    let query = { customerId };
    
    if (req.user.role !== 'super_admin') {
      query.shopId = req.user.shopId;
    }

    const sales = await Sale.find(query)
      .populate('shopId', 'name')
      .populate('customerId', 'name phone')
      .populate('createdBy', 'name')
      .sort({ saleDate: -1 });

    res.json(sales);
  } catch (error) {
    console.error('Get customer sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role !== 'super_admin') {
      matchQuery.shopId = req.user.shopId;
    }

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const stats = await Sale.aggregate([
      { $match: { ...matchQuery, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: '$balanceAmount' },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $and: [
                  { $gte: ['$saleDate', startOfMonth] },
                  { $lte: ['$saleDate', endOfMonth] }
                ]},
                '$totalAmount',
                0
              ]
            }
          },
          monthlySales: {
            $sum: {
              $cond: [
                { $and: [
                  { $gte: ['$saleDate', startOfMonth] },
                  { $lte: ['$saleDate', endOfMonth] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalSales: 0,
      totalRevenue: 0,
      totalPaid: 0,
      totalPending: 0,
      monthlyRevenue: 0,
      monthlySales: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
