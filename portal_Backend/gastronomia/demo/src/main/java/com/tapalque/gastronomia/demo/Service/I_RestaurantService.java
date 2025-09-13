package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import com.tapalque.gastronomia.demo.Entity.Restaurant;

public interface I_RestaurantService {

    
    public List<Restaurant> getAllRestaurant();
    public Restaurant getRestaurantById(Long id);
    public Restaurant getRestaurantByCategory(String category);
    

   
}
