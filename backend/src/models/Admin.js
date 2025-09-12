const mongoose = require('mongoose');
const User = require('./UserBase');

const AdminSchema = new mongoose.Schema({
  // admin-specific fields can be added here
}, { timestamps: true });

const Admin = User.discriminator('super-admin', AdminSchema);

module.exports = Admin;
