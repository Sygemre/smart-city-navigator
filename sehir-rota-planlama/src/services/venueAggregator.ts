import { normalizeVenue } from "../utils/normalizeVenue";
import { calculateDistanceMeters, normalizeName } from "./geoUtils";
import type { Venue } from "./venueTypes";

const DEDUP_DISTANCE_METERS = 80;
const MAX_VENUES = 25;

function isSameVenue(a: Venue, b: Venue): boolean {
  const dist = calculateDistanceMeters(a.lat, a.lng, b.lat, b.lng);
  if (dist > DEDUP_DISTANCE_METERS) return false;

  const na = normalizeName(a.name);
  const nb = normalizeName(b.name);
  if (!na || !nb) return false;

  return na === nb || na.includes(nb) || nb.includes(na);
}

function mergeVenueGroup(group: Venue[]): Venue {
  const google = group.find((v) => v.source === "google");
  const etkinlik = group.find((v) => v.source === "etkinlik");
  const osm = group.find((v) => v.source === "osm");
  const base = google ?? etkinlik ?? osm ?? group[0];

  const ratings = group
    .map((v) => v.rating)
    .filter((rating): rating is number => typeof rating === "number" && Number.isFinite(rating));

  return {
    ...base,
    rating: ratings.length > 0 ? Math.max(...ratings) : base.rating ?? 4.0,
    photoUrl: google?.photoUrl ?? etkinlik?.photoUrl ?? osm?.photoUrl ?? base.photoUrl,
    externalUrl: etkinlik?.externalUrl ?? base.externalUrl,
    eventStartsAt: etkinlik?.eventStartsAt ?? base.eventStartsAt,
    source: google?.source ?? etkinlik?.source ?? osm?.source ?? base.source
  };
}

function deduplicateVenues(venues: Venue[]): Venue[] {
  const groups: Venue[][] = [];

  for (const venue of venues) {
    let placed = false;
    for (const group of groups) {
      if (group.some((existing) => isSameVenue(existing, venue))) {
        group.push(venue);
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push([venue]);
    }
  }

  return groups.map(mergeVenueGroup).map(normalizeVenue);
}

export function sortVenuesByDistanceAndRating(
  venues: Venue[],
  lat: number,
  lng: number
): Venue[] {
  return [...venues].sort((a, b) => {
    const distanceA = calculateDistanceMeters(lat, lng, a.lat, a.lng);
    const distanceB = calculateDistanceMeters(lat, lng, b.lat, b.lng);
    if (Math.abs(distanceA - distanceB) < 150) {
      return b.rating - a.rating;
    }
    return distanceA - distanceB;
  });
}

export function mergeVenueLists(
  lists: Venue[][],
  origin: { lat: number; lng: number }
): Venue[] {
  const combined = lists.flat();
  const deduped = deduplicateVenues(combined);
  return sortVenuesByDistanceAndRating(deduped, origin.lat, origin.lng).slice(0, MAX_VENUES);
}
