import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { login } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login: authLogin } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setApiError(null);
      const res = await login(data);
      if (res.data.succeeded && res.data.data) {
        const { token, user } = res.data.data;
        await authLogin(token, user);
      } else {
        setApiError(res.data.message ?? 'Login failed. Please try again.');
      }
    } catch (e: any) {
      setApiError(
        e.response?.data?.message ?? 'Unable to connect. Check your internet connection.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.logo}>V</Text>
        <Text style={styles.brand}>Vistaro</Text>
        <Text style={styles.tagline}>Welcome back</Text>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        {apiError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <AppInput
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <AppInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <AppButton
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          style={styles.button}
        />

        <TouchableOpacity
          style={styles.register}
          onPress={() => navigation.navigate('Register' as any)}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerLink}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0d9488',
    width: 56,
    height: 56,
    lineHeight: 56,
    textAlign: 'center',
    backgroundColor: 'rgba(13,148,136,0.15)',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  brand: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
  tagline: { fontSize: 14, color: '#94c3dc', marginTop: 4 },
  form: { flex: 1 },
  formContent: { padding: 24 },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: { color: '#dc2626', fontSize: 13 },
  button: { marginTop: 8 },
  register: { marginTop: 24, alignItems: 'center' },
  registerText: { fontSize: 14, color: '#64748b' },
  registerLink: { color: '#0d9488', fontWeight: '700' },
});
