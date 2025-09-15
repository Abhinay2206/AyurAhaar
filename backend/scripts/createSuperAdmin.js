const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/UserBase');
const Admin = require('../src/models/Admin');

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurahaar';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Super admin credentials
    const superAdminData = {
      name: 'Super Administrator',
      email: 'superadmin@ayurahaar.com',
      password: 'SuperAdmin123!',
      role: 'super-admin'
    };

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      email: superAdminData.email,
      role: 'super-admin' 
    });

    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create super admin
    const superAdmin = new Admin({
      name: superAdminData.name,
      email: superAdminData.email,
      password: superAdminData.password,
      role: 'super-admin'
    });

    await superAdmin.save();
    
    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', superAdminData.email);
    console.log('🔑 Password:', superAdminData.password);
    console.log('👤 Role:', superAdminData.role);
    console.log('\n🚀 You can now login with these credentials from the main login page.');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    if (error.code === 11000) {
      console.log('Super admin with this email already exists');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
createSuperAdmin();