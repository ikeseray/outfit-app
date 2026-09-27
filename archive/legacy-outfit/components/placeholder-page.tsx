import { ScrollView, Text } from 'react-native';

export function PlaceholderPage({ description }: { description: string }) {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
      <Text selectable style={{ fontSize: 22, textAlign: 'center' }}>Outfit App</Text>
      <Text selectable style={{ fontSize: 16, textAlign: 'center', color: '#555' }}>{description}</Text>
      <Text style={{ textAlign: 'center', color: '#777' }}>功能准备中</Text>
    </ScrollView>
  );
}
