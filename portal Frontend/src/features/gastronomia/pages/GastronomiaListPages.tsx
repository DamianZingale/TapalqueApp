import { useEffect, useState } from "react";
import { Card } from "../../../shared/components/Card";
import { Loading } from "../../../shared/components/Loading";
import type { LocalGastronomicoDTO } from "../types/IlocalegastronomicoDTO";





export default function GastronomiaListPage () {


  const [locales, setLocales] = useState<LocalGastronomicoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch("http://localhost:8081/api/gastronomia/local/findAll")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los locales");
        return res.json();
      })
      .then((data) => {
        setLocales(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => setLoading(false));
      // Datos de ejemplo en caso de que la API no esté disponible
      const mockData: LocalGastronomicoDTO[] = [
    {
      id_local: 1,
      nombre_local: "Pizzería Giuseppe",
      direccion_local: "Av 9 de Julio 500",
      image: "public/descarga.jpeg",
      
    },
    {
      id_local: 2,
      nombre_local: "La Parrilla del Centro",
      direccion_local: "Mitre 1234",
      image: "/public/pizzeria-le-basilico.jpg",
      
    },
  ];

  setLocales(mockData);
  setLoading(false);
  }, []);

  if (loading) {
    return <Loading text= "Cargando locales..."/>
  }

  return (
    <div className="container">
      <h1 className="text-center my-4">Locales Gastronómicos</h1>
      <div className="row justify-content-center">
        {locales.length > 0 ? (
          locales.map((local) => (
            <Card
              key= {local.id_local}
              id= {local.id_local.toString()}
              titulo={local.nombre_local}
              direccion_local={local.direccion_local}
              imagenUrl= {local.image} tipo={"gastronomia"} />

          ))
        ) : (
          <p>No hay locales disponibles</p>
        )}
      </div>
    </div>
  );

}
