import React from "react";
import styled from "styled-components/native";
import type { PlannedStop } from "../services/routePlanner";
import {
  formatRating,
  hasNonEmptyString,
  toDisplayNumber,
  toDisplayText
} from "../utils/displayText";

type Props = {
  stop: PlannedStop;
  onDirections: (name: string, lat: number, lng: number) => void;
  onEventDetail: (url: string) => void;
};

function formatEventDate(isoDate: unknown): string {
  const value = toDisplayText(isoDate, "");
  if (value.length === 0) return "";

  try {
    const formatted = new Date(value).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
    return formatted === "Invalid Date" ? "" : formatted;
  } catch {
    return "";
  }
}

function getVenuePhotoUri(photoUrl: unknown): string {
  return hasNonEmptyString(photoUrl)
    ? photoUrl.trim()
    : "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=600&q=70";
}

export function PlaceCard({ stop, onDirections, onEventDetail }: Props) {
  const venue = stop.venue;
  const venueName = toDisplayText(venue.name, "Mekan");
  const district = toDisplayText(venue.district, "Merkez");
  const visitMinutes = toDisplayNumber(stop.visitMinutes, 0);
  const rating = toDisplayNumber(venue.rating, 0);
  const hasRating = rating > 0;
  const eventDateText = hasNonEmptyString(venue.eventStartsAt)
    ? formatEventDate(venue.eventStartsAt)
    : "";
  const hasEventDate = eventDateText.length > 0;
  const externalUrl = hasNonEmptyString(venue.externalUrl) ? venue.externalUrl.trim() : "";
  const hasExternalUrl = externalUrl.length > 0;

  const travelMinutes = toDisplayNumber(stop.travelMinutes, 0);
  const travelDistance = Math.round(toDisplayNumber(stop.travelDistanceMeters, 0));
  const startOffset = toDisplayNumber(stop.startMinuteOffset, 0);
  const stepOrder = toDisplayNumber(stop.order, 0);

  const baseMetaLine = `${district} - ${visitMinutes} dk`;
  const routeLine = `Yuru ${travelMinutes} dk (${travelDistance} m) - Baslangic +${startOffset} dk`;

  return (
    <Card>
      <VenuePhoto source={{ uri: getVenuePhotoUri(venue.photoUrl) }} />
      <CardBody>
        <StepBadge>{`Adim ${stepOrder}`}</StepBadge>
        <VenueTitle>{venueName}</VenueTitle>
        <Meta>{baseMetaLine}</Meta>
        {hasRating ? <Meta>{`⭐ ${formatRating(rating)}`}</Meta> : null}
        {hasEventDate ? <Meta>{eventDateText}</Meta> : null}
        <RouteMeta>{routeLine}</RouteMeta>
        {hasExternalUrl ? (
          <DetailButton onPress={() => onEventDetail(externalUrl)}>
            <DetailButtonLabel>Etkinlik Detayi</DetailButtonLabel>
          </DetailButton>
        ) : null}
        <DirectionsButton
          onPress={() =>
            onDirections(
              venueName,
              toDisplayNumber(venue.lat, 0),
              toDisplayNumber(venue.lng, 0)
            )
          }
        >
          <DirectionsButtonLabel>Yol Tarifi Al</DirectionsButtonLabel>
        </DirectionsButton>
      </CardBody>
    </Card>
  );
}

const Card = styled.View`
  border-radius: 10px;
  border-width: 1px;
  border-color: #2a2f3e;
  overflow: hidden;
  margin-bottom: 10px;
  background-color: #1c2130;
`;

const VenuePhoto = styled.Image`
  width: 100%;
  height: 120px;
`;

const CardBody = styled.View`
  padding: 10px 12px;
`;

const StepBadge = styled.Text`
  align-self: flex-start;
  padding: 3px 8px;
  border-radius: 999px;
  background-color: rgba(255, 92, 53, 0.15);
  color: #ff5c35;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
`;

const VenueTitle = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
`;

const Meta = styled.Text`
  color: #a0a0a0;
  font-size: 12px;
  margin-top: 4px;
`;

const RouteMeta = styled.Text`
  color: #8cc8ff;
  font-size: 12px;
  margin-top: 6px;
`;

const DetailButton = styled.TouchableOpacity`
  margin-top: 10px;
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 10px;
  background-color: rgba(255, 92, 53, 0.15);
  border-width: 1px;
  border-color: rgba(255, 92, 53, 0.45);
`;

const DetailButtonLabel = styled.Text`
  color: #ff5c35;
  font-size: 12px;
  font-weight: 700;
`;

const DirectionsButton = styled.TouchableOpacity`
  margin-top: 8px;
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 10px;
  background-color: rgba(30, 207, 176, 0.18);
  border-width: 1px;
  border-color: rgba(30, 207, 176, 0.45);
`;

const DirectionsButtonLabel = styled.Text`
  color: #1ecfb0;
  font-size: 12px;
  font-weight: 700;
`;
