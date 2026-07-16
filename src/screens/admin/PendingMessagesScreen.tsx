import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  Alert, Modal, TextInput, TouchableOpacity, RefreshControl,
} from 'react-native';
import { getPendingMessages, approveMessage, rejectMessage } from '../../api/admin.api';
import { AdminMessageResponseDto } from '../../types/admin';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export default function PendingMessagesScreen() {
  const [messages, setMessages] = useState<AdminMessageResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ visible: boolean; msgId: string }>({ visible: false, msgId: '' });
  const [reason, setReason] = useState('');

  const fetch = async () => {
    try {
      const res = await getPendingMessages();
      if (res.data.succeeded && res.data.data) setMessages(res.data.data);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (id: string) => {
    setActionLoading(id);
    try { await approveMessage(id); fetch(); }
    catch { Alert.alert('Error', 'Approve failed'); }
    finally { setActionLoading(null); }
  };

  const confirmReject = async () => {
    setActionLoading(rejectModal.msgId);
    setRejectModal({ ...rejectModal, visible: false });
    try { await rejectMessage(rejectModal.msgId, { rejectionReason: reason }); fetch(); }
    catch { Alert.alert('Error', 'Reject failed'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Message Moderation</Text>
        <Text style={styles.sub}>{messages.length} pending</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => {
          const busy = actionLoading === item.id;
          return (
            <AppCard>
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>"{item.messageText}"</Text>
              </View>
              <Text style={styles.meta}>
                From: {item.senderUserId.substring(0, 8)}... → To: {item.receiverUserId.substring(0, 8)}...
              </Text>
              <Text style={styles.date}>{format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}</Text>
              <View style={styles.actions}>
                <AppButton title="✓ Approve" variant="secondary" loading={busy} onPress={() => approve(item.id)} style={styles.btn} />
                <AppButton title="✕ Reject" variant="danger" loading={busy} onPress={() => { setRejectModal({ visible: true, msgId: item.id }); setReason(''); }} style={styles.btn} />
              </View>
            </AppCard>
          );
        }}
        ListEmptyComponent={<EmptyState icon="mail-outline" title="No pending messages" subtitle="Message queue is clear!" />}
      />

      <Modal visible={rejectModal.visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Reject Message</Text>
            <Text style={styles.modalSub}>Provide a reason for rejecting this message.</Text>
            <TextInput style={styles.modalInput} multiline numberOfLines={3} placeholder="Rejection reason..." value={reason} onChangeText={setReason} textAlignVertical="top" />
            <AppButton title="Confirm Reject" variant="danger" onPress={confirmReject} style={{ marginTop: 12 }} />
            <AppButton title="Cancel" variant="outline" onPress={() => setRejectModal({ ...rejectModal, visible: false })} style={{ marginTop: 8 }} />
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
  messageBox: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#0d9488' },
  messageText: { fontSize: 14, color: '#1e293b', fontStyle: 'italic', lineHeight: 20 },
  meta: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  date: { fontSize: 11, color: '#94a3b8', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 10, minHeight: 40, borderRadius: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f2c59', marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  modalInput: { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', minHeight: 80 },
});
