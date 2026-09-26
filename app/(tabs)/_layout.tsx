import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#345b46', tabBarIcon: () => null, headerTitleAlign: 'center' }}>
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="wardrobe" options={{ title: '衣橱' }} />
      <Tabs.Screen name="outfits" options={{ title: 'AI穿搭' }} />
      <Tabs.Screen name="favorites" options={{ title: '收藏' }} />
      <Tabs.Screen name="profile" options={{ title: '我的' }} />
    </Tabs>
  );
}
