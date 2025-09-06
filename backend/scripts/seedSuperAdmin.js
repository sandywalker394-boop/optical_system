const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function seedSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/optical-shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create super admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@optical.com',
      password: 'admin123',
      role: 'super_admin',
      isActive: true
    });

    await superAdmin.save();
    console.log('Super admin created successfully:', superAdmin.email);

  } catch (error) {
    console.error('Error seeding super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedSuperAdmin();
