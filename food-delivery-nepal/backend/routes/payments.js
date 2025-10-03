const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Initiate payment
router.post('/initiate', auth, async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    const order = await Order.findOne({ _id: orderId, customer: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // For cash on delivery, we can mark the payment as pending and order as confirmed
    if (paymentMethod === 'cod') {
      order.paymentMethod = 'cod';
      order.paymentStatus = 'pending';
      await order.save();
      return res.json({
        success: true,
        message: 'Order placed with COD. Payment will be collected on delivery.'
      });
    }

    // For eSewa and Khalti, we would integrate with their API
    // This is a placeholder for payment gateway integration
    if (paymentMethod === 'esewa' || paymentMethod === 'khalti') {
      // Here we would generate the payment request and return the payment URL or details
      // For now, we simulate a successful payment
      order.paymentMethod = paymentMethod;
      order.paymentStatus = 'paid';
      await order.save();

      return res.json({
        success: true,
        message: `Payment with ${paymentMethod} completed successfully.`
      });
    }

    res.status(400).json({ message: 'Invalid payment method' });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Payment success callback (for eSewa, Khalti, etc.)
router.post('/success', auth, async (req, res) => {
  // This endpoint would be called by the payment gateway after successful payment
  // We would verify the payment and update the order accordingly
  const { orderId, transactionId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.transactionId = transactionId;
    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(order._id.toString()).emit('payment_success', order);

    res.json({ success: true, message: 'Payment verified and order confirmed.' });
  } catch (error) {
    console.error('Payment success callback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
