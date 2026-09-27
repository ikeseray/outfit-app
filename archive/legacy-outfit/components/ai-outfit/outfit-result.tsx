import { useState } from 'react';
import { Text, View } from 'react-native';
import { Action, Card, colors, Copy, Pill } from '@/components/wardrobe-ui';
import type { ClothingItem, OutfitPlan } from '@/domain/types';
import { categoryLabels, replacementOptions } from '@/services/outfit/ai-outfit-service';
import { LayeredOutfitPreview, ReplacementPanel } from '@/components/ai-outfit/layered-outfit-preview';

const scoreLabels: Record<keyof OutfitPlan['scores'], string> = {
  style: '风格协调', weather: '天气适配', scene: '场景匹配', warmth: '保暖适配', activity: '活动便利',
};

export function OutfitResult({ plan, items, disabled, onReplace }: {
  plan: OutfitPlan; items: ClothingItem[]; disabled: boolean; onReplace: (slot: number, id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const selected = selectedSlot === null ? null : plan.slots[selectedSlot];
  const choices = selected && selectedSlot !== null ? replacementOptions(plan, selectedSlot, items) : [];
  const pick = (id: string) => {
    if (selectedSlot === null) return;
    const selectedItem = items.find(item => item.id === id);
    if (!selectedItem) return;
    onReplace(selectedSlot, id); setNotice(`已换成${selectedItem.name}，评分和解释已更新。`); setSelectedSlot(null);
  };
  const random = () => choices.length && pick(choices[Math.floor(Math.random() * choices.length)].id);
  return <Card>
    <Copy large>{plan.date} · {plan.scene.scene}</Copy>
    <Copy muted>{plan.weather.condition} · {plan.weather.lowC}–{plan.weather.highC}°C · 降雨 {plan.weather.rainProbability}%</Copy>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <LayeredOutfitPreview slots={plan.slots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} onClear={() => setSelectedSlot(null)} />
      {selected?.item && <View style={{ flexBasis: 240, maxWidth: 280 }}><ReplacementPanel item={selected.item} choices={choices} disabled={disabled} onRandom={random} onPick={pick} /></View>}
    </View>
    <Pill>场景匹配 {plan.scores.scene} / 100 · 规则演示评分</Pill>
    <Copy>{plan.slots.map(slot => slot.item?.name ?? `${categoryLabels[slot.category]}缺失`).join(' + ')}</Copy>
    {!!plan.gaps.length && <Copy muted>衣橱缺口：{plan.gaps.map(key => categoryLabels[key as keyof typeof categoryLabels] ?? key).join('、')}</Copy>}
    <Action label={expanded ? '收起评分与解释' : '查看评分与解释'} onPress={() => setExpanded(!expanded)} />
    {expanded && <>
      <Copy large>推荐评分与解释</Copy>
      <View style={{ gap: 8 }}>{(Object.keys(scoreLabels) as (keyof OutfitPlan['scores'])[]).map(key =>
        <Copy key={key}>{scoreLabels[key]}：{plan.scores[key]} / 100</Copy>)}</View>
      <Copy>{plan.reason}</Copy>
      <Copy muted>点击上方人形画布中的单品即可进入替换模式。</Copy>
      {!!notice && <Text selectable accessibilityLiveRegion="polite" style={{ color: colors.sage }}>{notice}</Text>}
    </>}
  </Card>;
}
