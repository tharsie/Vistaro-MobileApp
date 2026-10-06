import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getEmployerApplications } from '../../api/jobApplications.api';
import { getMyJobPostings } from '../../api/jobs.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ShopOwnerDashboard() {
  const insets = useSafeAreaInsets();
  const { state, logout } = useAuth();
  const navigation = useNavigation<any>();

  const [stats, setStats] = useState({ jobs: 0, applications: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        getMyJobPostings(),
        getEmployerApplications(),
      ]);
      const jobs = jobsRes.data.data?.length ?? 0;
      const apps = appsRes.data.data ?? [];
      setStats({
        jobs,
        applications: apps.length,
        shortlisted: apps.filter((a: any) => a.status === 6).length,
      });
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const getOwnerInitials = () => {
    const name = state.user?.fullName?.trim() || 'Shop';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#0d9488"
            colors={['#0d9488']}
            onRefresh={() => {
              setRefreshing(true);
              fetch();
            }}
          />
        }
      >
        {/* ========================================================= */}
        {/* 1. BRANDED HEADER WITH TopBackground.png                  */}
        {/* ========================================================= */}
        <ImageBackground
          source={require('../../../assets/TopBackground.png')}
          style={[
            styles.headerBackground,
            { paddingTop: insets.top > 0 ? insets.top + 8 : 40 },
          ]}
          imageStyle={styles.headerBackgroundImage}
          resizeMode="cover"
        >
          {/* Top Row: Logo + Store Badge + Actions */}
          <View style={styles.headerTopRow}>
            <Image
              source={require('../../../assets/vistaro_header_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Messages')}
                activeOpacity={0.75}
              >
                <Ionicons name="chatbubbles-outline" size={20} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarText}>{getOwnerInitials()}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconBtn, styles.logoutBtn]}
                onPress={handleLogout}
                activeOpacity={0.75}
              >
                <Ionicons name="log-out-outline" size={19} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingSubtext}>Welcome back,</Text>
            <Text style={styles.greetingNameText}>
              {state.user?.fullName ?? 'Shop Partner'} 🏪
            </Text>
          </View>

          {/* Quick Post Job Bar */}
          <TouchableOpacity
            style={styles.postJobBannerBtn}
            onPress={() => navigation.navigate('CreateJob' as any, { editMode: false })}
            activeOpacity={0.9}
          >
            <View style={styles.postJobLeft}>
              <View style={styles.plusIconWrap}>
                <Ionicons name="add" size={18} color="#0d9488" />
              </View>
              <Text style={styles.postJobText}>Post a New Student Shift</Text>
            </View>
            <Ionicons name="arrow-forward" size={17} color="#0d9488" />
          </TouchableOpacity>
        </ImageBackground>

        {/* ========================================================= */}
        {/* 2. FEATURED HERO BANNER (vistaro_shop_hero.jpg)           */}
        {/* ========================================================= */}
        <View style={styles.bannerWrapper}>
          <View style={styles.heroCard}>
            <Image
              source={require('../../../assets/vistaro_shop_hero.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={12} color="#0d9488" style={{ marginRight: 4 }} />
                <Text style={styles.heroBadgeText}>Shop Owner Hub</Text>
              </View>

              <Text style={styles.heroTitle}>Build Your Team with Local Students</Text>
              <Text style={styles.heroSubtitle}>
                Post flexible shifts, review admin-screened applications, and discover local students
                looking for part-time work.
              </Text>

              <View style={styles.heroActionRow}>
                <TouchableOpacity
                  style={styles.heroBtnPrimary}
                  onPress={() => navigation.navigate('Jobs')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="briefcase-outline" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.heroBtnPrimaryText}>Manage Jobs</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.heroBtnSecondary}
                  onPress={() => navigation.navigate('Candidates')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="people-outline" size={15} color="#0f2c59" style={{ marginRight: 6 }} />
                  <Text style={styles.heroBtnSecondaryText}>View Candidates</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 3. THREE STATS CARDS                                      */}
        {/* ========================================================= */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Candidates')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            {[
              {
                label: 'Active Jobs',
                value: stats.jobs,
                icon: 'briefcase' as const,
                color: '#0f2c59',
                bg: '#f8fafc',
                borderColor: '#e2e8f0',
                route: 'Jobs',
              },
              {
                label: 'Applications',
                value: stats.applications,
                icon: 'people' as const,
                color: '#0d9488',
                bg: '#f0fdf9',
                borderColor: '#ccfbf1',
                route: 'Candidates',
              },
              {
                label: 'Shortlisted',
                value: stats.shortlisted,
                icon: 'star' as const,
                color: '#7c3aed',
                bg: '#faf5ff',
                borderColor: '#f3e8ff',
                route: 'Candidates',
              },
            ].map((s) => (
              <TouchableOpacity
                key={s.label}
                style={[
                  styles.statCard,
                  { backgroundColor: s.bg, borderColor: s.borderColor },
                ]}
                onPress={() => navigation.navigate(s.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconBadge, { backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon} size={20} color={s.color} />
                </View>
                <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========================================================= */}
        {/* 4. ADMIN VETTED COMPLIANCE BANNER                         */}
        {/* ========================================================= */}
        <View style={styles.tipWrapper}>
          <View style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <Ionicons name="shield-checkmark" size={22} color="#0d9488" />
            </View>
            <View style={styles.tipTextCol}>
              <Text style={styles.tipTitle}>Verified Student Applicants</Text>
              <Text style={styles.tipText}>
                All candidates are vetted for UK right-to-work and availability by Vistaro admins
                before applications reach your inbox.
              </Text>
            </View>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 5. FOOTER LONDON SKYLINE                                  */}
        {/* ========================================================= */}
        <View style={styles.footerSkylineContainer}>
          <Image
            source={require('../../../assets/BottomBanner.png')}
            style={styles.footerSkylineImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Header */
  headerBackground: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#002868',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerBackgroundImage: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    width: 145,
    height: 44,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#008b8b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  greetingSection: {
    marginTop: 14,
  },
  greetingSubtext: {
    fontSize: 13,
    color: '#c2ddf7',
    fontWeight: '500',
  },
  greetingNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    marginTop: 1,
  },

  /* Post Job Quick Bar */
  postJobBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  postJobLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f0fdf9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  postJobText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f2438',
  },

  /* Hero Card */
  bannerWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#0f2c59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroImage: {
    width: '100%',
    height: 145,
  },
  heroContent: {
    padding: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    color: '#0d9488',
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#0f2438',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  heroBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  heroBtnSecondaryText: {
    color: '#0f2438',
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* Stats Section */
  statsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f2438',
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0066ff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNum: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
    textAlign: 'center',
  },

  /* Tip Card */
  tipWrapper: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  tipIconWrap: {
    marginRight: 10,
    marginTop: 2,
  },
  tipTextCol: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f2438',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  /* London Skyline Footer */
  footerSkylineContainer: {
    width: '100%',
    height: 55,
    overflow: 'hidden',
    marginTop: 20,
    opacity: 0.65,
  },
  footerSkylineImage: {
    width: '100%',
    height: '100%',
  },
});
