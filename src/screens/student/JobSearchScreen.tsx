import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { searchJobs } from '../../api/jobs.api';
import { getMyApplications } from '../../api/jobApplications.api';
import { JobPostingSummaryDto } from '../../types/jobs';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/ui/EmptyState';

// Quick filter categories
const QUICK_FILTERS = [
  { id: 'all', label: 'All Jobs', icon: 'grid-outline' as const, query: '' },
  { id: 'barista', label: 'Barista & Cafe', icon: 'cafe-outline' as const, query: 'barista' },
  { id: 'retail', label: 'Retail & Fashion', icon: 'bag-handle-outline' as const, query: 'retail' },
  { id: 'tutoring', label: 'Tutoring', icon: 'school-outline' as const, query: 'tutor' },
  { id: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline' as const, query: 'waiter' },
  { id: 'supermarket', label: 'Supermarket', icon: 'cart-outline' as const, query: 'sales' },
];

// We push JobDetail onto a modal stack so we use a simple param store
const JOB_DETAIL_STORE: { job: JobPostingSummaryDto | null } = { job: null };
export { JOB_DETAIL_STORE };

export default function JobSearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [keyword, setKeyword] = useState(route.params?.keyword || '');
  const [city, setCity] = useState(route.params?.city || '');
  const [activeCategory, setActiveCategory] = useState(route.params?.category || 'all');

  const [jobs, setJobs] = useState<JobPostingSummaryDto[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const doSearch = useCallback(
    async (reset = true, customKeyword?: string) => {
      try {
        setLoading(true);
        const currentPage = reset ? 1 : page;
        const kw = customKeyword !== undefined ? customKeyword : keyword;
        const res = await searchJobs({ keyword: kw, city, page: currentPage, pageSize: 10 });
        if (res.data.succeeded && res.data.data) {
          const { items, totalCount: total } = res.data.data;
          setJobs(reset ? items : [...jobs, ...items]);
          setPage(currentPage + 1);
          setTotalCount(total);
          setHasMore((reset ? items : [...jobs, ...items]).length < total);
        }
      } catch (_) {
      } finally {
        setLoading(false);
        setRefreshing(false);
        setSearched(true);
      }
    },
    [keyword, city, page, jobs]
  );

  const fetchAppliedJobs = async () => {
    try {
      const res = await getMyApplications();
      if (res.data.succeeded && res.data.data) {
        const ids = new Set(
          res.data.data
            .filter((app) => app.status !== 14) // Exclude withdrawn
            .map((app) => app.jobPostingId)
        );
        setAppliedJobIds(ids);
      }
    } catch (_) {}
  };

  const handleCategorySelect = (item: (typeof QUICK_FILTERS)[0]) => {
    setActiveCategory(item.id);
    setKeyword(item.query);
    doSearch(true, item.query);
  };

  const handleClearSearch = () => {
    setKeyword('');
    setCity('');
    setActiveCategory('all');
    doSearch(true, '');
  };

  const openDetail = (job: JobPostingSummaryDto) => {
    JOB_DETAIL_STORE.job = job;
    navigation.navigate('JobDetail' as any, { jobId: job.id });
  };

  useEffect(() => {
    doSearch(true);
  }, []);

  useEffect(() => {
    fetchAppliedJobs();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAppliedJobs();
    });
    return unsubscribe;
  }, [navigation]);

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
        {/* Header Top Title Row */}
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Find Jobs</Text>
            <Text style={styles.headerSubtitle}>
              Browse student-friendly roles & flexible shifts
            </Text>
          </View>

          {(keyword !== '' || city !== '' || activeCategory !== 'all') && (
            <TouchableOpacity style={styles.resetBtn} onPress={handleClearSearch} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={15} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Floating Search Input Card */}
        <View style={styles.searchCard}>
          {/* Keyword Input Row */}
          <View style={styles.inputRow}>
            <Ionicons name="search-outline" size={19} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Job title, keywords, or role..."
              placeholderTextColor="#94a3b8"
              value={keyword}
              onChangeText={setKeyword}
              returnKeyType="search"
              onSubmitEditing={() => doSearch(true)}
            />
            {keyword.length > 0 && (
              <TouchableOpacity onPress={() => setKeyword('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputDivider} />

          {/* City / Location Input Row + Action Button */}
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={19} color="#0d9488" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="City, area, or postcode..."
              placeholderTextColor="#94a3b8"
              value={city}
              onChangeText={setCity}
              returnKeyType="search"
              onSubmitEditing={() => doSearch(true)}
            />
            {city.length > 0 && (
              <TouchableOpacity onPress={() => setCity('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.searchActionBtn} onPress={() => doSearch(true)} activeOpacity={0.85}>
              <Ionicons name="search" size={15} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.searchActionBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Horizontal Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {QUICK_FILTERS.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => handleCategorySelect(item)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={isActive ? '#0f2438' : '#ffffff'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ImageBackground>

      {/* ========================================================= */}
      {/* JOB LISTINGS RESULTS FEED                                 */}
      {/* ========================================================= */}
      {loading && jobs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Finding student opportunities...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="#0d9488"
              colors={['#0d9488']}
              onRefresh={() => {
                setRefreshing(true);
                doSearch(true);
              }}
            />
          }
          ListHeaderComponent={
            jobs.length > 0 ? (
              <View style={styles.resultsCountBar}>
                <Text style={styles.resultsCountText}>
                  Showing <Text style={styles.resultsCountBold}>{jobs.length}</Text> open positions
                </Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#0d9488" style={{ marginRight: 4 }} />
                  <Text style={styles.verifiedBadgeText}>Vetted by Vistaro</Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <JobCard
              job={item}
              applied={appliedJobIds.has(item.id)}
              onPress={() => openDetail(item)}
            />
          )}
          ListEmptyComponent={
            searched ? (
              <EmptyState
                icon="briefcase-outline"
                title="No matching roles found"
                subtitle="Try searching with different keywords, clear city filters, or select a role category above."
              />
            ) : (
              <EmptyState
                icon="search-outline"
                title="Search for student jobs"
                subtitle="Enter a role title or location to find verified part-time shifts."
              />
            )
          }
          onEndReached={() => hasMore && doSearch(false)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <View>
              {loading && jobs.length > 0 ? (
                <ActivityIndicator color="#0d9488" style={{ marginVertical: 16 }} />
              ) : null}

              {/* London Skyline Silhouette Footer */}
              <View style={styles.footerSkylineWrap}>
                <Image
                  source={require('../../../assets/BottomBanner.png')}
                  style={styles.footerSkylineImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  /* Branded Header with TopBackground.png */
  headerBackground: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#002868',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
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
  headerSubtitle: {
    fontSize: 12.5,
    color: '#c2ddf7',
    fontWeight: '500',
    marginTop: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Search Card */
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0f2438',
    fontWeight: '500',
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: -4,
  },
  searchActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginLeft: 6,
  },
  searchActionBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* Filter Pills */
  filterPillsScroll: {
    gap: 8,
    paddingTop: 14,
    paddingBottom: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterPillActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#ffffff',
  },
  filterPillTextActive: {
    color: '#0f2438',
    fontWeight: '700',
  },

  /* Results Count Bar */
  resultsCountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  resultsCountText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  resultsCountBold: {
    color: '#0f2438',
    fontWeight: '800',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  verifiedBadgeText: {
    fontSize: 10.5,
    color: '#0d9488',
    fontWeight: '700',
  },

  /* Feed List */
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13.5,
    color: '#64748b',
    fontWeight: '500',
  },

  /* Skyline Footer */
  footerSkylineWrap: {
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
