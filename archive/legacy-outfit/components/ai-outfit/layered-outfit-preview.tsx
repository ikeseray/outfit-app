import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { ClothingCategory, ClothingItem, OutfitSlot } from '@/domain/types';
import { categoryLabels } from '@/services/outfit/ai-outfit-service';
import { colors } from '@/components/wardrobe-ui';

type Layer = { category: ClothingCategory; left: number; top: number; width: number; height: number; zIndex: number; radius: number };
const layers: Layer[] = [
  { category: 'shoes', left: 22, top: 274, width: 86, height: 42, zIndex: 1, radius: 30 },
  { category: 'shoes', left: 128, top: 274, width: 86, height: 42, zIndex: 1, radius: 30 },
  { category: 'bottom', left: 57, top: 160, width: 126, height: 128, zIndex: 2, radius: 28 },
  { category: 'top', left: 55, top: 80, width: 130, height: 108, zIndex: 3, radius: 28 },
  { category: 'outerwear', left: 43, top: 70, width: 154, height: 130, zIndex: 4, radius: 30 },
  { category: 'bag', left: 164, top: 135, width: 68, height: 84, zIndex: 5, radius: 22 },
  { category: 'accessory', left: 172, top: 30, width: 50, height: 50, zIndex: 6, radius: 24 },
];
const colorFor = (category: ClothingCategory) => ({ top: '#f3e9e2', bottom: '#aec0c8', outerwear: '#a5806f', shoes: '#d7d1c6', bag: '#a47e65', accessory: '#b9cee0' }[category] ?? colors.sand);

function GarmentFallback({ item, layer }: { item: ClothingItem; layer: Layer }) {
  return <View style={{ flex: 1, borderRadius: layer.radius, backgroundColor: colorFor(item.category), borderWidth: 1, borderColor: 'rgba(85,78,75,.22)', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
    <Text selectable numberOfLines={2} style={{ color: colors.ink, fontSize: 10, textAlign: 'center' }}>{categoryLabels[item.category]}</Text>
  </View>;
}
function LayerImage({ item, layer }: { item: ClothingItem; layer: Layer }) {
  const [failed, setFailed] = useState(false);
  if (failed || !item.image_url || item.image_url.startsWith('/placeholder')) return <GarmentFallback item={item} layer={layer} />;
  return <Image source={item.image_source ?? { uri: item.image_url }} accessibilityLabel={item.name} resizeMode="contain" onError={() => setFailed(true)} style={{ width: '100%', height: '100%' }} />;
}

export function LayeredOutfitPreview({ slots, selectedSlot, onSelect, onClear }: { slots: OutfitSlot[]; selectedSlot: number | null; onSelect: (index: number) => void; onClear: () => void }) {
  const byCategory = new Map(slots.map((slot, index) => [slot.category, { ...slot, index }]));
  const rendered = layers.map((layer, layerIndex) => {
    const match = byCategory.get(layer.category);
    if (!match || !match.item || (layer.category === 'shoes' && layerIndex === 1)) return null;
    return { layer, match: { ...match, item: match.item } };
  }).filter(Boolean) as { layer: Layer; match: OutfitSlot & { index: number; item: ClothingItem } }[];
  return <View style={{ alignItems: 'center', gap: 10 }}>
    <Text selectable style={{ color: colors.muted, fontSize: 12 }}>点一下单品查看 · 点空白处取消</Text>
    <View style={{ width: 240, height: 330, borderRadius: 32, backgroundColor: '#f6f0eb', borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
      <Pressable accessibilityLabel="取消选中单品" onPress={onClear} style={{ position: 'absolute', inset: 0 }}>
        <View style={{ position: 'absolute', left: 96, top: 22, width: 48, height: 48, borderRadius: 24, backgroundColor: '#eadfd7' }} />
        <View style={{ position: 'absolute', left: 70, top: 67, width: 100, height: 180, borderRadius: 48, backgroundColor: 'rgba(226,214,205,.48)' }} />
        <View style={{ position: 'absolute', left: 74, top: 230, width: 38, height: 70, borderRadius: 18, backgroundColor: 'rgba(226,214,205,.48)' }} />
        <View style={{ position: 'absolute', left: 128, top: 230, width: 38, height: 70, borderRadius: 18, backgroundColor: 'rgba(226,214,205,.48)' }} />
      </Pressable>
      {rendered.map(({ layer, match }) => {
        const active = selectedSlot === match.index;
        return <Pressable key={`${layer.category}-${match.index}`} accessibilityRole="button" accessibilityLabel={`${match.item.name}，${active ? '已选中' : '选择'}`} onPress={() => onSelect(match.index)} style={{ position: 'absolute', left: layer.left, top: layer.top, width: layer.width, height: layer.height, zIndex: active ? 20 : layer.zIndex, borderRadius: layer.radius, borderWidth: active ? 3 : 1, borderColor: active ? '#d18b63' : 'rgba(85,78,75,.12)', backgroundColor: active ? 'rgba(255,236,218,.28)' : 'transparent', boxShadow: active ? '0 0 0 5px rgba(209,139,99,.24)' : undefined }}>
          <LayerImage item={match.item} layer={layer} />
          {active && <View pointerEvents="none" style={{ position: 'absolute', right: -10, top: -16, borderRadius: 16, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#d18b63' }}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>换一件</Text></View>}
        </Pressable>;
      })}
    </View>
  </View>;
}

export function ReplacementPanel({ item, choices, disabled, onRandom, onPick }: { item: ClothingItem; choices: ClothingItem[]; disabled: boolean; onRandom: () => void; onPick: (id: string) => void }) {
  return <View style={{ padding: 14, gap: 10, borderRadius: 18, backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.border }}>
    <Text selectable style={{ color: colors.ink, fontWeight: '600' }}>替换 {categoryLabels[item.category]} · {item.name}</Text>
    <Pressable accessibilityRole="button" disabled={disabled || !choices.length} onPress={onRandom} style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, borderRadius: 22, backgroundColor: colors.sage, opacity: disabled || !choices.length ? .45 : pressed ? .75 : 1 })}><Text style={{ color: '#fff', fontWeight: '600' }}>随机换一件</Text></Pressable>
    <ScrollView accessibilityLabel="同类替换单品列表" style={{ maxHeight: 180 }} contentContainerStyle={{ gap: 8 }} nestedScrollEnabled>
      {choices.map(choice => <Pressable key={choice.id} accessibilityRole="button" onPress={() => onPick(choice.id)} disabled={disabled} style={({ pressed }) => ({ padding: 12, borderRadius: 14, backgroundColor: pressed ? colors.blush : colors.paper, borderWidth: 1, borderColor: colors.border, opacity: disabled ? .5 : 1 })}><Text selectable style={{ color: colors.ink }}>{choice.name}</Text><Text selectable style={{ color: colors.muted, fontSize: 12 }}>{choice.color} · {choice.material} · {choice.style_tags.join(' / ')}</Text></Pressable>)}
      {!choices.length && <Text selectable style={{ color: colors.muted }}>暂无同类可替换单品</Text>}
    </ScrollView>
  </View>;
}
