import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeItem, updateQuantity, clearCart } from '../redux/slices/cartSlice';

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);

  const totalAmount = cart.items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      dispatch(removeItem(itemId));
    } else {
      dispatch(updateQuantity({ itemId, quantity }));
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', { totalAmount });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.menuItem.name}</Text>
        <Text style={styles.itemPrice}>₹{item.menuItem.price}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.menuItem._id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.menuItem._id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.continueShoppingButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={item => item.menuItem._id}
        style={styles.cartList}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ₹{totalAmount}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  continueShoppingButton: {
    marginTop: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
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
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
