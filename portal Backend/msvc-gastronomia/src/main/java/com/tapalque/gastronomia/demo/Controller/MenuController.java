package com.tapalque.gastronomia.demo.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.gastronomia.demo.DTO.DishCategoryDTO;
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
}
