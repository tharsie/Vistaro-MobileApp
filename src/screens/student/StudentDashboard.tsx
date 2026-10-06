import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications } from '../../api/jobApplications.api';
import { searchJobs } from '../../api/jobs.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category icons config matching design
const CATEGORIES = [
  { id: 'barista', label: 'Barista & Cafe', icon: 'cafe' as const, color: '#0284c7', bg: '#e0f2fe', query: 'barista' },
  { id: 'retail', label: 'Retail & Fashion', icon: 'bag-handle' as const, color: '#db2777', bg: '#fce7f3', query: 'retail' },
  { id: 'tutoring', label: 'Tutoring', icon: 'school' as const, color: '#9333ea', bg: '#f3e8ff', query: 'tutor' },
  { id: 'restaurant', label: 'Restaurant', icon: 'restaurant' as const, color: '#d97706', bg: '#fef3c7', query: 'waiter' },
  { id: 'supermarket', label: 'Supermarket', icon: 'cart' as const, color: '#059669', bg: '#d1fae5', query: 'sales' },
  { id: 'more', label: 'More', icon: 'ellipsis-horizontal' as const, color: '#64748b', bg: '#f1f5f9', query: '' },
];

// Application status config matching design
const STATUS_CARDS = [
  {
    key: 'active',
    label: 'Active',
    sublabel: 'In Review',
    statuses: [1, 2, 3, 4, 6, 8, 9, 11],
    icon: 'paper-plane' as const,
    color: '#10b981',
    iconBg: '#dcfce7',
    cardBg: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  {
    key: 'interviews',
    label: 'Interviews',
    sublabel: 'Scheduled',
    statuses: [8, 9],
    icon: 'calendar' as const,
    color: '#9333ea',
    iconBg: '#f3e8ff',
    cardBg: '#faf5ff',
    borderColor: '#f3e8ff',
  },
  {
    key: 'offers',
    label: 'Offers',
    sublabel: 'Received',
    statuses: [11, 12],
    icon: 'briefcase' as const,
    color: '#0284c7',
    iconBg: '#e0f2fe',
    cardBg: '#f0f9ff',
    borderColor: '#e0f2fe',
  },
  {
    key: 'total',
    label: 'Total',
    sublabel: 'Submitted',
    statuses: null,
    icon: 'document-text' as const,
    color: '#d97706',
    iconBg: '#fef3c7',
    cardBg: '#fffbeb',
    borderColor: '#fef3c7',
  },
];

// Curated demo jobs matching the exact mockup
const RECOMMENDED_JOBS = [
  {
    id: 'rec-1',
    title: 'Barista (Part-Time)',
    category: 'Cafe',
    location: 'Canary Wharf, London',
    icon: 'cafe' as const,
    iconColor: '#0284c7',
    iconBg: '#e0f2fe',
    wage: '£11.50/hr',
    type: 'Part-time',
    shift: 'Flexible Hours',
    shiftIcon: 'calendar-outline' as const,
    badge: 'Student Friendly',
  },
  {
    id: 'rec-2',
    title: 'Retail Assistant',
    category: 'Fashion Store',
    location: 'Greenwich, London',
    icon: 'bag-handle' as const,
    iconColor: '#db2777',
    iconBg: '#fce7f3',
    wage: '£11.00/hr',
    type: 'Part-time',
    shift: 'Evening Shifts',
    shiftIcon: 'moon-outline' as const,
    badge: 'Student Friendly',
  },
];

const NEARBY_JOBS = [
  {
    id: 'near-1',
    title: 'Waiter / Waitress',
    category: 'Restaurant',
    location: 'Stratford, London',
    icon: 'restaurant' as const,
    iconColor: '#d97706',
    iconBg: '#fef3c7',
    wage: '£12.00/hr',
    type: 'Part-time',
    shift: 'Weekend',
    shiftIcon: 'calendar-outline' as const,
    badge: 'Student Friendly',
  },
  {
    id: 'near-2',
    title: 'Sales Assistant',
    category: 'Supermarket',
    location: 'Ilford, London',
    icon: 'cart' as const,
    iconColor: '#059669',
    iconBg: '#d1fae5',
    wage: '£11.50/hr',
    type: 'Part-time',
    shift: 'Weekend Hours',
    shiftIcon: 'calendar-outline' as const,
    badge: 'Student Friendly',
  },
];

export default function StudentDashboard() {
  const insets = useSafeAreaInsets();
  const { state, logout } = useAuth();
  const navigation = useNavigation<any>();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      const res = await getMyApplications();
      if (res.data.succeeded && res.data.data) {
        setApplications(res.data.data);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      refreshing && setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis !== 'undefined' && (globalThis as any).confirm
        ? (globalThis as any).confirm('Are you sure you want to sign out?')
        : true;
      if (confirmed) {
        logout();
      }
      return;
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleFavorite = (jobId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const countFor = (statuses: number[] | null) =>
    statuses
      ? applications.filter((a) => statuses.includes(a.status)).length
      : applications.length;

  const getUserInitials = () => {
    const name = state.user?.fullName?.trim() ?? 'TH';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const firstName = useMemo(() => {
    const full = state.user?.fullName?.trim();
    if (!full) return 'Tharsiegan';
    return full.split(' ')[0];
  }, [state.user]);

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
              fetchData();
            }}
          />
        }
      >
        {/* ========================================================= */}
        {/* 1. HEADER WITH TopBackground.png IMAGE                     */}
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
          {/* Top Row: Vistaro Logo + Bell + Avatar */}
          <View style={styles.headerTopRow}>
            {/* Vistaro Brand Logo */}
            <Image
              source={require('../../../assets/vistaro_header_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />

            {/* Right Action Icons: Bell & Avatar */}
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.bellBtn}
                onPress={() => navigation.navigate('Messages')}
                activeOpacity={0.75}
              >
                <Ionicons name="notifications-outline" size={23} color="#ffffff" />
                <View style={styles.bellBadge} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Welcome Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingSubtext}>Good to see you,</Text>
            <Text style={styles.greetingNameText}>
              {firstName} 👋
            </Text>
          </View>

          {/* Quick Search Shortcut Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Jobs')}
            activeOpacity={0.9}
          >
            <Ionicons name="search-outline" size={19} color="#64748b" style={{ marginRight: 10 }} />
            <Text style={styles.searchPlaceholder}>Search local shifts, shops, or roles...</Text>
            <View style={styles.filterBtn}>
              <Ionicons name="options-outline" size={18} color="#0f2438" />
            </View>
          </TouchableOpacity>
        </ImageBackground>

        {/* ========================================================= */}
        {/* 2. HERO BANNER CARD (bannerhome.png)                      */}
        {/* ========================================================= */}
        <View style={styles.bannerWrapper}>
          <TouchableOpacity
            style={styles.bannerCard}
            onPress={() => navigation.navigate('Jobs')}
            activeOpacity={0.9}
          >
            <Image
              source={require('../../../assets/bannerhome.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* 3. POPULAR CATEGORIES (6 ICONS)                           */}
        {/* ========================================================= */}
        <View style={styles.categoriesWrapper}>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => navigation.navigate('Jobs', { category: cat.id, keyword: cat.query })}
                activeOpacity={0.75}
              >
                <View style={[styles.categoryIconCircle, { backgroundColor: cat.bg }]}>
                  <Ionicons name={cat.icon} size={21} color={cat.color} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={2}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========================================================= */}
        {/* 4. APPLICATION STATUS (4 CARDS)                           */}
        {/* ========================================================= */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Application Status</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusCardsRow}>
            {STATUS_CARDS.map((card) => (
              <TouchableOpacity
                key={card.key}
                style={[
                  styles.statusCard,
                  { backgroundColor: card.cardBg, borderColor: card.borderColor },
                ]}
                onPress={() => navigation.navigate('Applications')}
                activeOpacity={0.8}
              >
                <View style={[styles.statusIconWrap, { backgroundColor: card.iconBg }]}>
                  <Ionicons name={card.icon} size={15} color={card.color} />
                </View>
                <Text style={[styles.statusCountText, { color: card.color }]}>
                  {countFor(card.statuses)}
                </Text>
                <Text style={styles.statusLabelText}>{card.label}</Text>
                <Text style={styles.statusSublabelText}>{card.sublabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========================================================= */}
        {/* 5. RECOMMENDED FOR YOU (2-COL CARDS)                      */}
        {/* ========================================================= */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
              <Text style={styles.viewAllText}>See All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.jobsGridRow}>
            {RECOMMENDED_JOBS.map((job) => {
              const isFav = favorites.has(job.id);
              return (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() => navigation.navigate('Jobs')}
                  activeOpacity={0.85}
                >
                  <View style={styles.jobCardTopRow}>
                    <View style={[styles.jobIconWrap, { backgroundColor: job.iconBg }]}>
                      <Ionicons name={job.icon} size={18} color={job.iconColor} />
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(job.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isFav ? '#ef4444' : '#94a3b8'}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.jobCardTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.jobCardShop} numberOfLines={1}>
                    {job.category} • {job.location}
                  </Text>

                  {/* Badges in 2 rows of 2 */}
                  <View style={styles.badgesWrapper}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badgePill, styles.wageBadge]}>
                        <Text style={styles.wageBadgeSymbol}>£</Text>
                        <Text style={styles.wageBadgeText}>{job.wage}</Text>
                      </View>
                      <View style={[styles.badgePill, styles.typeBadge]}>
                        <Ionicons name="time-outline" size={11} color="#0284c7" style={{ marginRight: 3 }} />
                        <Text style={styles.typeBadgeText}>{job.type}</Text>
                      </View>
                    </View>

                    <View style={styles.badgeRow}>
                      <View style={[styles.badgePill, styles.shiftBadge]}>
                        <Ionicons name={job.shiftIcon} size={11} color="#7c3aed" style={{ marginRight: 3 }} />
                        <Text style={styles.shiftBadgeText}>{job.shift}</Text>
                      </View>
                      <View style={[styles.badgePill, styles.studentBadge]}>
                        <Ionicons name="school" size={11} color="#db2777" style={{ marginRight: 3 }} />
                        <Text style={styles.studentBadgeText}>{job.badge}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ========================================================= */}
        {/* 6. JOBS NEAR YOU (2-COL CARDS)                            */}
        {/* ========================================================= */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Jobs Near You</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
              <Text style={styles.viewAllText}>See All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.jobsGridRow}>
            {NEARBY_JOBS.map((job) => {
              const isFav = favorites.has(job.id);
              return (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() => navigation.navigate('Jobs')}
                  activeOpacity={0.85}
                >
                  <View style={styles.jobCardTopRow}>
                    <View style={[styles.jobIconWrap, { backgroundColor: job.iconBg }]}>
                      <Ionicons name={job.icon} size={18} color={job.iconColor} />
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(job.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isFav ? '#ef4444' : '#94a3b8'}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.jobCardTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.jobCardShop} numberOfLines={1}>
                    {job.category} • {job.location}
                  </Text>

                  {/* Badges in 2 rows of 2 */}
                  <View style={styles.badgesWrapper}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badgePill, styles.wageBadge]}>
                        <Text style={styles.wageBadgeSymbol}>£</Text>
                        <Text style={styles.wageBadgeText}>{job.wage}</Text>
                      </View>
                      <View style={[styles.badgePill, styles.typeBadge]}>
                        <Ionicons name="time-outline" size={11} color="#0284c7" style={{ marginRight: 3 }} />
                        <Text style={styles.typeBadgeText}>{job.type}</Text>
                      </View>
                    </View>

                    <View style={styles.badgeRow}>
                      <View style={[styles.badgePill, styles.shiftBadge]}>
                        <Ionicons name={job.shiftIcon} size={11} color="#7c3aed" style={{ marginRight: 3 }} />
                        <Text style={styles.shiftBadgeText}>{job.shift}</Text>
                      </View>
                      <View style={[styles.badgePill, styles.studentBadge]}>
                        <Ionicons name="school" size={11} color="#db2777" style={{ marginRight: 3 }} />
                        <Text style={styles.studentBadgeText}>{job.badge}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ========================================================= */}
        {/* 7. RECENT SUBMITTED APPLICATIONS (IF ANY)                 */}
        {/* ========================================================= */}
        {applications.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Applications</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Applications')}>
                <Text style={styles.viewAllText}>Manage ({applications.length}) →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.applicationsList}>
              {applications.slice(0, 3).map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.appCard}
                  onPress={() => navigation.navigate('Applications')}
                  activeOpacity={0.8}
                >
                  <View style={styles.appIconWrapper}>
                    <Ionicons name="storefront-outline" size={18} color="#0f2c59" />
                  </View>

                  <View style={styles.appDetailsWrapper}>
                    <Text style={styles.appJobTitle} numberOfLines={1}>
                      {app.jobTitle}
                    </Text>
                    <Text style={styles.appShopName} numberOfLines={1}>
                      {app.shopName}
                    </Text>
                  </View>

                  <View style={styles.appStatusCol}>
                    <StatusBadge status={app.status} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* 8. FOOTER LONDON SKYLINE                                  */}
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

  /* 1. Header with TopBackground.png */
  headerBackground: {
    paddingHorizontal: 16,
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
    gap: 12,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#0f2c59',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#008b8b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 15,
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
    fontSize: 23,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    marginTop: 1,
  },

  /* Search Bar */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '400',
  },
  filterBtn: {
    paddingLeft: 6,
  },

  /* 2. Hero Banner Card (bannerhome.png) */
  bannerWrapper: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  bannerCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#0f2c59',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bannerImage: {
    width: '100%',
    height: (SCREEN_WIDTH - 32) * (887 / 1774), // Exactly matches aspect ratio ~2.0
    borderRadius: 18,
  },

  /* 3. Popular Categories (6 Icons) */
  categoriesWrapper: {
    marginTop: 18,
    paddingHorizontal: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 13,
  },

  /* Section Containers */
  sectionContainer: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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

  /* 4. Application Status (4 Cards) */
  statusCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusCountText: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f2438',
  },
  statusSublabelText: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },

  /* 5 & 6. Jobs Grid Row (2-col) */
  jobsGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  jobCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#0f2c59',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  jobCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f2438',
    marginBottom: 2,
  },
  jobCardShop: {
    fontSize: 10.5,
    color: '#64748b',
    marginBottom: 10,
  },

  /* Badges */
  badgesWrapper: {
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 5,
  },
  badgePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3.5,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  wageBadge: {
    backgroundColor: '#dcfce7',
  },
  wageBadgeSymbol: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginRight: 2,
  },
  wageBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  typeBadge: {
    backgroundColor: '#e0f2fe',
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#0284c7',
  },
  shiftBadge: {
    backgroundColor: '#f3e8ff',
  },
  shiftBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#7c3aed',
  },
  studentBadge: {
    backgroundColor: '#fce7f3',
  },
  studentBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#db2777',
  },

  /* Applications List */
  applicationsList: {
    gap: 8,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  appIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  appDetailsWrapper: {
    flex: 1,
  },
  appJobTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f2438',
  },
  appShopName: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  appStatusCol: {
    marginLeft: 8,
  },

  /* London Skyline Silhouette Footer */
  footerSkylineContainer: {
    width: '100%',
    height: 55,
    overflow: 'hidden',
    marginTop: 20,
    opacity: 0.7,
  },
  footerSkylineImage: {
    width: '100%',
    height: '100%',
  },
});
