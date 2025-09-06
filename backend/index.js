const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const saleRoutes = require('./routes/sales');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/optical-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Auto-create super admin if none exists
  const User = require('./models/User');
  User.findOne({ role: 'super_admin' }).then(superAdmin => {
    if (!superAdmin) {
      const bcrypt = require('bcryptjs');
      const newSuperAdmin = new User({
        name: 'Super Admin',
        email: 'admin@optical.com',
        password: 'admin123',
        role: 'super_admin',
        isActive: true
      });
      
      newSuperAdmin.save().then(() => {
        console.log('Super admin created successfully');
      }).catch(err => {
        console.log('Super admin already exists or error:', err.message);
      });
    }
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sales', saleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Optical Shop API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
