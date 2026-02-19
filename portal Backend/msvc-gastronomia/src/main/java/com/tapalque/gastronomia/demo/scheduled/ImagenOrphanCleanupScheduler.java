package com.tapalque.gastronomia.demo.scheduled;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.gastronomia.demo.Entity.RestaurantImage;
import com.tapalque.gastronomia.demo.Repository.RestaurantImageRepository;

@Component
public class ImagenOrphanCleanupScheduler {

    @Autowired
    private RestaurantImageRepository restaurantImageRepository;

    @Value("${upload.dir}")
    private String uploadDir;

    /**
     * Se ejecuta el primer día de cada mes a las 4:00 AM
     * Limpia imágenes huérfanas: archivos físicos sin registro en BD y registros en BD sin archivo físico
     */
    @Scheduled(cron = "0 0 4 1 * *")
    @Transactional
    public void limpiarImagenesHuerfanas() {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            System.out.println("ℹ️ [Gastronomia] Directorio de uploads no existe: " + uploadDir);
            return;
        }

        // Filenames referenciados en BD
        Set<String> filenamesEnBD = restaurantImageRepository.findAll()
                .stream()
                .map(img -> img.getImageUrl().replace("/api/gastronomia/uploads/", ""))
                .collect(Collectors.toSet());

        // 1. Eliminar archivos físicos que no están en BD
        int archivosEliminados = 0;
        try {
            List<Path> archivos = Files.list(uploadPath)
                    .filter(Files::isRegularFile)
                    .collect(Collectors.toList());

            for (Path archivo : archivos) {
                if (!filenamesEnBD.contains(archivo.getFileName().toString())) {
                    Files.deleteIfExists(archivo);
                    archivosEliminados++;
                    System.out.println("🗑️ [Gastronomia] Archivo huérfano eliminado: " + archivo.getFileName());
                }
            }
        } catch (IOException e) {
            System.err.println("❌ [Gastronomia] Error al escanear directorio de uploads: " + e.getMessage());
        }

        // 2. Eliminar registros en BD cuyo archivo físico no existe
        List<RestaurantImage> registrosHuerfanos = restaurantImageRepository.findAll()
                .stream()
                .filter(img -> {
                    String filename = img.getImageUrl().replace("/api/gastronomia/uploads/", "");
                    return !Files.exists(uploadPath.resolve(filename));
                })
                .collect(Collectors.toList());

        if (!registrosHuerfanos.isEmpty()) {
            restaurantImageRepository.deleteAll(registrosHuerfanos);
            System.out.println("🗑️ [Gastronomia] Registros huérfanos en BD eliminados: " + registrosHuerfanos.size());
        }

        if (archivosEliminados == 0 && registrosHuerfanos.isEmpty()) {
            System.out.println("ℹ️ [Gastronomia] No hay imágenes huérfanas");
        }
    }
}
