const ETKINLIK_API_BASE = "https://etkinlik.io/api/v2";

export function getEtkinlikToken(): string | undefined {
  return process.env.EXPO_PUBLIC_ETKINLIK_TOKEN;
}

export async function fetchEtkinlik<T>(
  path: string,
  query?: Record<string, string | number>
): Promise<T | null> {
  const token = getEtkinlikToken();
  if (!token) return null;

  const url = new URL(`${ETKINLIK_API_BASE}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "X-Etkinlik-Token": token,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}
