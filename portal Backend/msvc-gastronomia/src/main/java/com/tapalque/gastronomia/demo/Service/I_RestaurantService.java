package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;

public interface I_RestaurantService {

    
    List<RestaurantDTO> getAllLocalGastronomicos();
    void addLocalGastronomico(Restaurant restaurant);
    Restaurant getLocalGastronomicoById(Long id);
    void updateRestaurant (Restaurant restaurant);
    void deleteRestaurant (Long id);
    List<Restaurant> findByCategories(String category);
    

   
}
