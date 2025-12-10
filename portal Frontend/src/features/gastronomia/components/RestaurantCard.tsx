import type { IRestaurantInfo } from "../types/IrestaurantInfo";
import { ButtonComoLlegar } from "../../../shared/components/ButtonComoLlegar";
import styles from "../../../shared/styles/pagesTourist.module.css"
import stylesBtn from "../../../shared/styles/btn.module.css"

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
    <div className={styles.layout}>

            <h2 className={styles.tittle}>{name}</h2>
          <div className={styles.imgBox}>
            <img
              src={imageUrl}
              alt={name}
              className={styles.img}
            />
          </div>
          <div className={styles.infoBox}>
              <p className={styles.info}>📍 {address}</p>
              <p className={styles.info}>📞 {phone}</p>
              <p className={styles.info}>✉️ {email}</p>
              <p className={styles.info}>🚚 {delivery ? "Delivery disponible" : "Solo en el local"}</p>
            </div>

          {/* Columna derecha - botones*/}
          <div className={styles.buttonBox}>
            <ButtonComoLlegar
              destination={
                destination?.lat && destination?.lng
                  ? { lat: String(destination.lat), lng: String(destination.lng) }
                  : { lat: "0", lng: "0" }
              }
            />
            <button className={stylesBtn.btn}onClick={onVerMenu}>
              {showMenu ? "Ocultar Menú" : "Ver Menú"}
            </button>
          </div>
        </div>
  );
};
