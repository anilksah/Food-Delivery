const express = require('express');
const { body } = require('express-validator');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('restaurantId').isMongoId().withMessage('Invalid restaurant ID'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.menuItemId').isMongoId().withMessage('Invalid menu item ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['cod', 'esewa', 'khalti', 'card']).withMessage('Invalid payment method'),
  body('deliveryAddress').isObject().withMessage('Delivery address is required')
];

// Create new order
router.post('/', auth, createOrderValidation, validate, async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Verify restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or inactive'
      });
    }

    // Calculate total amount and verify items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItemId} not found or unavailable`
        });
      }

      // Verify menu item belongs to restaurant
      if (menuItem.restaurantId.toString() !== restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Menu item does not belong to selected restaurant'
        });
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
    totalAmount += restaurant.deliveryFee;

    const order = new Order({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      deliveryFee: restaurant.deliveryFee,
      deliveryAddress,
      paymentMethod,
      specialInstructions
    });

    await order.save();

    // Populate order data
    await order.populate([
      { path: 'restaurant', select: 'name deliveryTime images' },
      { path: 'items.menuItem', select: 'name price' }
    ]);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit('new_order', order);
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { customer: req.user.id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('restaurant', 'name images')
      .populate('deliveryPartner', 'name phone')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get vendor orders (FIXED authorization)
router.get('/vendor-orders', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find vendor's restaurant
    const restaurant = await Restaurant.findOne({ vendor: req.user.id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const { status } = req.query;
    const filter = { restaurant: restaurant._id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

// Update order status (FIXED authorization)
router.patch('/:id/status', auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorization check for vendors
    if (req.user.role === 'vendor') {
      const restaurant = await Restaurant.findOne({
        _id: order.restaurant,
        vendor: req.user.id
      });

      if (!restaurant) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this order'
        });
      }
    }

    // Authorization check for customers (can only cancel)
    if (req.user.role === 'customer') {
      if (order.customer.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Customers can only cancel orders'
        });
      }
      if (!['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel order in current status'
        });
      }
    }

    order.status = status;

    // Set estimated delivery time when confirmed
    if (status === 'confirmed') {
      const deliveryTime = new Date();
      deliveryTime.setMinutes(deliveryTime.getMinutes() + 45);
      order.estimatedDelivery = deliveryTime;
    }

    // Set actual delivery time when delivered
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_updated', order);
      io.to(`customer_${order.customer}`).emit('order_updated', order);
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// Cancel order
router.post('/:id/cancel', auth, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only customer can cancel their own order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
