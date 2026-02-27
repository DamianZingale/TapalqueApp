package com.tapalque.gastronomia.demo.DTO;

import com.tapalque.gastronomia.demo.Entity.SaborHeladeria;

public class SaborHeladeriaDTO {

    private Long id;
    private String nombre;
    private Boolean habilitado;

    public SaborHeladeriaDTO() {}

    public SaborHeladeriaDTO(Long id, String nombre, Boolean habilitado) {
        this.id = id;
        this.nombre = nombre;
        this.habilitado = habilitado;
    }

    public static SaborHeladeriaDTO fromEntity(SaborHeladeria sabor) {
        return new SaborHeladeriaDTO(
            sabor.getIdSabor(),
            sabor.getNombre(),
            sabor.getHabilitado()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Boolean getHabilitado() { return habilitado; }
    public void setHabilitado(Boolean habilitado) { this.habilitado = habilitado; }
}
