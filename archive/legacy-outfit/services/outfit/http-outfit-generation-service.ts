import { buildOutfitPrompt } from '@/src/config/outfitPrompts';
import type { ClothingDataService } from '@/services/clothing/clothing-data-service';
import type { WeatherService } from '@/services/weather/weather-service';
import type { OutfitPlan, SceneRequest } from '@/domain/types';
import type { OutfitGenerationInput, OutfitGenerationService } from '@/services/outfit/outfit-generation-service';
type AiResponse = OutfitPlan[] | { plans: OutfitPlan[] };
function endpoint() { const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env; return env?.EXPO_PUBLIC_OUTFIT_AI_URL?.trim() || ''; }
export class HttpOutfitGenerationService implements OutfitGenerationService {
  constructor(private readonly url = endpoint(), private readonly fetcher: typeof fetch = fetch) {}
  private async call(prompt: string, input: OutfitGenerationInput, scene: SceneRequest, weather: unknown, wardrobe: unknown) { if (!this.url) throw new Error('EXPO_PUBLIC_OUTFIT_AI_URL is not configured'); const response = await this.fetcher(this.url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, input, scene, weather, wardrobe }) }); if (!response.ok) throw new Error(`AI request failed (${response.status})`); const data = await response.json() as AiResponse; const plans = Array.isArray(data) ? data : data.plans; if (!Array.isArray(plans)) throw new Error('AI response must contain a plans array'); return plans; }
  async generateForScene(input: OutfitGenerationInput, scene: SceneRequest, deps: { clothing: ClothingDataService; weather: WeatherService }) { const [weather] = await deps.weather.getForecast(input.city, 1); const wardrobe = await deps.clothing.getAvailableItems(); const prompt = buildOutfitPrompt({ style: 'minimal_workwear', userProfile: JSON.stringify(input.profile), occasion: scene.scene, weather: JSON.stringify(weather), wardrobe }); const [plan] = await this.call(prompt, input, scene, weather, wardrobe); if (!plan) throw new Error('AI response returned no outfit plan'); return plan; }
  async generateWeek(input: OutfitGenerationInput, deps: { clothing: ClothingDataService; weather: WeatherService }) { const weather = await deps.weather.getForecast(input.city, 7); const wardrobe = await deps.clothing.getAvailableItems(); return this.call(buildOutfitPrompt({ style: 'minimal_workwear', userProfile: JSON.stringify(input.profile), occasion: '一周安排', weather: JSON.stringify(weather), wardrobe }), input, input.scenes[0] ?? { scene: '上班' }, weather, wardrobe); }
}
export function isAiConfigured() { return Boolean(endpoint()); }

