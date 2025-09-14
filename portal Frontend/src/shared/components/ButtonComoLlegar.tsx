import type { ButtonComoLlegarProps } from "../types/MapProps";



export const ButtonComoLlegar: React.FC<ButtonComoLlegarProps> = ({ destination }) => {
  const handleClick = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en este navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;
        const dest = `${destination.lat},${destination.lng}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
        window.open(url, "_blank");
      },
      (error) => {
        alert("No se pudo obtener tu ubicación: " + error.message);
      }
    );
  };

  return (
    <button className="btn btn-primary" onClick={handleClick}>
      📍 Cómo Llegar
    </button>
  );
};