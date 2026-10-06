import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  RoleSelect: { fullName: string; email: string; phoneNumber: string; password: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
    </Stack.Navigator>
  );
}
