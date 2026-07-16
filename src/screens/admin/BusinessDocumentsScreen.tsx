import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Alert, RefreshControl, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBusinessDocuments, approveBusinessDocument, rejectBusinessDocument } from '../../api/admin.api';
import { AdminBusinessDocumentDto } from '../../types/admin';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export default function BusinessDocumentsScreen() {
  const [docs, setDocs] = useState<AdminBusinessDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetch = async () => {
    try {
      const res = await getBusinessDocuments({ page: 1, pageSize: 50 });
      if (res.data.succeeded && res.data.data) setDocs(res.data.data.items ?? []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const doAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id + action);
    try {
      action === 'approve' ? await approveBusinessDocument(id) : await rejectBusinessDocument(id);
      fetch();
    } catch { Alert.alert('Error', 'Action failed'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Business Documents</Text>
        <Text style={styles.sub}>{docs.filter((d) => d.status === 'Pending').length} pending review</Text>
      </View>
      <FlatList
        data={docs}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => {
          const busy = (label: string) => actionLoading === item.id + label;
          const statusColor = item.status === 'Approved' ? '#16a34a' : item.status === 'Rejected' ? '#dc2626' : '#d97706';
          return (
            <AppCard>
              <View style={styles.row}>
                <Ionicons name="document-text" size={28} color="#0d9488" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
                  <Text style={styles.shopName}>{item.shopName} · {item.shopOwnerName}</Text>
                  <Text style={styles.date}>{format(new Date(item.uploadedAt), 'dd MMM yyyy')}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL(item.fileUrl)} style={styles.viewLink}>
                <Ionicons name="open-outline" size={14} color="#0d9488" />
                <Text style={styles.viewText}>View Document</Text>
              </TouchableOpacity>
              {item.status === 'Pending' && (
                <View style={styles.actions}>
                  <AppButton title="✓ Approve" variant="secondary" loading={busy('approve')} onPress={() => doAction(item.id, 'approve')} style={styles.btn} />
                  <AppButton title="✕ Reject" variant="danger" loading={busy('reject')} onPress={() => doAction(item.id, 'reject')} style={styles.btn} />
                </View>
              )}
            </AppCard>
          );
        }}
        ListEmptyComponent={<EmptyState icon="documents-outline" title="No documents" subtitle="Business documents will appear here when uploaded." />}
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  shopName: { fontSize: 12, color: '#64748b', marginTop: 2 },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  viewLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  viewText: { fontSize: 13, color: '#0d9488', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 10, minHeight: 40, borderRadius: 20 },
});
