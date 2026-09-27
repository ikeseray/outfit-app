import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import type { WardrobeItem } from './domain';
import { colors, s } from './ui';
import { OutfitStudio } from './outfit-studio';

const entries = [
  ['shirt', '白色宽松衬衫', '衬衫', '白色', require('../assets/outfit-demo/neutral-white-shirt.png')],
  ['trousers', '深灰直筒西裤', '西裤/西装裤', '深灰色', require('../assets/outfit-demo/neutral-dark-trousers.png')],
  ['blazer', '米色廓形西装', '西装', '米色', require('../assets/outfit-demo/neutral-beige-blazer.png')],
  ['sneakers', '灰色休闲鞋', '运动鞋', '灰色', require('../assets/outfit-demo/neutral-gray-sneakers.png')],
  ['bag', '浅粉色肩背包', '包袋', '粉色', require('../assets/outfit-demo/sweet-pastel-bag.png')],
  ['blouse', '浅粉短袖衬衫', '衬衫', '粉色', require('../assets/outfit-demo/sweet-pink-blouse.png')],
  ['skirt', '浅蓝百褶半身裙', '百褶裙', '蓝色', require('../assets/outfit-demo/sweet-blue-skirt.png')],
  ['cargo', '深灰宽腿工装裤', '工装裤', '深灰色', require('../assets/outfit-demo/street-cargo-pants.png')],
] as const;
const items: WardrobeItem[] = entries.map(([id, name, type, color]) => ({ id, name, type, color, season: '四季' }));
const sources = Object.fromEntries(entries.map(([id, , , , source]) => [id, source]));

export function OutfitPreview() {
  return <View style={{ flex: 1, backgroundColor: colors.background }}><ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20, paddingBottom: 40 }}><View style={{ width: '100%', maxWidth: 620, gap: 24 }}>
    <View style={[s.headingRow, { borderBottomWidth: 1, borderColor: colors.line, paddingBottom: 16 }]}><View><Text style={{ color: colors.ink, fontSize: 18, fontWeight: '700' }}>家里放哪儿 / 智能衣柜</Text><Text style={s.sectionCaption}>穿搭工作台 · 交互预览</Text></View><Image source={require('../assets/cat-mascot.png')} style={{ width: 48, height: 56 }} resizeMode="contain" /></View>
    <OutfitStudio items={items} sources={sources} demo weather={{ city: '示例天气', day: { feelsLikeC: 21, highC: 24, condition: '多云', rainProbability: 10 } }} />
    <Text style={s.sectionCaption}>这是独立的示例衣柜，不会更改你的家庭或衣物记录。真实衣柜中已接入相同的展示与换装组件。</Text>
  </View></ScrollView></View>;
}
