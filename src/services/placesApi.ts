import {
  clearPlacesCacheStorage,
  getCachedVenues,
  getPlacesMemoryCacheSize,
  setCachedVenues
} from "./placesCache";
import { fetchEtkinlikVenues } from "./etkinlik/etkinlikProvider";
import { fetchGoogleVenues } from "./googlePlacesProvider";
import { fetchOverpassVenues } from "./overpass/overpassProvider";
import { normalizeVenue } from "../utils/normalizeVenue";
import { mergeVenueLists } from "./venueAggregator";

export type { Venue, VenueCategory, VenueSource } from "./venueTypes";
export { CATEGORY_TO_VISIT_MINUTES } from "./venueTypes";
import type { Venue, VenueCategory } from "./venueTypes";

export class PlacesApiError extends Error {
  constructor(
    message: string,
    public code: "LIMIT" | "NETWORK" | "API" | "PARTIAL"
  ) {
    super(message);
    this.name = "PlacesApiError";
  }
}

const CACHE_TTL_MS = 10 * 60 * 1000;

export type FetchNearbyVenuesParams = {
  lat: number;
  lng: number;
  city: string;
  district?: string;
  categories: VenueCategory[];
};

export async function fetchNearbyVenues(params: FetchNearbyVenuesParams): Promise<Venue[]> {
  const cacheKey = `places-v3-${params.city}-${params.lat.toFixed(3)}-${params.lng.toFixed(3)}-${params.categories.sort().join("-")}`;
  const cacheHit = await getCachedVenues(cacheKey, CACHE_TTL_MS);

  if (cacheHit && cacheHit.length > 0) return cacheHit.map(normalizeVenue);

  const [googleResult, etkinlikResult, overpassResult] = await Promise.allSettled([
    fetchGoogleVenues({ city: params.city, categories: params.categories }),
    fetchEtkinlikVenues({
      city: params.city,
      district: params.district,
      categories: params.categories
    }),
    fetchOverpassVenues({
      lat: params.lat,
      lng: params.lng,
      city: params.city,
      district: params.district,
      categories: params.categories
    })
  ]);

  const lists: Venue[][] = [];

  if (googleResult.status === "fulfilled") {
    lists.push(googleResult.value);
  }

  if (etkinlikResult.status === "fulfilled") {
    lists.push(etkinlikResult.value);
  }

  if (overpassResult.status === "fulfilled") {
    lists.push(overpassResult.value);
  }

  let venues =
    lists.length > 0
      ? mergeVenueLists(lists, { lat: params.lat, lng: params.lng })
      : [];

  if (venues.length === 0) {
    const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      return buildFallbackVenues({
        lat: params.lat,
        lng: params.lng,
        district: params.district ?? params.city
      });
    }
    return buildFallbackVenues({
      lat: params.lat,
      lng: params.lng,
      district: params.district ?? params.city
    });
  }

  const normalizedVenues = venues.map(normalizeVenue);
  await setCachedVenues(cacheKey, normalizedVenues);
  return normalizedVenues;
}

export function buildFallbackVenues(params?: {
  lat: number;
  lng: number;
  district?: string;
}): Venue[] {
  const lat = params?.lat ?? 41.0082;
  const lng = params?.lng ?? 28.9784;
  const district = params?.district ?? "Merkez";

  return [
    normalizeVenue({
      id: "fallback-1",
      name: "Merkezi Kultur Alani",
      lat: lat + 0.002,
      lng: lng + 0.001,
      averageVisitMinutes: 60,
      rating: 4.5,
      category: "sanat",
      district
    }),
    normalizeVenue({
      id: "fallback-2",
      name: "Sehir Parki",
      lat: lat - 0.001,
      lng: lng + 0.002,
      averageVisitMinutes: 45,
      rating: 4.2,
      category: "doga",
      district
    }),
    normalizeVenue({
      id: "fallback-3",
      name: "Yerel Gastronomi Noktasi",
      lat: lat + 0.001,
      lng: lng - 0.002,
      averageVisitMinutes: 70,
      rating: 4.4,
      category: "gastronomi",
      district
    })
  ];
}

export async function clearPlacesCache() {
  await clearPlacesCacheStorage();
}

export function getPlacesCacheSize() {
  return getPlacesMemoryCacheSize();
}
