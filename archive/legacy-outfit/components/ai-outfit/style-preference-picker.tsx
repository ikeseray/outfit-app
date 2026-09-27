import { Pressable, ScrollView, Text, View } from 'react-native';
import { colors } from '@/components/wardrobe-ui';
import { styleOptions } from '@/services/outfit/ai-outfit-service';

export function StylePreferencePicker({ selected, disabled, onChange }: {
  selected: string[]; disabled: boolean; onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length === 1) return;
      onChange(selected.filter(value => value !== id));
      return;
    }
    if (selected.length >= 3) onChange([...selected.slice(1), id]);
    else onChange([...selected, id]);
  };
  return <View style={{ gap: 10 }}>
    <View style={{ gap: 3 }}>
      <Text selectable style={{ color: colors.ink, fontSize: 17, fontWeight: '600' }}>先告诉我你的穿衣感觉</Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>可以选择 1–3 种，推荐会优先参考这些方向。</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }}>
      {styleOptions.map(option => {
        const active = selected.includes(option.id);
        return <Pressable key={option.id} accessibilityRole="checkbox" accessibilityState={{ checked: active, disabled }}
          accessibilityLabel={`${option.name}，${active ? '已选择' : '未选择'}`} disabled={disabled} onPress={() => toggle(option.id)}
          style={({ pressed }) => ({ width: 152, minHeight: 156, padding: 14, gap: 10, borderRadius: 22,
            borderWidth: active ? 2 : 1, borderColor: active ? colors.sage : colors.border,
            backgroundColor: active ? colors.mint : colors.paper, opacity: disabled ? .55 : pressed ? .72 : 1 })}>
          <View style={{ height: 62, borderRadius: 15, backgroundColor: option.swatch, justifyContent: 'flex-end', padding: 8 }}>
            <View style={{ flexDirection: 'row', gap: 5 }}>{option.colors.map(color => <View key={color} style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: color, borderWidth: 1, borderColor: 'rgba(0,0,0,.08)' }} />)}</View>
          </View>
          <Text selectable style={{ color: colors.ink, fontWeight: '600' }}>{option.name}</Text>
          <Text selectable numberOfLines={2} style={{ color: colors.muted, fontSize: 12, lineHeight: 17 }}>{option.description}</Text>
          {active && <Text selectable style={{ color: colors.sage, fontSize: 12, fontWeight: '600' }}>已选 · 点击取消</Text>}
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}
