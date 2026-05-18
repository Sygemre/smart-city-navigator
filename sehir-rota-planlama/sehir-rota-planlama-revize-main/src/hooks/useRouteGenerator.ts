import { useCallback, useState } from "react";
import type { VenueCategory } from "../services/placesApi";
import { buildFallbackVenues, fetchNearbyVenues, PlacesApiError } from "../services/placesApi";
import { buildDynamicRoute, type PlannedRoute } from "../services/routePlanner";

type GenerateRouteInput = {
  lat: number;
  lng: number;
  city: string;
  district?: string;
  totalMinutes: number;
  categories: VenueCategory[];
};

export function useRouteGenerator() {
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<PlannedRoute | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const generateRoute = useCallback(async (input: GenerateRouteInput) => {
    try {
      setLoading(true);
      setError(null);
      setWarning(null);

      let venues = await fetchNearbyVenues({
        lat: input.lat,
        lng: input.lng,
        city: input.city,
        district: input.district,
        categories: input.categories
      });

      if (venues.length < 3) {
        const fallback = buildFallbackVenues({
          lat: input.lat,
          lng: input.lng,
          district: input.district
        });
        venues = [...venues, ...fallback];
        setWarning("Canli veride az sonuc bulundu. Rota kismi ornek verilerle tamamlandi.");
      }

      const planned = buildDynamicRoute({
        startLat: input.lat,
        startLng: input.lng,
        totalAvailableMinutes: input.totalMinutes,
        venues,
        selectedCategories: input.categories
      });

      setRoute(planned);
      return planned;
    } catch (e) {
      if (e instanceof PlacesApiError && ["LIMIT", "NETWORK", "API"].includes(e.code)) {
        const fallback = buildFallbackVenues({
          lat: input.lat,
          lng: input.lng,
          district: input.district
        });
        const plannedFallback = buildDynamicRoute({
          startLat: input.lat,
          startLng: input.lng,
          totalAvailableMinutes: input.totalMinutes,
          venues: fallback,
          selectedCategories: input.categories
        });
        setRoute(plannedFallback);
        setWarning(`${e.message} Gecici olarak ornek mekanlar gosteriliyor.`);
        return plannedFallback;
      }

      const msg = e instanceof Error ? e.message : "Rota olusturulamadi.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    route,
    error,
    warning,
    generateRoute
  };
}
