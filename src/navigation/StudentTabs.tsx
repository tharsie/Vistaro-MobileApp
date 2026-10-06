import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import StudentDashboard from '../screens/student/StudentDashboard';
import JobSearchScreen from '../screens/student/JobSearchScreen';
import MyApplicationsScreen from '../screens/student/MyApplicationsScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import InboxScreen from '../screens/messaging/InboxScreen';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type StudentTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Applications: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

const COLORS = { primary: '#0f2c59', accent: '#0d9488', inactive: '#94a3b8', bg: '#ffffff' };

export default function StudentTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

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
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
        tabBarLabel: ({ focused, color }) => {
          const titles: Record<string, string> = {
            Home: 'Home',
            Jobs: 'Find Jobs',
            Applications: 'My Apps',
            Messages: 'Messages',
            Profile: 'Profile',
          };
          return (
            <View style={{ alignItems: 'center', marginTop: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color }}>
                {titles[route.name] || route.name}
              </Text>
              {focused ? (
                <View
                  style={{
                    width: 20,
                    height: 2.5,
                    backgroundColor: COLORS.accent,
                    borderRadius: 2,
                    marginTop: 2,
                  }}
                />
              ) : (
                <View style={{ height: 2.5, marginTop: 2 }} />
              )}
            </View>
          );
        },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Jobs: focused ? 'briefcase' : 'briefcase-outline',
            Applications: focused ? 'document-text' : 'document-text-outline',
            Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return (
            <Ionicons name={icons[route.name] as any} size={22} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={StudentDashboard} options={{ title: 'Home' }} />
      <Tab.Screen name="Jobs" component={JobSearchScreen} options={{ title: 'Find Jobs' }} />
      <Tab.Screen name="Applications" component={MyApplicationsScreen} options={{ title: 'My Apps' }} />
      <Tab.Screen name="Messages" component={InboxScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="Profile" component={StudentProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});
