package com.tapalque.termas.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.termas.Exceptions.TermaNotFoundException;
import com.tapalque.termas.dto.TermaRequestDTO;
import com.tapalque.termas.dto.TermaResponseDTO;
import com.tapalque.termas.entity.Terma;
import com.tapalque.termas.repository.TermaRepository;

@Service
@Transactional(readOnly = true )
public class TermaService {
    @Autowired
    private TermaRepository termaRepository;

    @CacheEvict(value = "termas", allEntries = true)
    @Transactional
    public TermaResponseDTO crear(TermaRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new IllegalArgumentException("El título del terma es obligatorio");
        }

        Terma terma = new Terma(dto);
        termaRepository.save(terma);
        return new TermaResponseDTO(terma);
    }

    @Cacheable(value = "termas")
    public List<TermaResponseDTO> obtenerTodos() {
        return termaRepository.findAll()
                .stream()
                .map(TermaResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "termas", key = "#id")
    public TermaResponseDTO obtenerPorId(Long id) {
        Terma terma = termaRepository.findById(id)
                .orElseThrow(() -> new TermaNotFoundException(id));
        return new TermaResponseDTO(terma);
    }

    @CacheEvict(value = "termas", allEntries = true)
    @Transactional
    public TermaResponseDTO actualizarCompleto(Long id, TermaRequestDTO dto) {
        Terma terma = termaRepository.findById(id)
                .orElseThrow(() -> new TermaNotFoundException(id));
        // Actualizar campos sin perder las imágenes existentes
        terma.setTitulo(dto.getTitulo());
        terma.setDescripcion(dto.getDescripcion());
        terma.setDireccion(dto.getDireccion());
        terma.setHorario(dto.getHorario());
        terma.setTelefono(dto.getTelefono());
        terma.setLatitud(dto.getLatitud());
        terma.setLongitud(dto.getLongitud());
        terma.setFacebook(dto.getFacebook());
        terma.setInstagram(dto.getInstagram());
        // No tocamos terma.imagenes para preservarlas
        termaRepository.save(terma);
        return new TermaResponseDTO(terma);
    }

    @CacheEvict(value = "termas", allEntries = true)
    @Transactional
    public TermaResponseDTO actualizarParcial(Long id, TermaRequestDTO dto) {
        Terma terma = termaRepository.findById(id)
                .orElseThrow(() -> new TermaNotFoundException(id));
        terma.actualizarParcial(dto);
        termaRepository.save(terma);
        return new TermaResponseDTO(terma);
    }

    @CacheEvict(value = "termas", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        Terma terma = termaRepository.findById(id)
                .orElseThrow(() -> new TermaNotFoundException(id));
        termaRepository.delete(terma);
    }
}
