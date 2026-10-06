import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getMyJobPostings, deleteJobPosting } from '../../api/jobs.api';
import { JobPostingResponseDto } from '../../types/jobs';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export default function ManageJobsScreen() {
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<JobPostingResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetch = async () => {
    try {
      const res = await getMyJobPostings();
      if (res.data.succeeded && res.data.data) setJobs(res.data.data);
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetch();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Job Posting', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJobPosting(id);
            fetch();
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  const handleEdit = (job: JobPostingResponseDto) => {
    navigation.navigate('CreateJob', { editMode: true, jobId: job.id });
  };

  const getRoleIcon = (title: string, category: string) => {
    const text = `${title} ${category || ''}`.toLowerCase();
    if (text.includes('barista') || text.includes('cafe') || text.includes('coffee')) {
      return { icon: 'cafe' as const, color: '#0284c7', bg: '#e0f2fe' };
    }
    if (text.includes('retail') || text.includes('fashion') || text.includes('shop') || text.includes('sales')) {
      return { icon: 'bag-handle' as const, color: '#db2777', bg: '#fce7f3' };
    }
    if (text.includes('wait') || text.includes('restaurant') || text.includes('food')) {
      return { icon: 'restaurant' as const, color: '#d97706', bg: '#fef3c7' };
    }
    if (text.includes('supermarket') || text.includes('cart') || text.includes('grocery')) {
      return { icon: 'cart' as const, color: '#059669', bg: '#d1fae5' };
    }
    return { icon: 'briefcase' as const, color: '#0f2c59', bg: '#eff6ff' };
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
            <Text style={styles.headerTitle}>My Job Posts</Text>
            <Text style={styles.headerSub}>
              {jobs.length} active shift posting{jobs.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CreateJob', { editMode: false })}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Post Shift</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* ========================================================= */}
      {/* JOB POSTINGS LIST FEED                                    */}
      {/* ========================================================= */}
      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.listContent}
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
        renderItem={({ item }) => {
          const roleMeta = getRoleIcon(item.jobTitle, item.jobCategory);
          let formattedDate = 'Recently';
          try {
            formattedDate = format(new Date(item.createdAt), 'dd MMM yyyy');
          } catch (_) {}

          return (
            <View style={styles.jobCard}>
              {/* Top Row: Icon + Title & Category + Rate */}
              <View style={styles.cardHeaderRow}>
                <View style={[styles.roleIconWrap, { backgroundColor: roleMeta.bg }]}>
                  <Ionicons name={roleMeta.icon} size={20} color={roleMeta.color} />
                </View>

                <View style={styles.cardTitleCol}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {item.jobTitle}
                  </Text>
                  <Text style={styles.catText} numberOfLines={1}>
                    {item.jobCategory || 'General'} • {item.employmentType === 1 ? 'Part-time' : 'Full-time'}
                  </Text>
                </View>

                <View style={styles.rateTag}>
                  <Text style={styles.rateText}>£{item.salaryAmount}/hr</Text>
                </View>
              </View>

              {/* Meta Row: Location & Hours */}
              <View style={styles.metaRow}>
                {item.city ? (
                  <View style={styles.metaChip}>
                    <Ionicons name="location-outline" size={13} color="#64748b" style={{ marginRight: 3 }} />
                    <Text style={styles.metaChipText}>{item.city}</Text>
                  </View>
                ) : null}

                {item.hoursPerWeek ? (
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={13} color="#64748b" style={{ marginRight: 3 }} />
                    <Text style={styles.metaChipText}>{item.hoursPerWeek}h/wk</Text>
                  </View>
                ) : null}

                <View style={styles.dateWrap}>
                  <Ionicons name="calendar-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                  <Text style={styles.dateText}>Posted {formattedDate}</Text>
                </View>
              </View>

              {/* Actions Row: Edit & Delete */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEdit(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={15} color="#0f2c59" style={{ marginRight: 4 }} />
                  <Text style={styles.editBtnText}>Edit Posting</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={15} color="#dc2626" style={{ marginRight: 4 }} />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="No shifts posted yet"
            subtitle="Tap '+ Post Shift' to list your flexible student openings."
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

  /* Header */
  headerBackground: {
    paddingHorizontal: 18,
    paddingBottom: 18,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* List */
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  jobCard: {
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
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0f2438',
    letterSpacing: -0.2,
  },
  catText: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  rateTag: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaChipText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 8,
    borderRadius: 14,
  },
  editBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 8,
    borderRadius: 14,
  },
  deleteBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#dc2626',
  },

  /* London Skyline Footer */
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
