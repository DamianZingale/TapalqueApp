package com.tapalque.gastronomia.demo.DTO;

public class ImagenResponseDTO {
    private String imagenUrl;

    public ImagenResponseDTO() {
    }

    public ImagenResponseDTO(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }
}
