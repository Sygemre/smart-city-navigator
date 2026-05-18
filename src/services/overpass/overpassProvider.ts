import type { Venue, VenueCategory } from "../venueTypes";
import { queryOverpass } from "./overpassClient";
import { mapOverpassElementToVenue } from "./overpassMapper";
import { buildOverpassQuery, supportsOverpassCategories } from "./overpassQuery";

export type FetchOverpassVenuesParams = {
  lat: number;
  lng: number;
  city: string;
  district?: string;
  categories: VenueCategory[];
};

export async function fetchOverpassVenues(params: FetchOverpassVenuesParams): Promise<Venue[]> {
  if (!Array.isArray(params.categories) || params.categories.length === 0) return [];
  if (!supportsOverpassCategories(params.categories)) return [];

  const lat = Number(params.lat);
  const lng = Number(params.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

  const overpassQl = buildOverpassQuery(lat, lng, params.categories);
  if (!overpassQl) return [];

  const response = await queryOverpass(overpassQl);
  const elements = response?.elements;
  if (!Array.isArray(elements) || elements.length === 0) return [];

  const district = params.district?.trim() || params.city?.trim() || "Merkez";
  const unique = new Map<string, Venue>();

  for (const element of elements) {
    const venue = mapOverpassElementToVenue(element, params.categories, district);
    if (venue?.id && !unique.has(venue.id)) {
      unique.set(venue.id, venue);
    }
  }

  return Array.from(unique.values());
}
