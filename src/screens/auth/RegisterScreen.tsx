import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    phoneNumber: z.string().min(10, 'Enter a valid phone number (min 10 digits)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isTablet = screenWidth >= 600;
  const isShortScreen = screenHeight < 720;

  // Responsive banner selection: use bigbannerlogin for tablets/ipads, bannerlogin for phones
  const bannerSource = isTablet
    ? require('../../../assets/bigbannerlogin.png')
    : require('../../../assets/bannerlogin.png');

  // Dynamic banner height calibrated to frame the background while keeping registration form comfortable
  const bannerHeight = isTablet
    ? Math.min(300, Math.max(220, Math.round(screenHeight * 0.28)))
    : screenHeight >= 850
    ? Math.min(290, Math.round(screenHeight * 0.32))
    : isShortScreen
    ? Math.max(190, Math.round(screenHeight * 0.28))
    : Math.min(260, Math.max(220, Math.round(screenHeight * 0.3)));

  // Calculate scaled bottom edge of the Vistaro logo to avoid text collision
  const logoBottomScaled = Math.round(180 * (screenWidth / 1024));
  const heroTopPadding = isTablet
    ? insets.top > 0 ? insets.top + 60 : 70
    : insets.top > 0
    ? Math.max(insets.top + 46, logoBottomScaled + 12)
    : logoBottomScaled + 10;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    navigation.navigate('RoleSelect', {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={[styles.mainScroll, isTablet && styles.mainScrollTablet]}
        contentContainerStyle={[
          styles.mainScrollContent,
          isTablet && styles.mainScrollContentTablet,
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================================= */}
        {/* TOP HERO BANNER (Responsive for Mobile and Tablet/iPad)   */}
        {/* ========================================================= */}
        <View style={[styles.heroBannerContainer, { height: bannerHeight }]}>
          <Image
            source={bannerSource}
            style={[
              styles.heroBannerImage,
              isTablet
                ? { width: '100%', height: '100%' }
                : { width: screenWidth, height: screenWidth * 1.384 },
            ]}
            resizeMode="cover"
          />

          {/* Floating Circular Back Button */}
          <TouchableOpacity
            style={[
              styles.backButton,
              { top: insets.top > 0 ? insets.top + 10 : 20 },
            ]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Overlaid Headline & 3 Quick Benefit Badges */}
          <View
            style={[
              styles.heroOverlayContent,
              {
                paddingTop: heroTopPadding,
                width: isTablet ? Math.min(420, screenWidth * 0.45) : '64%',
                paddingLeft: isTablet ? Math.max(36, (screenWidth - 520) / 2) : 20,
              },
            ]}
          >
            <Text style={[styles.heroTitleWhite, isShortScreen && styles.textSm]}>
              Start Your,
            </Text>
            <Text style={[styles.heroTitleCyan, isShortScreen && styles.textSm]}>
              Journey.
            </Text>

            {/* Decorative cyan curved swoop line */}
            <View style={styles.swoopContainer}>
              <View style={styles.swoopCurve} />
            </View>

            {/* 3 Quick Badges: Shifts | Verified | Local */}
            <View style={styles.heroBadgesRow}>
              <View style={styles.heroBadgeItem}>
                <Ionicons
                  name="school-outline"
                  size={isShortScreen ? 14 : 16}
                  color="#00d2ff"
                />
                <Text style={styles.heroBadgeSub}>Flexible</Text>
                <Text style={styles.heroBadgeMain}>Shifts</Text>
              </View>

              <View style={styles.heroBadgeDivider} />

              <View style={styles.heroBadgeItem}>
                <Ionicons
                  name="storefront-outline"
                  size={isShortScreen ? 14 : 16}
                  color="#00d2ff"
                />
                <Text style={styles.heroBadgeSub}>Local</Text>
                <Text style={styles.heroBadgeMain}>Shops</Text>
              </View>

              <View style={styles.heroBadgeDivider} />

              <View style={styles.heroBadgeItem}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={isShortScreen ? 14 : 16}
                  color="#00d2ff"
                />
                <Text style={styles.heroBadgeSub}>Vetted</Text>
                <Text style={styles.heroBadgeMain}>Roles</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* MAIN WHITE CARD (Form + Skyline Silhouette Footer)        */}
        {/* ========================================================= */}
        <View
          style={[
            styles.card,
            isTablet && styles.cardTablet,
            { maxWidth: isTablet ? 540 : undefined },
          ]}
        >
          <View>
            {/* Top drag handle pill */}
            <View style={styles.dragHandle} />

            <View style={[styles.cardInner, isShortScreen && styles.cardInnerShort]}>
              <Text style={[styles.welcomeText, isShortScreen && styles.welcomeTextShort]}>
                Create Account
              </Text>
              <Text style={[styles.subWelcomeText, isShortScreen && styles.subWelcomeTextShort]}>
                Join Vistaro today & find flexible local shifts
              </Text>

              {/* 1. Full Name Field */}
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View style={[styles.inputContainer, isShortScreen && styles.inputContainerShort]}>
                    <View
                      style={[
                        styles.inputBox,
                        isShortScreen && styles.inputBoxShort,
                        errors.fullName ? styles.inputBoxError : null,
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color="#94a3b8"
                        style={styles.inputLeftIcon}
                      />
                      <View style={styles.inputContentWrapper}>
                        <Text style={styles.inputLabelText}>Full Name</Text>
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Jane Smith"
                          placeholderTextColor="#94a3b8"
                          autoCapitalize="words"
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                    {errors.fullName && (
                      <Text style={styles.fieldErrorText}>{errors.fullName.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* 2. Email Address Field */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View style={[styles.inputContainer, isShortScreen && styles.inputContainerShort]}>
                    <View
                      style={[
                        styles.inputBox,
                        isShortScreen && styles.inputBoxShort,
                        errors.email ? styles.inputBoxError : null,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color="#94a3b8"
                        style={styles.inputLeftIcon}
                      />
                      <View style={styles.inputContentWrapper}>
                        <Text style={styles.inputLabelText}>Email Address</Text>
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="jane@example.com"
                          placeholderTextColor="#94a3b8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                    {errors.email && (
                      <Text style={styles.fieldErrorText}>{errors.email.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* 3. Phone Number Field */}
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View style={[styles.inputContainer, isShortScreen && styles.inputContainerShort]}>
                    <View
                      style={[
                        styles.inputBox,
                        isShortScreen && styles.inputBoxShort,
                        errors.phoneNumber ? styles.inputBoxError : null,
                      ]}
                    >
                      <Ionicons
                        name="call-outline"
                        size={18}
                        color="#94a3b8"
                        style={styles.inputLeftIcon}
                      />
                      <View style={styles.inputContentWrapper}>
                        <Text style={styles.inputLabelText}>Phone Number</Text>
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="e.g. +44 7123 456789"
                          placeholderTextColor="#94a3b8"
                          keyboardType="phone-pad"
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                    {errors.phoneNumber && (
                      <Text style={styles.fieldErrorText}>{errors.phoneNumber.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* 4. Password Field with Eye Toggle */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View style={[styles.inputContainer, isShortScreen && styles.inputContainerShort]}>
                    <View
                      style={[
                        styles.inputBox,
                        isShortScreen && styles.inputBoxShort,
                        errors.password ? styles.inputBoxError : null,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color="#94a3b8"
                        style={styles.inputLeftIcon}
                      />
                      <View style={styles.inputContentWrapper}>
                        <Text style={styles.inputLabelText}>Password</Text>
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Min 8 characters"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry={!showPassword}
                          style={styles.textInput}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={18}
                          color="#94a3b8"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.fieldErrorText}>{errors.password.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* 5. Confirm Password Field with Eye Toggle */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View style={[styles.inputContainer, isShortScreen && styles.inputContainerShort]}>
                    <View
                      style={[
                        styles.inputBox,
                        isShortScreen && styles.inputBoxShort,
                        errors.confirmPassword ? styles.inputBoxError : null,
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={18}
                        color="#94a3b8"
                        style={styles.inputLeftIcon}
                      />
                      <View style={styles.inputContentWrapper}>
                        <Text style={styles.inputLabelText}>Confirm Password</Text>
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Repeat password"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry={!showConfirmPassword}
                          style={styles.textInput}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={18}
                          color="#94a3b8"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text style={styles.fieldErrorText}>{errors.confirmPassword.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Vibrant Blue "Next: Choose Role →" Pill Button */}
              <TouchableOpacity
                style={[
                  styles.signInBtn,
                  isShortScreen && styles.signInBtnShort,
                ]}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.85}
              >
                <View style={styles.signInBtnContent}>
                  <Text style={styles.signInBtnText}>Next: Choose Role</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color="#ffffff"
                    style={styles.signInBtnArrow}
                  />
                </View>
              </TouchableOpacity>

              {/* Already Have Account Link */}
              <TouchableOpacity
                style={[
                  styles.registerLinkContainer,
                  isShortScreen && styles.registerLinkContainerShort,
                ]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerPromptText}>
                  Already have an account?{' '}
                  <Text style={styles.registerActionText}>Sign in</Text>
                </Text>
              </TouchableOpacity>

              {/* Trust Badge */}
              <View style={[styles.trustBadgeRow, isShortScreen && styles.trustBadgeRowShort]}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                <Text style={styles.trustBadgeText}>
                  Admin Vetted & UK Employment Law Compliant
                </Text>
              </View>
            </View>
          </View>

          {/* London Skyline Silhouette Footer */}
          <View
            style={[
              styles.skylineFooterContainer,
              isShortScreen && styles.skylineFooterContainerShort,
            ]}
          >
            <Image
              source={require('../../../assets/BottomBanner.png')}
              style={styles.skylineFooterImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#07162c',
  },
  mainScroll: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainScrollTablet: {
    backgroundColor: '#07162c',
  },
  mainScrollContent: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  mainScrollContentTablet: {
    alignItems: 'center',
    backgroundColor: '#07162c',
  },

  /* Hero Banner */
  heroBannerContainer: {
    width: '100%',
    backgroundColor: '#07162c',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backButton: {
    position: 'absolute',
    left: 18,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 22, 44, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlayContent: {
    paddingLeft: 20,
    width: '64%',
  },
  heroTitleWhite: {
    fontSize: 23,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
    lineHeight: 27,
  },
  heroTitleCyan: {
    fontSize: 23,
    fontWeight: '900',
    color: '#00d2ff',
    letterSpacing: -0.3,
    lineHeight: 27,
  },
  textSm: {
    fontSize: 19,
    lineHeight: 23,
  },
  swoopContainer: {
    width: 82,
    height: 5,
    overflow: 'hidden',
    marginTop: 2,
    marginBottom: 8,
  },
  swoopCurve: {
    width: 82,
    height: 12,
    borderRadius: 6,
    borderBottomWidth: 2.5,
    borderColor: '#00d2ff',
    marginTop: -7,
  },

  /* 3 Quick Badges Row */
  heroBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  heroBadgeItem: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  heroBadgeDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginHorizontal: 2,
  },
  heroBadgeSub: {
    fontSize: 8.5,
    color: '#cbd5e1',
    fontWeight: '500',
    marginTop: 1,
  },
  heroBadgeMain: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.1,
  },

  /* Main Card: flex: 1 & flexGrow: 1 ensure card extends all the way to bottom */
  card: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    width: '100%',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 14,
      },
      default: {
        boxShadow: '0px -5px 18px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  cardTablet: {
    borderRadius: 32,
    marginTop: -26,
    marginBottom: 30,
    alignSelf: 'center',
    flex: 0,
    flexGrow: 0,
  },
  dragHandle: {
    width: 34,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  cardInner: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  cardInnerShort: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f2438',
    letterSpacing: -0.3,
  },
  welcomeTextShort: {
    fontSize: 21,
  },
  subWelcomeText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 3,
    marginBottom: 16,
    fontWeight: '400',
  },
  subWelcomeTextShort: {
    fontSize: 12,
    marginBottom: 12,
  },

  /* Input Boxes with Inner Label & Left Icon */
  inputContainer: {
    marginBottom: 14,
  },
  inputContainerShort: {
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inputBoxShort: {
    paddingVertical: 6,
    borderRadius: 12,
  },
  inputBoxError: {
    borderColor: '#dc2626',
  },
  inputLeftIcon: {
    marginRight: 11,
  },
  inputContentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  inputLabelText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 3,
  },
  textInput: {
    fontSize: 14,
    color: '#0f2438',
    padding: 0,
    margin: 0,
    height: 22,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldErrorText: {
    fontSize: 11,
    color: '#dc2626',
    marginTop: 3,
    marginLeft: 4,
    fontWeight: '500',
  },

  /* Vibrant Blue Pill Next Button */
  signInBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007aff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#007aff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 7,
      },
      android: {
        elevation: 5,
      },
      default: {
        boxShadow: '0px 3px 10px rgba(0, 122, 255, 0.3)',
      },
    }),
  },
  signInBtnShort: {
    height: 45,
    borderRadius: 23,
  },
  signInBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  signInBtnArrow: {
    marginLeft: 8,
  },

  /* Registration Link */
  registerLinkContainer: {
    marginTop: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  registerLinkContainerShort: {
    marginTop: 10,
    marginBottom: 6,
  },
  registerPromptText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  registerActionText: {
    color: '#0284c7',
    fontWeight: '700',
  },

  /* Trust Badge */
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 6,
    marginBottom: 8,
  },
  trustBadgeRowShort: {
    marginBottom: 4,
  },
  trustBadgeText: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
  },

  /* London Skyline Silhouette Footer: pinned to bottom of the card */
  skylineFooterContainer: {
    width: '100%',
    height: 58,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  skylineFooterContainerShort: {
    height: 44,
  },
  skylineFooterImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
});
