package com.tapalque.gastronomia.demo.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.gastronomia.demo.DTO.MenuDTO;
import com.tapalque.gastronomia.demo.Service.MenuServiceInterface;


@RestController
@RequestMapping("/menu")
public class MenuController {

    private final MenuServiceInterface menuService;

    public MenuController(MenuServiceInterface menuService) {
        this.menuService = menuService;
    }

    @GetMapping("getMenu/{id}")
    public MenuDTO getMenuByRestaurantId(@PathVariable Long id) {
       return menuService.getMenuByRestaurantId(id);
    }
    
    
}
