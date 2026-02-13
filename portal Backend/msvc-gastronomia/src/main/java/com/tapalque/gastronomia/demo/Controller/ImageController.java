package com.tapalque.gastronomia.demo.Controller;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/uploads")
public class ImageController {

    // Ruta donde están guardadas las imágenes en el volumen
    private final Path imageStorageLocation = Paths.get("/app/uploads");

    @SuppressWarnings("null")
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            System.out.println("🖼️  Sirviendo imagen: " + filename);
            System.out.println("   Desde: " + imageStorageLocation.resolve(filename));

            Path filePath = imageStorageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                System.out.println("   ✅ Imagen encontrada y legible");
                // Detectar tipo de contenido
                String contentType = "image/jpeg"; // default
                if (filename.endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.endsWith(".webp")) {
                    contentType = "image/webp";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                System.out.println("   ❌ Imagen no encontrada o no legible");
                System.out.println("   Exists: " + resource.exists());
                System.out.println("   Readable: " + (resource.exists() && resource.isReadable()));
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            System.out.println("   ❌ Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}