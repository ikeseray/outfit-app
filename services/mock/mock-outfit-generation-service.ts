import type { OutfitGenerationInput, OutfitGenerationService } from "@/services/outfit/outfit-generation-service";
import type { ClothingDataService } from "@/services/clothing/clothing-data-service";
import type { WeatherService } from "@/services/weather/weather-service";
import type { OutfitPlan, SceneRequest } from "@/domain/types";
export class MockOutfitGenerationService implements OutfitGenerationService {
  async generateWeek(input: OutfitGenerationInput, deps: { clothing: ClothingDataService; weather: WeatherService }) { const weather = await deps.weather.getForecast(input.city, 7); const items = await deps.clothing.getAvailableItems(); return weather.map((day, i) => this.plan(day, input.scenes[i] ?? { scene: "上班" }, items, input)); }
  async generateForScene(input: OutfitGenerationInput, scene: SceneRequest, deps: { clothing: ClothingDataService; weather: WeatherService }) { const [weather] = await deps.weather.getForecast(input.city, 1); return this.plan(weather, scene, await deps.clothing.getAvailableItems(), input); }
  private plan(weather: OutfitPlan["weather"], scene: SceneRequest, items: Awaited<ReturnType<ClothingDataService["getAvailableItems"]>>, input: OutfitGenerationInput): OutfitPlan { const pick = (category: OutfitPlan["slots"][number]["category"]) => items.find(i => i.category === category) ?? null; const slots = (["top", "bottom", "outerwear", "shoes"] as const).map(category => ({ category, item: pick(category) })); const gaps = slots.filter(s => !s.item).map(s => s.category); const reason = input.profile.explanationMode === "mood" ? `柔和配色适合${scene.scene}的氛围，整体感觉清爽、自然。` : `这套搭配结合了${weather.feelsLikeC}°体感温度和${scene.scene}场景，版型利落，方便活动。`; return { date: weather.date, weather, scene, slots, scores: { style: 86, weather: weather.rainProbability > 50 ? 68 : 91, scene: 88, warmth: 72, activity: 84 }, reason, gaps }; }
}

