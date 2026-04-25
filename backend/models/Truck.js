const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  truckNumber: { type: String, required: true },
  truckType: {
    type: String,
    enum: ['Open truck', 'Container', 'Cold chain', 'Express delivery'],
    required: true
  },
  capacity: { type: String, required: true }, // e.g., "10 tons", "20 ft"
  route: { type: String, required: true }, // e.g., "Delhi to Jaipur"
  basePrice: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  location: { type: String },
  features: [String], // e.g., ["GPS tracking", "Refrigerated"]
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Truck', truckSchema);