import type { Venue, VenueCategory } from "./venueTypes";
import { CATEGORY_TO_VISIT_MINUTES } from "./venueTypes";

const DEFAULT_GOOGLE_RATING = 4.0;

type GooglePlaceResult = {
  place_id?: string;
  name?: string;
  rating?: number;
  geometry?: { location?: { lat?: number; lng?: number } };
  photos?: Array<{ photo_reference?: string }>;
};

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
    if (payload?.status === "OK" && Array.isArray(payload.results)) {
      return payload.results as GooglePlaceResult[];
    }
    return [];
  } catch {
    return [];
  }
}

function parseRating(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return DEFAULT_GOOGLE_RATING;
}

function parseCoordinates(
  location: GooglePlaceResult["geometry"]
): { lat: number; lng: number } | null {
  const lat = location?.location?.lat;
  const lng = location?.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function mapGooglePlaceToVenue(
  result: GooglePlaceResult,
  category: VenueCategory,
  city: string,
  apiKey: string
): Venue | null {
  const id = result.place_id?.trim();
  const name = result.name?.trim();
  const coords = parseCoordinates(result.geometry);

  if (!id || !name || !coords) return null;

  const visitMinutes = CATEGORY_TO_VISIT_MINUTES[category];
  if (typeof visitMinutes !== "number" || !Number.isFinite(visitMinutes)) return null;

  const photoRef = result.photos?.[0]?.photo_reference;
  const photoUrl =
    typeof photoRef === "string" && photoRef.length > 0
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`
      : undefined;

  return {
    id,
    name,
    lat: coords.lat,
    lng: coords.lng,
    averageVisitMinutes: visitMinutes,
    rating: parseRating(result.rating),
    category,
    district: city?.trim() || "Merkez",
    photoUrl,
    source: "google"
  };
}

export type FetchGoogleVenuesParams = {
  city: string;
  categories: VenueCategory[];
};

export async function fetchGoogleVenues(params: FetchGoogleVenuesParams): Promise<Venue[]> {
  const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!googleApiKey) return [];

  const city = params.city?.trim() || "Merkez";
  const uniqueVenues = new Map<string, Venue>();

  const byCategoryResults = await Promise.all(
    params.categories.map(async (category) => {
      const results = await fetchGooglePlacesTextSearch({
        city,
        category,
        apiKey: googleApiKey
      });

      return results
        .map((result) => mapGooglePlaceToVenue(result, category, city, googleApiKey))
        .filter((venue): venue is Venue => venue !== null);
    })
  );

  byCategoryResults.flat().forEach((venue) => {
    if (!uniqueVenues.has(venue.id)) {
      uniqueVenues.set(venue.id, venue);
    }
  });

  return Array.from(uniqueVenues.values());
}
