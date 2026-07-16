import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Alert, Modal, TextInput, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getStudentProfile, updateStudentProfile, uploadCV } from '../../api/student.api';
import { StudentProfileResponseDto, UpdateStudentProfileDto } from '../../types/student';
import AppButton from '../../components/ui/AppButton';
import AppCard from '../../components/ui/AppCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as DocumentPicker from 'expo-document-picker';

export default function StudentProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfileResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  const [form, setForm] = useState<Partial<UpdateStudentProfileDto>>({});

  const fetch = async () => {
    try {
      const res = await getStudentProfile();
      if (res.data.succeeded && res.data.data) {
        const p = res.data.data;
        setProfile(p);
        setForm({
          fullName: p.fullName, phoneNumber: p.phoneNumber, address: p.address,
          city: p.city, postcode: p.postcode, employmentPreference: p.employmentPreference,
          maxHoursPerWeek: p.maxHoursPerWeek, expectedHourlyRate: p.expectedHourlyRate,
          preferredJobCategories: p.preferredJobCategories, skills: p.skills,
        });
      }
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    try {
      setSaving(true);
      const res = await updateStudentProfile(form as UpdateStudentProfileDto);
      if (res.data.succeeded) {
        setProfile(res.data.data);
        setEditing(false);
        Alert.alert('Profile updated successfully!');
      } else {
        Alert.alert('Error', res.data.message ?? 'Update failed');
      }
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setSaving(false); }
  };

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/msword'] });
      if (result.canceled) return;
      const asset = result.assets[0];
      setCvUploading(true);
      const res = await uploadCV(asset.uri, asset.name, asset.mimeType ?? 'application/pdf');
      if (res.data.succeeded) {
        Alert.alert('CV uploaded!');
        fetch();
      }
    } catch { Alert.alert('Error', 'CV upload failed'); }
    finally { setCvUploading(false); }
  };

  if (loading) return <LoadingSpinner />;

  const p = profile;

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{p?.fullName?.[0] ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{p?.fullName}</Text>
        <Text style={styles.email}>{p?.email}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutRow}>
          <Ionicons name="log-out-outline" size={16} color="#94c3dc" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* CV Section */}
        <AppCard style={styles.cvCard}>
          <Text style={styles.sectionTitle}>CV / Resume</Text>
          {p?.cvFileName ? (
            <Text style={styles.cvName}>📄 {p.cvFileName}</Text>
          ) : (
            <Text style={styles.cvEmpty}>No CV uploaded yet</Text>
          )}
          <AppButton title={cvUploading ? 'Uploading...' : 'Upload CV'} variant="secondary" loading={cvUploading} onPress={pickCV} style={{ marginTop: 12 }} />
        </AppCard>

        {/* Details */}
        <AppCard>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Ionicons name={editing ? 'close-outline' : 'pencil-outline'} size={20} color="#0d9488" />
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              {([
                ['Full Name', 'fullName'],
                ['Phone', 'phoneNumber'],
                ['Address', 'address'],
                ['City', 'city'],
                ['Postcode', 'postcode'],
                ['Skills', 'skills'],
                ['Preferred Categories', 'preferredJobCategories'],
              ] as [string, keyof UpdateStudentProfileDto][]).map(([label, key]) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={String(form[key] ?? '')}
                    onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
                  />
                </View>
              ))}
              <AppButton title="Save Changes" onPress={save} loading={saving} style={{ marginTop: 16 }} />
            </>
          ) : (
            <>
              {[
                ['Phone', p?.phoneNumber],
                ['City', p?.city],
                ['Postcode', p?.postcode],
                ['Skills', p?.skills],
                ['Preferred Categories', p?.preferredJobCategories],
                ['Max Hours/Week', `${p?.maxHoursPerWeek} hrs`],
                ['Expected Rate', `£${p?.expectedHourlyRate}/hr`],
                ['Preference', p?.employmentPreference === 1 ? 'Part-time' : 'Full-time'],
              ].map(([label, val]) => (
                <View key={label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{val ?? '—'}</Text>
                </View>
              ))}
            </>
          )}
        </AppCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f2c59',
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  email: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16 },
  logoutText: { fontSize: 13, color: '#94c3dc' },
  body: { padding: 16 },
  cvCard: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f2c59', marginBottom: 8 },
  cvName: { fontSize: 13, color: '#64748b' },
  cvEmpty: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 13, color: '#1e293b', fontWeight: '600' },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: '600' },
  fieldInput: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
});
