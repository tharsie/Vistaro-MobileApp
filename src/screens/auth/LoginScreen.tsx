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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { login } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/apiError';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { login: authLogin } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const isTablet = screenWidth >= 600;
  const isShortScreen = screenHeight < 720;

  // Responsive banner selection: use bigbannerlogin for tablets/ipads, bannerlogin for phones
  const bannerSource = isTablet
    ? require('../../../assets/bigbannerlogin.png')
    : require('../../../assets/bannerlogin.png');

  // Dynamic banner height calibrated to frame the student and Big Ben while keeping card proportional
  const bannerHeight = isTablet
    ? Math.min(340, Math.max(250, Math.round(screenHeight * 0.32)))
    : screenHeight >= 850
    ? Math.min(345, Math.round(screenHeight * 0.37))
    : isShortScreen
    ? Math.max(215, Math.round(screenHeight * 0.33))
    : Math.min(300, Math.max(265, Math.round(screenHeight * 0.35)));

  // Calculate where the Vistaro logo ends in the banner image to avoid ANY text overlap
  // In bannerlogin.png (1024x1417), the logo is at Y=70..180
  const logoBottomScaled = Math.round(180 * (screenWidth / 1024));
  const heroTopPadding = isTablet
    ? insets.top > 0 ? insets.top + 65 : 75
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

          {/* Overlaid Headline & 3 Badges strictly BELOW the logo */}
          <View
            style={[
              styles.heroOverlayContent,
              {
                paddingTop: heroTopPadding,
                width: isTablet ? Math.min(420, screenWidth * 0.45) : '63%',
                paddingLeft: isTablet ? Math.max(36, (screenWidth - 520) / 2) : 20,
              },
            ]}
          >
            <Text style={[styles.heroTitleWhite, isShortScreen && styles.textSm]}>
              Local Jobs,
            </Text>
            <Text style={[styles.heroTitleCyan, isShortScreen && styles.textSm]}>
              Connected.
            </Text>

            {/* Decorative cyan curved swoop line */}
            <View style={styles.swoopContainer}>
              <View style={styles.swoopCurve} />
            </View>

            {/* 3 Quick Badges: Find Jobs | Connect Locally | Build Your Future */}
            <View style={styles.heroBadgesRow}>
              <View style={styles.heroBadgeItem}>
                <Ionicons
                  name="briefcase-outline"
                  size={isShortScreen ? 14 : 16}
                  color="#00d2ff"
                />
                <Text style={styles.heroBadgeSub}>Find</Text>
                <Text style={styles.heroBadgeMain}>Jobs</Text>
              </View>

              <View style={styles.heroBadgeDivider} />

              <View style={styles.heroBadgeItem}>
                <Ionicons
                  name="people-outline"
                  size={isShortScreen ? 14 : 16}
                  color="#00d2ff"
                />
                <Text style={styles.heroBadgeSub}>Connect</Text>
                <Text style={styles.heroBadgeMain}>Locally</Text>
              </View>

              <View style={styles.heroBadgeDivider} />

              <View style={styles.heroBadgeItem}>
                <Ionicons
                  name="stats-chart-outline"
                  size={isShortScreen ? 14 : 16}
                  color="#00d2ff"
                />
                <Text style={styles.heroBadgeSub}>Build</Text>
                <Text style={styles.heroBadgeMain}>Your Future</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* MAIN WHITE CARD (Extends to bottom, no blue voids)       */}
        {/* ========================================================= */}
        <View
          style={[
            styles.card,
            isTablet && styles.cardTablet,
            { maxWidth: isTablet ? 520 : undefined },
          ]}
        >
          {/* Form Content Section */}
          <View>
            {/* Top drag handle pill */}
            <View style={styles.dragHandle} />

            <View style={[styles.cardInner, isShortScreen && styles.cardInnerShort]}>
              <Text style={[styles.welcomeText, isShortScreen && styles.welcomeTextShort]}>
                Welcome Back
              </Text>
              <Text style={[styles.subWelcomeText, isShortScreen && styles.subWelcomeTextShort]}>
                Sign in to continue to your Vistaro account
              </Text>

              {apiError && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                  <Text style={styles.errorBannerText}>{apiError}</Text>
                </View>
              )}

              {/* Email Field with Left Mail Icon */}
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
                          placeholder="you@example.com"
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

              {/* Password Field with Left Lock Icon & Right Eye Toggle */}
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
                          placeholder="••••••••"
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

              {/* Remember Me & Forgot Password Row */}
              <View style={[styles.optionsRow, isShortScreen && styles.optionsRowShort]}>
                <TouchableOpacity
                  style={styles.rememberMeTouchable}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                  </View>
                  <Text style={styles.rememberMeLabel}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Vibrant Blue "Sign In →" Pill Button */}
              <TouchableOpacity
                style={[
                  styles.signInBtn,
                  isShortScreen && styles.signInBtnShort,
                  submitting && styles.signInBtnDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <View style={styles.signInBtnContent}>
                    <Text style={styles.signInBtnText}>Sign In</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color="#ffffff"
                      style={styles.signInBtnArrow}
                    />
                  </View>
                )}
              </TouchableOpacity>

              {/* Create One Registration Link */}
              <TouchableOpacity
                style={[
                  styles.registerLinkContainer,
                  isShortScreen && styles.registerLinkContainerShort,
                ]}
                onPress={() => navigation.navigate('Register' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.registerPromptText}>
                  Don't have an account?{' '}
                  <Text style={styles.registerActionText}>Create one</Text>
                </Text>
              </TouchableOpacity>

              {/* "─── WHY VISTARO ───" Section Divider */}
              <View style={[styles.dividerRow, isShortScreen && styles.dividerRowShort]}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>WHY VISTARO</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 2-Column Side-by-Side Cards */}
              <View style={[styles.featureCardsRow, isShortScreen && styles.featureCardsRowShort]}>
                {/* For Students Card (Light Blue) */}
                <View style={[styles.studentCard, isShortScreen && styles.featureCardShort]}>
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={[
                        styles.studentIconBadge,
                        isShortScreen && styles.iconBadgeShort,
                      ]}
                    >
                      <Ionicons
                        name="school"
                        size={isShortScreen ? 14 : 16}
                        color="#0284c7"
                      />
                    </View>
                    <View style={styles.cardArrowCircle}>
                      <Ionicons name="arrow-forward" size={11} color="#0284c7" />
                    </View>
                  </View>
                  <Text style={styles.featureCardTitle}>For Students</Text>
                  <Text style={styles.featureCardDesc} numberOfLines={2}>
                    Flexible local shifts that fit around your lectures
                  </Text>
                </View>

                {/* For Local Shops Card (Light Mint) */}
                <View style={[styles.shopCard, isShortScreen && styles.featureCardShort]}>
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={[
                        styles.shopIconBadge,
                        isShortScreen && styles.iconBadgeShort,
                      ]}
                    >
                      <Ionicons
                        name="storefront"
                        size={isShortScreen ? 14 : 16}
                        color="#16a34a"
                      />
                    </View>
                    <View style={styles.cardArrowCircle}>
                      <Ionicons name="arrow-forward" size={12} color="#16a34a" />
                    </View>
                  </View>
                  <Text style={styles.featureCardTitle}>For Local Shops</Text>
                  <Text style={styles.featureCardDesc} numberOfLines={2}>
                    Post jobs & connect with motivated local talent
                  </Text>
                </View>
              </View>

              {/* Trust Footer */}
              <View style={[styles.trustBadgeRow, isShortScreen && styles.trustBadgeRowShort]}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                <Text style={styles.trustBadgeText}>
                  Admin Vetted & UK Employment Law Compliant
                </Text>
              </View>
            </View>
          </View>

          {/* London Skyline Silhouette Footer (pinned to bottom of white card) */}
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
  heroOverlayContent: {
    paddingLeft: 20,
    width: '63%',
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#dc2626',
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
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

  /* Remember Me & Forgot Password */
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 16,
  },
  optionsRowShort: {
    marginTop: 2,
    marginBottom: 12,
  },
  rememberMeTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  rememberMeLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '600',
  },

  /* Vibrant Blue Pill Sign In Button */
  signInBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007aff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  signInBtnDisabled: {
    opacity: 0.65,
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
    marginTop: 12,
    alignItems: 'center',
  },
  registerLinkContainerShort: {
    marginTop: 8,
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

  /* Section Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  dividerRowShort: {
    marginTop: 10,
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginHorizontal: 8,
    letterSpacing: 1.1,
  },

  /* 2-Column Side-by-Side Cards */
  featureCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  featureCardsRowShort: {
    gap: 8,
    marginBottom: 8,
  },
  studentCard: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  shopCard: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  featureCardShort: {
    padding: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  studentIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#bae6fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#bbf7d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadgeShort: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  cardArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f2438',
    marginBottom: 2,
  },
  featureCardDesc: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
  },

  /* Trust Badge */
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 2,
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
