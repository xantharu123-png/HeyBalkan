import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { chatService } from '../../services/chatService';

export default function ChatRoomScreen({ route, navigation }) {
  const { matchId, userName, userPhoto } = route.params;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    loadMessages();

    // Subscribe to realtime messages
    subscriptionRef.current = chatService.subscribeToMessages(matchId, (msg) => {
      if (msg.sender_id !== user.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      chatService.unsubscribe(subscriptionRef.current);
    };
  }, [matchId]);

  const loadMessages = async () => {
    const { data } = await chatService.getMessages(matchId);
    setMessages(data);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistically add message
    const tempMsg = {
      id: Date.now(),
      match_id: matchId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      _temp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    const { data, error } = await chatService.sendMessage(matchId, user.id, content);
    setSending(false);

    if (data) {
      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) => (m._temp && m.id === tempMsg.id ? data : m))
      );
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender_id === user.id;
    const prevMsg = messages[index - 1];
    const showTime = !prevMsg ||
      new Date(item.created_at) - new Date(prevMsg.created_at) > 300000; // 5 min gap

    return (
      <View>
        {showTime && (
          <Text style={styles.timeLabel}>{formatTime(item.created_at)}</Text>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {userPhoto ? (
          <Image source={{ uri: userPhoto }} style={styles.headerAvatar} />
        ) : (
          <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
            <Text>👤</Text>
          </View>
        )}

        <Text style={styles.headerName}>{userName}</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t('typeMessage')}
          placeholderTextColor={COLORS.textMuted}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 12,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerAvatarPlaceholder: {
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerName: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  messageList: {
    padding: SIZES.padding,
    paddingBottom: 8,
  },
  timeLabel: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    marginVertical: 8,
  },
  bubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: SIZES.md,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: COLORS.white,
  },
  bubbleTextThem: {
    color: COLORS.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SIZES.padding,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.padding,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
