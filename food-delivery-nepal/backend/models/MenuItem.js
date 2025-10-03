const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Special']
  },
  cuisineType: {
    type: String,
    enum: ['Nepali', 'Indian', 'Chinese', 'Italian', 'Fast Food', 'Vegetarian', 'Non-Veg', 'Street Food', 'Beverages']
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  ingredients: [String],
  spiceLevel: {
    type: String,
    enum: ['Mild', 'Medium', 'Hot', 'Very Hot'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
