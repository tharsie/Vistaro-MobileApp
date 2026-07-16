import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ShopOwnerDashboard from '../screens/shop-owner/ShopOwnerDashboard';
import ManageJobsScreen from '../screens/shop-owner/ManageJobsScreen';
import JobApplicationsScreen from '../screens/shop-owner/JobApplicationsScreen';
import ShopOwnerProfileScreen from '../screens/shop-owner/ShopOwnerProfileScreen';
import InboxScreen from '../screens/messaging/InboxScreen';

export type ShopOwnerTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Candidates: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ShopOwnerTabParamList>();

const COLORS = { accent: '#0d9488', inactive: '#94a3b8', bg: '#ffffff' };

export default function ShopOwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.bg,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 12,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Jobs: focused ? 'briefcase' : 'briefcase-outline',
            Candidates: focused ? 'people' : 'people-outline',
            Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Profile: focused ? 'storefront' : 'storefront-outline',
          };
          return (
            <Ionicons name={icons[route.name] as any} size={22} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={ShopOwnerDashboard} options={{ title: 'Home' }} />
      <Tab.Screen name="Jobs" component={ManageJobsScreen} options={{ title: 'My Jobs' }} />
      <Tab.Screen name="Candidates" component={JobApplicationsScreen} options={{ title: 'Candidates' }} />
      <Tab.Screen name="Messages" component={InboxScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="Profile" component={ShopOwnerProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
