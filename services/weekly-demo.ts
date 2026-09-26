import type { OutfitPlan, Scene } from '@/domain/types';
import { MockClothingDataService } from '@/services/mock/mock-clothing-data-service';
import { MockWeatherService } from '@/services/mock/mock-weather-service';
import { MockOutfitGenerationService } from '@/services/mock/mock-outfit-generation-service';

const scenes: Scene[] = ['上班', '开会', '出门玩', '约会', '运动', '聚会', '旅行'];
export const clothing = new MockClothingDataService();

export async function generateWeeklyDemo() {
  return new MockOutfitGenerationService().generateWeek({
    city: '上海',
    profile: { commonScenes: ['上班'], likedColors: [], dislikedColors: [], fitPreference: 'regular',
      clothingRestrictions: [], allowWeeklyRepeat: false, explanationMode: 'realistic' },
    styles: { baseStyle: '极简风', weights: {}, preferences: {} },
    scenes: scenes.map(scene => ({ scene })),
  }, { clothing, weather: new MockWeatherService() });
}

export function replaceItem(plan: OutfitPlan, slotIndex: number, items: Awaited<ReturnType<typeof clothing.getAvailableItems>>): OutfitPlan {
  const slot = plan.slots[slotIndex];
  if (!slot) return plan;
  const choices = items.filter(item => item.status === 'available' && item.category === slot.category);
  if (choices.length < 2) return plan;
  const current = choices.findIndex(item => item.id === slot.item?.id);
  const next = choices[(current + 1) % choices.length];
  return { ...plan, slots: plan.slots.map((item, index) => index === slotIndex ? { ...item, item: next } : item) };
}
