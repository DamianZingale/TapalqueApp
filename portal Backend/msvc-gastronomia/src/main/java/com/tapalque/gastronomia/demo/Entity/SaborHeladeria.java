package com.tapalque.gastronomia.demo.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sabor_heladeria")
public class SaborHeladeria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSabor;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Boolean habilitado = true;

    @ManyToOne
    @JoinColumn(name = "id_restaurant", nullable = false)
    private Restaurant restaurante;

    public SaborHeladeria() {}

    public SaborHeladeria(String nombre, Boolean habilitado, Restaurant restaurante) {
        this.nombre = nombre;
        this.habilitado = habilitado != null ? habilitado : true;
        this.restaurante = restaurante;
    }

    public Long getIdSabor() { return idSabor; }
    public void setIdSabor(Long idSabor) { this.idSabor = idSabor; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Boolean getHabilitado() { return habilitado != null ? habilitado : true; }
    public void setHabilitado(Boolean habilitado) { this.habilitado = habilitado != null ? habilitado : true; }

    public Restaurant getRestaurante() { return restaurante; }
    public void setRestaurante(Restaurant restaurante) { this.restaurante = restaurante; }
}
