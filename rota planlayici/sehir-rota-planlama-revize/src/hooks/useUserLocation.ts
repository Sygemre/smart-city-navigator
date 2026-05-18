import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

export type UserLocationState = {
  loading: boolean;
  permissionGranted: boolean;
  lat?: number;
  lng?: number;
  city?: string;
  district?: string;
  error?: string;
};

const INITIAL_STATE: UserLocationState = {
  loading: true,
  permissionGranted: false
};

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>(INITIAL_STATE);

  const requestAndResolveLocation = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: undefined }));

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setState({
          loading: false,
          permissionGranted: false,
          error: "Konum izni verilmedi."
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const geo = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      const first = geo[0];
      setState({
        loading: false,
        permissionGranted: true,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        city: first?.city ?? first?.subregion ?? undefined,
        district: first?.district ?? first?.name ?? undefined
      });
    } catch (error) {
      setState({
        loading: false,
        permissionGranted: false,
        error: error instanceof Error ? error.message : "Konum alinamadi."
      });
    }
  }, []);

  useEffect(() => {
    requestAndResolveLocation();
  }, [requestAndResolveLocation]);

  return {
    ...state,
    refreshLocation: requestAndResolveLocation
  };
}
