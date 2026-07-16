import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchCandidates } from '../../api/jobApplications.api';
import { AvailableStudentSearchResultDto } from '../../types/applications';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import EmptyState from '../../components/ui/EmptyState';

export default function SearchCandidatesScreen() {
  const [city, setCity] = useState('');
  const [results, setResults] = useState<AvailableStudentSearchResultDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const res = await searchCandidates({ city: city || undefined, page: 1, pageSize: 20 });
      if (res.data.succeeded && res.data.data) setResults(res.data.data);
    } catch (_) {}
    finally { setLoading(false); setSearched(true); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Candidate Pool</Text>
        <Text style={styles.sub}>Search anonymised candidate profiles</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="location-outline" size={16} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Filter by city"
              placeholderTextColor="#94a3b8"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={search}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.gdprBar}>
          <Ionicons name="eye-off-outline" size={13} color="#0d9488" />
          <Text style={styles.gdprText}>Names and contact details are hidden to protect candidate privacy</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AppCard>
              <Text style={styles.code}>🔒 {item.candidateCode}</Text>
              <View style={styles.chips}>
                <View style={styles.chip}>
                  <Ionicons name="location-outline" size={12} color="#0d9488" />
                  <Text style={styles.chipText}>{item.city}</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons name="time-outline" size={12} color="#0d9488" />
                  <Text style={styles.chipText}>{item.maxHoursPerWeek}h/wk max</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons name="cash-outline" size={12} color="#0d9488" />
                  <Text style={styles.chipText}>£{item.expectedHourlyRate}/hr</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: item.employmentPreference === 1 ? '#fef9c3' : '#dbeafe' }]}>
                  <Text style={[styles.chipText, { color: '#374151' }]}>
                    {item.employmentPreference === 1 ? 'Part-time' : 'Full-time'}
                  </Text>
                </View>
              </View>
              {item.skills && (
                <View style={styles.skillRow}>
                  <Text style={styles.skillLabel}>Skills: </Text>
                  <Text style={styles.skillVal}>{item.skills}</Text>
                </View>
              )}
              {item.preferredJobCategories && (
                <View style={styles.skillRow}>
                  <Text style={styles.skillLabel}>Categories: </Text>
                  <Text style={styles.skillVal}>{item.preferredJobCategories}</Text>
                </View>
              )}
            </AppCard>
          )}
          ListEmptyComponent={
            searched ? (
              <EmptyState icon="people-outline" title="No candidates found" subtitle="Try a different city or remove filters." />
            ) : (
              <EmptyState icon="search-outline" title="Search candidates" subtitle="Filter by city to see available students." />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0f2c59', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#94c3dc', marginBottom: 14 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingHorizontal: 12, height: 44,
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  searchBtn: { backgroundColor: '#0d9488', width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  gdprBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(13,148,136,0.15)', borderRadius: 8, padding: 8,
  },
  gdprText: { fontSize: 11, color: '#0d9488', flex: 1, fontWeight: '600' },
  list: { padding: 16, flexGrow: 1 },
  code: { fontSize: 14, fontWeight: '700', color: '#0f2c59', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  chipText: { fontSize: 11, color: '#0d9488', fontWeight: '600' },
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  skillVal: { fontSize: 12, color: '#475569', flex: 1 },
});
