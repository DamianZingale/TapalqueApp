import { useEffect, useState } from "react";
import { Card } from "../../../shared/components/Card";
import { Loading } from "../../../shared/components/Loading";
import type { LocalGastronomicoDTO } from "../types/IlocalegastronomicoDTO";

export default function GastronomiaListPage() {
  const [locales, setLocales] = useState<LocalGastronomicoDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/gastronomia/local/findAll");

        if (!res.ok) throw new Error("Error al obtener los locales");

        const data = await res.json();
        setLocales(data);
      } catch (error) {
        console.error("Error:", error);

        // Datos de ejemplo si falla el fetch
        const mockData: LocalGastronomicoDTO[] = [
          {
            id_local: 1,
            nombre_local: "Pizzería Giuseppe",
            direccion_local: "Av 9 de Julio 500",
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/2b/2c/40/giuseppe-pizzeria.jpg?w=900&h=500&s=1",
          },
          {
            id_local: 2,
            nombre_local: "La Parrilla del Centro",
            direccion_local: "Mitre 1234",
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/27/16/6f/caption.jpg?w=900&h=500&s=1",
          },
        ];

        setLocales(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchLocales();
  }, []);

  if (loading) {
    return <Loading text="Cargando locales..." />;
  }

  return (
    <div className="">
      <h1 className="">Locales Gastronómicos</h1>
      <div className="">
        {locales.length > 0 ? (
          locales.map((local) => (
            <Card
              key={local.id_local}
              id={local.id_local.toString()}
              titulo={local.nombre_local}
              direccion_local={local.direccion_local}
              imagenUrl={local.image}
              tipo="gastronomia"
            />
          ))
        ) : (
          <p className="">No hay locales disponibles</p>
        )}
      </div>
    </div>
  );
}