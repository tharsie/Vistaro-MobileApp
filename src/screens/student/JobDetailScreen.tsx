import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobPostingSummaryDto } from '../../types/jobs';
import { applyToJob } from '../../api/jobApplications.api';
import AppButton from '../../components/ui/AppButton';
import { format } from 'date-fns';

// We receive the job via global store from JobSearchScreen
import { JOB_DETAIL_STORE } from './JobSearchScreen';

export default function JobDetailScreen({ navigation }: any) {
  const job: JobPostingSummaryDto | null = JOB_DETAIL_STORE.job;
  const [modalVisible, setModalVisible] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 24, color: '#64748b' }}>Job not found. Go back and try again.</Text>
      </View>
    );
  }

  const apply = async () => {
    try {
      setApplying(true);
      const res = await applyToJob(job.id, { coverLetter });
      if (res.data.succeeded) {
        Alert.alert('Applied!', 'Your application has been submitted for admin review.', [
          { text: 'OK', onPress: () => { setModalVisible(false); navigation.goBack(); } },
        ]);
      } else {
        Alert.alert('Error', res.data.message ?? 'Application failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message ?? 'Network error');
    } finally { setApplying(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <AppButton
          title="← Back"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          textStyle={{ color: '#fff', fontSize: 13 }}
        />
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.jobTitle}>{job.jobTitle}</Text>
        <Text style={styles.shopName}>{job.shopName}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="location-outline" size={14} color="#0d9488" />
            <Text style={styles.metaText}>{job.city}, {job.postcode}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="cash-outline" size={14} color="#0d9488" />
            <Text style={styles.metaText}>£{job.hourlyRate}/hr</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={14} color="#0d9488" />
            <Text style={styles.metaText}>{job.hoursPerWeek}h/week</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: job.employmentType === 1 ? '#fef9c3' : '#dbeafe' }]}>
            <Text style={[styles.metaText, { color: '#374151' }]}>
              {job.employmentType === 1 ? 'Part-time' : 'Full-time'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <Text style={styles.sectionText}>{job.jobCategory}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>{job.jobDescription}</Text>
        </View>

        <Text style={styles.postedDate}>
          Posted {format(new Date(job.createdAt), 'dd MMMM yyyy')}
        </Text>

        <AppButton
          title="Apply for this Job"
          variant="secondary"
          onPress={() => setModalVisible(true)}
          style={{ marginTop: 24 }}
        />
      </ScrollView>

      {/* Cover Letter Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cover Letter (Optional)</Text>
            <Text style={styles.modalSub}>Introduce yourself and why you'd be a great fit.</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={6}
              placeholder="Dear Hiring Manager..."
              value={coverLetter}
              onChangeText={setCoverLetter}
              textAlignVertical="top"
            />
            <AppButton title="Submit Application" onPress={apply} loading={applying} style={{ marginTop: 12 }} />
            <AppButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderColor: 'rgba(255,255,255,0.3)', minHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { padding: 24 },
  jobTitle: { fontSize: 22, fontWeight: '800', color: '#0f2c59', marginBottom: 4 },
  shopName: { fontSize: 15, color: '#0d9488', fontWeight: '600', marginBottom: 16 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f0fdf9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  metaText: { fontSize: 12, color: '#0d9488', fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  sectionText: { fontSize: 14, color: '#334155', lineHeight: 22 },
  postedDate: { fontSize: 12, color: '#94a3b8', textAlign: 'right' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f2c59', marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', minHeight: 120,
  },
});
