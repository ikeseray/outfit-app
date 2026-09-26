import type { ClothingDataService } from "@/services/clothing/clothing-data-service";
import type { ClothingItem } from "@/domain/types";
export const mockClothingItems: ClothingItem[] = [
  { id: "top-1", name: "白色棉质衬衫", image_url: "/placeholder-shirt.svg", category: "top", color: "白色", material: "棉质", length: "常规长度", style_tags: ["简约", "通勤"], season: ["春", "秋"], formality_level: 4, activity_level: 3, status: "available", last_worn_at: null, wear_count: 1, warmth: 2 },
  { id: "bottom-1", name: "深蓝直筒长裤", image_url: "/placeholder-pants.svg", category: "bottom", color: "深蓝", material: "西装面料", length: "长款", style_tags: ["正式", "简约"], season: ["春", "秋", "冬"], formality_level: 4, activity_level: 3, status: "available", last_worn_at: null, wear_count: 0, warmth: 3 },
  { id: "shoes-1", name: "白色休闲鞋", image_url: "/placeholder-shoes.svg", category: "shoes", color: "白色", material: "皮革", length: "常规长度", style_tags: ["休闲"], season: ["春", "夏", "秋"], formality_level: 2, activity_level: 5, status: "available", last_worn_at: null, wear_count: 3, warmth: 1 },
  { id: "outer-1", name: "燕麦色针织开衫", image_url: "/placeholder-outer.svg", category: "outerwear", color: "燕麦色", material: "针织", length: "常规长度", style_tags: ["温柔", "休闲"], season: ["春", "秋"], formality_level: 2, activity_level: 3, status: "available", last_worn_at: null, wear_count: 2, warmth: 3 },
  { id: "bottom-2", name: "浅蓝直筒牛仔裤", image_url: "/placeholder-pants.svg", category: "bottom", color: "浅蓝", material: "牛仔", length: "九分", style_tags: ["休闲", "复古"], season: ["春", "夏", "秋"], formality_level: 2, activity_level: 4, status: "available", last_worn_at: null, wear_count: 4, warmth: 2 },
];
export class MockClothingDataService implements ClothingDataService { async listItems() { return mockClothingItems; } async getAvailableItems() { return mockClothingItems.filter(i => i.status === "available"); } async getItem(id: string) { return mockClothingItems.find(i => i.id === id) ?? null; } }

