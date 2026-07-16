import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  Alert, Modal, TextInput, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getEmployerApplications, updateApplicationStatus, requestInterview,
  makeConditionalOffer, requestContactRelease, sendModeratedMessage,
} from '../../api/jobApplications.api';
import { JobApplicationResponseDto, JobApplicationStatus } from '../../types/applications';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export default function JobApplicationsScreen() {
  const [applications, setApplications] = useState<JobApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [msgModal, setMsgModal] = useState<{ visible: boolean; appId: string }>({ visible: false, appId: '' });
  const [msgText, setMsgText] = useState('');
  const [contactModal, setContactModal] = useState<{ visible: boolean; appId: string }>({ visible: false, appId: '' });
  const [contactReason, setContactReason] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetch = async () => {
    try {
      const res = await getEmployerApplications();
      if (res.data.succeeded && res.data.data) setApplications(res.data.data);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const doAction = async (id: string, action: () => Promise<any>, label: string) => {
    setActionLoading(id + label);
    try { await action(); fetch(); }
    catch { Alert.alert('Error', `${label} failed`); }
    finally { setActionLoading(null); }
  };

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    setModalSubmitting(true);
    try {
      await sendModeratedMessage({ jobApplicationId: msgModal.appId, messageText: msgText });
      Alert.alert('Sent', 'Your message is pending admin moderation.');
      setMsgModal({ visible: false, appId: '' });
      setMsgText('');
    } catch { Alert.alert('Error', 'Failed to send message'); }
    finally { setModalSubmitting(false); }
  };

  const sendContactRequest = async () => {
    if (!contactReason.trim()) return;
    setModalSubmitting(true);
    try {
      await requestContactRelease(contactModal.appId, { reason: contactReason });
      Alert.alert('Requested', 'Contact release request submitted for admin approval.');
      setContactModal({ visible: false, appId: '' });
      setContactReason('');
    } catch { Alert.alert('Error', 'Failed to submit request'); }
    finally { setModalSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Candidate Applications</Text>
        <Text style={styles.sub}>{applications.length} approved candidate{applications.length !== 1 ? 's' : ''}</Text>
        <View style={styles.gdprBanner}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#0d9488" />
          <Text style={styles.gdprText}>Candidate identities are protected — GDPR compliant</Text>
        </View>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => {
          const busy = (label: string) => actionLoading === item.id + label;
          return (
            <AppCard>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  {/* GDPR: Only candidateCode shown, never fullName */}
                  <Text style={styles.candidateCode}>🔒 {(item as any).candidateCode ?? 'Candidate'}</Text>
                  <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.date}>Applied {format(new Date(item.appliedAt), 'dd MMM yyyy')}</Text>

              <View style={styles.actionsWrap}>
                {item.status === JobApplicationStatus.ApprovedForEmployer && (
                  <>
                    <AppButton title="Shortlist" variant="secondary" loading={busy('sl')} onPress={() => doAction(item.id, () => updateApplicationStatus(item.id, { status: 6 }), 'sl')} style={styles.btn} />
                    <AppButton title="Reject" variant="danger" loading={busy('rj')} onPress={() => doAction(item.id, () => updateApplicationStatus(item.id, { status: 7 }), 'rj')} style={styles.btn} />
                  </>
                )}
                {item.status === JobApplicationStatus.Shortlisted && (
                  <AppButton title="Request Interview" variant="primary" loading={busy('iv')} onPress={() => doAction(item.id, () => requestInterview(item.id), 'iv')} style={styles.btn} />
                )}
                {item.status === JobApplicationStatus.InterviewApproved && (
                  <AppButton title="Make Offer" variant="secondary" loading={busy('off')} onPress={() => doAction(item.id, () => makeConditionalOffer(item.id), 'off')} style={styles.btn} />
                )}
                <AppButton title="Message" variant="outline" onPress={() => { setMsgModal({ visible: true, appId: item.id }); setMsgText(''); }} style={styles.btn} />
                <AppButton title="Request Contact" variant="outline" onPress={() => { setContactModal({ visible: true, appId: item.id }); setContactReason(''); }} style={styles.btn} />
              </View>
            </AppCard>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title="No applications yet" subtitle="Applications approved by admin will appear here." />
        }
      />

      {/* Message Modal */}
      <Modal visible={msgModal.visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Send Moderated Message</Text>
            <Text style={styles.modalSub}>Messages are reviewed by admin before delivery.</Text>
            <TextInput style={styles.modalInput} multiline numberOfLines={4} placeholder="Type your message..." value={msgText} onChangeText={setMsgText} textAlignVertical="top" />
            <AppButton title="Send Message" onPress={sendMessage} loading={modalSubmitting} style={{ marginTop: 12 }} />
            <AppButton title="Cancel" variant="outline" onPress={() => setMsgModal({ visible: false, appId: '' })} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      {/* Contact Request Modal */}
      <Modal visible={contactModal.visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Request Contact Details</Text>
            <Text style={styles.modalSub}>Explain why you need this candidate's contact info. Admin will review.</Text>
            <TextInput style={styles.modalInput} multiline numberOfLines={3} placeholder="e.g. We'd like to schedule an on-site interview..." value={contactReason} onChangeText={setContactReason} textAlignVertical="top" />
            <AppButton title="Submit Request" onPress={sendContactRequest} loading={modalSubmitting} style={{ marginTop: 12 }} />
            <AppButton title="Cancel" variant="outline" onPress={() => setContactModal({ visible: false, appId: '' })} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  gdprBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(13,148,136,0.15)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginTop: 10,
  },
  gdprText: { fontSize: 11, color: '#0d9488', fontWeight: '600' },
  list: { padding: 16, flexGrow: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  candidateCode: { fontSize: 13, fontWeight: '700', color: '#0f2c59' },
  jobTitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  date: { fontSize: 11, color: '#94a3b8', marginBottom: 12 },
  actionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 36, borderRadius: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f2c59', marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', minHeight: 100,
  },
});
