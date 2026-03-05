import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../config/theme';

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.wave}>👋</Text>
        <Text style={styles.title}>Hey Balkan!</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  wave: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.hero,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: SIZES.lg,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
});
