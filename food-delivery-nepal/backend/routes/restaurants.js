const express = require('express');
const Restaurant = require('../models/Restaurant');
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

const upload = multer({ storage });

// Get all restaurants with filtering
router.get('/', async (req, res) => {
  try {
    const { city, cuisine, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true };

    if (city) {
      filter['location.city'] = city;
    }

    if (cuisine) {
      filter.cuisineType = { $in: [cuisine] };
    }

    const restaurants = await Restaurant.find(filter)
      .populate('vendor', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1 });

    const total = await Restaurant.countDocuments(filter);

    res.json({
      restaurants,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
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

    res.json(restaurant);
  } catch (error) {
    console.error(error);
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

    const restaurant = new Restaurant({
      ...req.body,
      vendor: req.user.id,
      images
    });

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
