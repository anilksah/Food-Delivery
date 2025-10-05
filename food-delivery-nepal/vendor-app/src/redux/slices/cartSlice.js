import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    restaurant: null,
  },
  reducers: {
    addItem: (state, action) => {
      const { item, restaurantId } = action.payload;

      // If adding from different restaurant, clear cart
      if (state.restaurant && state.restaurant !== restaurantId) {
        state.items = [];
      }

      state.restaurant = restaurantId;

      const existingItem = state.items.find(i => i.menuItem._id === item._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          menuItem: item,
          quantity: 1,
          specialInstructions: ''
        });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.menuItem._id !== action.payload);
      if (state.items.length === 0) {
        state.restaurant = null;
      }
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(i => i.menuItem._id === itemId);
      if (item) {
        if (quantity === 0) {
          state.items = state.items.filter(i => i.menuItem._id !== itemId);
        } else {
          item.quantity = quantity;
        }
      }
      if (state.items.length === 0) {
        state.restaurant = null;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
    },
    loadCart: (state, action) => {
      state.items = action.payload.items || [];
      state.restaurant = action.payload.restaurant || null;
    }
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, loadCart } = cartSlice.actions;

// Thunk to persist cart
export const persistCart = () => async (dispatch, getState) => {
  try {
    const { cart } = getState();
    await AsyncStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error persisting cart:', error);
  }
};

// Thunk to load cart from storage
export const loadPersistedCart = () => async (dispatch) => {
  try {
    const cartData = await AsyncStorage.getItem('cart');
    if (cartData) {
      dispatch(loadCart(JSON.parse(cartData)));
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
};

export default cartSlice.reducer;
