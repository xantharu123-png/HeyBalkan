import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', t('errorEmail'));
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    }
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

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => {}}
          >
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>{t('login')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t('noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.switchLink}>{t('signup')}</Text>
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
    backdropFilter: 'blur(10px)',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: SIZES.md,
  },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
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
