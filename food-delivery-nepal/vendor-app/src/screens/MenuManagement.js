import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import api from '../services/api';

export default function MenuManagement({ navigation }) {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    cuisineType: 'Nepali',
    preparationTime: '15',
    spiceLevel: 'Medium'
  });

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, []);

  const fetchRestaurantAndMenu = async () => {
    try {
      // First get vendor's restaurant
      const restaurantResponse = await api.get('/restaurants/vendor/my-restaurants');
      if (restaurantResponse.data.length > 0) {
        const vendorRestaurant = restaurantResponse.data[0];
        setRestaurant(vendorRestaurant);

        // Then get menu items
        const menuResponse = await api.get(`/menu/restaurant/${vendorRestaurant._id}`);
        setMenuItems(menuResponse.data.menuItems);
      }
    } catch (error) {
      console.error('Error fetching restaurant and menu:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      await api.post('/menu', {
        ...newItem,
        restaurantId: restaurant._id,
        price: parseFloat(newItem.price),
        preparationTime: parseInt(newItem.preparationTime)
      });

      Alert.alert('Success', 'Menu item added successfully');
      setIsAddingItem(false);
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        cuisineType: 'Nepali',
        preparationTime: '15',
        spiceLevel: 'Medium'
      });
      fetchRestaurantAndMenu();
    } catch (error) {
      console.error('Error adding menu item:', error);
      Alert.alert('Error', 'Failed to add menu item');
    }
  };

  const toggleItemAvailability = async (itemId, currentStatus) => {
    try {
      await api.put(`/menu/${itemId}`, {
        isAvailable: !currentStatus
      });
      fetchRestaurantAndMenu();
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <Text style={styles.itemCategory}>{item.category} • {item.cuisineType}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.availabilityButton,
          item.isAvailable ? styles.availableButton : styles.unavailableButton
        ]}
        onPress={() => toggleItemAvailability(item._id, item.isAvailable)}
      >
        <Text style={styles.availabilityButtonText}>
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingItem(true)}
        >
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {isAddingItem ? (
        <View style={styles.addItemForm}>
          <TextInput
            style={styles.input}
            placeholder="Item Name"
            value={newItem.name}
            onChangeText={text => setNewItem({...newItem, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newItem.description}
            onChangeText={text => setNewItem({...newItem, description: text})}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={newItem.price}
            onChangeText={text => setNewItem({...newItem, price: text})}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddItem}>
            <Text style={styles.saveButtonText}>Save Item</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setIsAddingItem(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={item => item._id}
          style={styles.menuList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addItemForm: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  availabilityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  availableButton: {
    backgroundColor: '#d4edda',
  },
  unavailableButton: {
    backgroundColor: '#f8d7da',
  },
  availabilityButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
