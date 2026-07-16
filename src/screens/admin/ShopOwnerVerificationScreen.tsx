import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Alert, RefreshControl } from 'react-native';
import { getShopOwners, approveShopOwner, rejectShopOwner } from '../../api/admin.api';
import { AdminShopOwnerListItemDto } from '../../types/admin';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const isVerifiedShopOwner = (shopOwner: AdminShopOwnerListItemDto) => {
  const status = shopOwner.businessVerificationStatus ?? shopOwner.verificationStatus ?? shopOwner.isVerified;

  if (typeof status === 'boolean') {
    return status;
  }

  if (typeof status === 'number') {
    return status === 2;
  }

  if (typeof status === 'string') {
    const normalized = status.toLowerCase();
    return normalized.includes('approved') || normalized.includes('verified');
  }

  return false;
};

export default function ShopOwnerVerificationScreen() {
  const [shopOwners, setShopOwners] = useState<AdminShopOwnerListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetch = async () => {
    try {
      const res = await getShopOwners({ page: 1, pageSize: 50 });
      if (res.data.succeeded && res.data.data) setShopOwners(res.data.data.items ?? []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const doAction = (id: string, action: 'approve' | 'reject') => {
    Alert.alert(
      action === 'approve' ? 'Approve Shop Owner' : 'Reject Shop Owner',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            setActionLoading(id + action);
            try {
              action === 'approve' ? await approveShopOwner(id) : await rejectShopOwner(id);
              fetch();
            } catch { Alert.alert('Error', 'Action failed'); }
            finally { setActionLoading(null); }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingSpinner />;

  const pending = shopOwners.filter((s) => !isVerifiedShopOwner(s));
  const verified = shopOwners.filter((s) => isVerifiedShopOwner(s));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Shop Owners</Text>
        <Text style={styles.sub}>{pending.length} pending · {verified.length} verified</Text>
      </View>
      <FlatList
        data={shopOwners}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => {
          const busy = (label: string) => actionLoading === item.id + label;
          const verified = isVerifiedShopOwner(item);
          return (
            <AppCard style={StyleSheet.flatten([styles.card, verified && styles.verified] as any)}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopName}>{item.shopName}</Text>
                  <Text style={styles.ownerName}>{item.fullName}</Text>
                  <Text style={styles.city}>{item.city}</Text>
                  <Text style={styles.date}>Joined {format(new Date(item.createdAt), 'dd MMM yyyy')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: verified ? '#ecfdf5' : '#fffbeb' }]}>
                  <Text style={[styles.statusText, { color: verified ? '#16a34a' : '#d97706' }]}>
                    {verified ? '✓ Verified' : (item.verificationStatus ?? String(item.businessVerificationStatus ?? 'Pending'))}
                  </Text>
                </View>
              </View>
              {!verified && (
                <View style={styles.actions}>
                  <AppButton title="✓ Approve" variant="secondary" loading={busy('approve')} onPress={() => doAction(item.id, 'approve')} style={styles.btn} />
                  <AppButton title="✕ Reject" variant="danger" loading={busy('reject')} onPress={() => doAction(item.id, 'reject')} style={styles.btn} />
                </View>
              )}
            </AppCard>
          );
        }}
        ListEmptyComponent={<EmptyState icon="storefront-outline" title="No shop owners" subtitle="Registered shop owners will appear here." />}
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
  verified: { borderLeftWidth: 3, borderLeftColor: '#16a34a' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  shopName: { fontSize: 15, fontWeight: '700', color: '#0f2c59' },
  ownerName: { fontSize: 13, color: '#64748b', marginTop: 2 },
  city: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { flex: 1, paddingVertical: 10, minHeight: 40, borderRadius: 20 },
});
