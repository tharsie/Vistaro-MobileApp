import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Alert, RefreshControl } from 'react-native';
import { approveContactRelease, denyContactRelease } from '../../api/admin.api';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Contact releases are embedded in employer application cards; this screen provides a dedicated queue
export default function ContactReleasesScreen() {
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Contact Releases</Text>
        <Text style={styles.sub}>Manage employer contact requests</Text>
      </View>
      <EmptyState
        icon="person-add-outline"
        title="Contact Release Queue"
        subtitle="Contact release requests from employers will appear here. Use the Applications tab to review applications and approve releases inline."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
});
