import type { VenueCategory } from "../venueTypes";

const DEFAULT_RADIUS_METERS = 4000;
const RESULT_LIMIT = 45;

export function buildOverpassQuery(
  lat: number,
  lng: number,
  categories: VenueCategory[],
  radiusMeters = DEFAULT_RADIUS_METERS
): string | null {
  const blocks: string[] = [];

  if (categories.includes("gastronomi")) {
    blocks.push(
      `node["amenity"~"restaurant|cafe|fast_food"](around:${radiusMeters},${lat},${lng});`,
      `way["amenity"~"restaurant|cafe|fast_food"](around:${radiusMeters},${lat},${lng});`
    );
  }

  if (categories.includes("tarih")) {
    blocks.push(
      `node["historic"](around:${radiusMeters},${lat},${lng});`,
      `way["historic"](around:${radiusMeters},${lat},${lng});`,
      `node["tourism"~"museum|attraction"](around:${radiusMeters},${lat},${lng});`,
      `way["tourism"~"museum|attraction"](around:${radiusMeters},${lat},${lng});`
    );
  }

  if (blocks.length === 0) return null;

  return `[out:json][timeout:25];(\n${blocks.join("\n")}\n);out center ${RESULT_LIMIT};`;
}

export function supportsOverpassCategories(categories: VenueCategory[]) {
  return categories.some((c) => c === "gastronomi" || c === "tarih");
}
