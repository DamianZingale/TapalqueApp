package com.tapalque.servicios.service;

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

import com.tapalque.servicios.Exceptions.ServicioNotFoundException;
import com.tapalque.servicios.dto.ServicioImagenRequestDTO;
import com.tapalque.servicios.dto.ImagenResponseDTO;
import com.tapalque.servicios.entity.Servicio;
import com.tapalque.servicios.entity.ServicioImagen;
import com.tapalque.servicios.repository.ServicioImagenRepository;
import com.tapalque.servicios.repository.ServicioRepository;

@Service
public class ServicioImagenService {
    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private ServicioImagenRepository cImagenRepository;

    @CacheEvict(value = "servicios", allEntries = true)
    public ImagenResponseDTO agregarImagen(Long servicioId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }

        Servicio servicio = servicioRepository.findById(servicioId)
                .orElseThrow(() -> new ServicioNotFoundException(servicioId));

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

            ServicioImagen imagen = new ServicioImagen();
            imagen.setImagenUrl("/api/servicio/uploads/" + fileName);
            imagen.setServicio(servicio);
            cImagenRepository.save(imagen);

            return new ImagenResponseDTO(imagen.getImagenUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen en disco", e);
        }
    }

    public List<ImagenResponseDTO> listarImagenes(Long servicioId) {
        if (!servicioRepository.existsById(servicioId)) {
            throw new ServicioNotFoundException(servicioId);
        }

        return cImagenRepository.findByServicio_Id(servicioId)
                .stream()
                .map(c -> new ImagenResponseDTO(c.getImagenUrl()))
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "servicios", allEntries = true)
    public void eliminarImagen(Long servicioId, ServicioImagenRequestDTO dto) {
        if (dto.getImagenUrl() == null || dto.getImagenUrl().isBlank()) {
            throw new IllegalArgumentException("La URL de la imagen es obligatoria");
        }
        System.out.println("Pasa 1 if");

        if (!servicioRepository.existsById(servicioId)) {
            throw new ServicioNotFoundException(servicioId);
        }
        System.out.println("Pasa 2 if");
        ServicioImagen imagen = cImagenRepository
                .findByServicio_IdAndImagenUrl(servicioId, dto.getImagenUrl())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró ninguna imagen con esa URL para el servicio"));

        System.out.println("Pasa 3 if");

        cImagenRepository.delete(imagen);

        try {
            String fileName = dto.getImagenUrl()
                    .replace("/api/servicio/uploads/", "")
                    .replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar archivo físico", e);
        }

        System.out.println("Pasa 4 if");
    }
}
