import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

const ForecastArrowIcon = require('@/assets/icon-forecast-arrow.svg').default;

const TAB_ICONS: Record<string, { outline: string; filled: string }> = {
  Home:             { outline: 'home-outline',         filled: 'home' },
  Transactions:     { outline: 'list-outline',         filled: 'list' },
  Challenges:       { outline: 'trophy-outline',       filled: 'trophy' },
};

function TabIcon({ label, active, color }: { label: string; active: boolean; color?: string }) {
  const iconColor = color ?? (active ? colors.primary : '#888');

  if (label === 'Spending Forecast') {
    return (
      <View style={tabStyles.container}>
        <ForecastArrowIcon width={22} height={22} color={iconColor} />
      </View>
    );
  }

  const iconNames = TAB_ICONS[label];
  const iconName = (active ? iconNames?.filled : iconNames?.outline) ?? 'ellipse-outline';

  return (
    <View style={tabStyles.container}>
      <Ionicons name={iconName as any} size={22} color={iconColor} />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: { alignItems: 'center' },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ focused }) => <TabIcon label="Transactions" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ focused }) => <TabIcon label="Challenges" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="future-forecast"
        options={{
          title: 'Spending Forecast',
          tabBarIcon: ({ focused, color }) => <TabIcon label="Spending Forecast" active={focused} color={color} />,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        }}
      />
    </Tabs>
  );
}
