import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Alert, RefreshControl } from 'react-native';
import { getPendingInterviews, approveInterview } from '../../api/admin.api';
import { AdminInterviewResponseDto } from '../../types/admin';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export default function PendingInterviewsScreen() {
  const [interviews, setInterviews] = useState<AdminInterviewResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetch = async () => {
    try {
      const res = await getPendingInterviews();
      if (res.data.succeeded && res.data.data) setInterviews(res.data.data);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (applicationId: string) => {
    setActionLoading(applicationId);
    try { await approveInterview(applicationId); Alert.alert('Approved!', 'Interview request approved.'); fetch(); }
    catch { Alert.alert('Error', 'Approval failed'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Interview Requests</Text>
        <Text style={styles.sub}>{interviews.length} pending approval</Text>
      </View>
      <FlatList
        data={interviews}
        keyExtractor={(i) => i.applicationId}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => (
          <AppCard>
            <View style={styles.iconRow}>
              <Text style={styles.calIcon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.candidate}>🔒 {item.candidateCode}</Text>
                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                <Text style={styles.shopName}>{item.shopName}</Text>
                <Text style={styles.date}>Requested {format(new Date(item.requestedAt), 'dd MMM yyyy')}</Text>
              </View>
            </View>
            <AppButton
              title="Approve Interview"
              variant="secondary"
              loading={actionLoading === item.applicationId}
              onPress={() => approve(item.applicationId)}
              style={{ marginTop: 12 }}
            />
          </AppCard>
        )}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title="No interview requests" subtitle="All interview requests have been reviewed." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  list: { padding: 16, flexGrow: 1 },
  iconRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  calIcon: { fontSize: 28 },
  candidate: { fontSize: 13, fontWeight: '700', color: '#0f2c59' },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#0f2c59', marginTop: 2 },
  shopName: { fontSize: 13, color: '#0d9488', marginTop: 2 },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
});
