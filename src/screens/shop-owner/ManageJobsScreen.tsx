import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getMyJobPostings, deleteJobPosting } from '../../api/jobs.api';
import { JobPostingResponseDto } from '../../types/jobs';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';
export default function ManageJobsScreen() {
  const [jobs, setJobs] = useState<JobPostingResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetch = async () => {
    try {
      const res = await getMyJobPostings();
      if (res.data.succeeded && res.data.data) setJobs(res.data.data);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetch();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Job', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await deleteJobPosting(id); fetch(); }
          catch { Alert.alert('Error', 'Delete failed'); }
        },
      },
    ]);
  };

  const handleEdit = (job: JobPostingResponseDto) => {
    navigation.navigate('CreateJob', { editMode: true, jobId: job.id });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Job Posts</Text>
          <Text style={styles.sub}>{jobs.length} posting{jobs.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { navigation.navigate('CreateJob', { editMode: false }); }}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => (
          <AppCard>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                <Text style={styles.cat}>{item.jobCategory} · {item.employmentType === 1 ? 'Part-time' : 'Full-time'}</Text>
              </View>
              <Text style={styles.rate}>£{item.salaryAmount}/hr</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color="#64748b" />
              <Text style={styles.metaText}>{item.city}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.metaText}>{item.hoursPerWeek}h/wk</Text>
            </View>
            <Text style={styles.date}>Created {format(new Date(item.createdAt), 'dd MMM yyyy')}</Text>
            <View style={styles.actions}>
              <AppButton title="Edit" variant="outline" onPress={() => handleEdit(item)} style={styles.smallBtn} />
              <AppButton title="Delete" variant="danger" onPress={() => handleDelete(item.id)} style={styles.smallBtn} />
            </View>
          </AppCard>
        )}
        ListEmptyComponent={
          <EmptyState icon="briefcase-outline" title="No jobs posted" subtitle="Tap + to create your first job posting." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0d9488', justifyContent: 'center', alignItems: 'center',
  },
  list: { padding: 16, flexGrow: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#0f2c59' },
  cat: { fontSize: 12, color: '#64748b', marginTop: 2 },
  rate: { fontSize: 15, fontWeight: '700', color: '#0d9488' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { fontSize: 12, color: '#64748b' },
  dot: { color: '#94a3b8' },
  date: { fontSize: 11, color: '#94a3b8', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36, borderRadius: 18, flex: 1 },
});
