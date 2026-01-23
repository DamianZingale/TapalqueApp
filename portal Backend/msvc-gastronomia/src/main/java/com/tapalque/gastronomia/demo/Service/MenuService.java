package com.tapalque.gastronomia.demo.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.gastronomia.demo.DTO.DishCategoryDTO;
import com.tapalque.gastronomia.demo.DTO.DishDTO;
import com.tapalque.gastronomia.demo.DTO.DishRestrictionDTO;
import com.tapalque.gastronomia.demo.DTO.MenuDTO;
import com.tapalque.gastronomia.demo.Entity.Menu;
import com.tapalque.gastronomia.demo.Repository.DishCategoryRepository;
import com.tapalque.gastronomia.demo.Repository.DishRestrictionRepository;
import com.tapalque.gastronomia.demo.Repository.MenuRepositoryInterface;

@Service
@Transactional(readOnly = true)
public class MenuService implements MenuServiceInterface {

    private final MenuRepositoryInterface menuRepository;
    private final DishCategoryRepository dishCategoryRepository;
    private final DishRestrictionRepository dishRestrictionRepository;

    public MenuService(MenuRepositoryInterface menuRepository,
                       DishCategoryRepository dishCategoryRepository,
                       DishRestrictionRepository dishRestrictionRepository) {
        this.menuRepository = menuRepository;
        this.dishCategoryRepository = dishCategoryRepository;
        this.dishRestrictionRepository = dishRestrictionRepository;
    }

    @Override
    public MenuDTO getMenuByRestaurantId(Long idRestaurant) {
        Optional<Menu> menuOptional = menuRepository.findByRestaurantIdRestaurant(idRestaurant);

        if (menuOptional.isEmpty()) {
            MenuDTO emptyMenu = new MenuDTO();
            emptyMenu.setDescription("Menú no disponible");
            emptyMenu.setDishes(new ArrayList<>());
            return emptyMenu;
        }

        Menu menu = menuOptional.get();
        return MenuDTO.fromEntity(menu);
    }

    @Override
    public MenuDTO getMenuFiltered(Long idRestaurant, String category, List<String> restrictions) {
        MenuDTO menu = getMenuByRestaurantId(idRestaurant);

        if (menu.getDishes() == null || menu.getDishes().isEmpty()) {
            return menu;
        }

        List<DishDTO> filteredDishes = menu.getDishes().stream()
            .filter(dish -> {
                // Filtrar por categoría si se especifica
                if (category != null && !category.isEmpty()) {
                    boolean hasCategory = dish.getCategories() != null &&
                        dish.getCategories().stream()
                            .anyMatch(c -> c.getName().equalsIgnoreCase(category));
                    if (!hasCategory) {
                        return false;
                    }
                }

                // Filtrar por restricciones si se especifican
                if (restrictions != null && !restrictions.isEmpty()) {
                    if (dish.getRestrictions() == null) {
                        return false;
                    }
                    List<String> dishRestrictionNames = dish.getRestrictions().stream()
                        .map(DishRestrictionDTO::getName)
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());

                    // El plato debe tener TODAS las restricciones especificadas
                    for (String restriction : restrictions) {
                        if (!dishRestrictionNames.contains(restriction.toLowerCase())) {
                            return false;
                        }
                    }
                }

                return true;
            })
            .collect(Collectors.toList());

        menu.setDishes(filteredDishes);
        return menu;
    }

    @Override
    public List<DishCategoryDTO> getAllCategories() {
        return dishCategoryRepository.findAll().stream()
            .map(DishCategoryDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public List<DishRestrictionDTO> getAllRestrictions() {
        return dishRestrictionRepository.findAll().stream()
            .map(DishRestrictionDTO::fromEntity)
            .collect(Collectors.toList());
    }
}
