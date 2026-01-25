package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import com.tapalque.gastronomia.demo.DTO.DishCategoryDTO;
import com.tapalque.gastronomia.demo.DTO.DishRestrictionDTO;
import com.tapalque.gastronomia.demo.DTO.MenuDTO;

public interface MenuServiceInterface {

    MenuDTO getMenuByRestaurantId(Long idRestaurant);

    MenuDTO getMenuFiltered(Long idRestaurant, String category, List<String> restrictions);

    List<DishCategoryDTO> getAllCategories();

    List<DishRestrictionDTO> getAllRestrictions();
}
