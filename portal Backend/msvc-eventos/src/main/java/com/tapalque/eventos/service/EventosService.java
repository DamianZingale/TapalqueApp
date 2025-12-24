package com.tapalque.eventos.service;

import com.tapalque.eventos.repository.EventosRepository;
import com.tapalque.eventos.repository.ImagesRepository;

public class EventosService implements EventosServiceInterface {

    private EventosRepository eventosRepository;
    private ImagesRepository imagesRepository;

    public EventosService(EventosRepository eventosRepository, ImagesRepository imagesRepository) {
        this.eventosRepository = eventosRepository;
        this.imagesRepository = imagesRepository;
    }
    
    
    
}
