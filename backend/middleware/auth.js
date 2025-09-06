const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).populate('shopId');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied. Super admin required.' });
  }
  next();
};

const requireShopAdmin = (req, res, next) => {
  if (!['super_admin', 'shop_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Shop admin or super admin required.' });
  }
  next();
};

const requireSameShop = (req, res, next) => {
  const requestedShopId = req.params.shopId || req.body.shopId;
  
  if (req.user.role === 'super_admin') {
    return next();
  }
  
  if (req.user.shopId?.toString() !== requestedShopId) {
    return res.status(403).json({ message: 'Access denied. You can only access your own shop.' });
  }
  
  next();
};

module.exports = {
  auth,
  requireSuperAdmin,
  requireShopAdmin,
  requireSameShop
};
