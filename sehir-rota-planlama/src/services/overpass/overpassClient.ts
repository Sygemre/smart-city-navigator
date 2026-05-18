import type { OverpassResponse } from "./types";

const DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export function getOverpassUrl(): string {
  return process.env.EXPO_PUBLIC_OVERPASS_URL ?? DEFAULT_OVERPASS_URL;
}

export async function queryOverpass(overpassQl: string): Promise<OverpassResponse | null> {
  const url = getOverpassUrl();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: `data=${encodeURIComponent(overpassQl)}`
    });

    if (!response.ok) return null;

    const data = (await response.json()) as OverpassResponse;
    if (!Array.isArray(data.elements)) return null;

    return data;
  } catch {
    return null;
  }
}
