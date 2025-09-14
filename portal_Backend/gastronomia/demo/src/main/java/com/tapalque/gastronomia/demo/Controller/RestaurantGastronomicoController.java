package com.tapalque.gastronomia.demo.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.gastronomia.demo.DTO.BasicRestaurantDTO;
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
    public ResponseEntity<List<BasicRestaurantDTO>> findAllRestaurantController() {
        try {
            List<BasicRestaurantDTO> locales = localGastronomicoService.getAllRestaurant();
            return ResponseEntity.ok(locales);
            
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
        
            
    }

    
   
}
