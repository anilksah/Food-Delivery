// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import restaurantSlice from './slices/restaurantSlice';
import cartSlice from './slices/cartSlice';

export default configureStore({
  reducer: {
    restaurants: restaurantSlice,
    cart: cartSlice,
  },
});

// src/redux/slices/restaurantSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (filters) => {
    const response = await api.get('/restaurants', { params: filters });
    return response.data;
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    restaurants: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload.restaurants;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default restaurantSlice.reducer;

// src/redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

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
        state.items.push({ menuItem: item, quantity: 1, specialInstructions: '' });
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
        item.quantity = quantity;
        if (quantity === 0) {
          state.items = state.items.filter(i => i.menuItem._id !== itemId);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
