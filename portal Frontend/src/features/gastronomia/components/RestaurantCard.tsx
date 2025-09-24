import type { IRestaurantInfo } from "../types/IrestaurantInfo";
import { ButtonComoLlegar } from "../../../shared/components/ButtonComoLlegar";

interface InfoProps extends IRestaurantInfo {
  onVerMenu: () => void;
  showMenu: boolean; 
}


// --- Card del restaurante ---
export const Info: React.FC<InfoProps> = ({
  name,
  address,
  phone,
  email,
  delivery,
  imageUrl,
  destination,
  onVerMenu,
  showMenu
}) => {
  return (
    <div className="container my-4">
      <div className="card p-3">
        <div className="row align-items-center">
          {/* Columna izquierda - datos*/}
          <div className="col-md-4">
            <h2>{name}</h2>
            <p>
              📍 {address} <br />
              📞 {phone} <br />
              ✉️ {email} <br />
              🚚 {delivery ? "Delivery disponible" : "Solo en el local"}
            </p>
          </div>

          {/* Columna central - imagen */}
          <div className="col-md-6 text-center">
            <img
              src={imageUrl}
              alt={name}
              className="img-fluid rounded"
              style={{ maxHeight: "250px", objectFit: "cover", width: "100%" }}
            />
          </div>

          {/* Columna derecha - botones*/}
          <div className="col-md-2 text-center">
            <ButtonComoLlegar
              destination={
                destination?.lat && destination?.lng
                  ? { lat: String(destination.lat), lng: String(destination.lng) }
                  : { lat: "0", lng: "0" }
              }
            />
            <button className="btn btn-primary mt-2" onClick={onVerMenu}>
              {showMenu ? "Ocultar Menú" : "Ver Menú"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
