import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../config/api';
import { WhatsAppButton } from '../../../shared/components/WhatsAppButton';
import { MenuCard } from '../components/MenuCard';
import { Info } from '../components/RestaurantCard';
import { Imenu } from '../types/Imenu';
import { IRestaurantInfo } from '../types/IrestaurantInfo';

export default function GastronomiaDetailPage() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  // Intentar obtener datos del state primero (viene del clic en la card)
  const [restaurante, setRestaurante] = useState<IRestaurantInfo | null>(
    location.state?.restaurante || null
  );
  const [loading, setLoading] = useState(!restaurante);
  const [showMenu, setShowMenu] = useState(false);

  const [menu, setMenu] = useState<Imenu[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  useEffect(() => {
    if (!restaurante && id) {
      const fetchRestaurantDetail = async () => {
        try {
          const response = await api.get<IRestaurantInfo>(
            `/gastronomia/findById/${id}`
          );
          setRestaurante(response.data);
        } catch (error) {
          console.error('Error fetching restaurant detail:', error);
          navigate('/gastronomia');
        } finally {
          setLoading(false);
        }
      };

      fetchRestaurantDetail();
    }
  }, [id, restaurante, navigate]);
  // fetch al menu
  const fetchMenu = async () => {
    if (!id) return;

    try {
      setLoadingMenu(true);
      const response = await api.get(`/gastronomia/menu/getMenu/${id}`);
      setMenu(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
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
        phone={restaurante.phone}
        email={restaurante.email}
        delivery={restaurante.delivery}
        imageUrl={restaurante.imageUrl}
        schedule={restaurante.schedule}
        category={restaurante.category}
        destination={{
          lat: restaurante.destination.lat,
          lng: restaurante.destination.lng,
        }}
      />

      {showMenu &&
        (loadingMenu ? (
          <div className="text-center my-3">
            <div className="spinner-border" role="status" />
          </div>
        ) : (
          <MenuCard items={menu} />
        ))}

      {/* Botón WhatsApp - usar teléfono real */}
      <WhatsAppButton num={restaurante.phone?.split(',')[0] || ''} />
    </div>
  );
}
