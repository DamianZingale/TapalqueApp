package com.tapalque.espaciospublicos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.espaciospublicos.Exceptions.EspacioPublicoNotFoundException;
import com.tapalque.espaciospublicos.dto.EspacioPublicoRequestDTO;
import com.tapalque.espaciospublicos.dto.EspacioPublicoResponseDTO;
import com.tapalque.espaciospublicos.entity.EspacioPublico;
import com.tapalque.espaciospublicos.repository.EspacioPublicoRepository;

@Service
@Transactional(readOnly = true )
public class EspacioPublicoService {
    @Autowired
    private EspacioPublicoRepository espacioPublicoRepository;

    @Transactional
    public EspacioPublicoResponseDTO crear(EspacioPublicoRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new IllegalArgumentException("El título del espacio público es obligatorio");
        }

        EspacioPublico espacioPublico = new EspacioPublico(dto);
        espacioPublicoRepository.save(espacioPublico);
        return new EspacioPublicoResponseDTO(espacioPublico);
    }

    public List<EspacioPublicoResponseDTO> obtenerTodos() {
        return espacioPublicoRepository.findAll()
                .stream()
                .map(EspacioPublicoResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<EspacioPublicoResponseDTO> obtenerPorCategoria(String categoria) {
        return espacioPublicoRepository.findByCategoria(categoria)
                .stream()
                .map(EspacioPublicoResponseDTO::new)
                .collect(Collectors.toList());
    }

    public EspacioPublicoResponseDTO obtenerPorId(Long id) {
        EspacioPublico espacioPublico = espacioPublicoRepository.findById(id)
                .orElseThrow(() -> new EspacioPublicoNotFoundException(id));
        return new EspacioPublicoResponseDTO(espacioPublico);
    }

    @Transactional
    public EspacioPublicoResponseDTO actualizarCompleto(Long id, EspacioPublicoRequestDTO dto) {
        EspacioPublico espacioPublico = espacioPublicoRepository.findById(id)
                .orElseThrow(() -> new EspacioPublicoNotFoundException(id));
        EspacioPublico actualizado = new EspacioPublico(dto);
        actualizado.setId(espacioPublico.getId());
        actualizado.setImagenes(espacioPublico.getImagenes());
        espacioPublicoRepository.save(actualizado);
        return new EspacioPublicoResponseDTO(actualizado);
    }

    @Transactional
    public EspacioPublicoResponseDTO actualizarParcial(Long id, EspacioPublicoRequestDTO dto) {
        EspacioPublico espacioPublico = espacioPublicoRepository.findById(id)
                .orElseThrow(() -> new EspacioPublicoNotFoundException(id));
        espacioPublico.actualizarParcial(dto);
        espacioPublicoRepository.save(espacioPublico);
        return new EspacioPublicoResponseDTO(espacioPublico);
    }

    @Transactional
    public void eliminar(Long id) {
        EspacioPublico espacioPublico = espacioPublicoRepository.findById(id)
                .orElseThrow(() -> new EspacioPublicoNotFoundException(id));
        espacioPublicoRepository.delete(espacioPublico);
    }
}
