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
      const data = await api.get<IRestaurantInfo[]>(
        '/gastronomia/restaurants'
      );
      setLocales(data || []);
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
      <title>Gastronomía en Tapalqué | Restaurantes y Locales</title>
      <meta name="description" content="Encontrá los mejores restaurantes y locales gastronómicos de Tapalqué. Pedí delivery o comé en el local." />
      <link rel="canonical" href="https://tapalqueapp.com.ar/gastronomia" />
      <h1 className="text-center my-4">Locales Gastronómicos</h1>
      <div className="row justify-content-center">
        {locales.length > 0 ? (
          locales.map((local) => (
            <div key={local.id} className="col-12 col-sm-6 col-md-4 col-lg-3 my-2 d-flex justify-content-center">
              <CardResto
                id={String(local.id)}
                titulo={local.name || 'Nombre no disponible'}
                direccion_local={local.address || 'Dirección no disponible'}
                imagenUrl={local.imageUrl || 'https://via.placeholder.com/400x300/e9ecef/6c757d?text=Sin+imagen'}
                tipo={'gastronomia'}
                schedule={local.schedule}
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
