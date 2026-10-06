import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import StudentTabsNavigator from './StudentTabs';
import ShopOwnerTabsNavigator from './ShopOwnerTabs';
import AdminTabsNavigator from './AdminTabs';
import ChatScreen from '../screens/messaging/ChatScreen';
import JobDetailScreen from '../screens/student/JobDetailScreen';
import CreateJobScreen from '../screens/shop-owner/CreateJobScreen';
import SplashScreen from '../screens/auth/SplashScreen';

// Root stack wraps tab navigators to allow pushing full-screen modals
const RootStack = createNativeStackNavigator();

function StudentRoot() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="StudentTabs" component={StudentTabsNavigator} />
      <RootStack.Screen name="JobDetail" component={JobDetailScreen} />
      <RootStack.Screen name="Chat" component={ChatScreen} />
    </RootStack.Navigator>
  );
}

function ShopOwnerRoot() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="ShopOwnerTabs" component={ShopOwnerTabsNavigator} />
      <RootStack.Screen name="CreateJob" component={CreateJobScreen} />
      <RootStack.Screen name="Chat" component={ChatScreen} />
    </RootStack.Navigator>
  );
}

function AdminRoot() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="AdminTabs" component={AdminTabsNavigator} />
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const { state } = useAuth();
  const [launching, setLaunching] = useState(true);

  // Show the launch screen on app boot for all users
  if (launching || state.isLoading) {
    return <SplashScreen onFinish={() => setLaunching(false)} />;
  }

  const renderNavigator = () => {
    if (!state.token || !state.user) return <AuthStack />;
    const roles = state.user.roles.map((r) => r.toLowerCase());
    if (roles.includes('admin')) return <AdminRoot />;
    if (roles.includes('shopowner')) return <ShopOwnerRoot />;
    return <StudentRoot />;
  };

  return <NavigationContainer>{renderNavigator()}</NavigationContainer>;
}
