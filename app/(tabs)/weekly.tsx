import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Action, Card, colors, Copy, Page, Pill } from '@/components/wardrobe-ui';
import type { ClothingItem, OutfitPlan } from '@/domain/types';
import { clothing, generateWeeklyDemo, replaceItem } from '@/services/weekly-demo';

const categoryLabels: Record<string, string> = { top: '上衣', bottom: '下装', outerwear: '外套', shoes: '鞋子' };

export default function Weekly() {
  const [plans, setPlans] = useState<OutfitPlan[]>([]);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const [nextPlans, available] = await Promise.all([generateWeeklyDemo(), clothing.getAvailableItems()]);
      setItems(available);
      setPlans(nextPlans);
    } catch {
      setError('暂时没能生成搭配，请重试。');
    } finally { setBusy(false); }
  }

  return (
    <Page subtitle="从今天起的 7 天穿搭 · 上海 · 演示数据">
      <Copy muted>沿用你的智能衣柜示例。点击标有“换一件”的单品，可以替换同类衣物。</Copy>
      <Action label={busy ? '正在生成…' : plans.length ? '重新生成 7 天方案' : '生成 7 天穿搭'} onPress={generate} disabled={busy} />
      {busy && <ActivityIndicator color={colors.sage} accessibilityLabel="正在生成搭配" />}
      {!!error && <Text selectable accessibilityRole="alert" style={{ color: '#a33131' }}>{error}</Text>}
      {!plans.length && !busy && <Card><Copy large>这一周，穿得轻松一点</Copy><Copy muted>点击上方按钮，看看 7 天不同场景的搭配示例。</Copy></Card>}
      {plans.map(plan => (
        <Card key={plan.date}>
          <Copy large>{plan.date} · {plan.scene.scene}</Copy>
          <Copy muted>{plan.weather.condition} {plan.weather.highC}° / {plan.weather.lowC}° · 降雨 {plan.weather.rainProbability}%</Copy>
          <Pill>风格匹配度 {plan.scores.style}% · 示例评分</Pill>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {plan.slots.map((slot, index) => {
              const canSwap = items.filter(item => item.category === slot.category).length > 1;
              return (
                <Pressable key={slot.category} accessibilityRole="button" disabled={!canSwap} accessibilityState={{ disabled: !canSwap }}
                  accessibilityLabel={`${slot.item?.name ?? '衣柜缺口'}，${canSwap ? '换一件' : '暂无替换衣物'}`}
                  onPress={() => setPlans(current => current.map(p => p.date === plan.date ? replaceItem(p, index, items) : p))}
                  style={({ pressed }) => ({ flexBasis: '45%', flexGrow: 1, padding: 12, gap: 10, borderRadius: 18,
                    backgroundColor: pressed ? '#e3d8d2' : colors.sand })}>
                  <View style={{ height: 64, backgroundColor: '#e3d8d2', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.muted }}>{categoryLabels[slot.category]}</Text>
                  </View>
                  <Copy>{slot.item?.name ?? '衣柜缺口'}</Copy>
                  <Text style={{ color: canSwap ? colors.sage : colors.muted, fontSize: 12 }}>{canSwap ? '换一件 ↻' : '暂无替换'}</Text>
                </Pressable>
              );
            })}
          </View>
          <Copy>{plan.reason}</Copy>
        </Card>
      ))}
      {!!plans.length && <Copy muted>当前为模拟搭配，刷新后会重置；收藏功能将在后续接入。</Copy>}
    </Page>
  );
}
