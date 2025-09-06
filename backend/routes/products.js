const express = require('express');
const Product = require('../models/Product');
const { auth, requireSameShop } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Super admin can see all products, others only their shop's products
    if (req.user.role !== 'super_admin') {
      query.shopId = req.user.shopId;
    }

    const products = await Product.find(query)
      .populate('shopId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shopId', 'name')
      .populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== product.shopId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/', auth, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      shopId: req.user.role === 'super_admin' ? req.body.shopId : req.user.shopId,
      createdBy: req.user._id
    };

    const product = new Product(productData);
    await product.save();
    
    await product.populate('shopId', 'name');
    await product.populate('createdBy', 'name');

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== product.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('shopId', 'name').populate('createdBy', 'name');

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== product.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product inventory
router.patch('/:id/inventory', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== product.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { quantity, operation } = req.body; // operation: 'add', 'subtract', 'set'

    if (!quantity || !operation) {
      return res.status(400).json({ message: 'Quantity and operation are required' });
    }

    switch (operation) {
      case 'add':
        product.inventory.quantity += quantity;
        break;
      case 'subtract':
        product.inventory.quantity = Math.max(0, product.inventory.quantity - quantity);
        break;
      case 'set':
        product.inventory.quantity = Math.max(0, quantity);
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    await product.save();
    await product.populate('shopId', 'name');
    await product.populate('createdBy', 'name');

    res.json(product);
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock products
router.get('/inventory/low-stock', auth, async (req, res) => {
  try {
    let query = {
      'inventory.quantity': { $lte: '$inventory.minStockLevel' },
      isActive: true
    };
    
    if (req.user.role !== 'super_admin') {
      query.shopId = req.user.shopId;
    }

    const lowStockProducts = await Product.find(query)
      .populate('shopId', 'name')
      .sort({ 'inventory.quantity': 1 });

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role !== 'super_admin') {
      matchQuery.shopId = req.user.shopId;
    }

    const stats = await Product.aggregate([
      { $match: { ...matchQuery, isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$inventory.quantity', '$pricing.costPrice'] } },
          lowStock: {
            $sum: {
              $cond: [
                { $lte: ['$inventory.quantity', '$inventory.minStockLevel'] },
                1,
                0
              ]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [
                { $eq: ['$inventory.quantity', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalProducts: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
