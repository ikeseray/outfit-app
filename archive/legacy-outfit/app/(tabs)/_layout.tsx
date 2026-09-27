import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/components/wardrobe-ui';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.sage, tabBarInactiveTintColor: colors.muted,
      headerTitleAlign: 'center', headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink,
      tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.border, height: 64 + insets.bottom,
        paddingTop: 6, paddingBottom: Math.max(insets.bottom, 8) }, tabBarLabelStyle: { fontSize: 12, lineHeight: 18 } }}>
      <Tabs.Screen name="index" options={{ title: '今天怎么穿', tabBarLabel: '首页', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>⌂</Text> }} />
      <Tabs.Screen name="weekly" options={{ title: '每周搭配', tabBarLabel: '搭配', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>✦</Text> }} />
      <Tabs.Screen name="design" options={{ title: '设计', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>✎</Text> }} />
      <Tabs.Screen name="wardrobe" options={{ title: '衣橱', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>□</Text> }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
