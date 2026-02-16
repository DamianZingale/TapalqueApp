package com.tapalque.hosteleria.demo.servicio;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.hosteleria.demo.dto.DisponibilidadResponseDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeRequestDTO;
import org.springframework.web.reactive.function.client.WebClient;

import com.tapalque.hosteleria.demo.entidades.Habitacion;
import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.entidades.HospedajeImagen;
import com.tapalque.hosteleria.demo.repositorio.HabitacionRepository;
import com.tapalque.hosteleria.demo.repositorio.HospedajeRepository;

@Service
@Transactional(readOnly = true)
public class HospedajeService {

    @Autowired
    private HospedajeRepository hospedajeRepository;

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Cacheable(value = "hospedajes")
    public List<HospedajeDTO> obtenerTodos() {
        return hospedajeRepository.findAll().stream()
                .map(HospedajeDTO::new)
                .collect(Collectors.toList());
    }

    public ResponseEntity<HospedajeDTO> obtenerPorId(Long id) {
        try {
            System.out.println("Buscando hospedaje con ID: " + id);
            Optional<Hospedaje> hospedaje = hospedajeRepository.findById(id);
            return hospedaje.map(value -> ResponseEntity.ok(new HospedajeDTO(value)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error al buscar hospedaje con ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @CacheEvict(value = "hospedajes", allEntries = true)
    @Transactional
    public HospedajeDTO guardar(HospedajeRequestDTO dto) {
        Hospedaje hospedaje = mapToEntity(dto);
        //🔴falta loguica para guardar archivo en servidor, y obtener la url para guardarla en la DB❗
        return new HospedajeDTO(hospedajeRepository.save(hospedaje));
    }

    @CacheEvict(value = "hospedajes", allEntries = true)
    @Transactional
    public ResponseEntity<Void> eliminarPorId(Long id) {
        Optional<Hospedaje> existente = hospedajeRepository.findById(id);
        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        //🔴Falta logia para eliminar archivo de imagenesen servidor❗
        hospedajeRepository.deleteById(id);

        // Eliminar la asignación de negocio en msvc-user
        try {
            webClientBuilder.build()
                    .delete()
                    .uri("lb://MSVC-USER/business/external/{externalId}/type/{type}", id, "HOSPEDAJE")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            System.err.println("No se pudo eliminar la asignación de negocio en msvc-user: " + e.getMessage());
        }

        return ResponseEntity.noContent().build(); // 204
    }

    @CacheEvict(value = "hospedajes", allEntries = true)
    @Transactional
    public ResponseEntity<HospedajeDTO> actualizarHospedaje(Long id, HospedajeRequestDTO dto)
    {
        Optional<Hospedaje> existente = hospedajeRepository.findById(id);
        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Hospedaje hospedaje = existente.get();
        // Actualizá los campos
        hospedaje.setTitulo(dto.getTitulo());
        hospedaje.setDescription(dto.getDescription());
        hospedaje.setUbicacion(dto.getUbicacion());
        hospedaje.setLatitud(dto.getLatitud());
        hospedaje.setLongitud(dto.getLongitud());
        hospedaje.setNumWhatsapp(dto.getNumWhatsapp());
        hospedaje.setTipoHospedaje(dto.getTipoHospedaje());
        // Solo actualizar imágenes si se envían explícitamente en el request.
        // Las imágenes se gestionan por separado vía /hospedajes/{id}/imagenes
        if (dto.getImagenes() != null) {
            hospedaje.getImagenes().clear();
            List<HospedajeImagen> nuevasImagenes = dto.getImagenes().stream().map(url -> {
                HospedajeImagen img = new HospedajeImagen();
                img.setImagenUrl(url);
                img.setHospedaje(hospedaje);
                return img;
            }).collect(Collectors.toList());
            hospedaje.getImagenes().addAll(nuevasImagenes);
        }
        Hospedaje actualizado = hospedajeRepository.save(hospedaje);
        return ResponseEntity.ok(new HospedajeDTO(actualizado));
    }

    // Método para mapear de DTORequest a Entidad
    private Hospedaje mapToEntity(HospedajeRequestDTO dto) {
        Hospedaje hospedaje = new Hospedaje();
        hospedaje.setTitulo(dto.getTitulo());
        hospedaje.setDescription(dto.getDescription());
        hospedaje.setUbicacion(dto.getUbicacion());
        hospedaje.setLatitud(dto.getLatitud());
        hospedaje.setLongitud(dto.getLongitud());
        hospedaje.setNumWhatsapp(dto.getNumWhatsapp());
        hospedaje.setTipoHospedaje(dto.getTipoHospedaje());
        // Carga imágenes si hay URLs
        if (dto.getImagenes() != null) {
            List<HospedajeImagen> imagenes = dto.getImagenes().stream().map(url -> {
                HospedajeImagen img = new HospedajeImagen();
                img.setImagenUrl(url);
                img.setHospedaje(hospedaje); // importante para la relación bidireccional
                return img;
            }).collect(Collectors.toList());
            hospedaje.setImagenes(imagenes);
        }
        return hospedaje;
    }

    public DisponibilidadResponseDTO consultarDisponibilidad(
            @NonNull Long hospedajeId,
            String fechaInicio,
            String fechaFin,
            Integer personas) {

        // Verificar que el hospedaje existe
        Optional<Hospedaje> hospedaje = hospedajeRepository.findById(hospedajeId);
        if (hospedaje.isEmpty()) {
            return new DisponibilidadResponseDTO(false, null);
        }

        // Buscar habitaciones disponibles que puedan alojar la cantidad de personas
        List<Habitacion> habitacionesDisponibles = habitacionRepository
                .findByHospedajeIdAndDisponibleTrue(hospedajeId);

        if (habitacionesDisponibles.isEmpty()) {
            return new DisponibilidadResponseDTO(false, null);
        }

        // Buscar una habitación que pueda alojar la cantidad de personas solicitada
        Optional<Habitacion> habitacionAdecuada = habitacionesDisponibles.stream()
                .filter(h -> h.getMaxPersonas() >= (personas != null ? personas : 1))
                .findFirst();

        if (habitacionAdecuada.isEmpty()) {
            return new DisponibilidadResponseDTO(false, null);
        }

        // Calcular precio (simplificado - se podría mejorar con lógica de fechas)
        Habitacion habitacion = habitacionAdecuada.get();
        BigDecimal precioTotal = habitacion.getPrecio();

        if (habitacion.getTipoPrecio() == Habitacion.TipoPrecio.POR_PERSONA && personas != null) {
            precioTotal = habitacion.getPrecio().multiply(BigDecimal.valueOf(personas));
        }

        return new DisponibilidadResponseDTO(true, precioTotal);
    }
}