export type VenueCategory = "sanat" | "tiyatro" | "muzik" | "gastronomi" | "tarih" | "doga";

export type VenueSource = "google" | "etkinlik" | "osm";

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
  source?: VenueSource;
  externalUrl?: string;
  eventStartsAt?: string;
};

export const CATEGORY_TO_VISIT_MINUTES: Record<VenueCategory, number> = {
  sanat: 90,
  tiyatro: 120,
  muzik: 100,
  gastronomi: 70,
  tarih: 80,
  doga: 60
};
