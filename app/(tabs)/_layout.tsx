import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

const ForecastArrowIcon = require('@/assets/icon-forecast-arrow.svg').default;

function TabIcon({ label, active, color }: { label: string; active: boolean; color?: string }) {
  if (label === 'Spending Forecast') {
    return (
      <View style={tabStyles.container}>
        <ForecastArrowIcon width={22} height={22} color={color ?? (active ? colors.primary : '#888')} />
      </View>
    );
  }
  const icons: Record<string, string> = {
    Home: '⌂',
    Transactions: '≡',
    Challenges: '🏆',
  };
  return (
    <View style={tabStyles.container}>
      <Text style={[tabStyles.icon, active && tabStyles.activeIcon]}>
        {icons[label] ?? '○'}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  icon: { fontSize: 20, color: '#888' },
  activeIcon: { color: colors.primary },
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
