package com.tapalque.gastronomia.demo.Service;

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

import com.tapalque.gastronomia.demo.DTO.ImagenRequestDTO;
import com.tapalque.gastronomia.demo.DTO.ImagenResponseDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Entity.RestaurantImage;
import com.tapalque.gastronomia.demo.Repository.LocalRepositoryInterface;
import com.tapalque.gastronomia.demo.Repository.RestaurantImageRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RestaurantImageService {

    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private LocalRepositoryInterface restaurantRepository;

    @Autowired
    private RestaurantImageRepository imageRepository;

    @CacheEvict(value = "restaurantes", allEntries = true)
    @Transactional
    public ImagenResponseDTO agregarImagen(Long restaurantId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío o no fue enviado");
        }

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurante no encontrado"));

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

            RestaurantImage imagen = new RestaurantImage();
            imagen.setImageUrl("/api/gastronomia/uploads/" + fileName);
            imagen.setRestaurant(restaurant);
            imageRepository.save(imagen);

            return new ImagenResponseDTO(imagen.getImageUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen en disco", e);
        }
    }

    public List<ImagenResponseDTO> listarImagenes(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new IllegalArgumentException("Restaurante no encontrado");
        }

        return imageRepository.findByRestaurantIdRestaurant(restaurantId)
                .stream()
                .map(img -> new ImagenResponseDTO(img.getImageUrl()))
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "restaurantes", allEntries = true)
    @Transactional
    public void eliminarImagen(Long restaurantId, ImagenRequestDTO dto) {
        if (dto.getImagenUrl() == null || dto.getImagenUrl().isBlank()) {
            throw new IllegalArgumentException("La URL de la imagen es obligatoria");
        }

        if (!restaurantRepository.existsById(restaurantId)) {
            throw new IllegalArgumentException("Restaurante no encontrado");
        }

        RestaurantImage imagen = imageRepository
                .findByRestaurantIdRestaurantAndImageUrl(restaurantId, dto.getImagenUrl())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró ninguna imagen con esa URL para el restaurante"));

        imageRepository.delete(imagen);

        try {
            String fileName = dto.getImagenUrl()
                    .replace("/api/gastronomia/uploads/", "")
                    .replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al eliminar archivo físico", e);
        }
    }
}
