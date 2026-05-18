export function toRadians(value: number) {
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

export function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .trim();
}
