import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../redux/slices/cartSlice';
import api from '../services/api';

export default function RestaurantScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const [menuItems, setMenuItems] = useState([]);
  const [groupedMenu, setGroupedMenu] = useState({});
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get(`/menu/restaurant/${restaurant._id}`);
      setMenuItems(response.data.menuItems);
      setGroupedMenu(response.data.groupedMenu);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const handleAddToCart = (item) => {
    dispatch(addItem({ item, restaurantId: restaurant._id }));
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <Image source={{ uri: item.image }} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.menuPrice}>₹{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategory = (category) => (
    <View key={category} style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <FlatList
        data={groupedMenu[category]}
        renderItem={renderMenuItem}
        keyExtractor={item => item._id}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={{ uri: restaurant.images[0] }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
          <Text style={styles.restaurantDetails}>
            {restaurant.cuisineType.join(' • ')} • ₹{restaurant.deliveryFee} delivery
          </Text>
          <Text style={styles.restaurantDetails}>
            {restaurant.deliveryTime.min}-{restaurant.deliveryTime.max} min
          </Text>
        </View>

        <View style={styles.menuContainer}>
          {Object.keys(groupedMenu).map(renderCategory)}
        </View>
      </ScrollView>

      {cart.items.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>
            View Cart ({cart.items.reduce((total, item) => total + item.quantity, 0)} items)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  restaurantDetails: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  menuContainer: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  menuInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
