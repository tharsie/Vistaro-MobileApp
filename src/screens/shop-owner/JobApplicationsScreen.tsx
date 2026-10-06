import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
  ImageBackground,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  getEmployerApplications,
  updateApplicationStatus,
  requestInterview,
  makeConditionalOffer,
  requestContactRelease,
  sendModeratedMessage,
} from '../../api/jobApplications.api';
import { JobApplicationResponseDto, JobApplicationStatus } from '../../types/applications';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

type CandidateTab = 'all' | 'pending' | 'shortlisted' | 'interview' | 'offers';

export default function JobApplicationsScreen() {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState<JobApplicationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CandidateTab>('all');

  // Modal states
  const [msgModal, setMsgModal] = useState<{ visible: boolean; appId: string }>({
    visible: false,
    appId: '',
  });
  const [msgText, setMsgText] = useState('');
  const [contactModal, setContactModal] = useState<{ visible: boolean; appId: string }>({
    visible: false,
    appId: '',
  });
  const [contactReason, setContactReason] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetch = async () => {
    try {
      const res = await getEmployerApplications();
      if (res.data.succeeded && res.data.data) setApplications(res.data.data);
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const doAction = async (id: string, action: () => Promise<any>, label: string) => {
    setActionLoading(id + label);
    try {
      await action();
      fetch();
    } catch {
      Alert.alert('Error', `${label} failed`);
    } finally {
      setActionLoading(null);
    }
  };

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    setModalSubmitting(true);
    try {
      await sendModeratedMessage({ jobApplicationId: msgModal.appId, messageText: msgText });
      Alert.alert('Sent', 'Your message is pending admin moderation.');
      setMsgModal({ visible: false, appId: '' });
      setMsgText('');
    } catch {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setModalSubmitting(false);
    }
  };

  const sendContactRequest = async () => {
    if (!contactReason.trim()) return;
    setModalSubmitting(true);
    try {
      await requestContactRelease(contactModal.appId, { reason: contactReason });
      Alert.alert('Requested', 'Contact release request submitted for admin approval.');
      setContactModal({ visible: false, appId: '' });
      setContactReason('');
    } catch {
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setModalSubmitting(false);
    }
  };

  const counts = useMemo(() => {
    const pending = applications.filter((a) => a.status === JobApplicationStatus.ApprovedForEmployer).length;
    const shortlisted = applications.filter((a) => a.status === JobApplicationStatus.Shortlisted).length;
    const interview = applications.filter((a) => [8, 9].includes(a.status)).length;
    const offers = applications.filter((a) => [11, 12].includes(a.status)).length;
    return { all: applications.length, pending, shortlisted, interview, offers };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return applications.filter((a) => a.status === JobApplicationStatus.ApprovedForEmployer);
      case 'shortlisted':
        return applications.filter((a) => a.status === JobApplicationStatus.Shortlisted);
      case 'interview':
        return applications.filter((a) => [8, 9].includes(a.status));
      case 'offers':
        return applications.filter((a) => [11, 12].includes(a.status));
      default:
        return applications;
    }
  }, [applications, activeTab]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ========================================================= */}
      {/* BRANDED HEADER WITH TopBackground.png                     */}
      {/* ========================================================= */}
      <ImageBackground
        source={require('../../../assets/TopBackground.png')}
        style={[
          styles.headerBackground,
          { paddingTop: insets.top > 0 ? insets.top + 8 : 40 },
        ]}
        imageStyle={styles.headerBackgroundImage}
        resizeMode="cover"
      >
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Candidate Applications</Text>
            <Text style={styles.headerSub}>
              {applications.length} vetted candidate{applications.length !== 1 ? 's' : ''} available
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshIconBtn} onPress={() => fetch()} activeOpacity={0.7}>
            <Ionicons name="reload-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* GDPR Privacy Notice */}
        <View style={styles.gdprBanner}>
          <Ionicons name="shield-checkmark" size={14} color="#00d2ff" style={{ marginRight: 6 }} />
          <Text style={styles.gdprText}>Candidate identities are protected — GDPR compliant</Text>
        </View>

        {/* Candidate Status Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}
        >
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'pending', label: 'Pending Review', count: counts.pending },
            { id: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
            { id: 'interview', label: 'Interviews', count: counts.interview },
            { id: 'offers', label: 'Offers', count: counts.offers },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveTab(tab.id as CandidateTab)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.filterCountBadge, isActive && styles.filterCountBadgeActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ImageBackground>

      {/* ========================================================= */}
      {/* CANDIDATES LIST FEED                                      */}
      {/* ========================================================= */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#0d9488"
            colors={['#0d9488']}
            onRefresh={() => {
              setRefreshing(true);
              fetch();
            }}
          />
        }
        renderItem={({ item }) => {
          const busy = (label: string) => actionLoading === item.id + label;
          let formattedDate = 'Recently';
          try {
            formattedDate = format(new Date(item.appliedAt), 'dd MMM yyyy');
          } catch (_) {}

          return (
            <View style={styles.candidateCard}>
              {/* Top Row: Candidate ID & Job + StatusBadge */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.avatarWrap}>
                  <Ionicons name="person" size={20} color="#0f2c59" />
                </View>

                <View style={styles.cardTitleCol}>
                  <Text style={styles.candidateCode}>
                    🔒 {(item as any).candidateCode ?? 'Candidate'}
                  </Text>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    Applied for: {item.jobTitle}
                  </Text>
                </View>

                <StatusBadge status={item.status} />
              </View>

              {/* Date Row */}
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                <Text style={styles.dateText}>Applied {formattedDate}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsWrap}>
                {item.status === JobApplicationStatus.ApprovedForEmployer && (
                  <>
                    <TouchableOpacity
                      style={styles.shortlistBtn}
                      disabled={busy('sl')}
                      onPress={() =>
                        doAction(item.id, () => updateApplicationStatus(item.id, { status: 6 }), 'sl')
                      }
                      activeOpacity={0.8}
                    >
                      <Ionicons name="star" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.shortlistBtnText}>Shortlist</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      disabled={busy('rj')}
                      onPress={() =>
                        doAction(item.id, () => updateApplicationStatus(item.id, { status: 7 }), 'rj')
                      }
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle-outline" size={14} color="#dc2626" style={{ marginRight: 4 }} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}

                {item.status === JobApplicationStatus.Shortlisted && (
                  <TouchableOpacity
                    style={styles.interviewBtn}
                    disabled={busy('iv')}
                    onPress={() => doAction(item.id, () => requestInterview(item.id), 'iv')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.interviewBtnText}>Request Interview</Text>
                  </TouchableOpacity>
                )}

                {item.status === JobApplicationStatus.InterviewApproved && (
                  <TouchableOpacity
                    style={styles.offerBtn}
                    disabled={busy('off')}
                    onPress={() => doAction(item.id, () => makeConditionalOffer(item.id), 'off')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trophy" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.offerBtnText}>Make Offer</Text>
                  </TouchableOpacity>
                )}

                {/* Always-accessible Communication Actions */}
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setMsgModal({ visible: true, appId: item.id });
                    setMsgText('');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-outline" size={14} color="#0f2c59" style={{ marginRight: 4 }} />
                  <Text style={styles.secondaryBtnText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setContactModal({ visible: true, appId: item.id });
                    setContactReason('');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call-outline" size={14} color="#0f2c59" style={{ marginRight: 4 }} />
                  <Text style={styles.secondaryBtnText}>Request Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No applications in this category"
            subtitle="Admin-approved candidate applications will appear here."
          />
        }
        ListFooterComponent={
          <View style={styles.footerSkylineContainer}>
            <Image
              source={require('../../../assets/BottomBanner.png')}
              style={styles.footerSkylineImage}
              resizeMode="cover"
            />
          </View>
        }
      />

      {/* Message Modal */}
      <Modal visible={msgModal.visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Send Moderated Message</Text>
            <Text style={styles.modalSub}>
              Messages are reviewed by Vistaro admin before delivery to the candidate.
            </Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Type your message to the candidate..."
              placeholderTextColor="#94a3b8"
              value={msgText}
              onChangeText={setMsgText}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={sendMessage}
              disabled={modalSubmitting}
              activeOpacity={0.85}
            >
              {modalSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.modalPrimaryBtnText}>Send Message</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setMsgModal({ visible: false, appId: '' })}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Contact Release Modal */}
      <Modal visible={contactModal.visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request Contact Details</Text>
            <Text style={styles.modalSub}>
              Provide a valid reason for contacting the candidate directly (e.g. phone interview).
            </Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={3}
              placeholder="Reason for contact request..."
              placeholderTextColor="#94a3b8"
              value={contactReason}
              onChangeText={setContactReason}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={sendContactRequest}
              disabled={modalSubmitting}
              activeOpacity={0.85}
            >
              {modalSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.modalPrimaryBtnText}>Submit Request</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setContactModal({ visible: false, appId: '' })}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  /* Header */
  headerBackground: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#002868',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerBackgroundImage: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12.5,
    color: '#c2ddf7',
    fontWeight: '500',
    marginTop: 2,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  gdprBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
    marginVertical: 10,
  },
  gdprText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },

  /* Filter Tabs */
  filterTabsScroll: {
    gap: 8,
    paddingTop: 2,
    paddingBottom: 4,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterTabActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 6,
  },
  filterTabTextActive: {
    color: '#0f2438',
    fontWeight: '700',
  },
  filterCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterCountBadgeActive: {
    backgroundColor: '#0f2438',
  },
  filterCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  filterCountTextActive: {
    color: '#ffffff',
  },

  /* List */
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  candidateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2f6',
    ...Platform.select({
      ios: {
        shadowColor: '#0f2c59',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  candidateCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f2438',
  },
  jobTitle: {
    fontSize: 12.5,
    color: '#0d9488',
    fontWeight: '600',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '500',
  },

  /* Actions */
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  shortlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  shortlistBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  interviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  interviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  offerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  offerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
  },
  secondaryBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f2c59',
  },

  /* Modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f2438',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12.5,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13.5,
    color: '#0f2438',
    height: 100,
    marginBottom: 14,
  },
  modalPrimaryBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },

  /* London Skyline Footer */
  footerSkylineContainer: {
    width: '100%',
    height: 55,
    overflow: 'hidden',
    marginTop: 16,
    opacity: 0.65,
  },
  footerSkylineImage: {
    width: '100%',
    height: '100%',
  },
});
