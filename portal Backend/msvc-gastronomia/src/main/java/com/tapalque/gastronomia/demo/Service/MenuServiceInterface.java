package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import com.tapalque.gastronomia.demo.DTO.DishCategoryDTO;
import com.tapalque.gastronomia.demo.DTO.DishDTO;
import com.tapalque.gastronomia.demo.DTO.DishRestrictionDTO;
import com.tapalque.gastronomia.demo.DTO.MenuDTO;

public interface MenuServiceInterface {

    MenuDTO getMenuByRestaurantId(Long idRestaurant);

    MenuDTO getMenuFiltered(Long idRestaurant, String category, List<String> restrictions);

    List<DishCategoryDTO> getAllCategories();

    List<DishRestrictionDTO> getAllRestrictions();

    // CRUD de Dishes
    DishDTO createDish(Long restaurantId, DishDTO dishDTO);

    DishDTO updateDish(Long dishId, DishDTO dishDTO);

    void deleteDish(Long dishId);

    DishDTO updateDishAvailability(Long dishId, Boolean available);

    DishDTO getDishById(Long dishId);
}
