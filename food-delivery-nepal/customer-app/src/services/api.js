import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// API URL based on platform
const API_BASE_URL = (() => {
  if (!__DEV__) {
    return 'https://your-production-api.com/api';
  }

  // Development
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api'; // Web browser
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:5000/api'; // iOS Simulator
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api'; // Android Emulator
  }

  return 'http://localhost:5000/api'; // Default
})();

console.log('🔗 API URL:', API_BASE_URL, 'Platform:', Platform.OS);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      Alert.alert('Session Expired', 'Please login again');
    }
    return Promise.reject(error);
  }
);

export default api;
