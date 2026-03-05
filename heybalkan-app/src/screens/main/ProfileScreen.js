import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../config/theme';
import { COUNTRIES, LANGUAGES } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const getAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Bist du sicher?',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const country = COUNTRIES.find((c) => c.code === profile?.origin_country);
  const age = getAge(profile?.birth_date);
  const photo = profile?.photos?.[0];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient colors={COLORS.gradient} style={styles.header}>
        <View style={styles.avatarContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>
          {profile?.first_name || 'User'}{age ? `, ${age}` : ''}
        </Text>
        {country && (
          <Text style={styles.origin}>{country.flag} {country.name}</Text>
        )}
        {profile?.city && (
          <Text style={styles.city}>📍 {profile.city}</Text>
        )}
      </LinearGradient>

      {/* Bio */}
      {profile?.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('writeBio')}</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Info</Text>

        {profile?.spoken_languages?.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="chatbubbles-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {profile.spoken_languages.join(', ')}
            </Text>
          </View>
        )}

        {profile?.relationship_goal && (
          <View style={styles.infoRow}>
            <Ionicons name="heart-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{t(profile.relationship_goal)}</Text>
          </View>
        )}

        {profile?.religion && (
          <View style={styles.infoRow}>
            <Ionicons name="sparkles-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{profile.religion}</Text>
          </View>
        )}
      </View>

      {/* Language Switch */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langChip, language === lang.code && styles.langChipActive]}
              onPress={() => setLanguage(lang.code)}
            >
              <Text style={[styles.langText, language === lang.code && styles.langTextActive]}>
                {lang.flag} {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings')}</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          <Text style={styles.menuText}>{t('notifications')}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-outline" size={22} color={COLORS.text} />
          <Text style={styles.menuText}>{t('privacy')}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={22} color={COLORS.text} />
          <Text style={styles.menuText}>{t('help')}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>{t('version')} 1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  origin: {
    fontSize: SIZES.lg,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  city: {
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    padding: SIZES.paddingLg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  langChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  langText: {
    color: COLORS.text,
    fontSize: SIZES.sm,
  },
  langTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  menuText: {
    flex: 1,
    fontSize: SIZES.lg,
    color: COLORS.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SIZES.paddingLg,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: SIZES.lg,
    color: COLORS.error,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    paddingVertical: 8,
  },
});
