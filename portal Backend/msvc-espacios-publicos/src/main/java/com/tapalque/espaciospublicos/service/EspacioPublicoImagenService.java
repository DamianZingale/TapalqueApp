package com.tapalque.espaciospublicos.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tapalque.espaciospublicos.Exceptions.EspacioPublicoNotFoundException;
import com.tapalque.espaciospublicos.entity.EspacioPublico;
import com.tapalque.espaciospublicos.entity.EspacioPublicoImagen;
import com.tapalque.espaciospublicos.repository.EspacioPublicoImagenRepository;
import com.tapalque.espaciospublicos.repository.EspacioPublicoRepository;

import jakarta.annotation.PostConstruct;

@Service
public class EspacioPublicoImagenService {

    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private EspacioPublicoRepository espacioPublicoRepository;

    @Autowired
    private EspacioPublicoImagenRepository imagenRepository;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de uploads", e);
        }
    }

    public EspacioPublicoImagen guardarImagen(Long espacioPublicoId, MultipartFile file) throws IOException {
        EspacioPublico espacioPublico = espacioPublicoRepository.findById(espacioPublicoId)
                .orElseThrow(() -> new EspacioPublicoNotFoundException(espacioPublicoId));

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String newFilename = UUID.randomUUID().toString() + extension;

        Path filePath = Paths.get(uploadDir).resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        EspacioPublicoImagen imagen = new EspacioPublicoImagen();
        imagen.setImagenUrl("/uploads/espacios-publicos/" + newFilename);
        imagen.setEspacioPublico(espacioPublico);

        return imagenRepository.save(imagen);
    }

    public void eliminarImagen(Long imagenId) throws IOException {
        EspacioPublicoImagen imagen = imagenRepository.findById(imagenId)
                .orElseThrow(() -> new IllegalArgumentException("Imagen no encontrada"));

        String filename = imagen.getImagenUrl().substring(imagen.getImagenUrl().lastIndexOf("/") + 1);
        Path filePath = Paths.get(uploadDir).resolve(filename);
        Files.deleteIfExists(filePath);

        imagenRepository.delete(imagen);
    }
}
