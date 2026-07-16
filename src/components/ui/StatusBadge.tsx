import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JobApplicationStatus } from '../../types/applications';

interface StatusBadgeProps {
  status: JobApplicationStatus;
}

const STATUS_MAP: Record<
  JobApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  [JobApplicationStatus.SubmittedToAdmin]: {
    label: 'Submitted',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  [JobApplicationStatus.AdminReview]: {
    label: 'Under Review',
    color: '#d97706',
    bg: '#fffbeb',
  },
  [JobApplicationStatus.MoreInformationRequested]: {
    label: 'More Info Needed',
    color: '#d97706',
    bg: '#fffbeb',
  },
  [JobApplicationStatus.ApprovedForEmployer]: {
    label: 'Employer Review',
    color: '#0d9488',
    bg: '#f0fdf9',
  },
  [JobApplicationStatus.RejectedByAdmin]: {
    label: 'Rejected by Admin',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  [JobApplicationStatus.Shortlisted]: {
    label: 'Shortlisted',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  [JobApplicationStatus.RejectedByEmployer]: {
    label: 'Rejected',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  [JobApplicationStatus.InterviewRequested]: {
    label: 'Interview Requested',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  [JobApplicationStatus.InterviewApproved]: {
    label: 'Interview Approved',
    color: '#059669',
    bg: '#ecfdf5',
  },
  [JobApplicationStatus.InterviewDeclined]: {
    label: 'Interview Declined',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  [JobApplicationStatus.OfferMade]: {
    label: 'Offer Made',
    color: '#0891b2',
    bg: '#ecfeff',
  },
  [JobApplicationStatus.OfferAccepted]: {
    label: 'Offer Accepted ✓',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  [JobApplicationStatus.OfferDeclined]: {
    label: 'Offer Declined',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  [JobApplicationStatus.Withdrawn]: {
    label: 'Withdrawn',
    color: '#6b7280',
    bg: '#f9fafb',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { label: 'Unknown', color: '#6b7280', bg: '#f9fafb' };
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
