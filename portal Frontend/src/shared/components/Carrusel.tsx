
import type { CarruselProps } from "../types/PropsGeneralesVerMas";
import styles from "../../shared/components/styles/carrusel.module.css";
import React, { useEffect } from "react";
import { Carousel } from "bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";



export const Carrusel: React.FC<CarruselProps> = ({ images }) => {
    const carouselId = "carouselTapalque";

    useEffect(() => {
        const el = document.getElementById(carouselId);
        if (el) new Carousel(el);
    }, []);

    if (images.length === 0) return null;

    return (
        <div
        id={carouselId}
        className={`carousel slide ${styles.carousel}`}
        data-bs-ride="carousel"
        data-bs-interval="4000"
        data-bs-pause="hover"
        >
        {/* Indicadores */}
        <div className={`carousel-indicators ${styles.indicators}`}>
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
                alt={`Imagen ${index + 1}`}
                className={`d-block w-100 ${styles.image}`}
                />
            </div>
            ))}
        </div>

        {/* Controles */}
        <button
            className={`${styles.controlButton} ${styles.prev}`}
            type="button"
            data-bs-target={`#${carouselId}`}
            data-bs-slide="prev"
            >
            <FontAwesomeIcon icon={faChevronLeft} className={styles.arrow} />
            <span className="visually-hidden">Anterior</span>
            </button>

            <button
            className={`${styles.controlButton} ${styles.next}`}
            type="button"
            data-bs-target={`#${carouselId}`}
            data-bs-slide="next"
            >
            <FontAwesomeIcon icon={faChevronRight} className={styles.arrow} />
            <span className="visually-hidden">Siguiente</span>
        </button>

        </div>
    );
};
