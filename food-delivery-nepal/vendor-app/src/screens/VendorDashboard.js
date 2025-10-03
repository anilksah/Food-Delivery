import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import api from '../services/api';

export default function VendorDashboard({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurant();
    fetchOrders();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const response = await api.get('/restaurants/my-restaurant');
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/vendor-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchOrders();
      Alert.alert('Success', 'Order status updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.orderId}</Text>
        <Text style={[
          styles.status,
          { color: getStatusColor(item.status) }
        ]}>
          {item.status.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.customerName}>{item.customer.name}</Text>

      <FlatList
        data={item.items}
        renderItem={({ item: orderItem }) => (
          <Text style={styles.orderItem}>
            {orderItem.quantity}x {orderItem.menuItem.name}
          </Text>
        )}
        keyExtractor={(orderItem, index) => index.toString()}
      />

      <Text style={styles.total}>Total: ₹{item.totalAmount}</Text>

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => updateOrderStatus(item._id, 'confirmed')}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => updateOrderStatus(item._id, 'cancelled')}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.button, styles.preparingButton]}
            onPress={() => updateOrderStatus(item._id, 'preparing')}
          >
            <Text style={styles.buttonText}>Start Preparing</Text>
          </TouchableOpacity>
        )}

        {item.status === 'preparing' && (
          <TouchableOpacity
            style={[styles.button, styles.readyButton]}
            onPress={() => updateOrderStatus(item._id, 'ready')}
          >
            <Text style={styles.buttonText}>Mark Ready</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#007BFF',
      preparing: '#6F42C1',
      ready: '#20C997',
      delivered: '#28A745',
      cancelled: '#DC3545'
    };
    return colors[status] || '#6C757D';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vendor Dashboard</Text>
      {restaurant && (
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
      )}

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item._id}
        refreshing={false}
        onRefresh={fetchOrders}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  restaurantName: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  customerName: {
    color: '#666',
    marginBottom: 8,
  },
  orderItem: {
    color: '#333',
    marginBottom: 4,
  },
  total: {
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#007BFF',
  },
  cancelButton: {
    backgroundColor: '#DC3545',
  },
  preparingButton: {
    backgroundColor: '#6F42C1',
  },
  readyButton: {
    backgroundColor: '#20C997',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
