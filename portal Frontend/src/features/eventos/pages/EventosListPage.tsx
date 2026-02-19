import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEventos, type Evento } from '../../../services/fetchEventos';
import { Card } from '../../../shared/components/Card';

export default function EventosListPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEventos = async () => {
      setLoading(true);
      const data = await fetchEventos();
      setEventos(data);
      setLoading(false);
    };
    loadEventos();
  }, []);

  const handleCardClick = (evento: Evento) => {
    navigate(`/eventos/${evento.id}`, {
      state: { evento },
    });
  };

  if (loading) {
    return (
      <div className="container">
        <h1 className="text-center my-4">Cargando eventos...</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="text-center my-4">Eventos</h1>
      {eventos.length === 0 ? (
        <p className="text-center">
          No hay eventos disponibles en este momento.
        </p>
      ) : (
        <div className="row justify-content-center">
          {eventos.map((evento) => (
            <Card
              key={evento.id}
              id={String(evento.id)}
              titulo={evento.nombreEvento}
              imagenUrl={
                evento.imagenes?.[0]?.imagenUrl ||
                'https://via.placeholder.com/300'
              }
              direccion_local={`${evento.lugar} | ${evento.fechaInicio}${evento.fechaFin ? ` - ${evento.fechaFin}` : ''}`}
              schedule={evento.horario}
              descripcion={evento.descripcion}
              tipo="eventos"
              onClick={() => handleCardClick(evento)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
