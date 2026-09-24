// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Platform } from 'react-native';

import { Room } from '../types';
import { useAuth } from '../hooks/useAuth';

import BrowseRoomsScreen from '../screens/BrowseRoomsScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Type definitions
export type RootStackParamList = {
  BrowseRooms: undefined;
  RoomDetail: { room: Room; initialDate?: string };
};

export type TabParamList = {
  BrowseTab: undefined;
  BookingsTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Stack navigator cho Browse tab
function BrowseStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="BrowseRooms" component={BrowseRoomsScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
    </Stack.Navigator>
  );
}

// Tab bar icon helper
type TabIconName = keyof typeof Ionicons.glyphMap;
function tabIcon(
  focused: boolean,
  iconActive: TabIconName,
  iconInactive: TabIconName
) {
  return (
    <Ionicons
      name={focused ? iconActive : iconInactive}
      size={24}
      color={focused ? '#4F46E5' : '#94A3B8'}
    />
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
            shadowColor: '#1E293B',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tab.Screen
          name="BrowseTab"
          component={BrowseStack}
          options={{
            tabBarLabel: 'Tìm phòng',
            tabBarIcon: ({ focused }) =>
              tabIcon(focused, 'search', 'search-outline'),
          }}
        />
        <Tab.Screen
          name="BookingsTab"
          component={MyBookingsScreen}
          options={{
            tabBarLabel: 'Đặt phòng',
            tabBarIcon: ({ focused }) =>
              tabIcon(focused, 'calendar', 'calendar-outline'),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Hồ sơ',
            tabBarIcon: ({ focused }) =>
              tabIcon(focused, 'person', 'person-outline'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
