import type { Venue, VenueCategory } from "./placesApi";

export type RouteRequest = {
  startLat: number;
  startLng: number;
  totalAvailableMinutes: number;
  venues: Venue[];
  selectedCategories?: VenueCategory[];
};

export type PlannedStop = {
  order: number;
  venue: Venue;
  travelDistanceMeters: number;
  travelMinutes: number;
  visitMinutes: number;
  startMinuteOffset: number;
  endMinuteOffset: number;
};

export type PlannedRoute = {
  totalDurationMinutes: number;
  totalDistanceMeters: number;
  totalTravelMinutes: number;
  totalVisitMinutes: number;
  stops: PlannedStop[];
};

const WALKING_METERS_PER_MINUTE = 75; // Yaklasik 4.5 km/s hizda yuruyus.

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  const earthRadius = 6371000;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateStopTarget(totalMinutes: number) {
  if (totalMinutes <= 120) return 3;
  if (totalMinutes <= 360) return 4;
  return 5;
}

function clampVisitMinutes(visitMinutes: number, totalMinutes: number) {
  const minVisit = totalMinutes <= 120 ? 25 : 35;
  const maxVisit = totalMinutes >= 480 ? 120 : 90;
  return Math.max(minVisit, Math.min(maxVisit, visitMinutes));
}

function venueScore(params: {
  venue: Venue;
  currentLat: number;
  currentLng: number;
  selectedCategories: VenueCategory[];
  usedCategories: Set<VenueCategory>;
}) {
  const distanceMeters = calculateDistanceMeters(
    params.currentLat,
    params.currentLng,
    params.venue.lat,
    params.venue.lng
  );

  const ratingScore = params.venue.rating * 22;
  const distancePenalty = Math.min(45, distanceMeters / 140);
  const categoryMatchBoost = params.selectedCategories.includes(params.venue.category) ? 12 : 0;
  const categoryDiversityBoost = params.usedCategories.has(params.venue.category) ? 0 : 8;

  return ratingScore + categoryMatchBoost + categoryDiversityBoost - distancePenalty;
}

export function buildDynamicRoute(request: RouteRequest): PlannedRoute {
  const selectedCategories = request.selectedCategories ?? [];
  const targetStopCount = estimateStopTarget(request.totalAvailableMinutes);
  const remainingVenues = [...request.venues];
  const stops: PlannedStop[] = [];
  const usedCategories = new Set<VenueCategory>();

  let currentLat = request.startLat;
  let currentLng = request.startLng;
  let consumedMinutes = 0;
  let totalDistanceMeters = 0;
  let totalTravelMinutes = 0;
  let totalVisitMinutes = 0;

  while (remainingVenues.length > 0 && stops.length < targetStopCount) {
    const scored = remainingVenues
      .map((venue, idx) => ({
        idx,
        venue,
        score: venueScore({
          venue,
          currentLat,
          currentLng,
          selectedCategories,
          usedCategories
        })
      }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (!best) break;

    const travelDistanceMeters = calculateDistanceMeters(
      currentLat,
      currentLng,
      best.venue.lat,
      best.venue.lng
    );
    const travelMinutes = Math.max(5, Math.round(travelDistanceMeters / WALKING_METERS_PER_MINUTE));
    const visitMinutes = clampVisitMinutes(best.venue.averageVisitMinutes, request.totalAvailableMinutes);

    const projectedTotal = consumedMinutes + travelMinutes + visitMinutes;
    const minimumStopCount = Math.min(3, targetStopCount);
    const mustKeepAdding = stops.length < minimumStopCount - 1;

    if (projectedTotal > request.totalAvailableMinutes && !mustKeepAdding) {
      break;
    }

    const startMinuteOffset = consumedMinutes + travelMinutes;
    const endMinuteOffset = startMinuteOffset + visitMinutes;

    stops.push({
      order: stops.length + 1,
      venue: best.venue,
      travelDistanceMeters,
      travelMinutes,
      visitMinutes,
      startMinuteOffset,
      endMinuteOffset
    });

    consumedMinutes = endMinuteOffset;
    totalDistanceMeters += travelDistanceMeters;
    totalTravelMinutes += travelMinutes;
    totalVisitMinutes += visitMinutes;
    usedCategories.add(best.venue.category);
    currentLat = best.venue.lat;
    currentLng = best.venue.lng;

    remainingVenues.splice(best.idx, 1);
  }

  return {
    totalDurationMinutes: consumedMinutes,
    totalDistanceMeters: Math.round(totalDistanceMeters),
    totalTravelMinutes,
    totalVisitMinutes,
    stops
  };
}
