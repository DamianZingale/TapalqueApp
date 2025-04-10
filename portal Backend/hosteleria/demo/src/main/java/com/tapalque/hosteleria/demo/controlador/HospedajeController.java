package com.tapalque.hosteleria.demo.controlador;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.servicio.HospedajeService;

@RestController
@RequestMapping("/api/hospedajes")
@CrossOrigin(origins = "*")
public class HospedajeController {

    @Autowired
    private HospedajeService hospedajeService;

    @GetMapping
    public List<Hospedaje> listarHospedajes() {
        return hospedajeService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospedaje> obtenerPorId(@PathVariable Long id) {
        return hospedajeService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Hospedaje> crearHospedaje(@RequestBody Hospedaje hospedaje) {
        Hospedaje nuevo = hospedajeService.guardar(hospedaje);
        return ResponseEntity.ok(nuevo);
    }
}
