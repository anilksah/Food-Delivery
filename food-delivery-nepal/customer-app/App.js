import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import store from './src/redux/store';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import RestaurantScreen from './src/screens/RestaurantScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Food Delivery Nepal' }}
          />
          <Stack.Screen
            name="Restaurant"
            component={RestaurantScreen}
            options={{ title: 'Restaurant' }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ title: 'Your Cart' }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ title: 'Checkout' }}
          />
          <Stack.Screen
            name="OrderTracking"
            component={OrderTrackingScreen}
            options={{ title: 'Order Tracking' }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
