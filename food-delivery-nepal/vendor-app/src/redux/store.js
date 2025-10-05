import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ordersReducer from './slices/ordersSlice';
import menuReducer from './slices/menuSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    menu: menuReducer,
  },
});

export default store;
