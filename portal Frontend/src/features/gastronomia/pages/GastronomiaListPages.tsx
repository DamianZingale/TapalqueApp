import { useEffect, useState } from "react";
import { Card } from "../../../shared/components/Card";
import { Loading } from "../../../shared/components/Loading";


interface LocalGastronomicoDTO {
  id_local: number;
  nombre_local: string;
  direccion_local: string;
  url_mapa: string;
  estado?: boolean;

}


export default function GastronomiaListPage() {
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
              key={local.id_local}
              id={local.id_local.toString()}
              titulo={local.nombre_local}
              direccion_local={local.direccion_local}
              imagenUrl="https://via.placeholder.com/300x200.png?text=Local+Gastronomico" tipo={"comercio"} />

          ))
        ) : (
          <p>No hay locales disponibles</p>
        )}
      </div>
    </div>
  );
}
