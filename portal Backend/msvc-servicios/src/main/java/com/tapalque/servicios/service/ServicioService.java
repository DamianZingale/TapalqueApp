package com.tapalque.servicios.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.servicios.Exceptions.ServicioNotFoundException;
import com.tapalque.servicios.dto.ServicioRequestDTO;
import com.tapalque.servicios.dto.ServicioResponseDTO;
import com.tapalque.servicios.entity.Servicio;
import com.tapalque.servicios.repository.ServicioRepository;

@Service
@Transactional(readOnly = true )
public class ServicioService {
    @Autowired
    private ServicioRepository servicioRepository;

    @Transactional
    public ServicioResponseDTO crear(ServicioRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new IllegalArgumentException("El título del servicio es obligatorio");
        }

        Servicio servicio = new Servicio(dto);
        servicioRepository.save(servicio);
        return new ServicioResponseDTO(servicio);
    }

    public List<ServicioResponseDTO> obtenerTodos() {
        return servicioRepository.findAll()
                .stream()
                .map(ServicioResponseDTO::new)
                .collect(Collectors.toList());
    }

    public ServicioResponseDTO obtenerPorId(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ServicioNotFoundException(id));
        return new ServicioResponseDTO(servicio);
    }

    @Transactional
    public ServicioResponseDTO actualizarCompleto(Long id, ServicioRequestDTO dto) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ServicioNotFoundException(id));
        Servicio actualizado = new Servicio(dto);
        actualizado.setId(servicio.getId());
        servicioRepository.save(actualizado);
        return new ServicioResponseDTO(actualizado);
    }

    @Transactional
    public ServicioResponseDTO actualizarParcial(Long id, ServicioRequestDTO dto) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ServicioNotFoundException(id));
        servicio.actualizarParcial(dto);
        servicioRepository.save(servicio);
        return new ServicioResponseDTO(servicio);
    }

    @Transactional
    public void eliminar(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ServicioNotFoundException(id));
        servicioRepository.delete(servicio);
    }
}
