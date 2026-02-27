package com.tapalque.gastronomia.demo.Service;

import com.tapalque.gastronomia.demo.DTO.SaborHeladeriaDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Entity.SaborHeladeria;
import com.tapalque.gastronomia.demo.Repository.LocalRepositoryInterface;
import com.tapalque.gastronomia.demo.Repository.SaborHeladeriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaborHeladeriaService {

    private final SaborHeladeriaRepository saborRepository;
    private final LocalRepositoryInterface restaurantRepository;

    public SaborHeladeriaService(SaborHeladeriaRepository saborRepository,
                                  LocalRepositoryInterface restaurantRepository) {
        this.saborRepository = saborRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public List<SaborHeladeriaDTO> getSaboresByRestaurant(Long restaurantId) {
        return saborRepository.findByRestauranteIdRestaurant(restaurantId)
                .stream()
                .map(SaborHeladeriaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<SaborHeladeriaDTO> getSaboresHabilitados(Long restaurantId) {
        return saborRepository.findByRestauranteIdRestaurantAndHabilitado(restaurantId, true)
                .stream()
                .map(SaborHeladeriaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public SaborHeladeriaDTO crearSabor(Long restaurantId, String nombre) {
        Restaurant restaurante = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));
        SaborHeladeria sabor = new SaborHeladeria(nombre, true, restaurante);
        return SaborHeladeriaDTO.fromEntity(saborRepository.save(sabor));
    }

    public SaborHeladeriaDTO actualizarSabor(Long saborId, String nombre, Boolean habilitado) {
        SaborHeladeria sabor = saborRepository.findById(saborId)
                .orElseThrow(() -> new RuntimeException("Sabor no encontrado"));
        if (nombre != null && !nombre.isBlank()) {
            sabor.setNombre(nombre);
        }
        if (habilitado != null) {
            sabor.setHabilitado(habilitado);
        }
        return SaborHeladeriaDTO.fromEntity(saborRepository.save(sabor));
    }

    public SaborHeladeriaDTO toggleHabilitado(Long saborId) {
        SaborHeladeria sabor = saborRepository.findById(saborId)
                .orElseThrow(() -> new RuntimeException("Sabor no encontrado"));
        sabor.setHabilitado(!sabor.getHabilitado());
        return SaborHeladeriaDTO.fromEntity(saborRepository.save(sabor));
    }

    public void eliminarSabor(Long saborId) {
        if (!saborRepository.existsById(saborId)) {
            throw new RuntimeException("Sabor no encontrado");
        }
        saborRepository.deleteById(saborId);
    }
}
