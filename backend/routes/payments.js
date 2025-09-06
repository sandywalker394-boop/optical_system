const express = require('express');
const Payment = require('../models/Payment');
const Sale = require('../models/Sale');
const { auth, requireSameShop } = require('../middleware/auth');

const router = express.Router();

// Get all payments
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Super admin can see all payments, others only their shop's payments
    if (req.user.role !== 'super_admin') {
      query.shopId = req.user.shopId;
    }

    const payments = await Payment.find(query)
      .populate('shopId', 'name')
      .populate('customerId', 'name phone')
      .populate('saleId', 'invoiceNumber')
      .populate('processedBy', 'name')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('shopId', 'name')
      .populate('customerId', 'name phone')
      .populate('saleId', 'invoiceNumber')
      .populate('processedBy', 'name');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== payment.shopId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new payment
router.post('/', auth, async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      shopId: req.user.role === 'super_admin' ? req.body.shopId : req.user.shopId,
      processedBy: req.user._id
    };

    const payment = new Payment(paymentData);
    await payment.save();
    
    await payment.populate('shopId', 'name');
    await payment.populate('customerId', 'name phone');
    await payment.populate('saleId', 'invoiceNumber');
    await payment.populate('processedBy', 'name');

    // Update sale payment status if saleId is provided
    if (payment.saleId) {
      const sale = await Sale.findById(payment.saleId);
      if (sale) {
        sale.paidAmount += payment.amount;
        sale.balanceAmount = sale.totalAmount - sale.paidAmount;
        
        if (sale.balanceAmount <= 0) {
          sale.paymentStatus = 'paid';
        } else if (sale.paidAmount > 0) {
          sale.paymentStatus = 'partial';
        }
        
        await sale.save();
      }
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment
router.put('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== payment.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('shopId', 'name')
     .populate('customerId', 'name phone')
     .populate('saleId', 'invoiceNumber')
     .populate('processedBy', 'name');

    res.json(updatedPayment);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete payment
router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== payment.shopId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update sale payment status if saleId is provided
    if (payment.saleId) {
      const sale = await Sale.findById(payment.saleId);
      if (sale) {
        sale.paidAmount -= payment.amount;
        sale.balanceAmount = sale.totalAmount - sale.paidAmount;
        
        if (sale.paidAmount <= 0) {
          sale.paymentStatus = 'pending';
        } else if (sale.paidAmount > 0) {
          sale.paymentStatus = 'partial';
        }
        
        await sale.save();
      }
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payments by customer
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const { customerId } = req.params;
    
    let query = { customerId };
    
    if (req.user.role !== 'super_admin') {
      query.shopId = req.user.shopId;
    }

    const payments = await Payment.find(query)
      .populate('shopId', 'name')
      .populate('customerId', 'name phone')
      .populate('saleId', 'invoiceNumber')
      .populate('processedBy', 'name')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get customer payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role !== 'super_admin') {
      matchQuery.shopId = req.user.shopId;
    }

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const stats = await Payment.aggregate([
      { $match: { ...matchQuery, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          monthlyAmount: {
            $sum: {
              $cond: [
                { $and: [
                  { $gte: ['$paymentDate', startOfMonth] },
                  { $lte: ['$paymentDate', endOfMonth] }
                ]},
                '$amount',
                0
              ]
            }
          },
          cashPayments: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$amount', 0]
            }
          },
          cardPayments: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalPayments: 0,
      totalAmount: 0,
      monthlyAmount: 0,
      cashPayments: 0,
      cardPayments: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
