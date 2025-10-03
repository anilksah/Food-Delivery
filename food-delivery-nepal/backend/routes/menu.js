const express = require('express');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/menu/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get menu items for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { category, available } = req.query;
    let filter = { restaurantId: req.params.restaurantId };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }

    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({
      menuItems,
      groupedMenu,
      total: menuItems.length
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add menu item (Vendor only)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can add menu items' });
    }

    // Check if restaurant belongs to vendor
    const restaurant = await Restaurant.findOne({
      _id: req.body.restaurantId,
      vendor: req.user.id
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or access denied' });
    }

    const menuItemData = {
      ...req.body,
      image: req.file ? req.file.path : ''
    };

    const menuItem = new MenuItem(menuItemData);
    await menuItem.save();

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update menu item
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if restaurant belongs to vendor
    const restaurant = await Restaurant.findOne({
      _id: menuItem.restaurantId,
      vendor: req.user.id
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedMenuItem);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
