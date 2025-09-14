import { useEffect, useState } from "react";

interface Location {
  lat: number;
  lng: number;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está soportada en este navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError("No se pudo obtener la ubicación: " + err.message);
      }
    );
  }, []);

  return { location, error };
};
