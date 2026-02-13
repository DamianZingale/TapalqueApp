package com.tapalque.gastronomia.demo.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Service.I_RestaurantService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/restaurante")
public class LocalGastronomicoController {

   private final I_RestaurantService localGastronomicoService;

     public LocalGastronomicoController(I_RestaurantService localGastronomicoService) {
        this.localGastronomicoService = localGastronomicoService;
    }


    @GetMapping("/findAll")
    public ResponseEntity<List<RestaurantDTO>> findAllLocalController() {
    List<RestaurantDTO> restaurants = localGastronomicoService.getAllLocalGastronomicos();
    return restaurants.isEmpty() 
        ? ResponseEntity.noContent().build() 
        : ResponseEntity.ok(restaurants);
    }
    
   @GetMapping("/findById/{id}")
    public ResponseEntity<RestaurantDTO> findByIdLocalController(@PathVariable Long id) {
    try {
        RestaurantDTO restaurant = localGastronomicoService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    } catch (EntityNotFoundException ex) {
        System.err.println("Restaurant no encontrado con ID: " + id);
        return ResponseEntity.notFound().build();
    } catch (Exception ex) {
        System.err.println("Error al buscar restaurant con ID " + id + ": " + ex.getMessage());
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
    }

    @PostMapping("/save")
    public ResponseEntity<RestaurantDTO> saveLocalController(@Valid @RequestBody RestaurantDTO nuevo_local) {
        RestaurantDTO restaurant = localGastronomicoService.addRestaurant(nuevo_local);
        if (restaurant == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurant);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RestaurantDTO> updateLocalController(@PathVariable Long id,
            @Valid @RequestBody RestaurantDTO actualizar_local) {
        try {
            Restaurant entity = actualizar_local.toEntity();
            entity.setIdRestaurant(id);
            localGastronomicoService.updateRestaurant(entity);
            return ResponseEntity.ok(new RestaurantDTO(entity));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteLocalController(@PathVariable Long id) {
        try {
            localGastronomicoService.deleteRestaurant(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
