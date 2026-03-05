import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, Platform, RefreshControl,
} from 'react-native';
import { COLORS, SIZES } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { chatService } from '../../services/chatService';

export default function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    const { data } = await chatService.getConversations(user.id);
    setConversations(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [user.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadConversations);
    return unsubscribe;
  }, [navigation, loadConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'jetzt';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }) => {
    const photo = item.user?.photos?.[0];
    const isMyMessage = item.lastMessage?.sender_id === user.id;

    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() =>
          navigation.navigate('ChatRoom', {
            matchId: item.matchId,
            userName: item.user?.first_name,
            userPhoto: photo,
          })
        }
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}

        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.user?.first_name || 'User'}</Text>
          {item.lastMessage ? (
            <Text style={styles.chatPreview} numberOfLines={1}>
              {isMyMessage ? 'Du: ' : ''}{item.lastMessage.content}
            </Text>
          ) : (
            <Text style={styles.chatNew}>{t('newMatch')} 👋</Text>
          )}
        </View>

        {item.lastMessage && (
          <Text style={styles.chatTime}>
            {formatTime(item.lastMessage.created_at)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('chat')}</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>{t('noMessages')}</Text>
          <Text style={styles.emptyText}>{t('noMessagesHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.matchId.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.textSecondary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  list: {
    paddingHorizontal: SIZES.padding,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  chatPreview: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chatNew: {
    fontSize: SIZES.md,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  chatTime: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
  },
});
