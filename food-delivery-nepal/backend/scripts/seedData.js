const mongoose = require('mongoose'); // ✅ Only ONE declaration here
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// MongoDB connection options (compatible with v4.4.6)
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};

const seedData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('Connection String:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('test123', 10);
    console.log('👤 Creating users...');

    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '9841111111',
      password: hashedPassword,
      role: 'customer',
      addresses: [{
        type: 'home',
        street: '123 Main Street',
        city: 'Kathmandu',
        area: 'Thamel',
        isDefault: true
      }]
    });

    const vendor = await User.create({
      name: 'Test Vendor',
      email: 'vendor@test.com',
      phone: '9841111112',
      password: hashedPassword,
      role: 'vendor'
    });

    const deliveryPartner = await User.create({
      name: 'Test Delivery',
      email: 'delivery@test.com',
      phone: '9841111113',
      password: hashedPassword,
      role: 'delivery'
    });

    console.log('✅ Created users');

    // Create restaurants
    console.log('🏪 Creating restaurants...');
    const restaurant1 = await Restaurant.create({
      name: 'Nepali Kitchen',
      vendor: vendor._id,
      description: 'Authentic Nepali cuisine with traditional recipes',
      cuisineType: ['Nepali', 'Street Food'],
      location: {
        street: '456 Food Street',
        city: 'Kathmandu',
        area: 'Thamel',
        coordinates: { lat: 27.7172, lng: 85.3240 }
      },
      deliveryFee: 60,
      deliveryTime: { min: 25, max: 35 },
      images: ['https://via.placeholder.com/400x300'],
      rating: 4.5,
      totalReviews: 120,
      isActive: true,
      isVerified: true
    });

    const restaurant2 = await Restaurant.create({
      name: 'Indian Spice',
      vendor: vendor._id,
      description: 'Best Indian food in town',
      cuisineType: ['Indian', 'Non-Veg'],
      location: {
        street: '789 Spice Lane',
        city: 'Kathmandu',
        area: 'Durbar Marg',
        coordinates: { lat: 27.7050, lng: 85.3200 }
      },
      deliveryFee: 50,
      deliveryTime: { min: 20, max: 30 },
      images: ['https://via.placeholder.com/400x300'],
      rating: 4.7,
      totalReviews: 200,
      isActive: true,
      isVerified: true
    });

    console.log('✅ Created restaurants');

    // Create menu items
    console.log('🍽️  Creating menu items...');
    const menuItems1 = [
      {
        name: 'Chicken Momo',
        description: 'Steamed dumplings filled with minced chicken',
        price: 200,
        category: 'Appetizer',
        cuisineType: 'Nepali',
        restaurantId: restaurant1._id,
        preparationTime: 15,
        spiceLevel: 'Medium',
        isAvailable: true
      },
      {
        name: 'Dal Bhat',
        description: 'Traditional Nepali meal with rice, lentils, and curry',
        price: 350,
        category: 'Main Course',
        cuisineType: 'Nepali',
        restaurantId: restaurant1._id,
        preparationTime: 25,
        spiceLevel: 'Medium',
        isAvailable: true
      },
      {
        name: 'Chowmein',
        description: 'Stir-fried noodles with vegetables',
        price: 180,
        category: 'Main Course',
        cuisineType: 'Nepali',
        restaurantId: restaurant1._id,
        preparationTime: 15,
        spiceLevel: 'Mild',
        isAvailable: true
      },
      {
        name: 'Lassi',
        description: 'Traditional yogurt drink',
        price: 80,
        category: 'Beverage',
        cuisineType: 'Nepali',
        restaurantId: restaurant1._id,
        preparationTime: 5,
        isAvailable: true
      }
    ];

    const menuItems2 = [
      {
        name: 'Butter Chicken',
        description: 'Creamy tomato curry with tender chicken',
        price: 450,
        category: 'Main Course',
        cuisineType: 'Indian',
        restaurantId: restaurant2._id,
        preparationTime: 20,
        spiceLevel: 'Mild',
        isAvailable: true
      },
      {
        name: 'Biryani',
        description: 'Aromatic rice with spiced meat',
        price: 400,
        category: 'Main Course',
        cuisineType: 'Indian',
        restaurantId: restaurant2._id,
        preparationTime: 30,
        spiceLevel: 'Medium',
        isAvailable: true
      },
      {
        name: 'Naan',
        description: 'Soft leavened flatbread',
        price: 60,
        category: 'Side Dish',
        cuisineType: 'Indian',
        restaurantId: restaurant2._id,
        preparationTime: 10,
        isAvailable: true
      },
      {
        name: 'Mango Lassi',
        description: 'Sweet mango yogurt drink',
        price: 100,
        category: 'Beverage',
        cuisineType: 'Indian',
        restaurantId: restaurant2._id,
        preparationTime: 5,
        isAvailable: true
      }
    ];

    await MenuItem.insertMany([...menuItems1, ...menuItems2]);
    console.log('✅ Created menu items');

    console.log('\n=================================');
    console.log('🎉 Seed data created successfully!');
    console.log('=================================\n');
    console.log('Test Accounts:');
    console.log('Customer: customer@test.com / test123');
    console.log('Vendor: vendor@test.com / test123');
    console.log('Delivery: delivery@test.com / test123');
    console.log('\nRestaurants:');
    console.log(`- ${restaurant1.name} (ID: ${restaurant1._id})`);
    console.log(`- ${restaurant2.name} (ID: ${restaurant2._id})`);
    console.log('\n=================================\n');

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error('Full error:', error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

seedData();
