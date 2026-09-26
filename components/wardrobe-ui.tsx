import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export const colors = {
  background: '#f4f6fb', paper: '#fbfaf8', border: '#e4deda',
  ink: '#554e4b', muted: '#786860', sage: '#55756b',
  sand: '#eee6df', blush: '#d8c5ba', mint: '#dbe8e2',
};

export function Page({ subtitle, children }: { subtitle: string; children: ReactNode }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 18, width: '100%', maxWidth: 720, alignSelf: 'center' }}>
      <View style={{ backgroundColor: colors.sand, padding: 18, borderRadius: 24, borderWidth: 1, borderColor: colors.border }}>
        <Text selectable style={{ color: colors.muted, lineHeight: 22 }}>{subtitle}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

export function Card({ children, tinted = false }: { children: ReactNode; tinted?: boolean }) {
  return <View style={{ padding: 20, gap: 14, borderRadius: 24, borderCurve: 'continuous', borderWidth: 1,
    borderColor: colors.border, backgroundColor: tinted ? colors.blush : colors.paper }}>{children}</View>;
}

export function Copy({ children, large = false, muted = false }: { children: ReactNode; large?: boolean; muted?: boolean }) {
  return <Text selectable style={{ fontSize: large ? 20 : 14, lineHeight: large ? 29 : 22,
    fontWeight: large ? '600' : '400', color: muted ? colors.muted : colors.ink }}>{children}</Text>;
}

export function Pill({ children }: { children: ReactNode }) {
  return <View style={{ alignSelf: 'flex-start', borderRadius: 20, backgroundColor: colors.mint, paddingHorizontal: 12, paddingVertical: 6 }}>
    <Text selectable style={{ color: colors.sage, fontSize: 12 }}>{children}</Text>
  </View>;
}

export function Action({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 28,
      backgroundColor: colors.sage, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 })}>
    <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center', fontSize: 15 }}>{label}</Text>
  </Pressable>;
}
