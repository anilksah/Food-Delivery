const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone
    };

    if (req.file) {
      updates.profileImage = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Add address
router.post('/addresses', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

// Update address
router.put('/addresses/:addressId', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/addresses/:addressId', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.id(req.params.addressId).remove();
    await user.save();

    res.json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
