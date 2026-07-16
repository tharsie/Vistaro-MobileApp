import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { searchJobs } from '../../api/jobs.api';
import { JobPostingSummaryDto } from '../../types/jobs';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/ui/EmptyState';
import { StudentTabParamList } from '../../navigation/StudentTabs';

// We push JobDetail onto a modal stack so we use a simple param store
const JOB_DETAIL_STORE: { job: JobPostingSummaryDto | null } = { job: null };
export { JOB_DETAIL_STORE };

export default function JobSearchScreen() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [jobs, setJobs] = useState<JobPostingSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const navigation = useNavigation<any>();

  const doSearch = useCallback(async (reset = true) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const res = await searchJobs({ keyword, city, page: currentPage, pageSize: 10 });
      if (res.data.succeeded && res.data.data) {
        const { items, totalCount } = res.data.data;
        setJobs(reset ? items : [...jobs, ...items]);
        setPage(currentPage + 1);
        setHasMore((reset ? items : [...jobs, ...items]).length < totalCount);
      }
    } catch (_) {}
    finally { setLoading(false); setSearched(true); }
  }, [keyword, city, page, jobs]);

  const openDetail = (job: JobPostingSummaryDto) => {
    JOB_DETAIL_STORE.job = job;
    navigation.navigate('JobDetail' as any, { jobId: job.id });
  };

  useEffect(() => {
    doSearch(true);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Find Jobs</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Job title or keyword"
              placeholderTextColor="#94a3b8"
              value={keyword}
              onChangeText={setKeyword}
              returnKeyType="search"
              onSubmitEditing={() => doSearch()}
            />
          </View>
          <View style={styles.searchInput}>
            <Ionicons name="location-outline" size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#94a3b8"
              value={city}
              onChangeText={setCity}
              returnKeyType="search"
              onSubmitEditing={() => doSearch()}
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => doSearch()}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && jobs.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#0d9488" />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <JobCard job={item} onPress={() => openDetail(item)} />
          )}
          ListEmptyComponent={
            searched ? (
              <EmptyState
                icon="briefcase-outline"
                title="No jobs found"
                subtitle="Try a different keyword or city."
              />
            ) : (
              <EmptyState
                icon="search-outline"
                title="Search for jobs"
                subtitle="Enter a keyword or city to find local opportunities."
              />
            )
          }
          onEndReached={() => hasMore && doSearch(false)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && jobs.length > 0 ? (
              <ActivityIndicator color="#0d9488" style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  searchRow: { gap: 8 },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 4,
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  searchBtn: {
    backgroundColor: '#0d9488',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: 16, flexGrow: 1 },
});
