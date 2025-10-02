package com.tapalque.hosteleria.demo.servicio;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.tapalque.hosteleria.demo.dto.HospedajeDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeRequestDTO;
import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.entidades.HospedajeImagen;
import com.tapalque.hosteleria.demo.repositorio.HospedajeRepository;
@Service
public class HospedajeService {

    @Autowired
    private HospedajeRepository hospedajeRepository;

    public List<HospedajeDTO> obtenerTodos() {
        return hospedajeRepository.findAll().stream()
                .map(HospedajeDTO::new)
                .collect(Collectors.toList());
    }

    public ResponseEntity<HospedajeDTO> obtenerPorId(Long id) {
        Optional<Hospedaje> hospedaje = hospedajeRepository.findById(id);
        return hospedaje.map(value -> ResponseEntity.ok(new HospedajeDTO(value)))
                .orElse(ResponseEntity.notFound().build());
    }

    public HospedajeDTO guardar(HospedajeRequestDTO dto) {
        Hospedaje hospedaje = mapToEntity(dto);
        //🔴falta loguica para guardar archivo en servidor, y obtener la url para guardarla en la DB❗
        return new HospedajeDTO(hospedajeRepository.save(hospedaje));
    }

    public ResponseEntity<Void> eliminarPorId(Long id) {
        Optional<Hospedaje> existente = hospedajeRepository.findById(id);
        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        //🔴Falta logia para eliminar archivo de imagenesen servidor❗
        hospedajeRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204
    }

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
        hospedaje.setGoogleMapsUrl(dto.getGoogleMapsUrl());
        hospedaje.setNumWhatsapp(dto.getNumWhatsapp());
        hospedaje.setTipoHospedaje(dto.getTipoHospedaje());
        // Limpiar y actualizar las imágenes
        //🔴Falta logia para eliminar archivo de imagenes que estan en el servidor❗
        hospedaje.getImagenes().clear();
        //🔴falta loguica para guardar archivo en servidor de las nuevas imagenes que tiene el DNO REQUEST, y obtener la url para guardarla en la DB❗
        if (dto.getImagenes() != null) {
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
        hospedaje.setGoogleMapsUrl(dto.getGoogleMapsUrl());
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
}