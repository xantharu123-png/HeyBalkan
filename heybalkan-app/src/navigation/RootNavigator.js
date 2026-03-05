import React from 'react';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/auth/SplashScreen';
import AuthNavigator from './AuthNavigator';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
  const { user, profile, loading, isOnboarded } = useAuth();

  // Still loading session
  if (loading) {
    return <SplashScreen />;
  }

  // Not logged in → Auth screens
  if (!user) {
    return <AuthNavigator />;
  }

  // Logged in but no profile / not onboarded → Onboarding
  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  // Fully set up → Main app
  return <MainNavigator />;
}
