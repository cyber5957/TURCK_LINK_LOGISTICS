const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner'], required: true },
  phone: { type: String },
  fleetSize: { type: String }, // for owners
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  refreshTokens: [
    {
      token: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);