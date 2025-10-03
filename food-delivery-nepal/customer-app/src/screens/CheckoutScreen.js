import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = cart.items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  const deliveryFee = 60; // This should come from restaurant data
  const grandTotal = totalAmount + deliveryFee;

  const addresses = [
    {
      _id: '1',
      type: 'home',
      street: '123 Main Street',
      city: 'Kathmandu',
      area: 'Thamel'
    },
    {
      _id: '2',
      type: 'work',
      street: '456 Office Road',
      city: 'Kathmandu',
      area: 'Durbar Marg'
    }
  ];

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        restaurantId: cart.restaurant,
        items: cart.items.map(item => ({
          menuItemId: item.menuItem._id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        deliveryAddress: selectedAddress,
        paymentMethod,
        totalAmount: grandTotal
      };

      const response = await api.post('/orders', orderData);

      // Clear cart
      dispatch(clearCart());

      // Navigate to order tracking
      navigation.replace('OrderTracking', { order: response.data });

      Alert.alert('Success', 'Your order has been placed successfully!');
    } catch (error) {
      console.error('Order placement error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.map(address => (
            <TouchableOpacity
              key={address._id}
              style={[
                styles.addressCard,
                selectedAddress?._id === address._id && styles.selectedAddress
              ]}
              onPress={() => setSelectedAddress(address)}
            >
              <Text style={styles.addressType}>{address.type}</Text>
              <Text style={styles.addressText}>{address.street}, {address.area}</Text>
              <Text style={styles.addressText}>{address.city}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'cod' && styles.selectedPayment
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'esewa' && styles.selectedPayment
            ]}
            onPress={() => setPaymentMethod('esewa')}
          >
            <Text style={styles.paymentText}>eSewa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'khalti' && styles.selectedPayment
            ]}
            onPress={() => setPaymentMethod('khalti')}
          >
            <Text style={styles.paymentText}>Khalti</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.items.map(item => (
            <View key={item.menuItem._id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.menuItem.name} x {item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.menuItem.price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee:</Text>
            <Text style={styles.totalValue}>₹{deliveryFee}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            isProcessing && styles.placeOrderButtonDisabled
          ]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <Text style={styles.placeOrderButtonText}>
            {isProcessing ? 'Processing...' : `Place Order - ₹${grandTotal}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedAddress: {
    borderColor: '#FF6B35',
    backgroundColor: '#fff5f5',
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  paymentMethod: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedPayment: {
    borderColor: '#FF6B35',
    backgroundColor: '#fff5f5',
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#666',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  placeOrderButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
