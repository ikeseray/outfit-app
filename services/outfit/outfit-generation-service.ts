import type { ClothingDataService } from "@/services/clothing/clothing-data-service";
import type { WeatherService } from "@/services/weather/weather-service";
import type { OutfitPlan, SceneRequest, StyleProfile, UserProfile } from "@/domain/types";
export interface OutfitGenerationInput { city: string; profile: UserProfile; styles: StyleProfile; scenes: SceneRequest[]; }
export interface OutfitGenerationService { generateWeek(input: OutfitGenerationInput, deps: { clothing: ClothingDataService; weather: WeatherService }): Promise<OutfitPlan[]>; generateForScene(input: OutfitGenerationInput, scene: SceneRequest, deps: { clothing: ClothingDataService; weather: WeatherService }): Promise<OutfitPlan>; }

