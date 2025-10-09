package com.tapalque.gastronomia.demo.Service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tapalque.gastronomia.demo.DTO.MenuDTO;
import com.tapalque.gastronomia.demo.Entity.Menu;
import com.tapalque.gastronomia.demo.Repository.MenuRepositoryInterface;

@Service
public class MenuService implements MenuServiceInterface {

    MenuRepositoryInterface menuRepository;

    public MenuService(MenuRepositoryInterface menuRepository) {
        this.menuRepository = menuRepository;
    }

@Override
public MenuDTO getMenuByRestaurantId(Long idRestaurant) {
    Optional<Menu> menuOptional = menuRepository.findByRestaurantIdRestaurant(idRestaurant);

    if (menuOptional.isEmpty()) {
        return null; // o lanzar excepción
    }

    Menu menu = menuOptional.get();
    return MenuDTO.fromEntity(menu);
}


}
