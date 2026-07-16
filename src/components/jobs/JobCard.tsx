import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobPostingSummaryDto } from '../../types/jobs';
import AppCard from '../ui/AppCard';
import { format } from 'date-fns';

interface JobCardProps {
  job: JobPostingSummaryDto;
  onPress: () => void;
}

export default function JobCard({ job, onPress }: JobCardProps) {
  const employmentLabel = job.employmentType === 1 ? 'Part-time' : 'Full-time';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <AppCard>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {job.jobTitle}
            </Text>
            <Text style={styles.shop}>{job.shopName}</Text>
          </View>
          <View style={styles.rateTag}>
            <Text style={styles.rate}>£{job.hourlyRate}/hr</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {job.jobDescription}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text style={styles.metaText}>{job.city}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text style={styles.metaText}>{job.hoursPerWeek}h/wk</Text>
          </View>
          <View style={[styles.badge, job.employmentType === 1 ? styles.partTime : styles.fullTime]}>
            <Text style={styles.badgeText}>{employmentLabel}</Text>
          </View>
        </View>

        <Text style={styles.date}>
          Posted {format(new Date(job.createdAt), 'dd MMM yyyy')}
        </Text>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  titleBlock: { flex: 1, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f2c59' },
  shop: { fontSize: 13, color: '#0d9488', marginTop: 2, fontWeight: '600' },
  rateTag: {
    backgroundColor: '#f0fdf9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rate: { fontSize: 13, fontWeight: '700', color: '#0d9488' },
  description: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748b' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  partTime: { backgroundColor: '#fef9c3' },
  fullTime: { backgroundColor: '#dbeafe' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  date: { fontSize: 11, color: '#94a3b8' },
});
