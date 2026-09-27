import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Action, Card, colors, Copy, Page } from '@/components/wardrobe-ui';
import type { ClothingItem, OutfitPlan, Scene } from '@/domain/types';
import { generateOutfits, replaceOutfitItem, sceneOptions } from '@/services/outfit/ai-outfit-service';
import { OutfitResult } from '@/components/ai-outfit/outfit-result';
import { StylePreferencePicker } from '@/components/ai-outfit/style-preference-picker';
import { styleProfileFromSelection } from '@/services/outfit/ai-outfit-service';

export function AiOutfitScreen() {
  const [scene, setScene] = useState<Scene>('上班');
  const [styleIds, setStyleIds] = useState(['minimal']);
  const [plans, setPlans] = useState<OutfitPlan[]>([]);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  const request = useRef(0);
  const lastMode = useRef(false);
  useEffect(() => () => { request.current += 1; }, []);

  async function generate(weekly: boolean) {
    if (pending.current) return;
    pending.current = true;
    const id = ++request.current;
    lastMode.current = weekly;
    setBusy(true); setError('');
    try {
      const styleProfile = styleProfileFromSelection(styleIds);
      const result = await generateOutfits({ scene }, weekly, undefined, styleProfile);
      if (id !== request.current) return;
      setPlans(result.plans); setItems(result.items); setGenerated(true); setRevision(value => value + 1);
    } catch {
      if (id === request.current) setError('暂时没能生成搭配。你可以重试，已有结果会保留。');
    } finally {
      if (id === request.current) { pending.current = false; setBusy(false); }
    }
  }

  return <Page subtitle="AI Outfit · 上海 · 模拟衣橱与天气">
    <Copy large>为下一个场景，选一身合适的</Copy>
    <Copy muted>选择场景，查看搭配建议和评分，也可以按自己的想法换一件。</Copy>
    <StylePreferencePicker selected={styleIds} disabled={busy} onChange={setStyleIds} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {sceneOptions.map(option => <Pressable key={option} accessibilityRole="radio"
        accessibilityState={{ checked: scene === option, disabled: busy }} disabled={busy} onPress={() => setScene(option)}
        style={({ pressed }) => ({ minHeight: 44, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 22,
          borderWidth: 1, borderColor: scene === option ? colors.sage : colors.border,
          backgroundColor: scene === option ? colors.mint : colors.paper, opacity: pressed || busy ? 0.6 : 1 })}>
        <Text style={{ color: colors.ink }}>{option}</Text>
      </Pressable>)}
    </View>
    <Action label={`生成「${scene}」穿搭`} disabled={busy} onPress={() => generate(false)} />
    <Action label={`生成 7 天「${scene}」方案`} disabled={busy} onPress={() => generate(true)} />
    <Copy muted>7 天方案使用同一场景，允许重复衣物。配置 AI 服务地址后会发送衣橱、场景、天气和穿搭规则生成推荐；未配置时使用本地演示。</Copy>
    {busy && <View style={{ gap: 10 }}><ActivityIndicator color={colors.sage} accessibilityLabel="正在生成搭配" /><Copy>正在整理推荐…</Copy></View>}
    {!!error && <Card><Text selectable accessibilityRole="alert" style={{ color: colors.ink }}>{error}</Text>
      <Action label="重试生成" disabled={busy} onPress={() => generate(lastMode.current)} /></Card>}
    {!generated && !busy && !error && <Card><Copy large>从一个场景开始</Copy><Copy muted>点击生成，查看你的第一套搭配。</Copy></Card>}
    {generated && !items.length && !busy && <Card><Copy large>暂无可用衣物</Copy><Copy muted>当前衣橱没有可用单品，无法组成穿搭；下方会列出需要补充的类别。</Copy></Card>}
    {generated && !plans.length && !busy && <Card><Copy>暂时没有推荐结果，请重新生成。</Copy></Card>}
    {plans.map((plan, index) => <OutfitResult key={`${revision}-${index}`} plan={plan} items={items} disabled={busy}
      onReplace={(slot, itemId) => setPlans(current => current.map((value, planIndex) =>
        planIndex === index ? replaceOutfitItem(value, slot, itemId, items, styleProfileFromSelection(styleIds)) : value))} />)}
  </Page>;
}

