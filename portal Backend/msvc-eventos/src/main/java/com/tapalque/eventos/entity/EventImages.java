package com.tapalque.eventos.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table  (name = "event_images")
public class EventImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_image;

    @ManyToOne
    @JoinColumn(name = "evento_id", referencedColumnName = "id", nullable = false)   
    private Eventos eventoId;

    private String imageUrl;


    public EventImages() {
    }

    public EventImages(Long id_image, Eventos eventoId, String imageUrl) {
        this.id_image = id_image;
        this.eventoId = eventoId;
        this.imageUrl = imageUrl;
    }

    public Long getId_image() {
        return id_image;
    }

    public void setId_image(Long id_image) {
        this.id_image = id_image;
    }

    public Eventos getEventoId() {
        return eventoId;
    }

    public void setEventoId(Eventos eventoId) {
        this.eventoId = eventoId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}