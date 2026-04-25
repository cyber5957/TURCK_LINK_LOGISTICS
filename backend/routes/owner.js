const express = require('express');
const { auth, ownerAuth } = require('../middleware/auth');
const Truck = require('../models/Truck');
const Booking = require('../models/Booking');

const router = express.Router();

// Owner dashboard
router.get('/dashboard', auth, ownerAuth, async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user.id });
    const bookings = await Booking.find({ truck: { $in: trucks.map(t => t._id) } })
      .populate('customer', 'name email')
      .populate('truck', 'truckNumber truckType');

    res.json({
      message: 'Welcome to owner dashboard',
      user: req.user,
      trucks: trucks.length,
      activeBookings: bookings.filter(b => b.status === 'in_transit').length,
      totalEarnings: bookings.filter(b => b.status === 'delivered').reduce((sum, b) => sum + b.price, 0)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add truck
router.post('/trucks', auth, ownerAuth, async (req, res) => {
  const { truckNumber, truckType, capacity, route, basePrice, features } = req.body;
  try {
    const truck = new Truck({
      owner: req.user.id,
      truckNumber,
      truckType,
      capacity,
      route,
      basePrice,
      features: features || []
    });
    await truck.save();
    res.status(201).json({ message: 'Truck added successfully', truck });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get owner's trucks
router.get('/trucks', auth, ownerAuth, async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user.id });
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for owner's trucks
router.get('/bookings', auth, ownerAuth, async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user.id });
    const truckIds = trucks.map(t => t._id);
    const bookings = await Booking.find({ truck: { $in: truckIds } })
      .populate('customer', 'name email phone')
      .populate('truck', 'truckNumber truckType capacity')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.put('/bookings/:id', auth, ownerAuth, async (req, res) => {
  const { status, location, notes } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if owner owns the truck
    const truck = await Truck.findById(booking.truck);
    if (truck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = status;
    if (location || notes) {
      booking.trackingUpdates.push({ status, location, notes });
    }
    await booking.save();

    res.json({ message: 'Booking updated successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;