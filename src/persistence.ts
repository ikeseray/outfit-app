import { createInitialData } from './domain.ts';
import { DEFAULT_HOME_GREETING, DEFAULT_HOME_NOTE, normalizeRoomLayout } from './domain.ts';
import type { Category, Container, Home, Item, Room, WardrobeItem } from './domain.ts';

export type Snapshot = { homes: Home[]; rooms: Room[]; containers: Container[]; items: Item[]; categories: Category[]; wardrobeItems?: WardrobeItem[] };
export const emptySnapshot = (): Snapshot => createInitialData();

export function encodeSnapshot(snapshot: Snapshot) { return JSON.stringify(snapshot); }
export function decodeSnapshot(value: string): Snapshot {
  const parsed = JSON.parse(value);
  if (!isSnapshot(parsed)) throw new Error('Invalid snapshot');
  return {
    ...parsed,
    homes: parsed.homes.map(home => ({ ...home, greeting: home.greeting ?? DEFAULT_HOME_GREETING, note: home.note ?? DEFAULT_HOME_NOTE })),
    // Layout was introduced after the first release. Missing or malformed values
    // are upgraded to the backwards-compatible 8×8 room size.
    rooms: parsed.rooms.map(room => ({ ...room, layout: normalizeRoomLayout(room.layout, room.kind === 'walk-in-closet' ? 6 : 8) })),
    containers: parsed.containers.map(container => ({ ...container, cells: [...new Set(container.cells)] })),
    ...(Array.isArray(parsed.wardrobeItems) ? { wardrobeItems: parsed.wardrobeItems } : {}),
  };
}
function isSnapshot(value: unknown): value is Snapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Snapshot>;
  return Array.isArray(candidate.homes) && Array.isArray(candidate.rooms) && Array.isArray(candidate.containers) && Array.isArray(candidate.items) && Array.isArray(candidate.categories)
    && candidate.rooms.every(room => room && typeof room.id === 'string' && typeof room.homeId === 'string' && (!room.layout || (Number.isFinite(room.layout.rows) && Number.isFinite(room.layout.cols))));
}
export function migrateSnapshot(value: string | null | undefined): Snapshot {
  if (!value) return emptySnapshot();
  try { return decodeSnapshot(value); } catch { return emptySnapshot(); }
}
