import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isLoading) {
      // AppNavigator handles routing based on auth state, so just guard against
      // being stuck on splash after token restored
      if (!state.token) {
        navigation.replace('Login');
      }
    }
  }, [state.isLoading, state.token]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.logoWrapper}>
        <Text style={styles.logo}>V</Text>
      </View>
      <Text style={styles.brand}>Vistaro</Text>
      <Text style={styles.tagline}>Local jobs, connected.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f2c59',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 8px 20px rgba(13, 148, 136, 0.5)',
    elevation: 12,
  },
  logo: { fontSize: 40, fontWeight: '900', color: '#fff' },
  brand: { fontSize: 34, fontWeight: '800', color: '#ffffff', letterSpacing: 2 },
  tagline: { fontSize: 14, color: '#94c3dc', marginTop: 8, letterSpacing: 0.5 },
});
