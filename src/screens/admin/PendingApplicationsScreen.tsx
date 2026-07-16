import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  Alert, Modal, TextInput, TouchableOpacity, RefreshControl,
} from 'react-native';
import {
  getPendingApplications, approveApplicationForEmployer,
  rejectApplication, requestMoreInfo,
} from '../../api/admin.api';
import { AdminJobApplicationResponseDto } from '../../types/applications';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

type ActionType = 'approve' | 'reject' | 'info' | null;

export default function PendingApplicationsScreen() {
  const [applications, setApplications] = useState<AdminJobApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<{ visible: boolean; appId: string; action: ActionType }>({ visible: false, appId: '', action: null });
  const [comment, setComment] = useState('');

  const fetch = async () => {
    try {
      const res = await getPendingApplications();
      if (res.data.succeeded && res.data.data) setApplications(res.data.data);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openModal = (appId: string, action: ActionType) => {
    setModal({ visible: true, appId, action });
    setComment('');
  };

  const confirm = async () => {
    setActionLoading(modal.appId);
    setModal({ ...modal, visible: false });
    try {
      const dto = { adminComment: comment || undefined };
      if (modal.action === 'approve') await approveApplicationForEmployer(modal.appId, dto);
      else if (modal.action === 'reject') await rejectApplication(modal.appId, dto);
      else if (modal.action === 'info') await requestMoreInfo(modal.appId, dto);
      fetch();
    } catch { Alert.alert('Error', 'Action failed'); }
    finally { setActionLoading(null); }
  };

  const ACTION_CONFIG = {
    approve: { title: 'Approve for Employer', color: '#059669' },
    reject: { title: 'Reject Application', color: '#dc2626' },
    info: { title: 'Request More Info', color: '#d97706' },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Pending Applications</Text>
        <Text style={styles.sub}>{applications.length} awaiting review</Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => {
          const busy = actionLoading === item.id;
          return (
            <AppCard>
              <Text style={styles.candidate}>🔒 {item.candidateCode}</Text>
              <Text style={styles.jobTitle}>{item.jobTitle}</Text>
              <Text style={styles.shopName}>{item.shopName}</Text>
              <Text style={styles.date}>Applied {format(new Date(item.appliedAt), 'dd MMM yyyy')}</Text>
              {item.adminComment && (
                <View style={styles.commentBox}>
                  <Text style={styles.commentText}>{item.adminComment}</Text>
                </View>
              )}
              <View style={styles.actions}>
                <AppButton title="✓ Approve" variant="secondary" loading={busy} onPress={() => openModal(item.id, 'approve')} style={styles.btn} />
                <AppButton title="? Info" variant="outline" loading={busy} onPress={() => openModal(item.id, 'info')} style={styles.btn} />
                <AppButton title="✕ Reject" variant="danger" loading={busy} onPress={() => openModal(item.id, 'reject')} style={styles.btn} />
              </View>
            </AppCard>
          );
        }}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="No pending applications" subtitle="All applications have been reviewed!" />}
      />

      <Modal visible={modal.visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modal.action ? ACTION_CONFIG[modal.action].title : ''}
            </Text>
            <Text style={styles.modalSub}>Add an optional comment for the candidate.</Text>
            <TextInput
              style={styles.modalInput}
              multiline numberOfLines={3}
              placeholder="Admin comment (optional)..."
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: modal.action ? ACTION_CONFIG[modal.action].color : '#0f2c59' }]}
              onPress={confirm}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
            <AppButton title="Cancel" variant="outline" onPress={() => setModal({ ...modal, visible: false })} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  list: { padding: 16, flexGrow: 1 },
  candidate: { fontSize: 13, fontWeight: '700', color: '#0f2c59', marginBottom: 4 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#0f2c59' },
  shopName: { fontSize: 13, color: '#0d9488', marginBottom: 4 },
  date: { fontSize: 11, color: '#94a3b8', marginBottom: 12 },
  commentBox: { backgroundColor: '#fffbeb', borderRadius: 8, padding: 10, marginBottom: 12 },
  commentText: { fontSize: 13, color: '#92400e' },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 10, minHeight: 40, borderRadius: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f2c59', marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  modalInput: { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', minHeight: 80 },
  confirmBtn: { paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginTop: 12 },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
