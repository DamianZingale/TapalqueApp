import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../config/api';
import { CardResto } from '../../../shared/components/CardResto';
import { Loading } from '../../../shared/components/Loading';
import { IRestaurantInfo } from '../types/IrestaurantInfo';

export default function GastronomiaListPage() {
  const [locales, setLocales] = useState<IRestaurantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurantList();
  }, []);

  const fetchRestaurantList = async () => {
    try {
      const response = await api.get<IRestaurantInfo[]>('/gastronomia/findAll');
      setLocales(response.data);
    } catch (error) {
      console.error('Error fetching restaurant list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (local: IRestaurantInfo) => {
    navigate(`/gastronomia/${local.id}`, {
      state: { restaurante: local },
    });
  };

  if (loading) {
    return <Loading text="Cargando locales..." />;
  }

  return (
    <div className="container">
      <h1 className="text-center my-4">Locales Gastronómicos</h1>
      <div className="row justify-content-center">
        {locales.length > 0 ? (
          locales.map((local) => (
            <div key={local.id} className="col-md-4 col-sm-6">
              <CardResto
                id={local.id.toString()}
                titulo={local.name || 'Nombre no disponible'}
                direccion_local={local.address || 'Dirección no disponible'}
                imagenUrl={local.imageUrl}
                tipo={'gastronomia'}
                schedule={local.schedule} // ← Pasar schedule
                onClick={() => handleCardClick(local)}
              />
            </div>
          ))
        ) : (
          <p>No hay locales disponibles</p>
        )}
      </div>
    </div>
  );
}
