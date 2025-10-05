import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import api from '../services/api';

export default function RestaurantProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurants/vendor/my-restaurants');
      if (response.data.length > 0) {
        setRestaurant(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      Alert.alert('Error', 'Failed to load restaurant information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const toggleRestaurantStatus = async () => {
    if (!restaurant) return;

    try {
      const newStatus = !restaurant.isActive;
      await api.patch(`/restaurants/${restaurant._id}`, {
        isActive: newStatus
      });

      setRestaurant({ ...restaurant, isActive: newStatus });
      Alert.alert(
        'Success',
        `Restaurant ${newStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      Alert.alert('Error', 'Failed to update restaurant status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Vendor Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendor Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user?.name || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{user?.phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Role:</Text>
          <Text style={[styles.value, styles.roleText]}>
            {user?.role?.toUpperCase() || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Restaurant Information Section */}
      {restaurant ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{restaurant.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value} numberOfLines={2}>
              {restaurant.description}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>City:</Text>
            <Text style={styles.value}>{restaurant.location?.city || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Area:</Text>
            <Text style={styles.value}>{restaurant.location?.area || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Cuisine:</Text>
            <Text style={styles.value}>
              {restaurant.cuisineType?.join(', ') || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Delivery Fee:</Text>
            <Text style={styles.value}>Rs {restaurant.deliveryFee}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Delivery Time:</Text>
            <Text style={styles.value}>
              {restaurant.deliveryTime?.min}-{restaurant.deliveryTime?.max} min
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Rating:</Text>
            <Text style={styles.value}>
              ⭐ {restaurant.rating?.toFixed(1) || '0.0'} ({restaurant.totalReviews || 0} reviews)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusBadge,
                restaurant.isActive ? styles.statusActive : styles.statusInactive
              ]}>
                {restaurant.isActive ? '✓ Active' : '✗ Inactive'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Verified:</Text>
            <Text style={[
              styles.value,
              restaurant.isVerified ? styles.verified : styles.notVerified
            ]}>
              {restaurant.isVerified ? '✓ Verified' : '✗ Not Verified'}
            </Text>
          </View>

          {/* Toggle Restaurant Status */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              restaurant.isActive ? styles.deactivateButton : styles.activateButton
            ]}
            onPress={toggleRestaurantStatus}
          >
            <Text style={styles.toggleButtonText}>
              {restaurant.isActive ? 'Deactivate Restaurant' : 'Activate Restaurant'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.noRestaurantText}>
            No restaurant found. Please contact support to create your restaurant profile.
          </Text>
        </View>
      )}

      {/* Statistics Section */}
      {restaurant && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{restaurant.totalReviews || 0}</Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {restaurant.rating?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => Alert.alert('Coming Soon', 'Profile editing feature coming soon!')}
        >
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => Alert.alert('Support', 'Contact support at: support@fooddelivery.com')}
        >
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  roleText: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  statusContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  statusActive: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusInactive: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  verified: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  notVerified: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  noRestaurantText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flex: 1,
    margin: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  toggleButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  activateButton: {
    backgroundColor: '#28a745',
  },
  deactivateButton: {
    backgroundColor: '#ffc107',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  actionsSection: {
    margin: 16,
  },
  editProfileButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    height: 40,
  },
});
