package com.tapalque.hosteleria.demo.entidades;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "habitaciones")
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "max_personas", nullable = false)
    private Integer maxPersonas;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "precio_una_persona", precision = 10, scale = 2)
    private BigDecimal precioUnaPersona;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_precio", nullable = false)
    private TipoPrecio tipoPrecio = TipoPrecio.POR_HABITACION;

    @Column(name = "minimo_personas_a_pagar")
    private Integer minimoPersonasAPagar;

    @ElementCollection
    @CollectionTable(name = "habitacion_fotos", joinColumns = @JoinColumn(name = "habitacion_id"))
    @Column(name = "foto_url")
    private List<String> fotos = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "habitacion_servicios", joinColumns = @JoinColumn(name = "habitacion_id"))
    @Column(name = "servicio")
    private List<String> servicios = new ArrayList<>();

    @Column(nullable = false)
    private Boolean disponible = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospedaje_id", nullable = false)
    private Hospedaje hospedaje;

    public enum TipoPrecio {
        POR_HABITACION,
        POR_PERSONA
    }

    // Constructors
    public Habitacion() {
    }

    public Habitacion(String titulo, String descripcion, Integer maxPersonas, BigDecimal precio,
                      TipoPrecio tipoPrecio, List<String> fotos, Hospedaje hospedaje) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.maxPersonas = maxPersonas;
        this.precio = precio;
        this.tipoPrecio = tipoPrecio;
        this.fotos = fotos != null ? fotos : new ArrayList<>();
        this.hospedaje = hospedaje;
        this.disponible = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getMaxPersonas() {
        return maxPersonas;
    }

    public void setMaxPersonas(Integer maxPersonas) {
        this.maxPersonas = maxPersonas;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public TipoPrecio getTipoPrecio() {
        return tipoPrecio;
    }

    public void setTipoPrecio(TipoPrecio tipoPrecio) {
        this.tipoPrecio = tipoPrecio;
    }

    public List<String> getFotos() {
        return fotos;
    }

    public void setFotos(List<String> fotos) {
        this.fotos = fotos != null ? fotos : new ArrayList<>();
    }

    public List<String> getServicios() {
        return servicios;
    }

    public void setServicios(List<String> servicios) {
        this.servicios = servicios;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public Hospedaje getHospedaje() {
        return hospedaje;
    }

    public void setHospedaje(Hospedaje hospedaje) {
        this.hospedaje = hospedaje;
    }

    public Integer getMinimoPersonasAPagar() {
        return minimoPersonasAPagar;
    }

    public void setMinimoPersonasAPagar(Integer minimoPersonasAPagar) {
        this.minimoPersonasAPagar = minimoPersonasAPagar;
    }

    public BigDecimal getPrecioUnaPersona() {
        return precioUnaPersona;
    }

    public void setPrecioUnaPersona(BigDecimal precioUnaPersona) {
        this.precioUnaPersona = precioUnaPersona;
    }
}
