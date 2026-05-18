export type CityDocument = {
  id: string; // plaka kodu: 01-81
  name: string;
  districts: string[];
  region: string;
};

export type UserFavoriteVenueDocument = {
  userId: string;
  venueId: string;
  venueName: string;
  city: string;
  district: string;
  createdAt: number;
};

export type UserRouteDocument = {
  userId: string;
  city: string;
  district: string;
  totalMinutes: number;
  totalDistanceMeters: number;
  stopCount: number;
  stops: Array<{
    venueId: string;
    venueName: string;
    visitMinutes: number;
    order: number;
  }>;
  createdAt: number;
};
