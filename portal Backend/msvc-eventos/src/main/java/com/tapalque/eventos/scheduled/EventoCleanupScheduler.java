package com.tapalque.eventos.scheduled;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.eventos.entity.Evento;
import com.tapalque.eventos.entity.EventoImagen;
import com.tapalque.eventos.repository.EventoImagenRepository;
import com.tapalque.eventos.repository.EventoRepository;

@Component
public class EventoCleanupScheduler {

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private EventoImagenRepository eventoImagenRepository;

    @Value("${upload.dir}")
    private String uploadDir;

    /**
     * Se ejecuta todos los días a las 3:00 AM
     * Elimina eventos cuya fecha de fin pasó hace más de 1 día (gracia de 24hs)
     * Si no tiene fecha de fin, elimina si la fecha de inicio pasó hace más de 1 día
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void eliminarEventosPasados() {
        LocalDate limite = LocalDate.now().minusDays(1);

        // Eliminar eventos con fecha de fin hace más de 1 día
        List<Evento> eventosConFinPasado = eventoRepository.findByFechaFinBefore(limite);
        if (!eventosConFinPasado.isEmpty()) {
            eventoRepository.deleteAll(eventosConFinPasado);
            System.out.println("✅ Eliminados " + eventosConFinPasado.size() + " eventos con fecha de fin pasada");
        }

        // Eliminar eventos sin fecha de fin pero con fecha de inicio hace más de 1 día
        List<Evento> eventosSinFinPasados = eventoRepository.findByFechaFinIsNullAndFechaInicioBefore(limite);
        if (!eventosSinFinPasados.isEmpty()) {
            eventoRepository.deleteAll(eventosSinFinPasados);
            System.out.println("✅ Eliminados " + eventosSinFinPasados.size() + " eventos sin fecha de fin con inicio pasado");
        }

        if (eventosConFinPasado.isEmpty() && eventosSinFinPasados.isEmpty()) {
            System.out.println("ℹ️ No hay eventos pasados para eliminar");
        }
    }

    /**
     * Se ejecuta todos los días a las 3:30 AM (después del cleanup de eventos)
     * Limpia imágenes huérfanas: archivos físicos sin registro en BD y registros en BD sin archivo físico
     */
    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void limpiarImagenesHuerfanas() {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            System.out.println("ℹ️ [Eventos] Directorio de uploads no existe: " + uploadDir);
            return;
        }

        // Filenames referenciados en BD
        Set<String> filenamesEnBD = eventoImagenRepository.findAll()
                .stream()
                .map(img -> img.getImagenUrl().replace("/api/evento/uploads/", ""))
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
                    System.out.println("🗑️ [Eventos] Archivo huérfano eliminado: " + archivo.getFileName());
                }
            }
        } catch (IOException e) {
            System.err.println("❌ [Eventos] Error al escanear directorio de uploads: " + e.getMessage());
        }

        // 2. Eliminar registros en BD cuyo archivo físico no existe
        List<EventoImagen> registrosHuerfanos = eventoImagenRepository.findAll()
                .stream()
                .filter(img -> {
                    String filename = img.getImagenUrl().replace("/api/evento/uploads/", "");
                    return !Files.exists(uploadPath.resolve(filename));
                })
                .collect(Collectors.toList());

        if (!registrosHuerfanos.isEmpty()) {
            eventoImagenRepository.deleteAll(registrosHuerfanos);
            System.out.println("🗑️ [Eventos] Registros huérfanos en BD eliminados: " + registrosHuerfanos.size());
        }

        if (archivosEliminados == 0 && registrosHuerfanos.isEmpty()) {
            System.out.println("ℹ️ [Eventos] No hay imágenes huérfanas");
        }
    }
}
