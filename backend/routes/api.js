const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Truck = require('../models/Truck');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const router = express.Router();

// Search trucks
router.get('/trucks', async (req, res) => {
  console.log('Entered GET /api/trucks');
  try {
    const { route, truckType, maxPrice, verified } = req.query;
    let query = { availability: true };

    if (route) query.route = new RegExp(route, 'i');
    if (truckType) query.truckType = truckType;
    if (maxPrice) query.basePrice = { $lte: parseInt(maxPrice, 10) };
    if (verified === 'true') query.verified = true;

    console.log('Query:', query);

    const trucks = await Truck.find(query)
      .sort({ rating: -1, basePrice: 1 })
      .lean();

    console.log('Found trucks count:', trucks.length);

    if (trucks.length > 0) {
      const ownerIds = [...new Set(trucks.map((truck) => truck.owner?.toString()).filter(Boolean))];
      const owners = await User.find({ _id: { $in: ownerIds } }).select('name');
      const ownerMap = owners.reduce((map, owner) => {
        map[owner._id.toString()] = owner.name;
        return map;
      }, {});
      trucks.forEach((truck) => {
        if (truck.owner) {
          truck.owner = { name: ownerMap[truck.owner.toString()] || 'Unknown' };
        }
      });
    }

    res.json(trucks);
  } catch (err) {
    console.error('Error in /api/trucks:', err.stack || err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get truck details with reviews
router.get('/trucks/:id', async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id).populate('owner', 'name');
    if (!truck) return res.status(404).json({ message: 'Truck not found' });

    const reviews = await Review.find({ truck: req.params.id })
      .populate('reviewer', 'name')
      .populate('booking')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ truck, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/bookings', auth, async (req, res) => {
  const { truckId, pickupLocation, deliveryLocation, cargoType, weight, pickupDate, specialInstructions } = req.body;
  try {
    const truck = await Truck.findById(truckId);
    if (!truck) return res.status(404).json({ message: 'Truck not found' });
    if (!truck.availability) return res.status(400).json({ message: 'Truck not available' });

    const booking = new Booking({
      customer: req.user.id,
      truck: truckId,
      pickupLocation,
      deliveryLocation,
      cargoType,
      weight,
      pickupDate,
      specialInstructions,
      price: truck.basePrice // In real app, this would be calculated
    });

    await booking.save();

    // Mark truck as unavailable
    truck.availability = false;
    await truck.save();

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookings
router.get('/bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('truck', 'truckNumber truckType capacity route')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review
router.post('/reviews', auth, async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (booking.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    const review = new Review({
      booking: bookingId,
      reviewer: req.user.id,
      truck: booking.truck,
      rating,
      comment
    });

    await review.save();

    // Update truck rating
    const truckReviews = await Review.find({ truck: booking.truck });
    const avgRating = truckReviews.reduce((sum, r) => sum + r.rating, 0) / truckReviews.length;
    await Truck.findByIdAndUpdate(booking.truck, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: truckReviews.length
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform stats
router.get('/stats', async (req, res) => {
  try {
    const totalTrucks = await Truck.countDocuments({ verified: true });
    const totalBookings = await Truck.countDocuments({ status: 'delivered' });
    const totalUsers = await User.countDocuments();
    const avgRating = await Truck.aggregate([
      { $match: { verified: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      totalTrucks,
      totalBookings,
      totalUsers,
      averageRating: avgRating[0]?.avgRating || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;