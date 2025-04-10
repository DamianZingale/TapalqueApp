package com.tapalque.hosteleria.demo.servicio;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.repositorio.HospedajeRepository;

@Service
public class HospedajeService {

    @Autowired
    private HospedajeRepository hospedajeRepository;

    public List<Hospedaje> obtenerTodos() {
        return hospedajeRepository.findAll();
    }

    public Optional<Hospedaje> obtenerPorId(Long id) {
        return hospedajeRepository.findById(id);
    }

    public Hospedaje guardar(Hospedaje hospedaje) {
        return hospedajeRepository.save(hospedaje);
    }

}
