import React from "react";
import styled from "styled-components/native";
import type { PlannedRoute } from "../services/routePlanner";
import { toDisplayNumber, toDisplayText } from "../utils/displayText";
import { getVenueListKey } from "../utils/venueKey";
import { PlaceCard } from "./PlaceCard";

type Props = {
  route: PlannedRoute;
  onDirections: (name: string, lat: number, lng: number) => void;
  onEventDetail: (url: string) => void;
};

export function RouteStopsList({ route, onDirections, onEventDetail }: Props) {
  const stopCount = toDisplayNumber(route.stops.length, 0);
  const distanceKm = Math.round(toDisplayNumber(route.totalDistanceMeters, 0) / 1000);
  const titleText = `${stopCount} durak - ${distanceKm} km`;

  return (
    <Container>
      <Title>{titleText}</Title>
      {route.stops.map((stop, index) => (
        <PlaceCard
          key={getVenueListKey(stop.venue, index)}
          stop={stop}
          onDirections={onDirections}
          onEventDetail={onEventDetail}
        />
      ))}
    </Container>
  );
}

const Container = styled.View`
  margin: 12px 24px 0;
  padding: 12px;
  border-radius: 10px;
  border-width: 1px;
  border-color: #2a2f3e;
  background-color: #1c2130;
`;

const Title = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
`;
