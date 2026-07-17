import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getShopOwnerProfile, updateShopOwnerProfile, uploadBusinessDocument, getBusinessDocuments, deleteBusinessDocument } from '../../api/shopOwner.api';
import { ShopOwnerProfileResponseDto, BusinessDocumentResponseDto, UpdateShopOwnerProfileDto } from '../../types/shopOwner';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';

export default function ShopOwnerProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ShopOwnerProfileResponseDto | null>(null);
  const [docs, setDocs] = useState<BusinessDocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [form, setForm] = useState<Partial<UpdateShopOwnerProfileDto>>({});

  const fetch = async () => {
    try {
      const [pRes, dRes] = await Promise.all([getShopOwnerProfile(), getBusinessDocuments()]);
      if (pRes.data.data) {
        const p = pRes.data.data;
        setProfile(p);
        setForm({
          fullName: p.fullName,
          phoneNumber: p.phoneNumber,
          shopName: p.shopName,
          businessType: p.businessType,
          premisesLicenceNumber: p.premisesLicenceNumber,
          shopAddress: p.shopAddress,
          city: p.city,
          postcode: p.postcode,
        });
      }
      if (dRes.data.data) setDocs(dRes.data.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateShopOwnerProfile(form as UpdateShopOwnerProfileDto);
      if (res.data.succeeded) { setEditing(false); fetch(); Alert.alert('Profile updated!'); }
      else Alert.alert('Error', res.data.message ?? 'Update failed');
    } catch { Alert.alert('Error', 'Network error'); }
    finally { setSaving(false); }
  };

  const pickDoc = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      const asset = result.assets[0];
      setDocUploading(true);
      const res = await uploadBusinessDocument(asset.uri, asset.name, asset.mimeType ?? 'application/octet-stream');
      if (res.data.succeeded) { Alert.alert('Document uploaded!'); fetch(); }
    } catch { Alert.alert('Error', 'Upload failed'); }
    finally { setDocUploading(false); }
  };

  const removeDoc = (id: string) => {
    Alert.alert('Delete', 'Remove this document?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteBusinessDocument(id); fetch(); } },
    ]);
  };

  if (loading) return <LoadingSpinner />;
  const p = profile;

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="storefront" size={36} color="#fff" />
        </View>
        <Text style={styles.shopName}>{p?.shopName}</Text>
        <Text style={styles.name}>{p?.fullName}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutRow}>
          <Ionicons name="log-out-outline" size={16} color="#94c3dc" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Profile details */}
        <AppCard>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Shop Details</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Ionicons name={editing ? 'close-outline' : 'pencil-outline'} size={20} color="#0d9488" />
            </TouchableOpacity>
          </View>
          {editing ? (
            <>
              {[
                ['Full Name', 'fullName'],
                ['Phone', 'phoneNumber'],
                ['Shop Name', 'shopName'],
                ['Business Type', 'businessType'],
                ['Licence Number', 'premisesLicenceNumber'],
                ['Address', 'shopAddress'],
                ['City', 'city'],
                ['Postcode', 'postcode'],
              ].map(([label, key]) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput style={styles.fieldInput} value={String((form as any)[key] ?? '')} onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))} />
                </View>
              ))}
              <AppButton title="Save" onPress={save} loading={saving} style={{ marginTop: 12 }} />
            </>
          ) : (
            <>
              {[
                ['Email', p?.email],
                ['Phone', p?.phoneNumber],
                ['Business Type', p?.businessType],
                ['Licence Number', p?.premisesLicenceNumber],
                ['Address', p?.shopAddress],
                ['City', p?.city],
                ['Postcode', p?.postcode],
              ].map(([label, val]) => (
                <View key={label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{val ?? '—'}</Text>
                </View>
              ))}
              <View style={[styles.infoRow, { marginTop: 8 }]}>
                <Text style={styles.infoLabel}>Verification</Text>
                <Text style={[styles.infoValue, { color: p?.businessVerificationStatus === 2 ? '#16a34a' : '#d97706' }]}>
                  {p?.businessVerificationStatus === 2
                    ? '✓ Verified'
                    : `⏳ ${
                        p?.businessVerificationStatus === 1
                          ? 'Under Review'
                          : 'Pending'
                      }`}
                </Text>
              </View>
            </>
          )}
        </AppCard>

        {/* Business Documents */}
        <AppCard>
          <Text style={styles.sectionTitle}>Business Documents</Text>
          {docs.map((doc) => (
            <View key={doc.id} style={styles.docRow}>
              <Ionicons name="document-outline" size={18} color="#0d9488" />
              <Text style={styles.docName} numberOfLines={1}>{doc.fileName}</Text>
              <Text style={[styles.docStatus, { color: doc.status === 'Approved' ? '#16a34a' : doc.status === 'Rejected' ? '#dc2626' : '#d97706' }]}>
                {doc.status}
              </Text>
              <TouchableOpacity onPress={() => removeDoc(doc.id)}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))}
          <AppButton title={docUploading ? 'Uploading...' : '+ Upload Document'} variant="secondary" loading={docUploading} onPress={pickDoc} style={{ marginTop: 12 }} />
        </AppCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 32, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0d9488', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  shopName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  name: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16 },
  logoutText: { fontSize: 13, color: '#94c3dc' },
  body: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f2c59' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 13, color: '#1e293b', fontWeight: '600' },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 4 },
  fieldInput: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, fontSize: 14, color: '#1e293b' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  docName: { flex: 1, fontSize: 13, color: '#1e293b' },
  docStatus: { fontSize: 12, fontWeight: '600' },
});
