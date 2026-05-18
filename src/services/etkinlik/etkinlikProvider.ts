import type { Venue, VenueCategory } from "../venueTypes";
import { resolveCityId } from "./cityResolver";
import { fetchEtkinlik, getEtkinlikToken } from "./etkinlikClient";
import { hasEventRelevantCategory, mapEtkinlikEventToVenue } from "./etkinlikMapper";
import type { EtkinlikEventsResponse } from "./types";

export type FetchEtkinlikVenuesParams = {
  city: string;
  district?: string;
  categories: VenueCategory[];
};

function todayIsoDate() {
  return new Date().toISOString();
}

export async function fetchEtkinlikVenues(params: FetchEtkinlikVenuesParams): Promise<Venue[]> {
  if (!getEtkinlikToken()) return [];
  if (!hasEventRelevantCategory(params.categories)) return [];

  const cityId = await resolveCityId(params.city);
  if (cityId === null) return [];

  const response = await fetchEtkinlik<EtkinlikEventsResponse>("/events", {
    city_ids: cityId,
    start_gte: todayIsoDate(),
    take: 30,
    skip: 0
  });

  if (!response?.items?.length) return [];

  const district = params.district ?? params.city;
  const venues: Venue[] = [];

  for (const event of response.items) {
    const venue = mapEtkinlikEventToVenue(event, params.categories, district);
    if (venue) venues.push(venue);
  }

  return venues;
}
