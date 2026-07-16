import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markNotificationRead } from '../../api/notifications.api';
import { NotificationResponseDto } from '../../types/notifications';
import AppCard from '../../components/ui/AppCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export default function StudentNotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getNotifications();
      if (res.data.succeeded && res.data.data) {
        setNotifications(res.data.data);
      }
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetch();
    pollRef.current = setInterval(() => fetch(true), 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const markRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch (_) {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.sub}>{notifications.filter((n) => !n.isRead).length} unread</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => !item.isRead && markRead(item.id)} activeOpacity={0.85}>
            <AppCard style={StyleSheet.flatten([styles.card, !item.isRead && styles.unread] as any)}>
              <View style={styles.row}>
                <View style={StyleSheet.flatten([styles.dot, item.isRead && styles.dotRead] as any)} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifMsg}>{item.message}</Text>
                  <Text style={styles.notifDate}>{format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}</Text>
                </View>
              </View>
            </AppCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title="No notifications" subtitle="You're all caught up!" />
        }
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
  card: {},
  unread: { borderLeftWidth: 3, borderLeftColor: '#0d9488' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0d9488', marginTop: 4 },
  dotRead: { backgroundColor: '#e2e8f0' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#0f2c59', marginBottom: 4 },
  notifMsg: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  notifDate: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
});
