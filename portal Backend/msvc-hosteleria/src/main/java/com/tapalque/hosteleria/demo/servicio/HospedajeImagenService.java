package com.tapalque.hosteleria.demo.servicio;

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
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.hosteleria.demo.dto.ImagenRequestDTO;
import com.tapalque.hosteleria.demo.dto.ImagenResponseDTO;
import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.entidades.HospedajeImagen;
import com.tapalque.hosteleria.demo.repositorio.HospedajeImagenRepository;
import com.tapalque.hosteleria.demo.repositorio.HospedajeRepository;


@Service
public class HospedajeImagenService {

    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private HospedajeRepository hospedajeRepository;

    @Autowired
    private HospedajeImagenRepository imagenRepository;

    public ImagenResponseDTO agregarImagen(Long hospedajeId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }

        Hospedaje hospedaje = hospedajeRepository.findById(hospedajeId)
                .orElseThrow(() -> new IllegalArgumentException("Hospedaje no encontrado"));

        try {
            String originalName = Objects.requireNonNull(file.getOriginalFilename());
            if (!originalName.contains(".")) {
                throw new IllegalArgumentException("El archivo no tiene extensión válida");
            }

            // Validar que sea imagen
            String extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            if (!extension.matches("\\.(jpg|jpeg|png)$")) {
                throw new IllegalArgumentException("Solo se permiten archivos JPG, JPEG y PNG");
            }

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            HospedajeImagen imagen = new HospedajeImagen();
            imagen.setImagenUrl("/uploads/" + fileName);
            imagen.setHospedaje(hospedaje);
            imagenRepository.save(imagen);

            return new ImagenResponseDTO(imagen.getImagenUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen en disco", e);
        }
    }

    public List<ImagenResponseDTO> listarImagenes(Long hospedajeId) {
        if (!hospedajeRepository.existsById(hospedajeId)) {
            throw new IllegalArgumentException("Hospedaje no encontrado");
        }

        return imagenRepository.findByHospedajeId(hospedajeId)
                .stream()
                .map(img -> new ImagenResponseDTO(img.getImagenUrl()))
                .collect(Collectors.toList());
    }

    public void eliminarImagen(Long hospedajeId, ImagenRequestDTO dto) {
        if (dto.getImagenUrl() == null || dto.getImagenUrl().isBlank()) {
            throw new IllegalArgumentException("La URL de la imagen es obligatoria");
        }

        if (!hospedajeRepository.existsById(hospedajeId)) {
            throw new IllegalArgumentException("Hospedaje no encontrado");
        }

        HospedajeImagen imagen = imagenRepository
                .findByHospedajeIdAndImagenUrl(hospedajeId, dto.getImagenUrl())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró ninguna imagen con esa URL para el hospedaje"));

        imagenRepository.delete(imagen);

        try {
            Path filePath = Paths.get(uploadDir, dto.getImagenUrl().replace("/uploads/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar archivo físico", e);
        }
    }
}
