import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications } from '../../api/jobApplications.api';
import { JobApplicationStatus } from '../../types/applications';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

const STATS_CONFIG = [
  { label: 'Active', statuses: [1,2,3,4,6,8,9,11], color: '#0d9488', bg: '#f0fdf9' },
  { label: 'Interviews', statuses: [8,9], color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Offers', statuses: [11,12], color: '#0891b2', bg: '#ecfeff' },
  { label: 'Total', statuses: null, color: '#0f2c59', bg: '#eff6ff' },
];

export default function StudentDashboard() {
  const { state, logout } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getMyApplications();
      if (res.data.succeeded && res.data.data) {
        setApplications(res.data.data);
      }
    } catch (_) {}
    finally { setLoading(false); refreshing && setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const countFor = (statuses: number[] | null) =>
    statuses ? applications.filter((a) => statuses.includes(a.status)).length : applications.length;

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good to see you,</Text>
          <Text style={styles.name}>{state.user?.fullName ?? 'Student'} 👋</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {STATS_CONFIG.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={[styles.statNum, { color: s.color }]}>{countFor(s.statuses)}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent applications */}
      <Text style={styles.sectionTitle}>Recent Applications</Text>
      <View style={{ paddingHorizontal: 16 }}>
        {applications.slice(0, 5).map((app) => (
          <View key={app.id} style={styles.appCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.appJob}>{app.jobTitle}</Text>
              <Text style={styles.appShop}>{app.shopName}</Text>
            </View>
            <StatusBadge status={app.status} />
          </View>
        ))}
      </View>

      {applications.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>You haven't applied to any jobs yet. Start exploring!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 32 },
  header: {
    backgroundColor: '#0f2c59',
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: { fontSize: 13, color: '#94c3dc' },
  name: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginTop: 2 },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  statCard: {
    width: '47%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNum: { fontSize: 32, fontWeight: '800' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f2c59',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#0f2c59',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appJob: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  appShop: { fontSize: 12, color: '#64748b', marginTop: 2 },
  emptyBox: {
    margin: 24,
    backgroundColor: '#f0fdf9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { color: '#0d9488', fontWeight: '600', textAlign: 'center' },
});
