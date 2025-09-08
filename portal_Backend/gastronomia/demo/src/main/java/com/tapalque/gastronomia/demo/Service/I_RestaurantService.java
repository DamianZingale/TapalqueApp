package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import com.tapalque.gastronomia.demo.Entity.Restaurant;

public interface I_RestaurantService {

    
    void addLocalGastronomico(Restaurant localGastronomico);
    Restaurant getLocalGastronomicoById(Long id);
    List<Restaurant> getAllLocalGastronomicos();
    void updateLocalGastronomico(Restaurant localGastronomico);
    void deleteLocalGastronomico(int id);
    List<Restaurant> findBycategory(String category);
    

   
}
