import type { ClothingItem, OutfitPlan, Scene, SceneRequest, StyleProfile } from '@/domain/types';
import type { OutfitGenerationInput } from '@/services/outfit/outfit-generation-service';
import { MockClothingDataService } from '@/services/mock/mock-clothing-data-service';
import { MockWeatherService } from '@/services/mock/mock-weather-service';
import { MockOutfitGenerationService } from '@/services/mock/mock-outfit-generation-service';
import { HttpOutfitGenerationService, isAiConfigured } from '@/services/outfit/http-outfit-generation-service';
import type { ClothingDataService } from '@/services/clothing/clothing-data-service';
import type { WeatherService } from '@/services/weather/weather-service';

export const sceneOptions: Scene[] = ['上班', '上学', '开会', '出门玩', '约会', '运动', '聚会', '旅行', '比赛'];
export const categoryLabels = { top: '上衣', bottom: '下装', outerwear: '外套', shoes: '鞋子', bag: '包袋', accessory: '配饰' };
export const styleOptions = [
  { id: 'minimal', name: '极简通勤', description: '干净、克制、利落', tags: ['简约', '通勤', '正式'], swatch: '#d9d2ca', colors: ['#f5f1ec', '#8d8178', '#273039'] },
  { id: 'casual', name: '休闲基础', description: '轻松、舒服、好搭配', tags: ['休闲', '舒适', '基础'], swatch: '#d8e1dc', colors: ['#f2eadf', '#80968f', '#527064'] },
  { id: 'street', name: '街头运动', description: '宽松、有活力、有态度', tags: ['街头', '运动', '宽松'], swatch: '#d8d6df', colors: ['#1f2630', '#7d8192', '#d36d54'] },
  { id: 'neutral', name: '中性利落', description: '简洁、平衡、不被性别限制', tags: ['中性', '利落', '基础'], swatch: '#dedbd5', colors: ['#efeee9', '#42484b', '#aa9d8d'] },
  { id: 'retro', name: '文艺复古', description: '有质感、温暖、带一点故事感', tags: ['复古', '文艺', '温柔'], swatch: '#e3d1c1', colors: ['#8b5f4c', '#d2aa83', '#283038'] },
] as const;
const defaults = { clothing: new MockClothingDataService(), weather: new MockWeatherService() };
const generator = new MockOutfitGenerationService();
const aiGenerator = new HttpOutfitGenerationService();
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
export function styleProfileFromSelection(ids: string[]): StyleProfile {
  const selected = styleOptions.filter(option => ids.includes(option.id));
  const active = selected.length ? selected : [styleOptions[0]];
  const weights = Object.fromEntries([...new Set(active.flatMap(option => option.tags))].map(tag => [tag, 1]));
  return { baseStyle: active.map(option => option.name).join(' / '), weights, preferences: {} };
}

// Demo rules use the existing mock's 1–5 formality, activity and warmth values.
function itemScores(item: ClothingItem, plan: OutfitPlan, styleProfile?: StyleProfile) {
  const scene = plan.scene.scene;
  const formality = ['上班', '开会'].includes(scene) ? 4 : ['约会', '聚会'].includes(scene) ? 3 : 2;
  const activity = ['运动', '比赛'].includes(scene) ? 5 : ['旅行', '出门玩'].includes(scene) ? 4 : 3;
  const warmth = plan.weather.feelsLikeC < 15 ? 4 : plan.weather.feelsLikeC < 23 ? 2 : 1;
  return {
    scene: clamp(100 - Math.abs(item.formality_level - formality) * 20),
    activity: clamp(100 - Math.max(0, activity - item.activity_level) * 25),
    warmth: clamp(100 - Math.abs((item.warmth ?? 2) - warmth) * 20),
    weather: plan.weather.rainProbability > 50 ? (item.waterproof ? 100 : 50) : 100,
    style: styleProfile ? styleProfileScore(item, styleProfile) : 60,
  };
}

function styleProfileScore(item: ClothingItem, styleProfile: StyleProfile) {
  const tags = item.style_tags;
  const weights = Object.values(styleProfile.weights);
  if (!weights.length) return 60;
  const matched = tags.reduce((sum, tag) => sum + (styleProfile.weights[tag] ?? 0), 0);
  return clamp(45 + matched * 25);
}

