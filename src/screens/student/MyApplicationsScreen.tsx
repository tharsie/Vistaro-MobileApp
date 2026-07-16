import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getMyApplications,
  withdrawApplication,
  acceptInterview,
  declineInterview,
  acceptOffer,
  declineOffer,
} from '../../api/jobApplications.api';
import { JobApplicationResponseDto, JobApplicationStatus } from '../../types/applications';
import StatusBadge from '../../components/ui/StatusBadge';
import AppButton from '../../components/ui/AppButton';
import AppCard from '../../components/ui/AppCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const POLL_INTERVAL = 15000;

export default function MyApplicationsScreen() {
  const [applications, setApplications] = useState<JobApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchApplications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getMyApplications();
      if (res.data.succeeded && res.data.data) {
        setApplications(res.data.data);
      }
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchApplications();
    pollRef.current = setInterval(() => fetchApplications(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleAction = async (
    id: string,
    action: () => Promise<any>,
    confirmMsg: string,
  ) => {
    Alert.alert('Confirm', confirmMsg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(id);
          try {
            await action();
            fetchApplications(true);
          } catch {
            Alert.alert('Error', 'Action failed. Please try again.');
          } finally { setActionLoading(null); }
        },
      },
    ]);
  };

  const renderActions = (app: JobApplicationResponseDto) => {
    const busy = actionLoading === app.id;
    const { status } = app;

    const btns: React.ReactElement[] = [];

    if ([1, 2, 3, 4].includes(status)) {
      btns.push(
        <AppButton
          key="withdraw"
          title="Withdraw"
          variant="outline"
          loading={busy}
          onPress={() => handleAction(app.id, () => withdrawApplication(app.id), 'Withdraw this application?')}
          style={styles.actionBtn}
        />,
      );
    }

    if (status === JobApplicationStatus.InterviewRequested) {
      btns.push(
        <AppButton key="accept-iv" title="Accept Interview" variant="secondary" loading={busy} onPress={() => handleAction(app.id, () => acceptInterview(app.id), 'Accept the interview invite?')} style={styles.actionBtn} />,
        <AppButton key="decline-iv" title="Decline" variant="danger" loading={busy} onPress={() => handleAction(app.id, () => declineInterview(app.id), 'Decline the interview?')} style={styles.actionBtn} />,
      );
    }

    if (status === JobApplicationStatus.OfferMade) {
      btns.push(
        <AppButton key="accept-off" title="Accept Offer 🎉" variant="secondary" loading={busy} onPress={() => handleAction(app.id, () => acceptOffer(app.id), 'Accept this job offer?')} style={styles.actionBtn} />,
        <AppButton key="decline-off" title="Decline Offer" variant="danger" loading={busy} onPress={() => handleAction(app.id, () => declineOffer(app.id), 'Decline this offer?')} style={styles.actionBtn} />,
      );
    }

    return btns.length > 0 ? <View style={styles.actionsRow}>{btns}</View> : null;
  };

  const renderItem = ({ item }: { item: JobApplicationResponseDto }) => (
    <AppCard>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{item.jobTitle}</Text>
          <Text style={styles.shopName}>{item.shopName}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {item.status === JobApplicationStatus.MoreInformationRequested && item.adminComment && (
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#d97706" />
          <Text style={styles.infoText}>{item.adminComment}</Text>
        </View>
      )}

      <Text style={styles.dateText}>
        Applied {format(new Date(item.appliedAt), 'dd MMM yyyy')}
      </Text>

      {renderActions(item)}
    </AppCard>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Text style={styles.headerSub}>{applications.length} application{applications.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApplications(); }} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No applications yet"
            subtitle="Browse jobs and apply to get started!"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59',
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  list: { padding: 16, flexGrow: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#0f2c59', flex: 1 },
  shopName: { fontSize: 13, color: '#0d9488', marginTop: 2 },
  dateText: { fontSize: 11, color: '#94a3b8', marginBottom: 12 },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: '#92400e' },
  actionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, minHeight: 40, borderRadius: 20 },
});
