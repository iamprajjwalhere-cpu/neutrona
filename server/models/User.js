// models/User.js — Defines what a User looks like in the database

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true        // name is compulsory
  },
  email: {
    type: String,
    required: true,
    unique: true          // no two users can have same email
  },
  PhoneNo: {
  type: String,
  default: ''
},
  password: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    unique: true
  },
  balance: {
    type: Number,
    default: 0            // every new user starts with 0 balance
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'closed'],  // only these 3 values allowed
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now     // automatically saves signup time
  }
});

module.exports = mongoose.model('User', UserSchema);