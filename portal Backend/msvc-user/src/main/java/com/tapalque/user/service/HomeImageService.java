package com.tapalque.user.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class HomeImageService {

    @Value("${upload.dir}")
    private String uploadDir;

    public String guardarImagen(MultipartFile file, String seccion) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }

        try {
            String originalName = Objects.requireNonNull(file.getOriginalFilename());
            if (!originalName.contains(".")) {
                throw new IllegalArgumentException("El archivo no tiene extensión válida");
            }

            // Validar que sea una imagen
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("El archivo debe ser una imagen");
            }

            String extension = originalName.substring(originalName.lastIndexOf("."));
            String fileName = "home-" + seccion.toLowerCase() + "-" + UUID.randomUUID().toString() + extension;

            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            return "/api/user/uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen en disco", e);
        }
    }

    public void eliminarImagen(String imagenUrl) {
        if (imagenUrl == null || imagenUrl.isBlank()) {
            return;
        }

        try {
            String fileName = imagenUrl
                    .replace("/api/user/uploads/", "")
                    .replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error pero no fallar
            System.err.println("Error al eliminar archivo físico: " + e.getMessage());
        }
    }
}
