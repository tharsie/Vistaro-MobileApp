import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Image,
  ImageBackground,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getInbox } from '../../api/messaging.api';
import { MessageResponseDto, ConversationThread } from '../../types/messaging';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export const CHAT_STORE: {
  otherUserId: string;
  jobApplicationId: string;
  threadLabel: string;
} = { otherUserId: '', jobApplicationId: '', threadLabel: '' };

const AVATAR_COLORS = ['#0f2c59', '#0d9488', '#7c3aed', '#0284c7', '#d97706', '#dc2626'];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function groupIntoThreads(messages: MessageResponseDto[], myUserId: string): ConversationThread[] {
  const map = new Map<string, MessageResponseDto[]>();
  for (const m of messages) {
    const key = m.jobApplicationId ?? 'no-app';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }

  const threads: ConversationThread[] = [];
  map.forEach((msgs, appId) => {
    const sorted = [...msgs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const last = sorted[0];
    const unread = msgs.filter((m) => !m.isRead && m.receiverUserId === myUserId).length;
    const otherParty = myUserId === last.senderUserId ? last.shopName : last.studentFullName;
    threads.push({
      jobApplicationId: appId,
      jobTitle: last.relatedJobTitle,
      otherPartyName: otherParty,
      lastMessage: last.messageText,
      lastMessageAt: last.createdAt,
      unreadCount: unread,
      messages: sorted,
    });
  });

  return threads.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export default function InboxScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useAuth();
  const navigation = useNavigation<any>();

  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetch = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getInbox();
      if (res.data.succeeded && res.data.data) {
        setThreads(groupIntoThreads(res.data.data, state.user?.id ?? ''));
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch();
    const interval = setInterval(() => fetch(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const openChat = (thread: ConversationThread) => {
    const lastMsg = thread.messages[0];
    const otherUserId =
      state.user?.id === lastMsg.senderUserId ? lastMsg.receiverUserId : lastMsg.senderUserId;
    CHAT_STORE.otherUserId = otherUserId;
    CHAT_STORE.jobApplicationId = thread.jobApplicationId;
    CHAT_STORE.threadLabel = thread.otherPartyName;
    navigation.navigate('Chat' as any);
  };

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter(
      (t) =>
        t.otherPartyName.toLowerCase().includes(q) ||
        (t.jobTitle && t.jobTitle.toLowerCase().includes(q)) ||
        t.lastMessage.toLowerCase().includes(q)
    );
  }, [threads, searchQuery]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ========================================================= */}
      {/* BRANDED HEADER WITH TopBackground.png                     */}
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
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSub}>
              {threads.length} active conversation{threads.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={() => fetch(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="reload-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations or roles..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>

      {/* ========================================================= */}
      {/* THREADS LIST FEED                                         */}
      {/* ========================================================= */}
      <FlatList
        data={filteredThreads}
        keyExtractor={(t) => t.jobApplicationId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#0d9488"
            colors={['#0d9488']}
            onRefresh={() => {
              setRefreshing(true);
              fetch();
            }}
          />
        }
        renderItem={({ item }) => {
          const avatarColor = getAvatarColor(item.otherPartyName || 'Candidate');
          let formattedTime = '';
          try {
            formattedTime = format(new Date(item.lastMessageAt), 'HH:mm');
          } catch (_) {
            formattedTime = 'Recently';
          }

          return (
            <TouchableOpacity onPress={() => openChat(item)} activeOpacity={0.88} style={styles.threadCard}>
              <View style={styles.threadRow}>
                {/* Avatar Circle */}
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarText}>
                    {item.otherPartyName?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>

                {/* Details Column */}
                <View style={styles.detailsCol}>
                  <View style={styles.nameTimeRow}>
                    <Text style={styles.otherPartyName} numberOfLines={1}>
                      {item.otherPartyName}
                    </Text>
                    <Text style={styles.timestampText}>{formattedTime}</Text>
                  </View>

                  {item.jobTitle && (
                    <View style={styles.jobBadgeRow}>
                      <Text style={styles.jobBadgeText} numberOfLines={1}>
                        re: {item.jobTitle}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.messagePreview} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>

                {/* Unread Counter Badge */}
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No messages yet"
            subtitle="Conversations tied to job applications will appear here automatically."
          />
        }
        ListFooterComponent={
          <View style={styles.footerSkylineContainer}>
            <Image
              source={require('../../../assets/BottomBanner.png')}
              style={styles.footerSkylineImage}
              resizeMode="cover"
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  /* Header */
  headerBackground: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12.5,
    color: '#c2ddf7',
    fontWeight: '500',
    marginTop: 2,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f2438',
    fontWeight: '500',
  },

  /* List */
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  threadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eef2f6',
    ...Platform.select({
      ios: {
        shadowColor: '#0f2c59',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 19,
  },
  detailsCol: {
    flex: 1,
    marginRight: 8,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  otherPartyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f2438',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 6,
  },
  timestampText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  jobBadgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    marginBottom: 4,
    marginTop: 1,
  },
  jobBadgeText: {
    fontSize: 11,
    color: '#0d9488',
    fontWeight: '700',
  },
  messagePreview: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#0d9488',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
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
