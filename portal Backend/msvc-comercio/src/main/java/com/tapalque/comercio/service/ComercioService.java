package com.tapalque.comercio.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.comercio.Exceptions.ComercioNotFoundException;
import com.tapalque.comercio.dto.ComercioRequestDTO;
import com.tapalque.comercio.dto.ComercioResponseDTO;
import com.tapalque.comercio.entity.Comercio;
import com.tapalque.comercio.repository.ComercioRepository;



@Service
@Transactional(readOnly = true )
public class ComercioService {
    @Autowired
    private ComercioRepository comercioRepository;

    @CacheEvict(value = "comercios", allEntries = true)
    @Transactional
    public ComercioResponseDTO crear(ComercioRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new IllegalArgumentException("El título del comercio es obligatorio");
        }

        Comercio comercio = new Comercio(dto);
        comercioRepository.save(comercio);
        return new ComercioResponseDTO(comercio);
    }

    @Cacheable(value = "comercios")
    public List<ComercioResponseDTO> obtenerTodos() {
        return comercioRepository.findAll()
                .stream()
                .map(ComercioResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "comercios", key = "#id")
    public ComercioResponseDTO obtenerPorId(Long id) {
        Comercio comercio = comercioRepository.findById(id)
                .orElseThrow(() -> new ComercioNotFoundException(id));
        return new ComercioResponseDTO(comercio);
    }

    @CacheEvict(value = "comercios", allEntries = true)
    @Transactional
    public ComercioResponseDTO actualizarCompleto(Long id, ComercioRequestDTO dto) {
        Comercio comercio = comercioRepository.findById(id)
                .orElseThrow(() -> new ComercioNotFoundException(id));
        Comercio actualizado = new Comercio(dto);
        actualizado.setId(comercio.getId());
        comercioRepository.save(actualizado);
        return new ComercioResponseDTO(actualizado);
    }

    @CacheEvict(value = "comercios", allEntries = true)
    @Transactional
    public ComercioResponseDTO actualizarParcial(Long id, ComercioRequestDTO dto) {
        Comercio comercio = comercioRepository.findById(id)
                .orElseThrow(() -> new ComercioNotFoundException(id));
        comercio.actualizarParcial(dto);
        comercioRepository.save(comercio);
        return new ComercioResponseDTO(comercio);
    }

    @CacheEvict(value = "comercios", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        Comercio comercio = comercioRepository.findById(id)
                .orElseThrow(() -> new ComercioNotFoundException(id));
        comercioRepository.delete(comercio);
    }
}
