import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../config/theme';
import { useLanguage } from '../context/LanguageContext';

export default function MatchModal({ visible, profile, onClose, onSendMessage }) {
  const { t } = useLanguage();

  if (!profile) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient colors={COLORS.gradient} style={styles.content}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>{t('itsAMatch')}</Text>
          <Text style={styles.subtitle}>
            {t('matchMessage')}
          </Text>

          <View style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>💜</Text>
            <Text style={styles.profileName}>{profile.first_name}</Text>
          </View>

          <TouchableOpacity style={styles.messageBtn} onPress={onSendMessage || onClose}>
            <Text style={styles.messageBtnText}>{t('sendMessage')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keepBtn} onPress={onClose}>
            <Text style={styles.keepBtnText}>{t('keepSwiping')}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  content: {
    width: '100%',
    borderRadius: SIZES.radiusXl,
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.lg,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileEmoji: {
    fontSize: 36,
  },
  profileName: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
    marginTop: 4,
  },
  messageBtn: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  messageBtnText: {
    color: COLORS.secondary,
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
  keepBtn: {
    paddingVertical: 12,
  },
  keepBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: SIZES.md,
  },
});
