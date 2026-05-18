import type { Venue } from "../services/venueTypes";
import { hasNonEmptyString, toDisplayNumber, toDisplayText } from "./displayText";

export function normalizeVenue(venue: Venue): Venue {
  return {
    ...venue,
    id: toDisplayText(venue.id, `venue-${venue.lat}-${venue.lng}`),
    name: toDisplayText(venue.name, "Mekan"),
    lat: toDisplayNumber(venue.lat, 0),
    lng: toDisplayNumber(venue.lng, 0),
    averageVisitMinutes: toDisplayNumber(venue.averageVisitMinutes, 60),
    rating: toDisplayNumber(venue.rating, 4.0),
    category: venue.category,
    district: toDisplayText(venue.district, "Merkez"),
    photoUrl: hasNonEmptyString(venue.photoUrl) ? venue.photoUrl.trim() : undefined,
    externalUrl: hasNonEmptyString(venue.externalUrl) ? venue.externalUrl.trim() : undefined,
    eventStartsAt: hasNonEmptyString(venue.eventStartsAt) ? venue.eventStartsAt.trim() : undefined,
    source: venue.source
  };
}
