import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobPostingSummaryDto } from '../../types/jobs';
import { format } from 'date-fns';

interface JobCardProps {
  job: JobPostingSummaryDto;
  onPress: () => void;
  applied?: boolean;
}

export default function JobCard({ job, onPress, applied }: JobCardProps) {
  const employmentLabel = job.employmentType === 1 ? 'Part-time' : 'Full-time';

  // Determine category theme icon & color
  const getCategoryMeta = () => {
    const text = `${job.jobTitle} ${job.jobCategory || ''}`.toLowerCase();
    if (text.includes('barista') || text.includes('cafe') || text.includes('coffee')) {
      return { icon: 'cafe' as const, color: '#0284c7', bg: '#e0f2fe' };
    }
    if (text.includes('retail') || text.includes('fashion') || text.includes('shop') || text.includes('boutique') || text.includes('assistant')) {
      return { icon: 'bag-handle' as const, color: '#db2777', bg: '#fce7f3' };
    }
    if (text.includes('tutor') || text.includes('teach') || text.includes('student') || text.includes('education')) {
      return { icon: 'school' as const, color: '#9333ea', bg: '#f3e8ff' };
    }
    if (text.includes('wait') || text.includes('restaurant') || text.includes('chef') || text.includes('food') || text.includes('bar')) {
      return { icon: 'restaurant' as const, color: '#d97706', bg: '#fef3c7' };
    }
    if (text.includes('supermarket') || text.includes('sales') || text.includes('cart') || text.includes('grocery') || text.includes('stock')) {
      return { icon: 'cart' as const, color: '#059669', bg: '#d1fae5' };
    }
    return { icon: 'briefcase' as const, color: '#0f2438', bg: '#f1f5f9' };
  };

  const meta = getCategoryMeta();

  let formattedDate = '';
  try {
    formattedDate = format(new Date(job.createdAt), 'dd MMM yyyy');
  } catch (_) {
    formattedDate = 'Recently';
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Top Header Row: Icon + Title & Shop + Salary Tag */}
        <View style={styles.topRow}>
          <View style={styles.leftInfo}>
            <View style={[styles.categoryIconWrap, { backgroundColor: meta.bg }]}>
              <Ionicons name={meta.icon} size={20} color={meta.color} />
            </View>
            <View style={styles.titleColumn}>
              <Text style={styles.title} numberOfLines={1}>
                {job.jobTitle}
              </Text>
              <View style={styles.shopRow}>
                <Ionicons name="storefront-outline" size={13} color="#0d9488" style={{ marginRight: 4 }} />
                <Text style={styles.shop} numberOfLines={1}>
                  {job.shopName}
                </Text>
              </View>
            </View>
          </View>

          {/* Salary Tag */}
          <View style={styles.rateTag}>
            <Text style={styles.rateText}>£{job.salaryAmount}/hr</Text>
          </View>
        </View>

        {/* Job Description Snippet */}
        {job.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {job.description}
          </Text>
        ) : null}

        {/* Meta Chips Row */}
        <View style={styles.metaRow}>
          {job.city ? (
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={13} color="#64748b" style={{ marginRight: 3 }} />
              <Text style={styles.metaText}>{job.city}</Text>
            </View>
          ) : null}

          {job.hoursPerWeek ? (
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={13} color="#64748b" style={{ marginRight: 3 }} />
              <Text style={styles.metaText}>{job.hoursPerWeek}h/wk</Text>
            </View>
          ) : null}

          <View style={[styles.typeBadge, job.employmentType === 1 ? styles.partTimeBadge : styles.fullTimeBadge]}>
            <Text style={[styles.typeBadgeText, job.employmentType === 1 ? styles.partTimeText : styles.fullTimeText]}>
              {employmentLabel}
            </Text>
          </View>

          {applied && (
            <View style={styles.appliedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#16a34a" style={{ marginRight: 3 }} />
              <Text style={styles.appliedText}>Applied</Text>
            </View>
          )}
        </View>

        {/* Bottom Card Footer: Date + View Arrow */}
        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>Posted {formattedDate}</Text>
          </View>

          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={13} color="#0066ff" style={{ marginLeft: 3 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eef2f6',
    ...Platform.select({
      ios: {
        shadowColor: '#0f2c59',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f2438',
    letterSpacing: -0.2,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  shop: {
    fontSize: 13,
    color: '#0d9488',
    fontWeight: '700',
  },
  rateTag: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  rateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  partTimeBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  fullTimeBadge: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  partTimeText: {
    color: '#1d4ed8',
  },
  fullTimeText: {
    color: '#7e22ce',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  appliedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0066ff',
  },
});
