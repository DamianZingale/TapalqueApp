package com.tapalque.gastronomia.demo.DTO;

public class ImagenRequestDTO {
    private String imagenUrl;

    public ImagenRequestDTO() {
    }

    public ImagenRequestDTO(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }
}
