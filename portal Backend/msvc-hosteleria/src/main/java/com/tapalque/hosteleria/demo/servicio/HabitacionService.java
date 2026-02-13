package com.tapalque.hosteleria.demo.servicio;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.tapalque.hosteleria.demo.dto.HabitacionDTO;
import com.tapalque.hosteleria.demo.dto.HabitacionRequestDTO;
import com.tapalque.hosteleria.demo.entidades.Habitacion;
import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.repositorio.HabitacionRepository;
import com.tapalque.hosteleria.demo.repositorio.HospedajeRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    private final HospedajeRepository hospedajeRepository;

    public HabitacionService(HabitacionRepository habitacionRepository, HospedajeRepository hospedajeRepository) {
        this.habitacionRepository = habitacionRepository;
        this.hospedajeRepository = hospedajeRepository;
    }

    public List<HabitacionDTO> obtenerPorHospedaje(@NonNull Long hospedajeId) {
        return habitacionRepository.findByHospedajeId(hospedajeId)
                .stream()
                .map(HabitacionDTO::new)
                .collect(Collectors.toList());
    }

    public HabitacionDTO obtenerPorId(@NonNull Long id) {
        Habitacion habitacion = habitacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Habitación no encontrada con ID: " + id));
        return new HabitacionDTO(habitacion);
    }

    public HabitacionDTO crear(@NonNull Long hospedajeId, @NonNull HabitacionRequestDTO dto) {
        Hospedaje hospedaje = hospedajeRepository.findById(hospedajeId)
                .orElseThrow(() -> new EntityNotFoundException("Hospedaje no encontrado con ID: " + hospedajeId));

        Habitacion habitacion = new Habitacion();
        habitacion.setTitulo(dto.getTitulo());
        habitacion.setDescripcion(dto.getDescripcion());
        habitacion.setMaxPersonas(dto.getMaxPersonas());
        habitacion.setPrecio(dto.getPrecio());
        habitacion.setTipoPrecio(parseTipoPrecio(dto.getTipoPrecio()));
        // Limitar a máximo 3 fotos
        if (dto.getFotos() != null && dto.getFotos().size() > 3) {
            habitacion.setFotos(dto.getFotos().subList(0, 3));
        } else {
            habitacion.setFotos(dto.getFotos());
        }
        habitacion.setServicios(dto.getServicios());
        habitacion.setDisponible(dto.getDisponible() != null ? dto.getDisponible() : true);
        habitacion.setHospedaje(hospedaje);

        Habitacion guardada = habitacionRepository.save(habitacion);
        return new HabitacionDTO(guardada);
    }

    public HabitacionDTO actualizar(@NonNull Long id, @NonNull HabitacionRequestDTO dto) {
        Habitacion habitacion = habitacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Habitación no encontrada con ID: " + id));

        if (dto.getTitulo() != null) {
            habitacion.setTitulo(dto.getTitulo());
        }
        if (dto.getDescripcion() != null) {
            habitacion.setDescripcion(dto.getDescripcion());
        }
        if (dto.getMaxPersonas() != null) {
            habitacion.setMaxPersonas(dto.getMaxPersonas());
        }
        if (dto.getPrecio() != null) {
            habitacion.setPrecio(dto.getPrecio());
        }
        if (dto.getTipoPrecio() != null) {
            habitacion.setTipoPrecio(parseTipoPrecio(dto.getTipoPrecio()));
        }
        if (dto.getFotos() != null) {
            // Limitar a máximo 3 fotos
            if (dto.getFotos().size() > 3) {
                habitacion.setFotos(dto.getFotos().subList(0, 3));
            } else {
                habitacion.setFotos(dto.getFotos());
            }
        }
        if (dto.getServicios() != null) {
            habitacion.setServicios(dto.getServicios());
        }
        if (dto.getDisponible() != null) {
            habitacion.setDisponible(dto.getDisponible());
        }

        Habitacion actualizada = habitacionRepository.save(habitacion);
        return new HabitacionDTO(actualizada);
    }

    public void eliminar(@NonNull Long id) {
        if (!habitacionRepository.existsById(id)) {
            throw new EntityNotFoundException("Habitación no encontrada con ID: " + id);
        }
        habitacionRepository.deleteById(id);
    }

    public HabitacionDTO cambiarDisponibilidad(@NonNull Long id, @NonNull Boolean disponible) {
        Habitacion habitacion = habitacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Habitación no encontrada con ID: " + id));

        habitacion.setDisponible(disponible);
        Habitacion actualizada = habitacionRepository.save(habitacion);
        return new HabitacionDTO(actualizada);
    }

    private Habitacion.TipoPrecio parseTipoPrecio(String tipoPrecio) {
        if (tipoPrecio == null) {
            return Habitacion.TipoPrecio.POR_HABITACION;
        }
        String normalized = tipoPrecio.toUpperCase().replace("-", "_");
        try {
            return Habitacion.TipoPrecio.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return Habitacion.TipoPrecio.POR_HABITACION;
        }
    }
}
