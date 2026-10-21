const express = require('express');
const { auth, customerAuth } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Truck = require('../models/Truck');
const Review = require('../models/Review');

const router = express.Router();

// Customer dashboard
router.get('/dashboard', auth, customerAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('truck', 'truckNumber truckType')
      .sort({ createdAt: -1 });

    const stats = {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => ['pending', 'confirmed', 'in_transit'].includes(b.status)).length,
      completedBookings: bookings.filter(b => b.status === 'delivered').length,
      totalSpent: bookings.filter(b => b.status === 'delivered').reduce((sum, b) => sum + b.price, 0)
    };

    res.json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      stats,
      recentBookings: bookings.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer bookings
router.get('/bookings', auth, customerAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('truck', 'truckNumber truckType capacity owner')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update customer profile
router.put('/profile', auth, customerAuth, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: { name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review for completed booking
router.post('/reviews', auth, customerAuth, async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5 || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({ message: 'Provide a rating from 1 to 5 and a review comment.' });
  }
  try {
    // Verify booking belongs to user and is completed
    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user.id,
      status: 'delivered'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not eligible for review' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    const review = new Review({
      booking: bookingId,
      customer: req.user.id,
      truck: booking.truck,
      rating: numericRating,
      comment: comment.trim()
    });

    await review.save();

    const reviews = await Review.find({ truck: booking.truck }).select('rating').lean();
    const averageRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
    await Truck.findByIdAndUpdate(booking.truck, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.put('/bookings/:id/cancel', auth, customerAuth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled at this stage' });
    }

    booking.status = 'cancelled';
    booking.trackingUpdates.push({
      status: 'cancelled',
      notes: 'Cancelled by customer'
    });

    await booking.save();

    // A cancelled reservation releases the demo truck back into availability.
    await Truck.findByIdAndUpdate(booking.truck, { availability: true });

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
