package com.tapalque.comercio.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.comercio.dto.ComercioImagenRequestDTO;
import com.tapalque.comercio.dto.ImagenResponseDTO;
import com.tapalque.comercio.repository.ComercioImagenRepository;

public class ComercioImagenService {
    @Autowired
    private ComercioImagenRepository cImagenRepository;

    public ImagenResponseDTO agregarImagen(Long comercioId, MultipartFile file) {
        throw new UnsupportedOperationException("Unimplemented method 'agregarImagen'");
    }

    public List<ImagenResponseDTO> listarImagenes(Long comercioId) {
        throw new UnsupportedOperationException("Unimplemented method 'listarImagenes'");
    }

    public void eliminarImagen(Long comercioId, ComercioImagenRequestDTO dto) {
        throw new UnsupportedOperationException("Unimplemented method 'eliminarImagen'");
    }
}
