package com.tapalque.eventos.service;

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

import com.tapalque.eventos.Exceptions.EventoNotFoundException;
import com.tapalque.eventos.dto.EventoImagenRequestDTO;
import com.tapalque.eventos.dto.ImagenResponseDTO;
import com.tapalque.eventos.entity.Evento;
import com.tapalque.eventos.entity.EventoImagen;
import com.tapalque.eventos.repository.EventoImagenRepository;
import com.tapalque.eventos.repository.EventoRepository;

@Service
public class EventoImagenService {
    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private EventoImagenRepository eventoImagenRepository;

    public ImagenResponseDTO agregarImagen(Long eventoId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }

        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new EventoNotFoundException(eventoId));

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

            EventoImagen imagen = new EventoImagen();
            imagen.setImagenUrl("/uploads/" + fileName);
            imagen.setEvento(evento);
            eventoImagenRepository.save(imagen);

            return new ImagenResponseDTO(imagen.getImagenUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen en disco", e);
        }
    }

    public List<ImagenResponseDTO> listarImagenes(Long eventoId) {
        if (!eventoRepository.existsById(eventoId)) {
            throw new EventoNotFoundException(eventoId);
        }

        return eventoImagenRepository.findByEvento_Id(eventoId)
                .stream()
                .map(c -> new ImagenResponseDTO(c.getImagenUrl()))
                .collect(Collectors.toList());
    }

    public void eliminarImagen(Long eventoId, EventoImagenRequestDTO dto) {
        if (dto.getImagenUrl() == null || dto.getImagenUrl().isBlank()) {
            throw new IllegalArgumentException("La URL de la imagen es obligatoria");
        }
        System.out.println("Pasa 1 if");

        if (!eventoRepository.existsById(eventoId)) {
            throw new EventoNotFoundException(eventoId);
        }
        System.out.println("Pasa 2 if");
        EventoImagen imagen = eventoImagenRepository
                .findByEvento_IdAndImagenUrl(eventoId, dto.getImagenUrl())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró ninguna imagen con esa URL para el evento"));

        System.out.println("Pasa 3 if");

        eventoImagenRepository.delete(imagen);

        try {
            Path filePath = Paths.get(uploadDir, dto.getImagenUrl().replace("/uploads/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar archivo físico", e);
        }

        System.out.println("Pasa 4 if");
    }
}
