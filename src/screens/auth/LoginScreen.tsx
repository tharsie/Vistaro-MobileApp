import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { login } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { getErrorMessage } from '../../utils/apiError';

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
      setApiError(getErrorMessage(e, 'Unable to connect. Check your internet connection.'));
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
        <View style={styles.logoWrapper}>
          <Text style={styles.logo}>V</Text>
        </View>
        <Text style={styles.brand}>Vistaro</Text>
        <Text style={styles.tagline}>Local jobs, connected.</Text>
      </View>

      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subWelcomeText}>Sign in to continue to your account</Text>

          {apiError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0f2c59' },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0px 8px 20px rgba(13, 148, 136, 0.4)',
      },
    }),
  },
  logo: { fontSize: 36, fontWeight: '900', color: '#fff' },
  brand: { fontSize: 30, fontWeight: '800', color: '#ffffff', letterSpacing: 1 },
  tagline: { fontSize: 13, color: '#94c3dc', marginTop: 4, opacity: 0.8 },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 24,
      },
      default: {
        boxShadow: '0px -6px 20px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  formContent: { paddingHorizontal: 28, paddingTop: 32, paddingBottom: 40 },
  welcomeText: { fontSize: 24, fontWeight: '800', color: '#0f2c59', marginBottom: 4 },
  subWelcomeText: { fontSize: 13, color: '#64748b', marginBottom: 24 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorBannerText: { color: '#dc2626', fontSize: 13, flex: 1, fontWeight: '500' },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  register: { marginTop: 28, alignItems: 'center' },
  registerText: { fontSize: 14, color: '#64748b' },
  registerLink: { color: '#0d9488', fontWeight: '700' },
});
