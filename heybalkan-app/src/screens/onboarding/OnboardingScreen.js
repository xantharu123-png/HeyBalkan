import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../../config/theme';
import { COUNTRIES, DACH_COUNTRIES, SPOKEN_LANGUAGES, RELIGIONS } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { profileService } from '../../services/profileService';

const TOTAL_STEPS = 6;

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Profile data
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [spokenLanguages, setSpokenLanguages] = useState([]);
  const [city, setCity] = useState('');
  const [livingCountry, setLivingCountry] = useState('');
  const [religion, setReligion] = useState('');
  const [relationshipGoal, setRelationshipGoal] = useState('');
  const [photos, setPhotos] = useState([]);
  const [bio, setBio] = useState('');

  const toggleLanguage = (lang) => {
    setSpokenLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need photo access to upload your pictures.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return firstName.trim().length > 0 && birthDate.length === 10 && gender;
      case 2: return originCountry && spokenLanguages.length > 0;
      case 3: return city.trim().length > 0 && livingCountry;
      case 4: return relationshipGoal;
      case 5: return photos.length >= 1;
      case 6: return true; // Bio is optional
      default: return false;
    }
  };

  const handleFinish = async () => {
    setLoading(true);

    // Upload photos first
    const photoUrls = [];
    for (let i = 0; i < photos.length; i++) {
      const { url, error } = await profileService.uploadPhoto(user.id, photos[i], i);
      if (url) photoUrls.push(url);
      if (error) console.error('Photo upload error:', error);
    }

    // Create profile
    const { error } = await profileService.createProfile(user.id, {
      first_name: firstName.trim(),
      birth_date: birthDate,
      gender,
      origin_country: originCountry,
      spoken_languages: spokenLanguages,
      city: city.trim(),
      living_country: livingCountry,
      religion: religion || null,
      relationship_goal: relationshipGoal,
      photos: photoUrls.length > 0 ? photoUrls : photos, // fallback to local URIs if upload fails
      bio: bio.trim() || null,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message || t('errorGeneral'));
    } else {
      await refreshProfile();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>{t('firstName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('firstName')}
              placeholderTextColor={COLORS.textMuted}
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>{t('birthDate')}</Text>
            <TextInput
              style={styles.input}
              placeholder="TT.MM.JJJJ"
              placeholderTextColor={COLORS.textMuted}
              value={birthDate}
              onChangeText={(text) => {
                // Auto-format date
                let formatted = text.replace(/[^0-9]/g, '');
                if (formatted.length > 2) formatted = formatted.slice(0, 2) + '.' + formatted.slice(2);
                if (formatted.length > 5) formatted = formatted.slice(0, 5) + '.' + formatted.slice(5, 9);
                setBirthDate(formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>Gender</Text>
            <View style={styles.chipRow}>
              {['Mann', 'Frau', 'Andere'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, gender === g && styles.chipActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>{t('yourOrigin')}</Text>
            <View style={styles.chipRow}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.chip, styles.chipWide, originCountry === c.code && styles.chipActive]}
                  onPress={() => setOriginCountry(c.code)}
                >
                  <Text style={[styles.chipText, originCountry === c.code && styles.chipTextActive]}>
                    {c.flag} {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>{t('yourLanguages')}</Text>
            <View style={styles.chipRow}>
              {SPOKEN_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.chip, spokenLanguages.includes(lang) && styles.chipActive]}
                  onPress={() => toggleLanguage(lang)}
                >
                  <Text style={[styles.chipText, spokenLanguages.includes(lang) && styles.chipTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>{t('yourCity')}</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. Zuerich, Berlin, Wien..."
              placeholderTextColor={COLORS.textMuted}
              value={city}
              onChangeText={setCity}
            />

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>{t('yourCountry')}</Text>
            <View style={styles.chipRow}>
              {DACH_COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.chip, styles.chipWide, livingCountry === c.code && styles.chipActive]}
                  onPress={() => setLivingCountry(c.code)}
                >
                  <Text style={[styles.chipText, livingCountry === c.code && styles.chipTextActive]}>
                    {c.flag} {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>{t('yourReligion')}</Text>
            <View style={styles.chipRow}>
              {RELIGIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, religion === r && styles.chipActive]}
                  onPress={() => setReligion(r)}
                >
                  <Text style={[styles.chipText, religion === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.stepTitle, { marginTop: 24 }]}>{t('relationshipGoal')}</Text>
            {[
              { key: 'serious', emoji: '\u{1F48D}', label: t('serious') },
              { key: 'casual', emoji: '\u{1F60A}', label: t('casual') },
              { key: 'friendship', emoji: '\u{1F91D}', label: t('friendship') },
              { key: 'open', emoji: '\u{1F30D}', label: t('open') },
            ].map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={[styles.goalCard, relationshipGoal === goal.key && styles.goalCardActive]}
                onPress={() => setRelationshipGoal(goal.key)}
              >
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <Text style={[styles.goalText, relationshipGoal === goal.key && styles.goalTextActive]}>
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>{t('uploadPhotos')}</Text>
            <Text style={styles.hint}>{t('photosHint')}</Text>

            <View style={styles.photoGrid}>
              {photos.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoSlot}
                  onPress={() => removePhoto(index)}
                >
                  <View style={styles.photoFilled}>
                    <Text style={styles.photoX}>X</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {photos.length < 6 && (
                <TouchableOpacity style={styles.photoSlot} onPress={pickPhoto}>
                  <View style={styles.photoEmpty}>
                    <Text style={styles.photoPlus}>+</Text>
                    <Text style={styles.photoAddText}>{t('addPhoto')}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 6:
        return (
          <View>
            <Text style={styles.stepTitle}>{t('writeBio')}</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder={t('bioPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS.gradient} style={styles.header}>
        <Text style={styles.headerTitle}>{t('onboardingTitle')}</Text>
        <Text style={styles.headerStep}>
          {t('step')} {step} {t('of')} {TOTAL_STEPS}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep((s) => s - 1)}
          >
            <Text style={styles.backBtnText}>{t('back')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextBtn,
            !canProceed() && styles.nextBtnDisabled,
            step === 1 && { flex: 1 },
          ]}
          onPress={() => {
            if (step < TOTAL_STEPS) {
              setStep((s) => s + 1);
            } else {
              handleFinish();
            }
          }}
          disabled={!canProceed() || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === TOTAL_STEPS ? t('letsGo') : t('next')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: SIZES.paddingLg,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerStep: {
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: SIZES.paddingLg,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  hint: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 16,
    fontSize: SIZES.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  bioInput: {
    height: 150,
    paddingTop: 16,
  },
  charCount: {
    textAlign: 'right',
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  chipWide: {
    minWidth: '45%',
  },
  chipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: SIZES.md,
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  goalCardActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  goalEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  goalText: {
    fontSize: SIZES.lg,
    color: COLORS.text,
  },
  goalTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 3 / 4,
  },
  photoEmpty: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFilled: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlus: {
    fontSize: 28,
    color: COLORS.textSecondary,
  },
  photoAddText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  photoX: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.padding,
    gap: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  backBtn: {
    flex: 1,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  backBtnText: {
    color: COLORS.text,
    fontSize: SIZES.lg,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 2,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
});
