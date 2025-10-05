const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cuisineType: [{
    type: String,
    enum: ['Nepali', 'Indian', 'Chinese', 'Italian', 'Fast Food', 'Vegetarian', 'Non-Veg', 'Street Food', 'Beverages']
  }],
  location: {
    street: String,
    city: {
      type: String,
      required: true,
      enum: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar', 'Butwal', 'Nepalgunj', 'Dharan', 'Bharatpur', 'Hetauda']
    },
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryFee: {
    type: Number,
    default: 60,
    min: 0
  },
  deliveryTime: {
    min: {
      type: Number,
      default: 20
    },
    max: {
      type: Number,
      default: 40
    }
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  images: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  openingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
restaurantSchema.index({ 'location.city': 1, isActive: 1 });
restaurantSchema.index({ vendor: 1 });
restaurantSchema.index({ cuisineType: 1 });
restaurantSchema.index({ rating: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
