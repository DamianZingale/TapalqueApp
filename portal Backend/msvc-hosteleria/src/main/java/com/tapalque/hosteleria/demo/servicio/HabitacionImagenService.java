package com.tapalque.hosteleria.demo.servicio;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.hosteleria.demo.dto.ImagenResponseDTO;

@Service
public class HabitacionImagenService {

    @Value("${upload.dir}")
    private String uploadDir;

    @CacheEvict(value = "habitaciones", allEntries = true)
    public ImagenResponseDTO subirImagen(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }

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

            String imagenUrl = "/api/hospedajes/uploads/" + fileName;
            return new ImagenResponseDTO(imagenUrl);
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen en disco", e);
        }
    }

    @CacheEvict(value = "habitaciones", allEntries = true)
    public void eliminarImagen(String imagenUrl) {
        if (imagenUrl == null || imagenUrl.isBlank()) {
            throw new IllegalArgumentException("La URL de la imagen es obligatoria");
        }

        try {
            String fileName = imagenUrl
                    .replace("/api/hospedajes/uploads/", "")
                    .replace("/api/hospedaje/uploads/", "")
                    .replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar archivo físico", e);
        }
    }
}
