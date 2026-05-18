import {
  clearPlacesCacheStorage,
  getCachedVenues,
  getPlacesMemoryCacheSize,
  setCachedVenues
} from "./placesCache";

export type VenueCategory = "sanat" | "tiyatro" | "muzik" | "gastronomi" | "tarih" | "doga";

export type Venue = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  averageVisitMinutes: number;
  rating: number;
  category: VenueCategory;
  district: string;
  photoUrl?: string;
};

const CACHE_TTL_MS = 10 * 60 * 1000;

const CATEGORY_TO_VISIT_MINUTES: Record<VenueCategory, number> = {
  sanat: 90, tiyatro: 120, muzik: 100, gastronomi: 70, tarih: 80, doga: 60
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const earthRadius = 6371000;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchGooglePlacesTextSearch(params: {
  city: string;
  category: VenueCategory;
  apiKey: string;
}) {
  const query = encodeURIComponent(`${params.city} ${params.category}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=tr&key=${params.apiKey}`;

  try {
    const response = await fetch(url);
    const payload = await response.json();
    if (payload.status === "OK") return payload.results;
    return [];
  } catch (err) {
    return [];
  }
}

export async function fetchNearbyVenues(params: {
  lat: number;
  lng: number;
  city: string;
  district?: string;
  categories: VenueCategory[];
}): Promise<Venue[]> {
  
  const cacheKey = `places-${params.city}-${params.categories.sort().join("-")}`;
  const cacheHit = await getCachedVenues(cacheKey, CACHE_TTL_MS);
  
  if (cacheHit && cacheHit.length > 0) return cacheHit;

  const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  const uniqueVenues = new Map<string, Venue>();

  if (!googleApiKey) return buildFallbackVenues();

  // Her secili kategori icin ayri Google Places sorgusu at ve sonuclari tek listede birlestir.
  const byCategoryResults = await Promise.all(
    params.categories.map(async (category) => {
      const results = await fetchGooglePlacesTextSearch({
        city: params.city,
        category,
        apiKey: googleApiKey
      });

      return results.map((result: any) => ({
        id: result.place_id,
        name: result.name,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        averageVisitMinutes: CATEGORY_TO_VISIT_MINUTES[category],
        rating: result.rating || 4.0,
        category,
        district: params.city,
        photoUrl: result.photos?.[0]?.photo_reference
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${result.photos[0].photo_reference}&key=${googleApiKey}`
          : undefined
      } as Venue));
    })
  );

  byCategoryResults.flat().forEach((venue) => {
    if (uniqueVenues.has(venue.id)) {
      return;
    }
    uniqueVenues.set(venue.id, venue);
  });

  const venues = Array.from(uniqueVenues.values())
    .sort((a, b) => {
      const distanceA = calculateDistanceMeters(params.lat, params.lng, a.lat, a.lng);
      const distanceB = calculateDistanceMeters(params.lat, params.lng, b.lat, b.lng);
      if (Math.abs(distanceA - distanceB) < 150) {
        return b.rating - a.rating;
      }
      return distanceA - distanceB;
    })
    .slice(0, 25);

  if (venues.length === 0) return buildFallbackVenues();

  await setCachedVenues(cacheKey, venues);
  return venues;
}

export function buildFallbackVenues(): Venue[] {
  return [{
      id: "fallback-1",
      name: "Merkezi Kültür Alanı",
      lat: 0, lng: 0,
      averageVisitMinutes: 60,
      rating: 4.5,
      category: "sanat",
      district: "Merkez"
  }];
}

export async function clearPlacesCache() { await clearPlacesCacheStorage(); }
export function getPlacesCacheSize() { return getPlacesMemoryCacheSize(); }