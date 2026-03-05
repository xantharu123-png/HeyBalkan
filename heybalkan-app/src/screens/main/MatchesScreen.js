import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, Platform, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../config/theme';
import { COUNTRIES } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { swipeService } from '../../services/swipeService';

const getAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function MatchesScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    const { data } = await swipeService.getMatches(user.id);
    setMatches(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [user.id]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const renderMatch = ({ item }) => {
    const photo = item.photos?.[0];
    const age = getAge(item.birth_date);
    const country = COUNTRIES.find((c) => c.code === item.origin_country);

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() =>
          navigation.navigate('ChatRoom', {
            matchId: item.matchId,
            userName: item.first_name,
            userPhoto: photo,
          })
        }
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.matchPhoto} />
        ) : (
          <View style={[styles.matchPhoto, styles.matchPhotoPlaceholder]}>
            <Text style={styles.matchEmoji}>👤</Text>
          </View>
        )}
        <Text style={styles.matchName} numberOfLines={1}>
          {item.first_name}
        </Text>
        {age ? <Text style={styles.matchAge}>{age}</Text> : null}
        {country && <Text style={styles.matchFlag}>{country.flag}</Text>}
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
        <Text style={styles.headerTitle}>{t('matches')}</Text>
        <Text style={styles.matchCount}>{matches.length}</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💜</Text>
          <Text style={styles.emptyTitle}>{t('noMatches')}</Text>
          <Text style={styles.emptyText}>{t('noMatchesHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.matchId.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  matchCount: {
    backgroundColor: COLORS.secondary,
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  list: {
    padding: SIZES.padding,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  matchCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  matchPhoto: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  matchPhotoPlaceholder: {
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchEmoji: {
    fontSize: 40,
  },
  matchName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  matchAge: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    paddingHorizontal: 10,
  },
  matchFlag: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingBottom: 10,
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
