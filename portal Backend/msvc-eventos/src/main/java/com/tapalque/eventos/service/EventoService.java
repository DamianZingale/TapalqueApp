package com.tapalque.eventos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.eventos.Exceptions.EventoNotFoundException;
import com.tapalque.eventos.dto.EventoRequestDTO;
import com.tapalque.eventos.dto.EventoResponseDTO;
import com.tapalque.eventos.entity.Evento;
import com.tapalque.eventos.repository.EventoRepository;

@Service
@Transactional(readOnly = true )
public class EventoService {
    @Autowired
    private EventoRepository eventoRepository;

    @Transactional
    public EventoResponseDTO crear(EventoRequestDTO dto) {
        if (dto.getNombreEvento() == null || dto.getNombreEvento().isBlank()) {
            throw new IllegalArgumentException("El nombre del evento es obligatorio");
        }

        Evento evento = new Evento(dto);
        eventoRepository.save(evento);
        return new EventoResponseDTO(evento);
    }

    public List<EventoResponseDTO> obtenerTodos() {
        return eventoRepository.findAll()
                .stream()
                .map(EventoResponseDTO::new)
                .collect(Collectors.toList());
    }

    public EventoResponseDTO obtenerPorId(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        return new EventoResponseDTO(evento);
    }

    @Transactional
    public EventoResponseDTO actualizarCompleto(Long id, EventoRequestDTO dto) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        evento.actualizarParcial(dto);
        eventoRepository.save(evento);
        return new EventoResponseDTO(evento);
    }

    @Transactional
    public EventoResponseDTO actualizarParcial(Long id, EventoRequestDTO dto) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        evento.actualizarParcial(dto);
        eventoRepository.save(evento);
        return new EventoResponseDTO(evento);
    }

    @Transactional
    public void eliminar(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new EventoNotFoundException(id));
        eventoRepository.delete(evento);
    }
}
