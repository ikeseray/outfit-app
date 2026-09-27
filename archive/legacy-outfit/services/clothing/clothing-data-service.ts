import type { ClothingItem } from "@/domain/types";
export interface ClothingDataService { listItems(): Promise<ClothingItem[]>; getAvailableItems(): Promise<ClothingItem[]>; getItem(id: string): Promise<ClothingItem | null>; }