export function evaluateOutfit(plan: OutfitPlan, styleProfile?: StyleProfile): OutfitPlan {
  const items = plan.slots.flatMap(slot => slot.item ? [slot.item] : []);
  const count = Math.max(plan.slots.length, 1);
  const average = (key: keyof ReturnType<typeof itemScores>) =>
    clamp(items.reduce((sum, item) => sum + itemScores(item, plan, styleProfile)[key], 0) / count);
  // Repeated style tags and slot completeness, not an AI probability.
  const matching = items.filter(item => item.style_tags.some(tag =>
    items.some(other => other.id !== item.id && other.style_tags.includes(tag)))).length;
  const scores = { style: styleProfile ? average('style') : clamp((items.length * 60 + matching * 40) / count),
    scene: average('scene'), activity: average('activity'), warmth: average('warmth'), weather: average('weather') };
  const gaps = plan.slots.filter(slot => !slot.item).map(slot => slot.category);
  const reason = items.length
    ? `${plan.scene.scene} · 体感 ${plan.weather.feelsLikeC}°C。当前组合：${items.map(item => item.name).join('、')}。${styleProfile ? `已按「${styleProfile.baseStyle}」偏好排序；` : ''}场景分按正式程度计算，活动分按活动需求计算，保暖分按体感温度计算，风格分参考你的选择和单品标签。${plan.weather.rainProbability > 50 ? '有降雨，未标注防水的单品会降低天气分。' : ''}${gaps.length ? '尚有单品缺失，评分已计入缺口。' : ''}`
    : '衣橱暂无可用单品，暂时无法组成穿搭。';
  return { ...plan, scores, reason, gaps };
}

export function replacementOptions(plan: OutfitPlan, slotIndex: number, items: ClothingItem[]) {
  const slot = plan.slots[slotIndex];
  if (!slot) return [];
  return items.filter(item => item.status === 'available' && item.category === slot.category && item.id !== slot.item?.id);
}

export function replaceOutfitItem(plan: OutfitPlan, slotIndex: number, itemId: string, items: ClothingItem[], styleProfile?: StyleProfile): OutfitPlan {
  const next = replacementOptions(plan, slotIndex, items).find(item => item.id === itemId);
  if (!next) return plan;
  return evaluateOutfit({ ...plan, slots: plan.slots.map((slot, index) => index === slotIndex ? { ...slot, item: next } : slot) }, styleProfile);
}

export async function generateOutfits(scene: SceneRequest, weekly: boolean,
  deps: { clothing: ClothingDataService; weather: WeatherService } = defaults, styleProfile?: StyleProfile) {
  const items = (await deps.clothing.getAvailableItems()).filter(item => item.status === 'available');
  // Use the same wardrobe snapshot for generation and replacements.
  const snapshot = { ...deps, clothing: { getAvailableItems: async () => items,
    listItems: async () => items, getItem: async (id: string) => items.find(item => item.id === id) ?? null } };
  const input: OutfitGenerationInput = { city: '上海',
    profile: { commonScenes: [scene.scene], likedColors: [], dislikedColors: [], fitPreference: 'regular',
      clothingRestrictions: [], allowWeeklyRepeat: true, explanationMode: 'realistic' },
    styles: { baseStyle: '简约', weights: {}, preferences: {} }, scenes: Array.from({ length: 7 }, () => scene) };
  const activeGenerator = isAiConfigured() ? aiGenerator : generator;
  const raw = weekly ? await activeGenerator.generateWeek(input, snapshot) : [await activeGenerator.generateForScene(input, scene, snapshot)];
  const plans = raw.map(plan => evaluateOutfit({ ...plan, slots: [...plan.slots,
    ...(['bag', 'accessory'] as const).filter(category => items.some(item => item.category === category))
      .map(category => ({ category, item: items.find(item => item.category === category) ?? null })),
  ].map(slot => {
    const candidates = items.filter(item => item.category === slot.category);
    const rank = (item: ClothingItem) => Object.values(itemScores(item, plan, styleProfile)).reduce((sum, score) => sum + score, 0);
    return { ...slot, item: candidates.sort((a, b) => rank(b) - rank(a))[0] ?? null };
  }) }, styleProfile));
  return { plans, items };
}


