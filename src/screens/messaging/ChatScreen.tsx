import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getConversation, sendMessage, markMessageRead } from '../../api/messaging.api';
import { getStudentProfile } from '../../api/student.api';
import { getShopOwnerProfile } from '../../api/shopOwner.api';
import { MessageResponseDto } from '../../types/messaging';
import { CHAT_STORE } from './InboxScreen';
import { format } from 'date-fns';

const MODERATION_LABEL: Record<number, { text: string; color: string }> = {
  1: { text: '• Pending moderation', color: '#d97706' },
  3: { text: '• Rejected by Admin', color: '#dc2626' },
};

export default function ChatScreen() {
  const { state } = useAuth();
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [studentProfileId, setStudentProfileId] = useState('');
  const [shopOwnerProfileId, setShopOwnerProfileId] = useState('');
  const flatRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const roles = state.user?.roles?.map((r) => r.toLowerCase()) ?? [];
  const isStudent = roles.includes('student');
  const myId = state.user?.id ?? '';

  // Fetch own profile IDs needed for send
  useEffect(() => {
    const fetchProfiles = async () => {
      if (isStudent) {
        const res = await getStudentProfile().catch(() => null);
        if (res?.data.data) setStudentProfileId(res.data.data.id);
      } else {
        const res = await getShopOwnerProfile().catch(() => null);
        if (res?.data.data) setShopOwnerProfileId(res.data.data.id);
      }
    };
    fetchProfiles();
  }, []);

  const loadMessages = async (silent = false) => {
    try {
      const res = await getConversation(CHAT_STORE.otherUserId);
      if (res.data.succeeded && res.data.data) {
        const filtered = res.data.data.filter(
          (m) => m.jobApplicationId === CHAT_STORE.jobApplicationId,
        );
        setMessages(filtered.reverse()); // oldest first

        // Mark unread received messages as read
        const unread = filtered.filter((m) => !m.isRead && m.receiverUserId === myId);
        unread.forEach((m) => markMessageRead(m.id).catch(() => {}));
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(() => loadMessages(true), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage({
        studentProfileId: isStudent ? studentProfileId : '',
        shopOwnerProfileId: !isStudent ? shopOwnerProfileId : undefined,
        messageText: text.trim(),
        messageType: 1,
        jobApplicationId: CHAT_STORE.jobApplicationId,
      });
      setText('');
      loadMessages(true);
    } catch {
      Alert.alert('Error', 'Failed to send message');
    } finally { setSending(false); }
  };

  const renderItem = ({ item }: { item: MessageResponseDto }) => {
    const isMine = item.senderUserId === myId;
    const modLabel = item.moderationStatus ? MODERATION_LABEL[item.moderationStatus] : null;

    return (
      <View style={[styles.bubbleWrapper, isMine ? styles.mine : styles.theirs]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.messageText}</Text>
        </View>
        <Text style={styles.timeStamp}>{format(new Date(item.createdAt), 'HH:mm')}</Text>
        {isMine && modLabel && (
          <Text style={[styles.modLabel, { color: modLabel.color }]}>{modLabel.text}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerName}>{CHAT_STORE.threadLabel}</Text>
          <Text style={styles.headerSub}>All messages reviewed by admin</Text>
        </View>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    backgroundColor: '#0f2c59', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center',
  },
  headerName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: '#94c3dc' },
  list: { padding: 16, paddingBottom: 8 },
  bubbleWrapper: { marginBottom: 12, maxWidth: '80%' },
  mine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: '#0d9488', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 14, color: '#1e293b', lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  timeStamp: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  modLabel: { fontSize: 10, marginTop: 2, fontWeight: '600' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 24, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, color: '#1e293b', maxHeight: 120,
    borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0d9488', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
