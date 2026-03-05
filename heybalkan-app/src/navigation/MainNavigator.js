import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../config/theme';
import { useLanguage } from '../context/LanguageContext';

import SwipeScreen from '../screens/main/SwipeScreen';
import MatchesScreen from '../screens/main/MatchesScreen';
import ChatListScreen from '../screens/main/ChatListScreen';
import ChatRoomScreen from '../screens/main/ChatRoomScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();
const MatchStack = createNativeStackNavigator();

function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </ChatStack.Navigator>
  );
}

function MatchNavigator() {
  return (
    <MatchStack.Navigator screenOptions={{ headerShown: false }}>
      <MatchStack.Screen name="MatchList" component={MatchesScreen} />
      <MatchStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </MatchStack.Navigator>
  );
}

export default function MainNavigator() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceLight,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: SIZES.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{
          tabBarLabel: t('discover'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchNavigator}
        options={{
          tabBarLabel: t('matches'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatNavigator}
        options={{
          tabBarLabel: t('chat'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
