import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getInbox } from '../../api/messaging.api';
import { MessageResponseDto, ConversationThread } from '../../types/messaging';
import AppCard from '../../components/ui/AppCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export const CHAT_STORE: {
  otherUserId: string;
  jobApplicationId: string;
  threadLabel: string;
} = { otherUserId: '', jobApplicationId: '', threadLabel: '' };

function groupIntoThreads(messages: MessageResponseDto[], myUserId: string): ConversationThread[] {
  const map = new Map<string, MessageResponseDto[]>();
  for (const m of messages) {
    const key = m.jobApplicationId ?? 'no-app';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }

  const threads: ConversationThread[] = [];
  map.forEach((msgs, appId) => {
    const sorted = [...msgs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  return threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export default function InboxScreen() {
  const { state } = useAuth();
  const navigation = useNavigation<any>();
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getInbox();
      if (res.data.succeeded && res.data.data) {
        setThreads(groupIntoThreads(res.data.data, state.user?.id ?? ''));
      }
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
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

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.sub}>{threads.length} conversation{threads.length !== 1 ? 's' : ''}</Text>
      </View>
      <FlatList
        data={threads}
        keyExtractor={(t) => t.jobApplicationId}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openChat(item)} activeOpacity={0.85}>
            <AppCard style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.otherPartyName?.[0] ?? '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{item.otherPartyName}</Text>
                    <Text style={styles.time}>{format(new Date(item.lastMessageAt), 'HH:mm')}</Text>
                  </View>
                  {item.jobTitle && <Text style={styles.jobTitle} numberOfLines={1}>re: {item.jobTitle}</Text>}
                  <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
                </View>
                {item.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </AppCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState icon="chatbubbles-outline" title="No messages yet" subtitle="Conversations tied to job applications will appear here." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 13, color: '#94c3dc', marginTop: 4 },
  list: { padding: 16, flexGrow: 1 },
  card: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#0f2c59', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '700', color: '#1e293b', flex: 1 },
  time: { fontSize: 11, color: '#94a3b8' },
  jobTitle: { fontSize: 11, color: '#0d9488', fontWeight: '600', marginBottom: 2 },
  preview: { fontSize: 13, color: '#64748b' },
  badge: { backgroundColor: '#0d9488', borderRadius: 12, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
