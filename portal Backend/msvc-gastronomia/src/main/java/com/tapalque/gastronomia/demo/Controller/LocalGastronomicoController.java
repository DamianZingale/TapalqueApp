package com.tapalque.gastronomia.demo.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.GastronomiaApplication;
import com.tapalque.gastronomia.demo.Service.I_RestaurantService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@RestController

@RequestMapping("/api/gastronomia")
public class LocalGastronomicoController {

   private final I_RestaurantService localGastronomicoService;

    public LocalGastronomicoController(I_RestaurantService localGastronomicoService, GastronomiaApplication gastronomiaApplication) {
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
        return ResponseEntity.notFound().build(); 
    }
    }

    @PostMapping("/save")
    public ResponseEntity<RestaurantDTO> saveLocalController(@Valid @RequestBody RestaurantDTO nuevo_local) {
    RestaurantDTO restaurant = localGastronomicoService.addRestaurant(nuevo_local);
    if(restaurant == null){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }
    return ResponseEntity.status(HttpStatus.CREATED).body(restaurant);
    }
    
    /* 
    @PutMapping("/reload/{id}") // actualizar
    public ResponseEntity<RestaurantDTO> reloadLocalController(@Valid @PathVariable Long id,
            @RequestBody RestaurantDTO actualizar_local) {
        Restaurant entity = actualizar_local.toEntity();
        entity.setIdRestaurant(id); // aseguramos que se actualice el correcto
        localGastronomicoService.updateRestaurant(entity);
        return ResponseEntity.ok(new RestaurantDTO(entity));
    }

    @DeleteMapping("/delete/{id}") // eliminar
    public ResponseEntity<Void> deleteLocalController(@PathVariable Long id) {
        localGastronomicoService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/findByCategory/{category}") // buscar por rubro
    public ResponseEntity<List<RestaurantDTO>> findByCategoryController(@PathVariable String category) {
        
        List<Restaurant> locales = localGastronomicoService.findByCategories(category);
        
        if (locales.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<RestaurantDTO> localesDTO = locales.stream()
                .map(RestaurantDTO::new)
                .toList();
        return ResponseEntity.ok(localesDTO);
    }

    @GetMapping("/saludo")
    public String getMethodName() {
        return "Hola Mundo!!";
    }*/
}
