const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    specialInstructions: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: {
      type: String,
      enum: ['home', 'work', 'other']
    },
    street: String,
    city: String,
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'esewa', 'khalti', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedDelivery: Date,
  specialInstructions: String
}, {
  timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const timestamp = date.getTime();
    this.orderId = `ORD${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
