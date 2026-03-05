import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', t('errorEmail'));
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', t('errorPassword'));
      return;
    }
    if (password !== confirmPw) {
      Alert.alert('Error', t('errorPasswordMatch'));
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    }
    // On success, AuthContext will detect the session and navigate automatically
  };

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.wave}>👋</Text>
          <Text style={styles.title}>Hey Balkan!</Text>
          <Text style={styles.subtitle}>{t('tagline')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('password')}
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('confirmPassword')}
              placeholderTextColor={COLORS.textMuted}
              value={confirmPw}
              onChangeText={setConfirmPw}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>{t('signup')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t('hasAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchLink}>{t('login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingLg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  wave: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: SIZES.hero,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: SIZES.lg,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
  },
  inputContainer: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: SIZES.radius,
    padding: 16,
    fontSize: SIZES.lg,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.secondary,
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  switchText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: SIZES.md,
  },
  switchLink: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
});
