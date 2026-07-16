import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboard from '../screens/admin/AdminDashboard';
import PendingApplicationsScreen from '../screens/admin/PendingApplicationsScreen';
import PendingMessagesScreen from '../screens/admin/PendingMessagesScreen';
import PendingInterviewsScreen from '../screens/admin/PendingInterviewsScreen';
import ShopOwnerVerificationScreen from '../screens/admin/ShopOwnerVerificationScreen';

export type AdminTabParamList = {
  Dashboard: undefined;
  Applications: undefined;
  Messages: undefined;
  Interviews: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const COLORS = { accent: '#0d9488', inactive: '#94a3b8', bg: '#ffffff' };

export default function AdminTabs() {
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
            Dashboard: focused ? 'grid' : 'grid-outline',
            Applications: focused ? 'document-text' : 'document-text-outline',
            Messages: focused ? 'mail' : 'mail-outline',
            Interviews: focused ? 'calendar' : 'calendar-outline',
            More: focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline',
          };
          return (
            <Ionicons name={icons[route.name] as any} size={22} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Applications" component={PendingApplicationsScreen} options={{ title: 'Applications' }} />
      <Tab.Screen name="Messages" component={PendingMessagesScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="Interviews" component={PendingInterviewsScreen} options={{ title: 'Interviews' }} />
      <Tab.Screen name="More" component={ShopOwnerVerificationScreen} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
}
