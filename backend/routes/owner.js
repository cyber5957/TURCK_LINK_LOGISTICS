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

// Let an owner mark a truck available again after its booking is complete.
router.put('/trucks/:id/availability', auth, ownerAuth, async (req, res) => {
  if (typeof req.body?.availability !== 'boolean') {
    return res.status(400).json({ message: 'Availability must be true or false.' });
  }

  try {
    const truck = await Truck.findOne({ _id: req.params.id, owner: req.user.id });
    if (!truck) return res.status(404).json({ message: 'Truck not found.' });

    if (req.body.availability) {
      const activeBooking = await Booking.exists({
        truck: truck._id,
        status: { $in: ['pending', 'confirmed', 'in_transit'] },
      });
      if (activeBooking) {
        return res.status(409).json({ message: 'This truck has an active booking and cannot be marked available yet.' });
      }
    }

    truck.availability = req.body.availability;
    await truck.save();
    res.json({ message: 'Availability updated.', truck });
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
  const nextStatuses = {
    pending: ['confirmed'],
    confirmed: ['in_transit'],
    in_transit: ['delivered'],
  };
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if owner owns the truck
    const truck = await Truck.findById(booking.truck);
    if (truck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!nextStatuses[booking.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot change a ${booking.status} booking to ${status}.` });
    }

    booking.status = status;
    booking.trackingUpdates.push({ status, location, notes });
    await booking.save();

    res.json({ message: 'Booking updated successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
