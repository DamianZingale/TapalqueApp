import { useState } from "react";
import { Title } from "../../../shared/components/Title"
import { BotonAgregar } from "../components/BotonAgregar"
import { BotonesAccionAdmin } from "../components/BotonesAccionAdmin"
import { ListadoLocales } from "../components/ListadoLocales";

export const AdminGralGastronomicosPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locales] = useState([
    {
      id: "1",
      estado: "Activo",
      nombre: "La Clandestina",
      direccion: "Complejo termal de Tapalqué",
    },
    {
      id: "2",
      estado: "Inactivo",
      nombre: "La Clandestina",
      direccion: "Av. Hipolito Yrigoyen N°123",
    },
  ]);
  const selectedLocal = locales.find((local) => local.id === selectedId);
  
  return (
    <>
      <Title text="Gastronomicos" />
      <BotonAgregar />
      {selectedLocal && (
        <BotonesAccionAdmin estado={selectedLocal.estado} />)}

      {locales.map((local) => (
        <ListadoLocales
          key={local.id}
          {...local}
          onSelect={(id) => setSelectedId(id)}
          selectedId={selectedId}
        />
      ))}
    </>
  )
}
