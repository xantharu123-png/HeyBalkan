import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Dimensions, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { COLORS, SIZES, SHADOWS } from '../../config/theme';
import { COUNTRIES } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { profileService } from '../../services/profileService';
import { swipeService } from '../../services/swipeService';
import MatchModal from '../../components/MatchModal';

const { width, height } = Dimensions.get('window');

const getAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getCountryFlag = (code) => {
  const country = COUNTRIES.find((c) => c.code === code);
  return country ? `${country.flag} ${country.name}` : code;
};

export default function SwipeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const swiperRef = useRef(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await profileService.getDiscoverProfiles(user.id);
    setProfiles(data);
    setCardIndex(0);
    setLoading(false);
  };

  const handleSwipe = async (index, action) => {
    const swipedProfile = profiles[index];
    if (!swipedProfile) return;

    const { isMatch } = await swipeService.swipe(user.id, swipedProfile.id, action);

    if (isMatch) {
      setMatchedProfile(swipedProfile);
      setShowMatch(true);
    }
  };

  const renderCard = (profile) => {
    if (!profile) return null;
    const age = getAge(profile.birth_date);
    const photo = profile.photos?.[0];

    return (
      <View style={styles.card}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.cardImage} />
        ) : (
          <LinearGradient colors={COLORS.gradientLight} style={styles.cardImage}>
            <Text style={styles.noPhotoEmoji}>👤</Text>
          </LinearGradient>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardOverlay}
        >
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>
              {profile.first_name}, {age}
            </Text>
            <Text style={styles.cardOrigin}>
              {getCountryFlag(profile.origin_country)}
            </Text>
            {profile.city && (
              <Text style={styles.cardCity}>
                📍 {profile.city}
              </Text>
            )}
            {profile.bio && (
              <Text style={styles.cardBio} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyTitle}>{t('noMoreProfiles')}</Text>
        <Text style={styles.emptyText}>{t('checkBackLater')}</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadProfiles}>
          <Ionicons name="refresh" size={20} color={COLORS.white} />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👋 Hey Balkan!</Text>
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={profiles}
          cardIndex={cardIndex}
          renderCard={renderCard}
          onSwipedLeft={(index) => handleSwipe(index, 'pass')}
          onSwipedRight={(index) => handleSwipe(index, 'like')}
          onSwipedTop={(index) => handleSwipe(index, 'super_like')}
          onSwipedAll={loadProfiles}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={12}
          animateCardOpacity
          cardVerticalMargin={0}
          cardHorizontalMargin={10}
          overlayLabels={{
            left: {
              title: 'PASS',
              style: {
                label: {
                  backgroundColor: COLORS.pass,
                  color: COLORS.white,
                  fontSize: 18,
                  borderRadius: 8,
                  padding: 8,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -20,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: COLORS.like,
                  color: COLORS.white,
                  fontSize: 18,
                  borderRadius: 8,
                  padding: 8,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 20,
                },
              },
            },
            top: {
              title: 'SUPER LIKE',
              style: {
                label: {
                  backgroundColor: COLORS.superLike,
                  color: COLORS.white,
                  fontSize: 18,
                  borderRadius: 8,
                  padding: 8,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingBottom: 40,
                },
              },
            },
          }}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.passBtn]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Ionicons name="close" size={30} color={COLORS.pass} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.superBtn]}
          onPress={() => swiperRef.current?.swipeTop()}
        >
          <Ionicons name="star" size={26} color={COLORS.superLike} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Ionicons name="heart" size={30} color={COLORS.like} />
        </TouchableOpacity>
      </View>

      <MatchModal
        visible={showMatch}
        profile={matchedProfile}
        onClose={() => setShowMatch(false)}
      />
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
    padding: SIZES.paddingLg,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  swiperContainer: {
    flex: 1,
    marginTop: -10,
  },
  card: {
    height: height * 0.58,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...SHADOWS.large,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoEmoji: {
    fontSize: 80,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
  },
  cardInfo: {},
  cardName: {
    fontSize: SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  cardOrigin: {
    fontSize: SIZES.lg,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  cardCity: {
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  cardBio: {
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    paddingTop: 10,
    gap: 20,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    ...SHADOWS.medium,
  },
  passBtn: {
    borderColor: COLORS.pass,
  },
  superBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: COLORS.superLike,
  },
  likeBtn: {
    borderColor: COLORS.like,
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
    marginBottom: 24,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  refreshText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
