import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import StudentTabsNavigator from './StudentTabs';
import ShopOwnerTabsNavigator from './ShopOwnerTabs';
import AdminTabsNavigator from './AdminTabs';
import ChatScreen from '../screens/messaging/ChatScreen';
import JobDetailScreen from '../screens/student/JobDetailScreen';
import CreateJobScreen from '../screens/shop-owner/CreateJobScreen';

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

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f2c59' }}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
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
