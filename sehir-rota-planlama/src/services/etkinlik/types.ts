export type EtkinlikSlugRef = {
  id: number;
  name: string;
  slug: string;
};

export type EtkinlikVenue = {
  id: number;
  name: string;
  slug: string;
  lat: string | number;
  lng: string | number;
  city?: EtkinlikSlugRef;
  district?: EtkinlikSlugRef;
  address?: string;
};

export type EtkinlikEvent = {
  id: number;
  name: string;
  slug: string;
  url: string;
  start: string;
  end: string;
  poster_url?: string;
  format?: EtkinlikSlugRef;
  category?: EtkinlikSlugRef;
  venue?: EtkinlikVenue | null;
};

export type EtkinlikEventsResponse = {
  items: EtkinlikEvent[];
  meta?: {
    total?: number;
    skip?: number;
    take?: number;
  };
};

export type EtkinlikCity = {
  id: number;
  name: string;
  slug: string;
};
