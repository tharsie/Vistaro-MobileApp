import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  getMyApplications,
  withdrawApplication,
  acceptInterview,
  declineInterview,
  acceptOffer,
  declineOffer,
} from '../../api/jobApplications.api';
import { JobApplicationResponseDto, JobApplicationStatus } from '../../types/applications';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const POLL_INTERVAL = 15000;

type FilterTab = 'all' | 'review' | 'interviews' | 'offers' | 'past';

export default function MyApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [applications, setApplications] = useState<JobApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchApplications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getMyApplications();
      if (res.data.succeeded && res.data.data) {
        setApplications(res.data.data);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchApplications(true);
    });
    pollRef.current = setInterval(() => fetchApplications(true), POLL_INTERVAL);
    return () => {
      unsubscribe();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [navigation]);

  const handleAction = async (
    id: string,
    action: () => Promise<any>,
    confirmMsg: string,
  ) => {
    Alert.alert('Confirm Action', confirmMsg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(id);
          try {
            await action();
            fetchApplications(true);
          } catch {
            Alert.alert('Error', 'Action failed. Please try again.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  // Status groupings
  const counts = useMemo(() => {
    const review = applications.filter((a) => [1, 2, 3, 4, 6].includes(a.status)).length;
    const interviews = applications.filter((a) => [8, 9].includes(a.status)).length;
    const offers = applications.filter((a) => [11, 12].includes(a.status)).length;
    const past = applications.filter((a) => [5, 7, 10, 13, 14].includes(a.status)).length;
    return { all: applications.length, review, interviews, offers, past };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    switch (activeTab) {
      case 'review':
        return applications.filter((a) => [1, 2, 3, 4, 6].includes(a.status));
      case 'interviews':
        return applications.filter((a) => [8, 9].includes(a.status));
      case 'offers':
        return applications.filter((a) => [11, 12].includes(a.status));
      case 'past':
        return applications.filter((a) => [5, 7, 10, 13, 14].includes(a.status));
      default:
        return applications;
    }
  }, [applications, activeTab]);

  // Determine icon & color based on role title
  const getRoleMeta = (title: string) => {
    const text = title.toLowerCase();
    if (text.includes('manager') || text.includes('lead') || text.includes('supervisor')) {
      return { icon: 'briefcase' as const, color: '#0f2c59', bg: '#eff6ff' };
    }
    if (text.includes('barista') || text.includes('cafe') || text.includes('coffee')) {
      return { icon: 'cafe' as const, color: '#0284c7', bg: '#e0f2fe' };
    }
    if (text.includes('waiter') || text.includes('waitress') || text.includes('restaurant') || text.includes('server')) {
      return { icon: 'restaurant' as const, color: '#d97706', bg: '#fef3c7' };
    }
    if (text.includes('chef') || text.includes('cook') || text.includes('kitchen')) {
      return { icon: 'flame' as const, color: '#ea580c', bg: '#ffedd5' };
    }
    if (text.includes('cashier') || text.includes('sales') || text.includes('retail') || text.includes('cart')) {
      return { icon: 'cart' as const, color: '#059669', bg: '#d1fae5' };
    }
    if (text.includes('customer') || text.includes('assistant') || text.includes('service')) {
      return { icon: 'headset' as const, color: '#7c3aed', bg: '#faf5ff' };
    }
    return { icon: 'document-text' as const, color: '#0f2c59', bg: '#f1f5f9' };
  };

  const renderActions = (app: JobApplicationResponseDto) => {
    const busy = actionLoading === app.id;
    const { status } = app;

    // Withdrawable statuses: Submitted, AdminReview, MoreInformationRequested, ApprovedForEmployer
    if ([1, 2, 3, 4].includes(status)) {
      return (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.withdrawBtn}
            disabled={busy}
            onPress={() =>
              handleAction(app.id, () => withdrawApplication(app.id), 'Withdraw this application?')
            }
            activeOpacity={0.75}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#0f2c59" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={15} color="#0f2c59" style={{ marginRight: 6 }} />
                <Text style={styles.withdrawBtnText}>Withdraw</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (status === JobApplicationStatus.InterviewRequested) {
      return (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.acceptInterviewBtn}
            disabled={busy}
            onPress={() =>
              handleAction(app.id, () => acceptInterview(app.id), 'Accept the interview invitation?')
            }
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={15} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.acceptBtnText}>Accept Interview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineBtn}
            disabled={busy}
            onPress={() =>
              handleAction(app.id, () => declineInterview(app.id), 'Decline this interview?')
            }
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={15} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === JobApplicationStatus.OfferMade) {
      return (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.acceptOfferBtn}
            disabled={busy}
            onPress={() => handleAction(app.id, () => acceptOffer(app.id), 'Accept this job offer?')}
            activeOpacity={0.8}
          >
            <Ionicons name="trophy" size={15} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.acceptBtnText}>Accept Offer 🎉</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineBtn}
            disabled={busy}
            onPress={() => handleAction(app.id, () => declineOffer(app.id), 'Decline this offer?')}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={15} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderItem = ({ item }: { item: JobApplicationResponseDto }) => {
    const roleMeta = getRoleMeta(item.jobTitle);
    let formattedDate = 'Recently';
    try {
      formattedDate = format(new Date(item.appliedAt), 'dd MMM yyyy');
    } catch (_) {}

    return (
      <View style={styles.appCard}>
        {/* Card Header: Role Icon + Title/Shop + StatusBadge */}
        <View style={styles.cardHeaderRow}>
          <View style={[styles.roleIconWrap, { backgroundColor: roleMeta.bg }]}>
            <Ionicons name={roleMeta.icon} size={20} color={roleMeta.color} />
          </View>

          <View style={styles.cardTitleCol}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.jobTitle}
            </Text>
            <View style={styles.shopRow}>
              <Ionicons name="business-outline" size={12} color="#0d9488" style={{ marginRight: 4 }} />
              <Text style={styles.shopName} numberOfLines={1}>
                {item.shopName}
              </Text>
            </View>
          </View>

          <StatusBadge status={item.status} />
        </View>

        {/* More Information Requested Banner */}
        {item.status === JobApplicationStatus.MoreInformationRequested && item.adminComment && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color="#d97706" style={{ marginRight: 6 }} />
            <Text style={styles.infoText}>{item.adminComment}</Text>
          </View>
        )}

        {/* Applied Date Row */}
        <View style={styles.cardFooterRow}>
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>Applied {formattedDate}</Text>
          </View>
        </View>

        {/* Actions Button Row (Withdraw, Accept/Decline) */}
        {renderActions(item)}
      </View>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ========================================================= */}
      {/* BRANDED HEADER WITH TopBackground.png                     */}
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
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>My Applications</Text>
            <Text style={styles.headerSub}>
              {applications.length} submitted application{applications.length !== 1 ? 's' : ''} tracked
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={() => fetchApplications(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="reload-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}
        >
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'review', label: 'In Review', count: counts.review },
            { id: 'interviews', label: 'Interviews', count: counts.interviews },
            { id: 'offers', label: 'Offers', count: counts.offers },
            { id: 'past', label: 'Archived', count: counts.past },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveTab(tab.id as FilterTab)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.filterCountBadge, isActive && styles.filterCountBadgeActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ImageBackground>

      {/* ========================================================= */}
      {/* APPLICATIONS LIST FEED                                    */}
      {/* ========================================================= */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#0d9488"
            colors={['#0d9488']}
            onRefresh={() => {
              setRefreshing(true);
              fetchApplications();
            }}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title={activeTab === 'all' ? 'No applications yet' : 'No applications in this category'}
            subtitle={
              activeTab === 'all'
                ? 'Explore flexible roles that fit your study schedule and apply!'
                : 'Check other filter tabs or browse open vacancies.'
            }
          />
        }
        ListFooterComponent={
          <View style={styles.footerSkylineContainer}>
            <Image
              source={require('../../../assets/BottomBanner.png')}
              style={styles.footerSkylineImage}
              resizeMode="cover"
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  /* Header with TopBackground.png */
  headerBackground: {
    paddingHorizontal: 18,
    paddingBottom: 16,
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
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12.5,
    color: '#c2ddf7',
    fontWeight: '500',
    marginTop: 2,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  /* Filter Tabs */
  filterTabsScroll: {
    gap: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterTabActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 6,
  },
  filterTabTextActive: {
    color: '#0f2438',
    fontWeight: '700',
  },
  filterCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterCountBadgeActive: {
    backgroundColor: '#0f2438',
  },
  filterCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  filterCountTextActive: {
    color: '#ffffff',
  },

  /* List */
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },

  /* Card */
  appCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2f6',
    ...Platform.select({
      ios: {
        shadowColor: '#0f2c59',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0f2438',
    letterSpacing: -0.2,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  shopName: {
    fontSize: 12.5,
    color: '#0d9488',
    fontWeight: '600',
  },

  /* Date */
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '500',
  },

  /* Info Banner */
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    color: '#92400e',
    fontWeight: '500',
    lineHeight: 17,
  },

  /* Actions */
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  withdrawBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f2c59',
  },
  acceptInterviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  acceptOfferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },

  /* Footer Skyline Silhouette */
  footerSkylineContainer: {
    width: '100%',
    height: 55,
    overflow: 'hidden',
    marginTop: 16,
    opacity: 0.65,
  },
  footerSkylineImage: {
    width: '100%',
    height: '100%',
  },
});
