package com.tapalque.eventos.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.tapalque.eventos.dto.EventoRequestDTO;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "evento")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Evento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreEvento;

    @Column(nullable = false)
    private String lugar;

    @Column(nullable = false)
    private String horario;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @Column(nullable = false)
    private String telefonoContacto;

    @Column(nullable = false)
    private String nombreContacto;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventoImagen> imagenes = new ArrayList<>();

    public Evento(EventoRequestDTO dto) {
        this.setNombreEvento(dto.getNombreEvento());
        this.setLugar(dto.getLugar());
        this.setHorario(dto.getHorario());
        this.setFechaInicio(dto.getFechaInicio());
        this.setFechaFin(dto.getFechaFin());
        this.setTelefonoContacto(dto.getTelefonoContacto());
        this.setNombreContacto(dto.getNombreContacto());
    }

    public void actualizarParcial(EventoRequestDTO dto) {
        if (dto.getNombreEvento() != null)
            this.nombreEvento = dto.getNombreEvento();
        if (dto.getLugar() != null)
            this.lugar = dto.getLugar();
        if (dto.getHorario() != null)
            this.horario = dto.getHorario();
        if (dto.getFechaInicio() != null)
            this.fechaInicio = dto.getFechaInicio();
        if (dto.getFechaFin() != null)
            this.fechaFin = dto.getFechaFin();
        if (dto.getTelefonoContacto() != null)
            this.telefonoContacto = dto.getTelefonoContacto();
        if (dto.getNombreContacto() != null)
            this.nombreContacto = dto.getNombreContacto();
    }
}
