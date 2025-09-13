package com.tapalque.gastronomia.demo.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Service.I_RestaurantService;

@RestController
@RequestMapping("/api/gastronomia/local")
@CrossOrigin("*")
public class RestaurantGastronomicoController {

   private final I_RestaurantService localGastronomicoService;

    public RestaurantGastronomicoController(I_RestaurantService localGastronomicoService) {
        this.localGastronomicoService = localGastronomicoService;
    }


    @GetMapping("/findAll") // obtener todos
    public ResponseEntity<List<RestaurantDTO>> findAllRestaurantController() {
        List<RestaurantDTO> locales = localGastronomicoService.getAllRestaurant()
                .stream()
                .map(RestaurantDTO::new)
                .toList();
        return ResponseEntity.ok(locales);
    }

    @GetMapping("/findById/{id}") // obtener por id
    public ResponseEntity<RestaurantDTO> findByIdLocalController(@PathVariable Long id) {
        Restaurant local = localGastronomicoService.getRestaurantById(id);
        return ResponseEntity.ok(new RestaurantDTO(local));
    }

    
    @GetMapping("/findByCategory/{category}") // obtener por categoria
    public ResponseEntity<RestaurantDTO> findByCategoryLocalController(@PathVariable String category) {
        Restaurant local = localGastronomicoService.getRestaurantByCategory(category);
        return ResponseEntity.ok(new RestaurantDTO(local));
    }
    
    @GetMapping("/saludo")
    public String getMethodName() {
        return "Hola Mundo!!";
    }
}
