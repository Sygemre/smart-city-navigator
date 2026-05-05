import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Venue } from "./placesApi";

type CacheRecord = {
  createdAt: number;
  venues: Venue[];
};

const MEMORY_CACHE = new Map<string, CacheRecord>();
const STORAGE_PREFIX = "places-cache-v1:";

export async function getCachedVenues(cacheKey: string, ttlMs: number): Promise<Venue[] | null> {
  const memoryHit = MEMORY_CACHE.get(cacheKey);
  if (memoryHit && Date.now() - memoryHit.createdAt < ttlMs) {
    return memoryHit.venues;
  }

  const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}${cacheKey}`);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheRecord;
    if (!parsed?.createdAt || !Array.isArray(parsed.venues)) {
      return null;
    }

    if (Date.now() - parsed.createdAt > ttlMs) {
      await AsyncStorage.removeItem(`${STORAGE_PREFIX}${cacheKey}`);
      return null;
    }

    MEMORY_CACHE.set(cacheKey, parsed);
    return parsed.venues;
  } catch {
    return null;
  }
}

export async function setCachedVenues(cacheKey: string, venues: Venue[]) {
  const record: CacheRecord = {
    createdAt: Date.now(),
    venues
  };

  MEMORY_CACHE.set(cacheKey, record);
  await AsyncStorage.setItem(`${STORAGE_PREFIX}${cacheKey}`, JSON.stringify(record));
}

export async function clearPlacesCacheStorage() {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
  if (cacheKeys.length > 0) {
    await AsyncStorage.multiRemove(cacheKeys);
  }
  MEMORY_CACHE.clear();
}

export function getPlacesMemoryCacheSize() {
  return MEMORY_CACHE.size;
}
