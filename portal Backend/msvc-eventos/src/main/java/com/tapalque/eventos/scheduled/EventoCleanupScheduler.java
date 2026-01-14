package com.tapalque.eventos.scheduled;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.tapalque.eventos.entity.Evento;
import com.tapalque.eventos.repository.EventoRepository;

@Component
public class EventoCleanupScheduler {

    @Autowired
    private EventoRepository eventoRepository;

    /**
     * Se ejecuta todos los días a las 3:00 AM
     * Elimina eventos cuya fecha de fin ya pasó
     * Si no tiene fecha de fin, elimina si la fecha de inicio ya pasó
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void eliminarEventosPasados() {
        LocalDate hoy = LocalDate.now();
        
        // Eliminar eventos con fecha de fin pasada
        List<Evento> eventosConFinPasado = eventoRepository.findByFechaFinBefore(hoy);
        if (!eventosConFinPasado.isEmpty()) {
            eventoRepository.deleteAll(eventosConFinPasado);
            System.out.println("✅ Eliminados " + eventosConFinPasado.size() + " eventos con fecha de fin pasada");
        }
        
        // Eliminar eventos sin fecha de fin pero con fecha de inicio pasada
        List<Evento> eventosSinFinPasados = eventoRepository.findByFechaFinIsNullAndFechaInicioBefore(hoy);
        if (!eventosSinFinPasados.isEmpty()) {
            eventoRepository.deleteAll(eventosSinFinPasados);
            System.out.println("✅ Eliminados " + eventosSinFinPasados.size() + " eventos sin fecha de fin con inicio pasado");
        }
        
        if (eventosConFinPasado.isEmpty() && eventosSinFinPasados.isEmpty()) {
            System.out.println("ℹ️ No hay eventos pasados para eliminar");
        }
    }
}
