const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/restaurants/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all restaurants with filtering
router.get('/', async (req, res) => {
  try {
    const { city, cuisine, page = 1, limit = 10, search } = req.query;

    let filter = { isActive: true };

    if (city && city !== 'all') {
      filter['location.city'] = city;
    }

    if (cuisine && cuisine !== 'all') {
      filter.cuisineType = { $in: [cuisine] };
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const restaurants = await Restaurant.find(filter)
      .populate('vendor', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Restaurant.countDocuments(filter);

    res.json({
      restaurants,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('vendor', 'name email phone');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Get menu items for this restaurant
    const menuItems = await MenuItem.find({
      restaurantId: req.params.id,
      isAvailable: true
    });

    res.json({
      ...restaurant.toObject(),
      menuItems
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create restaurant (Vendor only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can create restaurants' });
    }

    const images = req.files ? req.files.map(file => file.path) : [];

    const restaurantData = {
      ...req.body,
      vendor: req.user.id,
      images,
      cuisineType: Array.isArray(req.body.cuisineType) ? req.body.cuisineType : [req.body.cuisineType],
      deliveryTime: typeof req.body.deliveryTime === 'string' ? JSON.parse(req.body.deliveryTime) : req.body.deliveryTime,
      openingHours: typeof req.body.openingHours === 'string' ? JSON.parse(req.body.openingHours) : req.body.openingHours
    };

    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();

    await restaurant.populate('vendor', 'name email phone');
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor's restaurants
router.get('/vendor/my-restaurants', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const restaurants = await Restaurant.find({ vendor: req.user.id })
      .populate('vendor', 'name email phone');

    res.json(restaurants);
  } catch (error) {
    console.error('Get vendor restaurants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
