import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurants } from '../redux/slices/restaurantSlice';

const cities = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar'];
const cuisines = ['Nepali', 'Indian', 'Chinese', 'Fast Food', 'Vegetarian'];

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { restaurants, loading } = useSelector(state => state.restaurants);
  const [selectedCity, setSelectedCity] = useState('Kathmandu');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchRestaurants({ city: selectedCity }));
  }, [selectedCity]);

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.cuisine}>{item.cuisineType.join(', ')}</Text>
        <Text style={styles.deliveryInfo}>
          {item.deliveryTime.min}-{item.deliveryTime.max} min • ₹{item.deliveryFee} delivery
        </Text>
        <Text style={styles.rating}>⭐ {item.rating} ({item.totalReviews})</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning! 👋</Text>
        <Text style={styles.location}>Delivering to {selectedCity}</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for restaurants or food..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Cities Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesScroll}>
        {cities.map(city => (
          <TouchableOpacity
            key={city}
            style={[
              styles.cityButton,
              selectedCity === city && styles.cityButtonActive
            ]}
            onPress={() => setSelectedCity(city)}
          >
            <Text style={[
              styles.cityText,
              selectedCity === city && styles.cityTextActive
            ]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cuisines */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cuisinesScroll}>
        {cuisines.map(cuisine => (
          <TouchableOpacity key={cuisine} style={styles.cuisineButton}>
            <Text style={styles.cuisineText}>{cuisine}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Restaurants List */}
      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  citiesScroll: {
    marginBottom: 16,
  },
  cityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
  },
  cityButtonActive: {
    backgroundColor: '#FF6B35',
  },
  cityText: {
    color: '#666',
  },
  cityTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cuisinesScroll: {
    marginBottom: 16,
  },
  cuisineButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cuisineText: {
    color: '#495057',
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deliveryInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: '#FF6B35',
    marginTop: 4,
  },
});
