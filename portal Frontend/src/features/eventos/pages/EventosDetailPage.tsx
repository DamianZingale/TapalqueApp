import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventoById, type Evento } from '../../../services/fetchEventos';
import { Carrusel } from '../../../shared/components/Carrusel';
import { Title } from '../../../shared/components/Title';
import { WhatsAppButton } from '../../../shared/components/WhatsAppButton';

export default function EventosDetailPage() {
  const { id } = useParams();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvento = async () => {
      if (!id) return;
      setLoading(true);
      const data = await fetchEventoById(id);
      setEvento(data);
      setLoading(false);
    };
    loadEvento();
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <h1 className="text-center my-4">Cargando...</h1>
      </div>
    );
  }

  if (!evento)
    return <p className="container text-center my-4">Evento no encontrado</p>;

  const imagenes = evento.imagenes.map((img) => img.imagenUrl);

  return (
    <div className="container">
      <Title text={evento.nombreEvento} />
      <Carrusel images={imagenes} />

      {evento.descripcion && (
        <div className="my-4">
          <h4>Descripcion</h4>
          <p>{evento.descripcion}</p>
        </div>
      )}

      <div className="my-4">
        <h4>Fechas</h4>
        <p>
          {evento.fechaInicio} {evento.fechaFin ? `- ${evento.fechaFin}` : ''}
        </p>
      </div>

      <div className="my-4">
        <h4>Lugar</h4>
        <p>{evento.lugar}</p>
      </div>

      <div className="my-4">
        <h4>Horario</h4>
        <p>{evento.horario}</p>
      </div>

      <div className="my-4">
        <h4>Contacto</h4>
        <p>{evento.nombreContacto}</p>
      </div>

      <WhatsAppButton num={evento.telefonoContacto} />
    </div>
  );
}
