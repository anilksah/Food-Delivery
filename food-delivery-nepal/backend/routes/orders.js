const express = require('express');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      }

      totalAmount += menuItem.price * item.quantity;
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions
      });
    }

    // Add delivery fee
    const restaurant = await Restaurant.findById(restaurantId);
    totalAmount += restaurant.deliveryFee;

    const order = new Order({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      specialInstructions
    });

    await order.save();

    // Populate the order with necessary data
    await order.populate('restaurant', 'name deliveryTime');
    await order.populate('items.menuItem', 'name');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(restaurantId).emit('new_order', order);

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('restaurant', 'name images')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization checks based on user role
    if (req.user.role === 'vendor' && order.restaurant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;

    // Set estimated delivery time when order is confirmed
    if (status === 'confirmed') {
      const deliveryTime = new Date();
      deliveryTime.setMinutes(deliveryTime.getMinutes() + 45); // 45 minutes estimate
      order.estimatedDelivery = deliveryTime;
    }

    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(order._id.toString()).emit('order_updated', order);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
