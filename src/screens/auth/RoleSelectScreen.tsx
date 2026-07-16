import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { register as registerApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/ui/AppButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelect'>;

const ROLES: Array<{
  key: 'Student' | 'ShopOwner';
  icon: string;
  title: string;
  description: string;
  color: string;
}> = [
  {
    key: 'Student',
    icon: 'school-outline',
    title: 'Student',
    description: 'Find part-time or full-time local jobs that fit your schedule.',
    color: '#0d9488',
  },
  {
    key: 'ShopOwner',
    icon: 'storefront-outline',
    title: 'Shop Owner',
    description: 'Post jobs and connect with motivated local students.',
    color: '#0f2c59',
  },
];

export default function RoleSelectScreen({ route, navigation }: Props) {
  const { fullName, email, password } = route.params;
  const { login } = useAuth();
  const [selected, setSelected] = useState<'Student' | 'ShopOwner' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      setError(null);
      const res = await registerApi({ fullName, email, password, role: selected });
      if (res.data.succeeded && res.data.data) {
        const { token, user } = res.data.data;
        await login(token, user);
      } else {
        setError(res.data.message ?? 'Registration failed.');
      }
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>I am a…</Text>
        <Text style={styles.sub}>Select your account type to continue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.key}
            style={[
              styles.card,
              selected === role.key && { borderColor: role.color, borderWidth: 2.5 },
            ]}
            onPress={() => setSelected(role.key)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconBg, { backgroundColor: `${role.color}18` }]}>
              <Ionicons name={role.icon as any} size={36} color={role.color} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDesc}>{role.description}</Text>
            </View>
            {selected === role.key && (
              <Ionicons name="checkmark-circle" size={24} color={role.color} />
            )}
          </TouchableOpacity>
        ))}

        <AppButton
          title="Create Account"
          onPress={onConfirm}
          loading={loading}
          disabled={!selected}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59',
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backText: { color: '#94c3dc', marginBottom: 16, fontSize: 14 },
  title: { fontSize: 26, fontWeight: '800', color: '#ffffff' },
  sub: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  content: { padding: 24 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#0f2c59',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardBody: { flex: 1 },
  roleTitle: { fontSize: 18, fontWeight: '700', color: '#0f2c59', marginBottom: 4 },
  roleDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 13 },
});
