import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats } from '../../api/admin.api';
import { AdminDashboardStatsDto } from '../../types/admin';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AppCard from '../../components/ui/AppCard';

const STAT_CARDS = [
  { key: 'pendingApplications', label: 'Pending Applications', icon: 'document-text', color: '#6366f1' },
  { key: 'pendingMessages', label: 'Pending Messages', icon: 'mail', color: '#0891b2' },
  { key: 'pendingInterviews', label: 'Pending Interviews', icon: 'calendar', color: '#7c3aed' },
  { key: 'pendingContactReleases', label: 'Contact Requests', icon: 'person-add', color: '#d97706' },
  { key: 'pendingShopOwnerApprovals', label: 'Shop Verifications', icon: 'storefront', color: '#0d9488' },
  { key: 'pendingBusinessDocuments', label: 'Business Docs', icon: 'documents', color: '#dc2626' },
  { key: 'totalUsers', label: 'Total Users', icon: 'people', color: '#0f2c59' },
  { key: 'totalJobPostings', label: 'Job Postings', icon: 'briefcase', color: '#059669' },
] as const;

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await getAdminStats();
      if (res.data.succeeded && res.data.data) setStats(res.data.data);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.title}>Vistaro Control Centre</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Backlog summary */}
      <View style={styles.urgentRow}>
        <View style={styles.urgentCard}>
          <Text style={styles.urgentNum}>
            {(stats?.pendingApplications ?? 0) + (stats?.pendingMessages ?? 0) + (stats?.pendingInterviews ?? 0)}
          </Text>
          <Text style={styles.urgentLabel}>Items Requiring Action</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {STAT_CARDS.map(({ key, label, icon, color }) => (
          <AppCard key={key} style={StyleSheet.flatten([styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }] as any)}>
            <View style={styles.statRow}>
              <Ionicons name={icon as any} size={22} color={color} />
              <Text style={[styles.statNum, { color }]}>{stats?.[key] ?? 0}</Text>
            </View>
            <Text style={styles.statLabel}>{label}</Text>
          </AppCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  greeting: { fontSize: 13, color: '#94c3dc' },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  urgentRow: { padding: 16 },
  urgentCard: { backgroundColor: '#0f2c59', borderRadius: 16, padding: 20, alignItems: 'center' },
  urgentNum: { fontSize: 48, fontWeight: '900', color: '#0d9488' },
  urgentLabel: { fontSize: 14, color: '#94c3dc', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  statCard: { width: '47%', padding: 14 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#64748b', lineHeight: 16 },
});
