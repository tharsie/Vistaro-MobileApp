import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  ImageBackground,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getStudentProfile, updateStudentProfile, uploadCV } from '../../api/student.api';
import { StudentProfileResponseDto, UpdateStudentProfileDto } from '../../types/student';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as DocumentPicker from 'expo-document-picker';

export default function StudentProfileScreen() {
  const insets = useSafeAreaInsets();
  const { state, logout } = useAuth();

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
          fullName: p.fullName,
          phoneNumber: p.phoneNumber,
          address: p.address,
          city: p.city,
          postcode: p.postcode,
          employmentPreference: p.employmentPreference,
          maxHoursPerWeek: p.maxHoursPerWeek,
          expectedHourlyRate: p.expectedHourlyRate,
          preferredJobCategories: p.preferredJobCategories,
          skills: p.skills,
        });
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const res = await updateStudentProfile(form as UpdateStudentProfileDto);
      if (res.data.succeeded) {
        setProfile(res.data.data);
        setEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', res.data.message ?? 'Update failed');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setCvUploading(true);
      const res = await uploadCV(asset.uri, asset.name, asset.mimeType ?? 'application/pdf');
      if (res.data.succeeded) {
        Alert.alert('Success', 'Your CV has been uploaded successfully!');
        fetch();
      } else {
        Alert.alert('Upload Failed', res.data.message ?? 'Could not upload CV');
      }
    } catch {
      Alert.alert('Error', 'CV upload failed. Please try again.');
    } finally {
      setCvUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const getUserInitials = () => {
    const name = profile?.fullName?.trim() || state.user?.fullName?.trim() || 'T';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) return <LoadingSpinner />;

  const p = profile;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================= */}
        {/* BRANDED HEADER WITH TopBackground.png                     */}
        {/* ========================================================= */}
        <ImageBackground
          source={require('../../../assets/TopBackground.png')}
          style={[
            styles.headerBackground,
            { paddingTop: insets.top > 0 ? insets.top + 12 : 44 },
          ]}
          imageStyle={styles.headerBackgroundImage}
          resizeMode="cover"
        >
          {/* Avatar Circle with Online Ring */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </View>
            <View style={styles.verifiedDot}>
              <Ionicons name="checkmark-sharp" size={11} color="#ffffff" />
            </View>
          </View>

          {/* User Full Name & Email */}
          <Text style={styles.userName}>{p?.fullName || state.user?.fullName || 'Student'}</Text>
          <Text style={styles.userEmail}>{p?.email || state.user?.email}</Text>

          {/* Student Status Badge */}
          <View style={styles.roleBadge}>
            <Ionicons name="school-outline" size={12} color="#00d2ff" style={{ marginRight: 4 }} />
            <Text style={styles.roleBadgeText}>Verified Student Member</Text>
          </View>

          {/* Sign Out Action Button */}
          <TouchableOpacity onPress={handleLogout} style={styles.signOutBtn} activeOpacity={0.75}>
            <Ionicons name="log-out-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ImageBackground>

        {/* ========================================================= */}
        {/* PROFILE BODY CARDS                                        */}
        {/* ========================================================= */}
        <View style={styles.body}>
          {/* 1. CV / Resume Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconSquare, { backgroundColor: '#e0f2fe' }]}>
                  <Ionicons name="document-text" size={20} color="#0284c7" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>CV / Resume</Text>
                  <Text style={styles.cardSub}>
                    {p?.cvFileName ? 'Attached document' : 'Attach your resume for 1-click apply'}
                  </Text>
                </View>
              </View>
            </View>

            {p?.cvFileName ? (
              <View style={styles.cvFileRow}>
                <Ionicons name="document-attach" size={18} color="#0d9488" style={{ marginRight: 8 }} />
                <Text style={styles.cvFileName} numberOfLines={1}>
                  {p.cvFileName}
                </Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              </View>
            ) : (
              <View style={styles.cvEmptyBox}>
                <Text style={styles.cvEmptyText}>No CV uploaded yet</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={pickCV}
              disabled={cvUploading}
              activeOpacity={0.85}
            >
              {cvUploading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={17} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.uploadBtnText}>
                    {p?.cvFileName ? 'Replace CV' : 'Upload CV'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 2. Profile Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconSquare, { backgroundColor: '#f0fdf9' }]}>
                  <Ionicons name="person-outline" size={20} color="#0d9488" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Profile Details</Text>
                  <Text style={styles.cardSub}>Work availability & preferences</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editToggleBtn}
                onPress={() => setEditing(!editing)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={editing ? 'close-circle-outline' : 'create-outline'}
                  size={19}
                  color="#0d9488"
                />
                <Text style={styles.editToggleText}>{editing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {editing ? (
              /* Edit Mode Form */
              <View style={styles.editForm}>
                {[
                  ['Full Name', 'fullName', 'person-outline'],
                  ['Phone', 'phoneNumber', 'call-outline'],
                  ['Address', 'address', 'home-outline'],
                  ['City', 'city', 'location-outline'],
                  ['Postcode', 'postcode', 'mail-outline'],
                  ['Skills', 'skills', 'sparkles-outline'],
                  ['Preferred Categories', 'preferredJobCategories', 'pricetag-outline'],
                ].map(([label, key, icon]) => (
                  <View key={key} style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{label}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name={icon as any}
                        size={16}
                        color="#64748b"
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={String(form[key as keyof UpdateStudentProfileDto] ?? '')}
                        onChangeText={(t) =>
                          setForm((f) => ({ ...f, [key as keyof UpdateStudentProfileDto]: t }))
                        }
                        placeholder={`Enter ${label.toLowerCase()}`}
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={save}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-sharp" size={17} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* View Mode Rows */
              <View style={styles.infoList}>
                {[
                  { label: 'Phone', value: p?.phoneNumber, icon: 'call-outline' as const },
                  { label: 'City', value: p?.city, icon: 'location-outline' as const },
                  { label: 'Postcode', value: p?.postcode, icon: 'mail-outline' as const },
                  { label: 'Skills', value: p?.skills, icon: 'sparkles-outline' as const },
                  {
                    label: 'Preferred Categories',
                    value: p?.preferredJobCategories,
                    icon: 'pricetag-outline' as const,
                  },
                  {
                    label: 'Max Hours/Week',
                    value: p?.maxHoursPerWeek ? `${p.maxHoursPerWeek} hrs` : null,
                    icon: 'time-outline' as const,
                  },
                  {
                    label: 'Expected Rate',
                    value: p?.expectedHourlyRate ? `£${p.expectedHourlyRate}/hr` : null,
                    icon: 'cash-outline' as const,
                  },
                  {
                    label: 'Preference',
                    value: p?.employmentPreference === 1 ? 'Part-time' : 'Full-time',
                    icon: 'briefcase-outline' as const,
                  },
                ].map((item, idx, arr) => (
                  <View
                    key={item.label}
                    style={[
                      styles.infoRow,
                      idx === arr.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={styles.infoLabelGroup}>
                      <Ionicons
                        name={item.icon}
                        size={15}
                        color="#64748b"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.infoLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.infoValue}>{item.value || '—'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ========================================================= */}
        {/* FOOTER LONDON SKYLINE                                     */}
        {/* ========================================================= */}
        <View style={styles.footerSkylineContainer}>
          <Image
            source={require('../../../assets/BottomBanner.png')}
            style={styles.footerSkylineImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Header */
  headerBackground: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#002868',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerBackgroundImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#008b8b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f2438',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    color: '#c2ddf7',
    marginTop: 2,
    fontWeight: '500',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00d2ff',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginTop: 14,
  },
  signOutText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* Body */
  body: {
    padding: 16,
    gap: 14,
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
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f2438',
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  editToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0d9488',
    marginLeft: 3,
  },

  /* CV Section */
  cvFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    marginBottom: 12,
  },
  cvFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f2438',
    flex: 1,
  },
  activePill: {
    backgroundColor: '#10b981',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activePillText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  cvEmptyBox: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  cvEmptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  uploadBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },

  /* Info List */
  infoList: {
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13.5,
    color: '#0f2438',
    fontWeight: '700',
  },

  /* Edit Form */
  editForm: {
    marginTop: 6,
    gap: 10,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0f2438',
    fontWeight: '500',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Footer Skyline Silhouette */
  footerSkylineContainer: {
    width: '100%',
    height: 55,
    overflow: 'hidden',
    marginTop: 16,
    opacity: 0.65,
  },
  footerSkylineImage: {
    width: '100%',
    height: '100%',
  },
});
