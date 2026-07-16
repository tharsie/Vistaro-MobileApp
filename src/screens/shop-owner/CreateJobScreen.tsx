import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { createJobPosting, updateJobPosting } from '../../api/jobs.api';
import { CreateJobPostingDto } from '../../types/jobs';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { EDIT_JOB_STORE } from './ManageJobsScreen';

const CATEGORIES = ['Retail', 'Hospitality', 'Admin', 'Care', 'Logistics', 'Tech', 'Other'];

export default function CreateJobScreen({ navigation, route }: any) {
  const editMode: boolean = route?.params?.editMode ?? false;
  const existing = EDIT_JOB_STORE.job;

  const [form, setForm] = useState<CreateJobPostingDto>({
    jobTitle: existing?.jobTitle ?? '',
    jobDescription: existing?.jobDescription ?? '',
    jobCategory: existing?.jobCategory ?? '',
    employmentType: existing?.employmentType ?? 1,
    hourlyRate: existing?.hourlyRate ?? 0,
    hoursPerWeek: existing?.hoursPerWeek ?? 0,
    address: existing?.address ?? '',
    city: existing?.city ?? '',
    postcode: existing?.postcode ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof CreateJobPostingDto>(key: K, val: CreateJobPostingDto[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.jobTitle || !form.jobDescription || !form.city) {
      Alert.alert('Validation', 'Please fill in title, description and city.');
      return;
    }
    try {
      setSaving(true);
      const res = editMode && existing
        ? await updateJobPosting(existing.id, form)
        : await createJobPosting(form);
      if (res.data.succeeded) {
        Alert.alert('Success', editMode ? 'Job updated!' : 'Job posted successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', res.data.message ?? 'Failed to save job');
      }
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{editMode ? 'Edit Job' : 'Post a New Job'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <AppInput label="Job Title" value={form.jobTitle} onChangeText={(t) => set('jobTitle', t)} placeholder="e.g. Sales Assistant" />
        <AppInput label="Job Description" value={form.jobDescription} onChangeText={(t) => set('jobDescription', t)} placeholder="Describe responsibilities..." multiline numberOfLines={4} style={{ minHeight: 100 }} />

        <Text style={styles.fieldLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, form.jobCategory === c && styles.chipActive]}
              onPress={() => set('jobCategory', c)}
            >
              <Text style={[styles.chipText, form.jobCategory === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>Employment Type</Text>
        <View style={styles.toggle}>
          {([1, 2] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, form.employmentType === t && styles.toggleActive]}
              onPress={() => set('employmentType', t)}
            >
              <Text style={[styles.toggleText, form.employmentType === t && styles.toggleTextActive]}>
                {t === 1 ? 'Part-time' : 'Full-time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <AppInput
            label="Hourly Rate (£)"
            value={String(form.hourlyRate)}
            onChangeText={(t) => set('hourlyRate', parseFloat(t) || 0)}
            keyboardType="decimal-pad"
            containerStyle={{ flex: 1 }}
          />
          <View style={{ width: 12 }} />
          <AppInput
            label="Hours/Week"
            value={String(form.hoursPerWeek)}
            onChangeText={(t) => set('hoursPerWeek', parseInt(t) || 0)}
            keyboardType="number-pad"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <AppInput label="Address" value={form.address} onChangeText={(t) => set('address', t)} placeholder="Street address" />
        <View style={styles.row}>
          <AppInput label="City" value={form.city} onChangeText={(t) => set('city', t)} containerStyle={{ flex: 1 }} />
          <View style={{ width: 12 }} />
          <AppInput label="Postcode" value={form.postcode} onChangeText={(t) => set('postcode', t)} containerStyle={{ flex: 1 }} />
        </View>

        <AppButton title={editMode ? 'Update Job' : 'Post Job'} onPress={save} loading={saving} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24,
  },
  back: { color: '#94c3dc', marginBottom: 8, fontSize: 13 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  form: { padding: 24, paddingBottom: 48, backgroundColor: '#f8fafc' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  chips: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e2e8f0', marginRight: 8, backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  chipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  toggle: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5,
    borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#fff',
  },
  toggleActive: { backgroundColor: '#0f2c59', borderColor: '#0f2c59' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  toggleTextActive: { color: '#fff' },
  row: { flexDirection: 'row' },
});
