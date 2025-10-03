import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function OrderTrackingScreen() {
  const route = useRoute();
  const { order } = route.params;
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Order Confirmed' },
    { key: 'preparing', label: 'Preparing Food' },
    { key: 'ready', label: 'Ready for Pickup' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'on_the_way', label: 'On the Way' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStatusIndex = statusSteps.findIndex(step => step.key === currentStatus);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Order Status Timeline */}
        <View style={styles.timeline}>
          {statusSteps.map((step, index) => (
            <View key={step.key} style={styles.timelineStep}>
              <View style={[
                styles.timelineDot,
                index <= currentStatusIndex ? styles.completedDot : styles.pendingDot
              ]}>
                {index < currentStatusIndex && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[
                styles.timelineLabel,
                index <= currentStatusIndex ? styles.completedLabel : styles.pendingLabel
              ]}>
                {step.label}
              </Text>
              {index < statusSteps.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  index < currentStatusIndex ? styles.completedLine : styles.pendingLine
                ]} />
              )}
            </View>
          ))}
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>{order.orderId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Restaurant:</Text>
            <Text style={styles.detailValue}>{order.restaurant.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Address:</Text>
            <Text style={styles.detailValue}>
              {order.deliveryAddress.street}, {order.deliveryAddress.area}, {order.deliveryAddress.city}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map(item => (
            <View key={item.menuItem._id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.menuItem.name} x {item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>
      </ScrollView>
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
  timeline: {
    marginBottom: 24,
  },
  timelineStep: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedDot: {
    backgroundColor: '#FF6B35',
  },
  pendingDot: {
    backgroundColor: '#ccc',
    borderWidth: 2,
    borderColor: '#999',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timelineLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  completedLabel: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  pendingLabel: {
    color: '#999',
  },
  timelineLine: {
    width: 2,
    height: 20,
    marginVertical: 4,
  },
  completedLine: {
    backgroundColor: '#FF6B35',
  },
  pendingLine: {
    backgroundColor: '#ccc',
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
