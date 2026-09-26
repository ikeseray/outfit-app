export type ClothingStatus = "available" | "washing" | "unavailable" | "donated";
export type ClothingCategory = "top" | "bottom" | "outerwear" | "shoes" | "bag" | "accessory";
export type BodyType = "梨形" | "苹果型" | "沙漏型" | "直筒型" | "倒三角型" | "梯形" | "圆身型";
export type FitPreference = "loose" | "fitted" | "regular";
export type ExplanationMode = "realistic" | "mood";
export type Scene = "上学" | "上班" | "比赛" | "开会" | "出门玩" | "约会" | "运动" | "聚会" | "旅行" | "自定义";

export interface ClothingItem {
  id: string; name: string; image_url: string; category: ClothingCategory; color: string;
  material: string; length: string; style_tags: string[]; season: string[];
  formality_level: number; activity_level: number; status: ClothingStatus;
  last_worn_at: string | null; wear_count: number; waterproof?: boolean; warmth?: number;
}
export interface UserProfile { heightCm?: number; weightKg?: number; genderExpression?: string; bodyType?: BodyType; commonScenes: Scene[]; likedColors: string[]; dislikedColors: string[]; fitPreference: FitPreference; clothingRestrictions: string[]; allowWeeklyRepeat: boolean; explanationMode: ExplanationMode; }
export interface StyleProfile { baseStyle: string; weights: Record<string, number>; preferences: Record<string, "like" | "neutral" | "dislike">; }
export interface WeatherDay { date: string; highC: number; lowC: number; condition: string; rainProbability: number; windLevel: number; feelsLikeC: number; }
export interface SceneRequest { scene: Scene; note?: string; }
export interface OutfitSlot { category: ClothingCategory; item: ClothingItem | null; }
export interface OutfitPlan { date: string; weather: WeatherDay; scene: SceneRequest; slots: OutfitSlot[]; scores: { style: number; weather: number; scene: number; warmth: number; activity: number }; reason: string; gaps: string[]; }

