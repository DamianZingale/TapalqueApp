package com.tapalque.termas.service;

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

import com.tapalque.termas.Exceptions.TermaNotFoundException;
import com.tapalque.termas.dto.TermaImagenRequestDTO;
import com.tapalque.termas.dto.ImagenResponseDTO;
import com.tapalque.termas.entity.Terma;
import com.tapalque.termas.entity.TermaImagen;
import com.tapalque.termas.repository.TermaImagenRepository;
import com.tapalque.termas.repository.TermaRepository;

@Service
public class TermaImagenService {
    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private TermaRepository termaRepository;

    @Autowired
    private TermaImagenRepository cImagenRepository;

    public ImagenResponseDTO agregarImagen(Long termaId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }

        Terma terma = termaRepository.findById(termaId)
                .orElseThrow(() -> new TermaNotFoundException(termaId));

        try {
            String originalName = Objects.requireNonNull(file.getOriginalFilename());
            if (!originalName.contains(".")) {
                throw new IllegalArgumentException("El archivo no tiene extensión válida");
            }

            String extension = originalName.substring(originalName.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            TermaImagen imagen = new TermaImagen();
            imagen.setImagenUrl("/api/terma/uploads/" + fileName);
            imagen.setTerma(terma);
            cImagenRepository.save(imagen);

            return new ImagenResponseDTO(imagen.getImagenUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen en disco", e);
        }
    }

    public List<ImagenResponseDTO> listarImagenes(Long termaId) {
        if (!termaRepository.existsById(termaId)) {
            throw new TermaNotFoundException(termaId);
        }

        return cImagenRepository.findByTerma_Id(termaId)
                .stream()
                .map(c -> new ImagenResponseDTO(c.getImagenUrl()))
                .collect(Collectors.toList());
    }

    public void eliminarImagen(Long termaId, TermaImagenRequestDTO dto) {
        if (dto.getImagenUrl() == null || dto.getImagenUrl().isBlank()) {
            throw new IllegalArgumentException("La URL de la imagen es obligatoria");
        }
        System.out.println("Pasa 1 if");

        if (!termaRepository.existsById(termaId)) {
            throw new TermaNotFoundException(termaId);
        }
        System.out.println("Pasa 2 if");
        TermaImagen imagen = cImagenRepository
                .findByTerma_IdAndImagenUrl(termaId, dto.getImagenUrl())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró ninguna imagen con esa URL para la terma"));

        System.out.println("Pasa 3 if");

        cImagenRepository.delete(imagen);

        try {
            String fileName = dto.getImagenUrl()
                    .replace("/api/terma/uploads/", "")
                    .replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar archivo físico", e);
        }

        System.out.println("Pasa 4 if");
    }
}
