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
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {
  getShopOwnerProfile,
  updateShopOwnerProfile,
  uploadBusinessDocument,
  getBusinessDocuments,
  deleteBusinessDocument,
} from '../../api/shopOwner.api';
import {
  ShopOwnerProfileResponseDto,
  BusinessDocumentResponseDto,
  UpdateShopOwnerProfileDto,
} from '../../types/shopOwner';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as DocumentPicker from 'expo-document-picker';

export default function ShopOwnerProfileScreen() {
  const insets = useSafeAreaInsets();
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
      const [pRes, dRes] = await Promise.all([
        getShopOwnerProfile(),
        getBusinessDocuments(),
      ]);
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
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateShopOwnerProfile(form as UpdateShopOwnerProfileDto);
      if (res.data.succeeded) {
        setEditing(false);
        fetch();
        Alert.alert('Success', 'Shop profile updated successfully!');
      } else {
        Alert.alert('Error', res.data.message ?? 'Update failed');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pickDoc = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      const asset = result.assets[0];
      setDocUploading(true);
      const res = await uploadBusinessDocument(
        asset.uri,
        asset.name,
        asset.mimeType ?? 'application/octet-stream'
      );
      if (res.data.succeeded) {
        Alert.alert('Success', 'Document uploaded successfully!');
        fetch();
      } else {
        Alert.alert('Upload Failed', res.data.message ?? 'Upload failed');
      }
    } catch {
      Alert.alert('Error', 'Upload failed. Please try again.');
    } finally {
      setDocUploading(false);
    }
  };

  const removeDoc = (id: string) => {
    Alert.alert('Delete Document', 'Are you sure you want to remove this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBusinessDocument(id);
            fetch();
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const formatDocName = (name: string) => {
    if (!name) return 'Business Document.pdf';
    if (name.length > 28) {
      const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
      const base = name.replace(ext, '');
      return `${base.slice(0, 12)}...${base.slice(-6)}${ext}`;
    }
    return name;
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@vistaro.co.uk?subject=Shop%20Partner%20Inquiry');
  };

  if (loading) return <LoadingSpinner />;

  const p = profile;
  const isVerified = p?.businessVerificationStatus === 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================= */}
        {/* 1. BRANDED HEADER WITH TopBackground.png                  */}
        {/* ========================================================= */}
        <ImageBackground
          source={require('../../../assets/TopBackground.png')}
          style={[
            styles.headerBackground,
            { paddingTop: insets.top > 0 ? insets.top + 8 : 40 },
          ]}
          imageStyle={styles.headerBackgroundImage}
          resizeMode="cover"
        >
          {/* Header Top Brand Logo & Sign Out */}
          <View style={styles.headerBrandRow}>
            <Image
              source={require('../../../assets/vistaro_header_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={handleLogout} style={styles.headerSignOutBtn} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={16} color="#ffffff" style={{ marginRight: 5 }} />
              <Text style={styles.headerSignOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Store Avatar with Verified Badge */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="storefront" size={38} color="#ffffff" />
            </View>
            <View style={[styles.verifiedDot, isVerified ? styles.verifiedDotActive : styles.verifiedDotPending]}>
              <Ionicons
                name={isVerified ? 'checkmark-sharp' : 'time-outline'}
                size={12}
                color="#ffffff"
              />
            </View>
          </View>

          {/* Shop Name & Owner Name */}
          <Text style={styles.shopNameText}>{p?.shopName || 'Shop Name'}</Text>
          <Text style={styles.ownerNameText}>{p?.fullName || 'Business Owner'}</Text>

          {/* Business Partner Badge */}
          <View style={styles.partnerBadge}>
            <Ionicons
              name={isVerified ? 'shield-checkmark' : 'shield-outline'}
              size={13}
              color="#00d2ff"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.partnerBadgeText}>
              {isVerified ? 'Verified Business Partner' : 'Registered Business Partner'}
            </Text>
          </View>
        </ImageBackground>

        {/* ========================================================= */}
        {/* 2. QUICK STATS SUMMARY TILES                              */}
        {/* ========================================================= */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIconWrap, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons
                name={isVerified ? 'shield-checkmark' : 'time'}
                size={18}
                color={isVerified ? '#10b981' : '#f59e0b'}
              />
            </View>
            <Text style={styles.quickStatLabel}>Status</Text>
            <Text style={[styles.quickStatValue, { color: isVerified ? '#059669' : '#d97706' }]}>
              {isVerified ? 'Verified' : 'Under Review'}
            </Text>
          </View>

          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIconWrap, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="pricetag" size={17} color="#0284c7" />
            </View>
            <Text style={styles.quickStatLabel}>Category</Text>
            <Text style={styles.quickStatValue} numberOfLines={1}>
              {p?.businessType || 'Retail'}
            </Text>
          </View>

          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIconWrap, { backgroundColor: '#f0fdf9' }]}>
              <Ionicons name="location" size={18} color="#0d9488" />
            </View>
            <Text style={styles.quickStatLabel}>Location</Text>
            <Text style={styles.quickStatValue} numberOfLines={1}>
              {p?.city || 'United Kingdom'}
            </Text>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 3. BODY CARDS                                             */}
        {/* ========================================================= */}
        <View style={styles.body}>
          {/* Card 1: Shop Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconSquare, { backgroundColor: '#f0fdf9' }]}>
                  <Ionicons name="business-outline" size={20} color="#0d9488" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Shop Details</Text>
                  <Text style={styles.cardSub}>Business information & address</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editToggleBtn}
                onPress={() => setEditing(!editing)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={editing ? 'close-circle-outline' : 'create-outline'}
                  size={16}
                  color="#0d9488"
                />
                <Text style={styles.editToggleText}>{editing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {editing ? (
              /* Edit Form */
              <View style={styles.editForm}>
                {[
                  ['Owner Full Name', 'fullName', 'person-outline'],
                  ['Phone Number', 'phoneNumber', 'call-outline'],
                  ['Shop Name', 'shopName', 'storefront-outline'],
                  ['Business Type', 'businessType', 'pricetag-outline'],
                  ['Premises Licence', 'premisesLicenceNumber', 'document-outline'],
                  ['Shop Address', 'shopAddress', 'home-outline'],
                  ['City', 'city', 'location-outline'],
                  ['Postcode', 'postcode', 'navigate-outline'],
                ].map(([label, key, icon]) => (
                  <View key={key} style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{label}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name={icon as any}
                        size={17}
                        color="#64748b"
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={String((form as any)[key] ?? '')}
                        onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  </View>
                ))}

                <View style={styles.formActionsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setEditing(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

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
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={17}
                          color="#ffffff"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* View Mode Rows */
              <View style={styles.infoList}>
                {[
                  { label: 'Email', value: p?.email, icon: 'mail-outline' as const },
                  { label: 'Phone', value: p?.phoneNumber, icon: 'call-outline' as const },
                  { label: 'Business Type', value: p?.businessType, icon: 'pricetag-outline' as const },
                  {
                    label: 'Licence Number',
                    value: p?.premisesLicenceNumber,
                    icon: 'document-text-outline' as const,
                  },
                  { label: 'Address', value: p?.shopAddress, icon: 'home-outline' as const },
                  { label: 'City', value: p?.city, icon: 'location-outline' as const },
                  { label: 'Postcode', value: p?.postcode, icon: 'navigate-outline' as const },
                ].map((item) => (
                  <View key={item.label} style={styles.infoRow}>
                    <View style={styles.infoLabelGroup}>
                      <View style={styles.infoIconWrap}>
                        <Ionicons name={item.icon} size={15} color="#0d9488" />
                      </View>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.infoValue} numberOfLines={2}>
                      {item.value || '—'}
                    </Text>
                  </View>
                ))}

                {/* Verification Status Row */}
                <View style={[styles.infoRow, { borderBottomWidth: 0, paddingTop: 14 }]}>
                  <View style={styles.infoLabelGroup}>
                    <View style={styles.infoIconWrap}>
                      <Ionicons name="shield-checkmark-outline" size={15} color="#0d9488" />
                    </View>
                    <Text style={styles.infoLabel}>Verification</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      isVerified ? styles.verifiedPill : styles.pendingPill,
                    ]}
                  >
                    <Ionicons
                      name={isVerified ? 'checkmark-circle' : 'time-outline'}
                      size={13}
                      color={isVerified ? '#15803d' : '#b45309'}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        isVerified ? styles.verifiedPillText : styles.pendingPillText,
                      ]}
                    >
                      {isVerified ? 'Verified' : 'Under Review'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Card 2: Business Documents Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.iconSquare, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="document-attach" size={20} color="#0284c7" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Business Documents</Text>
                  <Text style={styles.cardSub}>Licences & verification files</Text>
                </View>
              </View>
              <View style={styles.docCountBadge}>
                <Text style={styles.docCountText}>{docs.length} uploaded</Text>
              </View>
            </View>

            {docs.length > 0 ? (
              <View style={styles.docsList}>
                {docs.map((doc) => (
                  <View key={doc.id} style={styles.docRow}>
                    <View style={styles.docIconWrap}>
                      <Ionicons name="document-text" size={18} color="#0d9488" />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docName} numberOfLines={1}>
                        {formatDocName(doc.fileName)}
                      </Text>
                      <Text style={styles.docMeta}>
                        {doc.status || 'Verified document'}
                      </Text>
                    </View>

                    {doc.status && (
                      <View
                        style={[
                          styles.docStatusBadge,
                          doc.status.toLowerCase().includes('approve') || doc.status.toLowerCase().includes('verif')
                            ? styles.docApproved
                            : doc.status.toLowerCase().includes('reject')
                            ? styles.docRejected
                            : styles.docPending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.docStatusText,
                            doc.status.toLowerCase().includes('approve') || doc.status.toLowerCase().includes('verif')
                              ? styles.docApprovedText
                              : doc.status.toLowerCase().includes('reject')
                              ? styles.docRejectedText
                              : styles.docPendingText,
                          ]}
                        >
                          {doc.status}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => removeDoc(doc.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.trashBtn}
                    >
                      <Ionicons name="trash-outline" size={17} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.docEmptyBox}>
                <Ionicons
                  name="folder-open-outline"
                  size={36}
                  color="#94a3b8"
                  style={{ marginBottom: 6 }}
                />
                <Text style={styles.docEmptyText}>No documents uploaded yet</Text>
                <Text style={styles.docEmptySub}>
                  Upload premises licence or business registration for full verified shop status.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={pickDoc}
              disabled={docUploading}
              activeOpacity={0.85}
            >
              {docUploading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.uploadBtnText}>+ Upload Document</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Card 3: Merchant Protection & Support */}
          <View style={styles.supportCard}>
            <View style={styles.supportTopRow}>
              <View style={styles.supportIconWrap}>
                <Ionicons name="shield-checkmark" size={20} color="#0d9488" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.supportTitle}>Merchant Support & Security</Text>
                <Text style={styles.supportSub}>
                  Need to update your registered business entity or premises licence? Contact our partner desk anytime.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.supportActionBtn}
              onPress={handleContactSupport}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={15} color="#0d9488" style={{ marginRight: 6 }} />
              <Text style={styles.supportActionText}>Contact Partner Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 4. FOOTER LONDON SKYLINE                                  */}
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
    paddingBottom: 26,
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
  headerBrandRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLogo: {
    width: 104,
    height: 28,
  },
  headerSignOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerSignOutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* Avatar */
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a1e3f',
  },
  verifiedDotActive: {
    backgroundColor: '#10b981',
  },
  verifiedDotPending: {
    backgroundColor: '#f59e0b',
  },
  shopNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  ownerNameText: {
    fontSize: 13.5,
    color: '#c2ddf7',
    marginTop: 2,
    fontWeight: '500',
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.35)',
    marginTop: 10,
  },
  partnerBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#00d2ff',
    letterSpacing: 0.2,
  },

  /* Quick Stats Row */
  quickStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -16,
    gap: 10,
    zIndex: 10,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#0f2438',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickStatIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickStatLabel: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickStatValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f2438',
    marginTop: 2,
    textAlign: 'center',
  },

  /* Body */
  body: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  editToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0d9488',
    marginLeft: 4,
  },
  docCountBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  docCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },

  /* Info List */
  infoList: {
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  infoIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#f0fdf9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13.5,
    color: '#0f2438',
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  verifiedPill: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  verifiedPillText: {
    color: '#15803d',
  },
  pendingPill: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  pendingPillText: {
    color: '#b45309',
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
  formActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 13.5,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Documents */
  docsList: {
    marginBottom: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  docIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  docInfo: {
    flex: 1,
    marginRight: 8,
  },
  docName: {
    fontSize: 12.5,
    color: '#0f2438',
    fontWeight: '700',
  },
  docMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  docStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  docStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  docApproved: {
    backgroundColor: '#ecfdf5',
  },
  docApprovedText: {
    color: '#15803d',
  },
  docPending: {
    backgroundColor: '#fffbeb',
  },
  docPendingText: {
    color: '#b45309',
  },
  docRejected: {
    backgroundColor: '#fef2f2',
  },
  docRejectedText: {
    color: '#dc2626',
  },
  trashBtn: {
    padding: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  docEmptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  docEmptyText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  docEmptySub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 13,
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

  /* Support Card */
  supportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  supportTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  supportIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0fdf9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f2438',
    marginBottom: 2,
  },
  supportSub: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
  supportActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf9',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  supportActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0d9488',
  },

  /* London Skyline Footer */
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
