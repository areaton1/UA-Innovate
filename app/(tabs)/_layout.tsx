import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

const TAB_ICONS: Record<string, { outline: string; filled: string }> = {
  Home:         { outline: 'home-outline',    filled: 'home' },
  Transactions: { outline: 'list-outline',    filled: 'list' },
  Compass:      { outline: 'compass-outline', filled: 'compass' },
};

function TabIcon({ label, active, color }: { label: string; active: boolean; color?: string }) {
  const iconColor = color ?? (active ? colors.primary : '#888');
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
        name="compass"
        options={{
          title: 'Compass',
          tabBarIcon: ({ focused, color }) => <TabIcon label="Compass" active={focused} color={color} />,
        }}
      />
      {/* Keep these registered so their routes still work, but hide from tab bar */}
      <Tabs.Screen
        name="challenges"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="future-forecast"
        options={{ href: null }}
      />
    </Tabs>
  );
}
