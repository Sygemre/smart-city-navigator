import type { EtkinlikCity } from "./types";
import { fetchEtkinlik } from "./etkinlikClient";

let citiesCache: EtkinlikCity[] | null = null;

function normalizeCityName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .trim();
}

async function loadCities(): Promise<EtkinlikCity[]> {
  if (citiesCache) return citiesCache;

  const data = await fetchEtkinlik<EtkinlikCity[]>("/cities");
  citiesCache = Array.isArray(data) ? data : [];
  return citiesCache;
}

export async function resolveCityId(cityName: string): Promise<number | null> {
  const cities = await loadCities();
  if (cities.length === 0) return null;

  const normalized = normalizeCityName(cityName);

  const match = cities.find((city) => {
    const nameNorm = normalizeCityName(city.name);
    const slugNorm = normalizeCityName(city.slug.replace(/-/g, " "));
    return (
      nameNorm === normalized ||
      slugNorm === normalized ||
      nameNorm.includes(normalized) ||
      normalized.includes(nameNorm)
    );
  });

  return match?.id ?? null;
}
