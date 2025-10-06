package com.tapalque.gastronomia.demo.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Service.I_RestaurantService;

@RestController

@CrossOrigin("*")
public class LocalGastronomicoController {

   private final I_RestaurantService localGastronomicoService;

    public LocalGastronomicoController(I_RestaurantService localGastronomicoService) {
        this.localGastronomicoService = localGastronomicoService;
    }


    @GetMapping("/findAll")
public ResponseEntity<List<RestaurantDTO>> findAllLocalController() {
    return ResponseEntity.ok(localGastronomicoService.getAllLocalGastronomicos());
}
    /* 
    @GetMapping("/findById/{id}") // obtener por id
    public ResponseEntity<RestaurantDTO> findByIdLocalController(@PathVariable Long id) {
        Restaurant local = localGastronomicoService.getLocalGastronomicoById(id);
        return ResponseEntity.ok(new RestaurantDTO(local));
    }

    @PostMapping("/save") // crear nuevo local gastronomico
    public ResponseEntity<RestaurantDTO> saveLocalController(@Valid @RequestBody RestaurantDTO nuevo_local) {
        Restaurant localEntity = nuevo_local.toEntity(); // asumimos que DTO tiene método paraEntity()
        localGastronomicoService.addLocalGastronomico(localEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RestaurantDTO(localEntity));
    }

  

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
