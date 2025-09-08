import React from "react";
import type { CarruselProps } from "../types/ui/PropsGeneralesVerMas";

export const Carrusel: React.FC<CarruselProps> = ({ images }) => {
    const carouselId = "carouselTapalque"; // puede ser dinámico si querés

    if (images.length === 0) return null;

    return (
        <div id={carouselId} className="carousel slide" data-bs-ride="carousel">
            {/* Indicadores */}
            <div className="carousel-indicators">
                {images.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        data-bs-target={`#${carouselId}`}
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        aria-current={index === 0 ? "true" : undefined}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Imágenes */}
            <div className="carousel-inner">
                {images.map((url, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                        <img
                            src={url}
                            className="d-block w-100"
                            alt={`Imagen ${index + 1}`}
                            style={{ height: "500px", objectFit: "cover" }}
                        />
                    </div>
                ))}
            </div>

            {/* Controles */}
            <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#${carouselId}`}
                data-bs-slide="prev"
            >
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">Anterior</span>
            </button>
            <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#${carouselId}`}
                data-bs-slide="next"
            >
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">Siguiente</span>
            </button>
        </div>
    );
};