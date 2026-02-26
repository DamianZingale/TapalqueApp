import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../config/api';
import { WhatsAppButton } from '../../../shared/components/WhatsAppButton';
import { MenuCard } from '../components/MenuCard';
import { MenuCardHeladeria } from '../components/MenuCardHeladeria';
import { Info } from '../components/RestaurantCard';
import { Imenu, MenuResponseDTO, transformMenuResponse } from '../types/Imenu';
import { IRestaurantInfo } from '../types/IrestaurantInfo';

export default function GastronomiaDetailPage() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  // Usar state del navegador como placeholder mientras carga
  const [restaurante, setRestaurante] = useState<IRestaurantInfo | null>(
    location.state?.restaurante || null
  );
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const [menu, setMenu] = useState<Imenu[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Siempre re-fetcha datos frescos del backend para garantizar precio de delivery actualizado
  useEffect(() => {
    if (!id) return;
    const fetchRestaurantDetail = async () => {
      try {
        const response = await api.get<IRestaurantInfo>(
          `/gastronomia/restaurants/${id}`
        );
        setRestaurante(response);
      } catch (error) {
        console.error('Error fetching restaurant detail:', error);
        if (!restaurante) navigate('/gastronomia');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  // fetch al menu
  const fetchMenu = async () => {
    if (!id) return;

    try {
      setLoadingMenu(true);
      const response = await api.get<MenuResponseDTO>(
        `/gastronomia/menu/restaurant/${id}`
      );
      console.log('Menu response:', response);
      // Transformar la respuesta del backend al formato del frontend
      const transformedMenu = transformMenuResponse(response);
      setMenu(transformedMenu);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenu([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const toggleMenu = () => {
    if (!showMenu && menu.length === 0) {
      fetchMenu();
    }
    setShowMenu((prev) => !prev);
  };

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no hay restaurante después de cargar, mostrar error
  if (!restaurante) {
    return (
      <div className="container my-4">
        <div className="alert alert-warning">
          No se pudo cargar la información del restaurante.
          <button
            onClick={() => navigate('/gastronomia')}
            className="btn btn-link"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <title>{restaurante.name} | Gastronomía - Tapalqué App</title>
      <meta name="description" content={`${restaurante.name} en Tapalqué.${restaurante.address ? ` ${restaurante.address}.` : ''} Consultá el menú y realizá pedidos online.`} />
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary mb-3"
      >
        ← Volver
      </button>

      {/* Info del restaurante */}
      <Info
        id={restaurante.id}
        onVerMenu={toggleMenu}
        showMenu={showMenu}
        name={restaurante.name}
        address={restaurante.address}
        phones={restaurante.phones}
        email={restaurante.email}
        delivery={restaurante.delivery}
        imageUrl={restaurante.imageUrl}
        schedule={restaurante.schedule}
        categories={restaurante.categories}
        latitude={restaurante.latitude}
        longitude={restaurante.longitude}
      />

      {showMenu && (
        <>
          {loadingMenu ? (
            <div className="text-center my-3">
              <div className="spinner-border" role="status" />
            </div>
          ) : (
            <>
              {menu.length > 0 ? (
                restaurante.esHeladeria ? (
                  <MenuCardHeladeria
                    items={menu}
                    restaurantId={restaurante.id.toString()}
                    restaurantName={restaurante.name ?? ''}
                    allowDelivery={restaurante.delivery ?? false}
                    deliveryPrice={restaurante.deliveryPrice ?? 0}
                    estimatedWaitTime={restaurante.estimatedWaitTime ?? 0}
                  />
                ) : (
                  <MenuCard
                    items={menu}
                    restaurantId={restaurante.id.toString()}
                    restaurantName={restaurante.name ?? ''}
                    allowDelivery={restaurante.delivery ?? false}
                    deliveryPrice={restaurante.deliveryPrice ?? 0}
                    estimatedWaitTime={restaurante.estimatedWaitTime ?? 0}
                  />
                )
              ) : (
                <div className="alert alert-info text-center">
                  No hay elementos disponibles en el menú de este restaurante.
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Botón WhatsApp - usar teléfono real */}
      <WhatsAppButton num={restaurante.phones?.split(',')[0] || ''} />
    </div>
  );
}
