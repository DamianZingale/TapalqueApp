package com.tapalque.gastronomia.demo.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.gastronomia.demo.DTO.DishCategoryDTO;
import com.tapalque.gastronomia.demo.DTO.DishDTO;
import com.tapalque.gastronomia.demo.DTO.DishRestrictionDTO;
import com.tapalque.gastronomia.demo.DTO.MenuDTO;
import com.tapalque.gastronomia.demo.Service.MenuServiceInterface;


@RestController
@RequestMapping("gastronomia/menu")
public class MenuController {

    private final MenuServiceInterface menuService;

    public MenuController(MenuServiceInterface menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/restaurant/{id}")
    public ResponseEntity<MenuDTO> getMenuByRestaurantId(@PathVariable Long id) {
       try {
           MenuDTO menu = menuService.getMenuByRestaurantId(id);
           if (menu == null) {
               return ResponseEntity.notFound().build();
           }
           return ResponseEntity.ok(menu);
       } catch (Exception e) {
           System.err.println("Error fetching menu for restaurant " + id + ": " + e.getMessage());
           return ResponseEntity.internalServerError().build();
       }
    }

    @GetMapping("/restaurant/{id}/filter")
    public ResponseEntity<MenuDTO> getMenuFiltered(
            @PathVariable Long id,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> restrictions) {
        try {
            MenuDTO menu = menuService.getMenuFiltered(id, category, restrictions);
            if (menu == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(menu);
        } catch (Exception e) {
            System.err.println("Error fetching filtered menu for restaurant " + id + ": " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<DishCategoryDTO>> getAllCategories() {
        try {
            List<DishCategoryDTO> categories = menuService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            System.err.println("Error fetching categories: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/restrictions")
    public ResponseEntity<List<DishRestrictionDTO>> getAllRestrictions() {
        try {
            List<DishRestrictionDTO> restrictions = menuService.getAllRestrictions();
            return ResponseEntity.ok(restrictions);
        } catch (Exception e) {
            System.err.println("Error fetching restrictions: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ingredients/common")
    public ResponseEntity<List<String>> getCommonIngredients() {
        try {
            List<String> ingredients = com.tapalque.gastronomia.demo.enu.CommonIngredientEnum.getAllIngredientNames();
            return ResponseEntity.ok(ingredients);
        } catch (Exception e) {
            System.err.println("Error fetching common ingredients: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ingredients/search")
    public ResponseEntity<List<String>> searchIngredients(@RequestParam String query) {
        try {
            List<String> results = com.tapalque.gastronomia.demo.enu.CommonIngredientEnum.search(query)
                .stream()
                .map(com.tapalque.gastronomia.demo.enu.CommonIngredientEnum::getDisplayName)
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error searching ingredients: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ===================== CRUD DE DISHES =====================

    @PostMapping("/restaurant/{restaurantId}/dish")
    public ResponseEntity<DishDTO> createDish(
            @PathVariable Long restaurantId,
            @RequestBody DishDTO dishDTO) {
        try {
            DishDTO createdDish = menuService.createDish(restaurantId, dishDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDish);
        } catch (IllegalArgumentException e) {
            System.err.println("Error creating dish: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error creating dish: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/dish/{dishId}")
    public ResponseEntity<DishDTO> updateDish(
            @PathVariable Long dishId,
            @RequestBody DishDTO dishDTO) {
        try {
            DishDTO updatedDish = menuService.updateDish(dishId, dishDTO);
            return ResponseEntity.ok(updatedDish);
        } catch (IllegalArgumentException e) {
            System.err.println("Error updating dish: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating dish: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/dish/{dishId}")
    public ResponseEntity<Void> deleteDish(@PathVariable Long dishId) {
        try {
            menuService.deleteDish(dishId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            System.err.println("Error deleting dish: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error deleting dish: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/dish/{dishId}/availability")
    public ResponseEntity<DishDTO> updateDishAvailability(
            @PathVariable Long dishId,
            @RequestBody Map<String, Boolean> body) {
        try {
            Boolean available = body.get("available");
            if (available == null) {
                return ResponseEntity.badRequest().build();
            }
            DishDTO updatedDish = menuService.updateDishAvailability(dishId, available);
            return ResponseEntity.ok(updatedDish);
        } catch (IllegalArgumentException e) {
            System.err.println("Error updating dish availability: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating dish availability: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
