const express = require('express');
const User = require('../models/User');
const { auth, requireSuperAdmin, requireShopAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (super admin only)
router.get('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().populate('shopId', 'name');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users by shop (shop admin and super admin)
router.get('/shop/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;
    
    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== shopId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({ shopId }).populate('shopId', 'name');
    res.json(users);
  } catch (error) {
    console.error('Get shop users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('shopId', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.shopId?.toString() !== user.shopId?._id?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role, shopId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      shopId: role !== 'super_admin' ? shopId : undefined
    });

    await user.save();
    await user.populate('shopId', 'name');

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('shopId', 'name');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (super admin only)
router.delete('/:id', auth, requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
