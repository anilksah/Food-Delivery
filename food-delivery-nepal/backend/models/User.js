const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'delivery', 'admin'],
    default: 'customer'
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: String,
    city: {
      type: String,
      enum: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar', 'Butwal', 'Nepalgunj', 'Dharan', 'Bharatpur', 'Hetauda'],
      required: true
    },
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  isVerified: {
    type: Boolean,
    default: true // Set to true for testing
  },
  profileImage: String
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
