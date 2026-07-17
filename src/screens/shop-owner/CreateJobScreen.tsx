import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { createJobPosting, updateJobPosting, getJobPostingById } from '../../api/jobs.api';
import { CreateJobPostingDto } from '../../types/jobs';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format, addDays } from 'date-fns';

export default function CreateJobScreen({ navigation, route }: any) {
  const editMode: boolean = route?.params?.editMode ?? false;
  const jobId: string | undefined = route?.params?.jobId;

  const [loading, setLoading] = useState(editMode);
  const [form, setForm] = useState<CreateJobPostingDto>({
    jobTitle: '',
    description: '',
    jobCategory: '',
    employmentType: 1,
    contractType: 1,
    salaryType: 1,
    salaryAmount: 0,
    hoursPerWeek: 0,
    location: '',
    city: '',
    postcode: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    status: 2,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editMode && jobId) {
      const fetchJobDetails = async () => {
        try {
          const res = await getJobPostingById(jobId);
          if (res.data.succeeded && res.data.data) {
            const job = res.data.data;
            setForm({
              jobTitle: job.jobTitle,
              description: job.description,
              jobCategory: job.jobCategory,
              employmentType: job.employmentType,
              contractType: job.contractType,
              salaryType: job.salaryType,
              salaryAmount: job.salaryAmount,
              hoursPerWeek: job.hoursPerWeek,
              location: job.location,
              city: job.city,
              postcode: job.postcode,
              startDate: job.startDate,
              expiryDate: job.expiryDate,
              status: job.status,
            });
          } else {
            Alert.alert('Error', 'Failed to retrieve job details.');
          }
        } catch {
          Alert.alert('Error', 'Failed to fetch job details from server.');
        } finally {
          setLoading(false);
        }
      };
      fetchJobDetails();
    }
  }, [editMode, jobId]);

  const set = <K extends keyof CreateJobPostingDto>(key: K, val: CreateJobPostingDto[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.jobTitle || !form.description || !form.city) {
      Alert.alert('Validation', 'Please fill in title, description and city.');
      return;
    }
    try {
      setSaving(true);
      const res = editMode && jobId
        ? await updateJobPosting(jobId, form)
        : await createJobPosting(form);
      if (res.data.succeeded) {
        const successMsg = editMode ? 'Job updated!' : 'Job posted successfully!';
        if (Platform.OS === 'web') {
          Alert.alert('Success', successMsg);
          navigation.goBack();
        } else {
          Alert.alert('Success', successMsg, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        Alert.alert('Error', res.data.message ?? 'Failed to save job');
      }
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

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
        <AppInput label="Job Description" value={form.description} onChangeText={(t) => set('description', t)} placeholder="Describe responsibilities..." multiline numberOfLines={4} style={{ minHeight: 100 }} />

        <AppInput
          label="Job Category (e.g. Retail, Cafe)"
          value={form.jobCategory}
          onChangeText={(t) => set('jobCategory', t)}
          placeholder="e.g. Retail, Cafe"
        />

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
            value={String(form.salaryAmount)}
            onChangeText={(t) => set('salaryAmount', parseFloat(t) || 0)}
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

        <AppInput label="Address" value={form.location} onChangeText={(t) => set('location', t)} placeholder="Street address" />
        <View style={styles.row}>
          <AppInput label="City" value={form.city} onChangeText={(t) => set('city', t)} containerStyle={{ flex: 1 }} />
          <View style={{ width: 12 }} />
          <AppInput label="Postcode" value={form.postcode} onChangeText={(t) => set('postcode', t)} containerStyle={{ flex: 1 }} />
        </View>

        <View style={styles.row}>
          <AppInput
            label="Start Date (YYYY-MM-DD)"
            value={form.startDate}
            onChangeText={(t) => set('startDate', t)}
            placeholder="e.g. 2026-07-16"
            containerStyle={{ flex: 1 }}
          />
          <View style={{ width: 12 }} />
          <AppInput
            label="Expiry Date (YYYY-MM-DD)"
            value={form.expiryDate}
            onChangeText={(t) => set('expiryDate', t)}
            placeholder="e.g. 2026-08-15"
            containerStyle={{ flex: 1 }}
          />
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
