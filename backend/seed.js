const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Truck = require('./models/Truck');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Truck.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create sample owners
    const owners = await User.insertMany([
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        password: '$2a$10$hashedpassword1', // 'password123' hashed
        role: 'owner',
        phone: '+91-9876543210',
        fleetSize: '6 to 20 trucks'
      },
      {
        name: 'Priya Transport Co.',
        email: 'priya@example.com',
        password: '$2a$10$hashedpassword2',
        role: 'owner',
        phone: '+91-9876543211',
        fleetSize: '21 to 50 trucks'
      },
      {
        name: 'Delhi Fleet Services',
        email: 'delhi@example.com',
        password: '$2a$10$hashedpassword3',
        role: 'owner',
        phone: '+91-9876543212',
        fleetSize: '1 to 5 trucks'
      }
    ]);
    console.log('Created sample owners');

    // Create sample trucks
    const trucks = await Truck.insertMany([
      {
        owner: owners[0]._id,
        truckNumber: 'DL-01-AB-1234',
        truckType: 'Open truck',
        capacity: '10 tons',
        route: 'Delhi to Jaipur',
        basePrice: 15000,
        availability: true,
        location: 'Delhi',
        features: ['GPS tracking', '24/7 support'],
        verified: true,
        rating: 4.8,
        reviewCount: 12
      },
      {
        owner: owners[0]._id,
        truckNumber: 'DL-02-CD-5678',
        truckType: 'Container',
        capacity: '20 ft',
        route: 'Delhi to Mumbai',
        basePrice: 35000,
        availability: true,
        location: 'Delhi',
        features: ['Refrigerated', 'GPS tracking'],
        verified: true,
        rating: 4.9,
        reviewCount: 8
      },
      {
        owner: owners[1]._id,
        truckNumber: 'MH-01-EF-9012',
        truckType: 'Cold chain',
        capacity: '15 tons',
        route: 'Mumbai to Pune',
        basePrice: 25000,
        availability: true,
        location: 'Mumbai',
        features: ['Temperature controlled', 'Real-time monitoring'],
        verified: true,
        rating: 4.7,
        reviewCount: 15
      },
      {
        owner: owners[1]._id,
        truckNumber: 'MH-02-GH-3456',
        truckType: 'Express delivery',
        capacity: '5 tons',
        route: 'Mumbai to Ahmedabad',
        basePrice: 20000,
        availability: true,
        location: 'Mumbai',
        features: ['Express service', 'Same day delivery'],
        verified: true,
        rating: 4.6,
        reviewCount: 22
      },
      {
        owner: owners[2]._id,
        truckNumber: 'KA-01-IJ-7890',
        truckType: 'Open truck',
        capacity: '8 tons',
        route: 'Bengaluru to Chennai',
        basePrice: 18000,
        availability: true,
        location: 'Bengaluru',
        features: ['GPS tracking'],
        verified: false,
        rating: 4.2,
        reviewCount: 5
      }
    ]);
    console.log('Created sample trucks');

    // Create sample customers
    const customers = await User.insertMany([
      {
        name: 'Amit Sharma',
        email: 'amit@example.com',
        password: '$2a$10$hashedpassword4',
        role: 'user',
        phone: '+91-9876543213'
      },
      {
        name: 'Sneha Electronics',
        email: 'sneha@example.com',
        password: '$2a$10$hashedpassword5',
        role: 'user',
        phone: '+91-9876543214'
      }
    ]);
    console.log('Created sample customers');

    // Create sample bookings
    const bookings = await Booking.insertMany([
      {
        customer: customers[0]._id,
        truck: trucks[0]._id,
        pickupLocation: 'Delhi Industrial Area',
        deliveryLocation: 'Jaipur Warehouse',
        cargoType: 'Electronics',
        weight: '2 tons',
        pickupDate: new Date('2024-12-20'),
        status: 'delivered',
        price: 15000,
        paymentStatus: 'paid',
        trackingUpdates: [
          { status: 'confirmed', location: 'Delhi', notes: 'Booking confirmed' },
          { status: 'in_transit', location: 'Jaipur Highway', notes: 'On the way' },
          { status: 'delivered', location: 'Jaipur Warehouse', notes: 'Delivered successfully' }
        ]
      },
      {
        customer: customers[1]._id,
        truck: trucks[2]._id,
        pickupLocation: 'Mumbai Port',
        deliveryLocation: 'Pune Factory',
        cargoType: 'Perishable goods',
        weight: '3 tons',
        pickupDate: new Date('2024-12-22'),
        status: 'in_transit',
        price: 25000,
        paymentStatus: 'paid',
        trackingUpdates: [
          { status: 'confirmed', location: 'Mumbai', notes: 'Ready for pickup' },
          { status: 'in_transit', location: 'Mumbai-Pune Expressway', notes: 'In transit' }
        ]
      }
    ]);
    console.log('Created sample bookings');

    // Create sample reviews
    await Review.insertMany([
      {
        booking: bookings[0]._id,
        reviewer: customers[0]._id,
        truck: trucks[0]._id,
        rating: 5,
        comment: 'Excellent service! Truck arrived on time and driver was very professional.',
        verified: true
      },
      {
        booking: bookings[0]._id,
        reviewer: customers[0]._id,
        truck: trucks[0]._id,
        rating: 4,
        comment: 'Good experience overall. Minor delay but communication was good.',
        verified: true
      }
    ]);
    console.log('Created sample reviews');

    console.log('Database seeded successfully!');
    console.log(`Created ${owners.length} owners, ${trucks.length} trucks, ${customers.length} customers, ${bookings.length} bookings`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();