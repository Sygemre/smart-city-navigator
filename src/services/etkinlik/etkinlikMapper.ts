import type { Venue, VenueCategory } from "../venueTypes";
import { CATEGORY_TO_VISIT_MINUTES } from "../venueTypes";
import { toDisplayText } from "../../utils/displayText";
import type { EtkinlikEvent, EtkinlikVenue } from "./types";

const EVENT_RELEVANT_CATEGORIES: VenueCategory[] = ["sanat", "tiyatro", "muzik"];

export function hasEventRelevantCategory(categories: VenueCategory[]) {
  return categories.some((c) => EVENT_RELEVANT_CATEGORIES.includes(c));
}

function resolveVenueDistrict(venue: EtkinlikVenue, fallback: string): string {
  const fromDistrict = toDisplayText(venue.district, "");
  if (fromDistrict) return fromDistrict;

  const fromCity = toDisplayText(venue.city, "");
  if (fromCity) return fromCity;

  const fromAddress = typeof venue.address === "string" ? venue.address.trim() : "";
  if (fromAddress) return fromAddress;

  return toDisplayText(fallback, "Merkez");
}

function parseCoordinate(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

function mapSlugToCategory(
  slug: string | undefined,
  name: string | undefined,
  fallback: VenueCategory
): VenueCategory {
  const text = `${slug ?? ""} ${name ?? ""}`.toLowerCase();

  if (/konser|muzik|festival|dj|rock|pop|jazz/.test(text)) return "muzik";
  if (/tiyatro|sahne|oyun|bale|opera/.test(text)) return "tiyatro";
  if (/sergi|sanat|galeri|muzee|museum|bienal/.test(text)) return "sanat";

  return fallback;
}

export function mapEtkinlikEventToVenue(
  event: EtkinlikEvent,
  selectedCategories: VenueCategory[],
  district: string
): Venue | null {
  const venue = event.venue;
  if (!venue) return null;

  const eventName = typeof event.name === "string" ? event.name.trim() : "";
  if (!eventName) return null;

  const lat = parseCoordinate(venue.lat);
  const lng = parseCoordinate(venue.lng);
  if (lat === null || lng === null) return null;

  const fallbackCategory =
    selectedCategories.find((c) => EVENT_RELEVANT_CATEGORIES.includes(c)) ?? "sanat";

  const category = mapSlugToCategory(
    event.category?.slug ?? event.format?.slug,
    event.category?.name ?? event.format?.name,
    fallbackCategory
  );

  if (!selectedCategories.includes(category)) {
    return null;
  }

  const visitMinutes = CATEGORY_TO_VISIT_MINUTES[category];
  if (typeof visitMinutes !== "number" || !Number.isFinite(visitMinutes)) return null;

  return {
    id: `etkinlik-${event.id}`,
    name: eventName,
    lat,
    lng,
    averageVisitMinutes: visitMinutes,
    rating: 4.3,
    category,
    district: resolveVenueDistrict(venue, district),
    photoUrl: typeof event.poster_url === "string" ? event.poster_url : undefined,
    externalUrl: typeof event.url === "string" ? event.url : undefined,
    eventStartsAt: typeof event.start === "string" ? event.start : undefined,
    source: "etkinlik"
  };
}
