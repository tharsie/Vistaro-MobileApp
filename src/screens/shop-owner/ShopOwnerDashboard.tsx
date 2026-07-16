import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getEmployerApplications } from '../../api/jobApplications.api';
import { getMyJobPostings } from '../../api/jobs.api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AppCard from '../../components/ui/AppCard';

export default function ShopOwnerDashboard() {
  const { state, logout } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([getMyJobPostings(), getEmployerApplications()]);
      const jobs = jobsRes.data.data?.length ?? 0;
      const apps = appsRes.data.data ?? [];
      setStats({
        jobs,
        applications: apps.length,
        shortlisted: apps.filter((a: any) => a.status === 6).length,
      });
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
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{state.user?.fullName} 🏪</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: 'Active Jobs', value: stats.jobs, icon: 'briefcase', color: '#0f2c59' },
          { label: 'Applications', value: stats.applications, icon: 'people', color: '#0d9488' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: 'star', color: '#7c3aed' },
        ].map((s) => (
          <AppCard key={s.label} style={styles.statCard}>
            <Ionicons name={s.icon as any} size={24} color={s.color} />
            <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </AppCard>
        ))}
      </View>

      <AppCard style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={20} color="#d97706" />
        <Text style={styles.tipText}>
          All applications go through admin review before reaching you. Check Candidates tab for approved ones.
        </Text>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59',
    paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  greeting: { fontSize: 13, color: '#94c3dc' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: { flex: 1, alignItems: 'center', gap: 6 },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#64748b', textAlign: 'center' },
  tipCard: { marginHorizontal: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#fffbeb' },
  tipText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 18 },
});
