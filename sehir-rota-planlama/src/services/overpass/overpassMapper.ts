import type { Venue, VenueCategory } from "../venueTypes";
import { CATEGORY_TO_VISIT_MINUTES } from "../venueTypes";
import type { OverpassElement } from "./types";

const DEFAULT_OSM_RATING = 3.8;

function isRecord(value: unknown): value is Record<string, string> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getElementCoordinates(element: OverpassElement): { lat: number; lng: number } | null {
  if (element.lat != null && element.lon != null) {
    const lat = Number(element.lat);
    const lng = Number(element.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  if (element.center?.lat != null && element.center?.lon != null) {
    const lat = Number(element.center.lat);
    const lng = Number(element.center.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  return null;
}

function getPlaceName(tags: Record<string, string>): string | null {
  const candidates = [tags.name, tags["name:tr"], tags["name:en"]];
  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return null;
}

function getOsmPhotoUrl(tags: Record<string, string>): string | undefined {
  const image =
    tags.image ??
    tags["image:url"] ??
    tags.wikimedia_commons ??
    tags["wikimedia_commons:image"];

  if (typeof image !== "string") return undefined;

  const trimmed = image.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("File:")) {
    const fileName = encodeURIComponent(trimmed.replace(/^File:/, ""));
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}`;
  }

  return undefined;
}

function getOsmDistrict(tags: Record<string, string>, fallbackDistrict: string): string {
  const parts = [
    tags["addr:neighbourhood"],
    tags["addr:suburb"],
    tags["addr:district"],
    tags["addr:city"],
    tags["addr:street"]
  ]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .map((part) => part.trim());

  if (parts.length > 0) return parts.join(", ");
  return fallbackDistrict?.trim() || "Merkez";
}

export function mapOsmTagsToCategory(tags: Record<string, string>): VenueCategory | null {
  const amenity = tags.amenity ?? "";
  if (/restaurant|cafe|fast_food|bar|biergarten|food_court/.test(amenity)) {
    return "gastronomi";
  }

  if (tags.historic) return "tarih";

  const tourism = tags.tourism ?? "";
  if (/museum|attraction|artwork|gallery/.test(tourism)) return "tarih";

  const leisure = tags.leisure ?? "";
  if (/park|nature_reserve/.test(leisure)) return "doga";

  return null;
}

export function mapOverpassElementToVenue(
  element: OverpassElement | null | undefined,
  selectedCategories: VenueCategory[],
  district: string
): Venue | null {
  if (!element || element.id == null) return null;

  const tags = element.tags;
  if (!isRecord(tags)) return null;

  const name = getPlaceName(tags);
  if (!name) return null;

  const category = mapOsmTagsToCategory(tags);
  if (!category || !selectedCategories.includes(category)) return null;

  const coords = getElementCoordinates(element);
  if (!coords) return null;

  const visitMinutes = CATEGORY_TO_VISIT_MINUTES[category];
  if (typeof visitMinutes !== "number" || !Number.isFinite(visitMinutes)) return null;

  const safeDistrict = getOsmDistrict(tags, district);
  const elementType = element.type ?? "node";

  return {
    id: `osm-${elementType}-${element.id}`,
    name,
    lat: coords.lat,
    lng: coords.lng,
    averageVisitMinutes: visitMinutes,
    rating: DEFAULT_OSM_RATING,
    category,
    district: safeDistrict,
    photoUrl: getOsmPhotoUrl(tags),
    source: "osm"
  };
}
