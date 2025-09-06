const express = require('express');
const Customer = require('../models/Customer');
const { auth, requireSameShop } = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Super admin can see all customers, others only their shop's customers
    if (req.user.role !== 'super_admin') {
      query.shopId = req.user.shopId;
    }

    const customers = await Customer.find(query)
      .populate('shopId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('shopId', 'name')
      .populate('createdBy', 'name');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== customer.shopId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new customer
router.post('/', auth, async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      shopId: req.user.role === 'super_admin' ? req.body.shopId : req.user.shopId,
      createdBy: req.user._id
    };

    const customer = new Customer(customerData);
    await customer.save();
    
    await customer.populate('shopId', 'name');
    await customer.populate('createdBy', 'name');

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== customer.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('shopId', 'name').populate('createdBy', 'name');

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== customer.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add prescription to customer
router.post('/:id/prescriptions', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== customer.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prescription = {
      ...req.body,
      prescribedBy: req.user._id
    };

    customer.prescriptions.push(prescription);
    customer.currentPrescription = customer.prescriptions[customer.prescriptions.length - 1]._id;
    
    await customer.save();
    await customer.populate('shopId', 'name');
    await customer.populate('createdBy', 'name');

    res.json(customer);
  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role !== 'super_admin') {
      matchQuery.shopId = req.user.shopId;
    }

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const stats = await Customer.aggregate([
      { $match: { ...matchQuery, isActive: true } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' },
          avgSpent: { $avg: '$totalSpent' },
          newThisMonth: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startOfMonth] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalCustomers: 0,
      totalSpent: 0,
      avgSpent: 0,
      newThisMonth: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
