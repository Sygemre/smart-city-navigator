import type { Venue } from "../services/venueTypes";
import { toDisplayText } from "./displayText";

export function getVenueListKey(venue: Venue, index: number): string {
  const id = toDisplayText(venue.id, "");
  if (id.length > 0) return id;

  const placeId = toDisplayText((venue as { place_id?: unknown }).place_id, "");
  if (placeId.length > 0) return placeId;

  return `venue-${index}`;
}
