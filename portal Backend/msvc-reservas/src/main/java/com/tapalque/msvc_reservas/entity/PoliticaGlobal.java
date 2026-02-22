package com.tapalque.msvc_reservas.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Política de reservas por hospedaje.
 * Cada hospedaje gestiona su propia configuración de manera independiente.
 */
@Document(collection = "politica_reservas")
public class PoliticaGlobal {

    @Id
    private String id;

    private String hotelId;                // Identificador del hospedaje

    private Boolean reservasHabilitadas;   // ON/OFF de reservas para este hospedaje
    private Boolean politicaFdsActiva;     // Activa regla mínimo 2 noches jue-dom

    private LocalDateTime fechaActualizacion;
    private String actualizadoPor;

    public PoliticaGlobal() {
        this.reservasHabilitadas = true;
        this.politicaFdsActiva = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHotelId() { return hotelId; }
    public void setHotelId(String hotelId) { this.hotelId = hotelId; }

    public Boolean getReservasHabilitadas() { return reservasHabilitadas; }
    public void setReservasHabilitadas(Boolean reservasHabilitadas) { this.reservasHabilitadas = reservasHabilitadas; }

    public Boolean getPoliticaFdsActiva() { return politicaFdsActiva; }
    public void setPoliticaFdsActiva(Boolean politicaFdsActiva) { this.politicaFdsActiva = politicaFdsActiva; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getActualizadoPor() { return actualizadoPor; }
    public void setActualizadoPor(String actualizadoPor) { this.actualizadoPor = actualizadoPor; }
}
