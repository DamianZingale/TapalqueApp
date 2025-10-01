package com.tapalque.comercio.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tapalque.comercio.dto.ComercioRequestDTO;
import com.tapalque.comercio.dto.ComercioResponseDTO;
import com.tapalque.comercio.repository.ComercioRepository;

@Service
public class ComercioService {
    @Autowired
    private ComercioRepository comercioRepository;

    public ComercioResponseDTO crear(ComercioRequestDTO dto) {
        throw new UnsupportedOperationException("Unimplemented method 'crear'");
    }

    public List<ComercioResponseDTO> obtenerTodos() {
        throw new UnsupportedOperationException("Unimplemented method 'obtenerTodos'");
    }

    public ComercioResponseDTO obtenerPorId(Long id) {
        throw new UnsupportedOperationException("Unimplemented method 'obtenerPorId'");
    }

    public ComercioResponseDTO actualizar(Long id, ComercioRequestDTO dto) {
        throw new UnsupportedOperationException("Unimplemented method 'actualizar'");
    }

    public void eliminar(Long id) {
        throw new UnsupportedOperationException("Unimplemented method 'eliminar'");
    }
}
