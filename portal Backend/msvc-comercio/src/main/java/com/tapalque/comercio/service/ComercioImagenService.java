package com.tapalque.comercio.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.comercio.Exceptions.ComercioNotFoundException;
import com.tapalque.comercio.dto.ComercioImagenRequestDTO;
import com.tapalque.comercio.dto.ImagenResponseDTO;
import com.tapalque.comercio.entity.Comercio;
import com.tapalque.comercio.entity.ComercioImagen;
import com.tapalque.comercio.repository.ComercioImagenRepository;
import com.tapalque.comercio.repository.ComercioRepository;

@Service
public class ComercioImagenService {
    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private ComercioRepository comercioRepository;

    @Autowired
    private ComercioImagenRepository cImagenRepository;

    @CacheEvict(value = "comercios", allEntries = true)
    public ImagenResponseDTO agregarImagen(Long comercioId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }

        Comercio comercio = comercioRepository.findById(comercioId)
                .orElseThrow(() -> new ComercioNotFoundException(comercioId));

        try {
            String originalName = Objects.requireNonNull(file.getOriginalFilename());
            if (!originalName.contains(".")) {
                throw new IllegalArgumentException("El archivo no tiene extensión válida");
            }

            String extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            if (!extension.matches("\\.(jpg|jpeg|png)$")) {
                throw new IllegalArgumentException("Solo se permiten archivos JPG, JPEG y PNG");
            }

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            ComercioImagen imagen = new ComercioImagen();
            imagen.setImagenUrl("/api/comercio/uploads/" + fileName);
            imagen.setComercio(comercio);
            cImagenRepository.save(imagen);

            return new ImagenResponseDTO(imagen.getImagenUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen en disco", e);
        }
    }

    public List<ImagenResponseDTO> listarImagenes(Long comercioId) {
        if (!comercioRepository.existsById(comercioId)) {
            throw new ComercioNotFoundException(comercioId);
        }

        return cImagenRepository.findByComercio_Id(comercioId)
                .stream()
                .map(c -> new ImagenResponseDTO(c.getImagenUrl()))
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "comercios", allEntries = true)
    public void eliminarImagen(Long comercioId, ComercioImagenRequestDTO dto) {
        if (dto.getImagenUrl() == null || dto.getImagenUrl().isBlank()) {
            throw new IllegalArgumentException("La URL de la imagen es obligatoria");
        }
        System.out.println("Pasa 1 if");

        if (!comercioRepository.existsById(comercioId)) {
            throw new ComercioNotFoundException(comercioId);
        }
        System.out.println("Pasa 2 if");
        ComercioImagen imagen = cImagenRepository
                .findByComercio_IdAndImagenUrl(comercioId, dto.getImagenUrl())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró ninguna imagen con esa URL para el comercio"));

        System.out.println("Pasa 3 if");

        cImagenRepository.delete(imagen);

        try {
            String fileName = dto.getImagenUrl()
                    .replace("/api/comercio/uploads/", "")
                    .replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar archivo físico", e);
        }

        System.out.println("Pasa 4 if");
    }
}
