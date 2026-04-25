const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
  pickupLocation: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  cargoType: { type: String, required: true },
  weight: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  specialInstructions: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  price: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  trackingUpdates: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);