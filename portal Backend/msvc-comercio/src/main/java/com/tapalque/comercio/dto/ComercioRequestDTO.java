package com.tapalque.comercio.dto;

public class ComercioRequestDTO {
    private String titulo;
    private String descripcion;
    private String direccion;
    private String horario;
    private String telefono;
    private Double latitud;
    private Double longitud;
    private String facebook;
    private String instagram;
    private String tag;

    public ComercioRequestDTO() {}

    public ComercioRequestDTO(String titulo, String descripcion, String direccion, String horario,
                              String telefono, Double latitud, Double longitud, String facebook,
                              String instagram, String tag) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.direccion = direccion;
        this.horario = horario;
        this.telefono = telefono;
        this.latitud = latitud;
        this.longitud = longitud;
        this.facebook = facebook;
        this.instagram = instagram;
        this.tag = tag;
    }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }

    public String getFacebook() { return facebook; }
    public void setFacebook(String facebook) { this.facebook = facebook; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
}
