import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../redux/slices/ordersSlice';

export default function OrderManagement() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.orders);
  const [filter, setFilter] = React.useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    dispatch(fetchOrders());
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    Alert.alert(
      'Update Order Status',
      `Change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            dispatch(updateOrderStatus({ orderId, status: newStatus }))
              .unwrap()
              .then(() => {
                Alert.alert('Success', 'Order status updated');
              })
              .catch((error) => {
                Alert.alert('Error', error);
              });
          }
        }
      ]
    );
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  const renderStatusButton = (order, status, label, color) => {
    return (
      <TouchableOpacity
        style={[styles.statusButton, { backgroundColor: color }]}
        onPress={() => handleStatusUpdate(order._id, status)}
      >
        {label}

    );
  };

  const renderOrder = ({ item: order }) => (


        #{order.orderId}

          {order.status.toUpperCase()}




        Customer: {order.customer?.name || 'Unknown'}

      Phone: {order.customer?.phone || 'N/A'}


        {order.items.map((item, index) => (

            • {item.quantity}x {item.menuItem?.name || 'Item'}

        ))}


      Total: Rs {order.totalAmount}
      Payment: {order.paymentMethod.toUpperCase()}


        {order.status === 'pending' && (
          <>
            {renderStatusButton(order, 'confirmed', 'Accept', '#28a745')}
            {renderStatusButton(order, 'cancelled', 'Reject', '#dc3545')}
          </>
        )}
        {order.status === 'confirmed' &&
          renderStatusButton(order, 'preparing', 'Start Preparing', '#6f42c1')}
        {order.status === 'preparing' &&
          renderStatusButton(order, 'ready', 'Mark Ready', '#20c997')}


  );

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#007bff',
      preparing: '#6f42c1',
      ready: '#20c997',
      picked_up: '#17a2b8',
      on_the_way: '#fd7e14',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  return (


        {['all', 'pending', 'confirmed', 'preparing', 'ready'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}


        ))}


      <FlatList
        data={getFilteredOrders()}
        renderItem={renderOrder}
        keyExtractor={item => item._id}
        refreshControl={

        }
        ListEmptyComponent={

            No orders found

        }
      />

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  status: {
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
